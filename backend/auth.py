from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, crud
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-this-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hrs default

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
from typing import Optional

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return crud.pwd_context.verify(plain_password, hashed_password)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if token == "guest-token":
        # Check if guest user exists in DB
        guest_user = crud.get_user_by_email(db, email="guest@prescription.ai")
        if not guest_user:
            # Create guest user on the fly if missing
            new_user = schemas.UserCreate(
                name="Guest Physician",
                email="guest@prescription.ai",
                password="guest-password",
                role="doctor"
            )
            guest_user = crud.create_user(db, new_user)

        # Always ensure doctor profile exists (even for existing guest users)
        existing_profile = crud.get_doctor_by_user_id(db, guest_user.id)
        if not existing_profile:
            try:
                crud.create_doctor_profile(db, schemas.DoctorCreate(
                    specialization="General Medicine",
                    license_number="GUEST-001"
                ), user_id=guest_user.id)
            except Exception:
                pass  # Profile may already exist with same license_number

        return guest_user

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
