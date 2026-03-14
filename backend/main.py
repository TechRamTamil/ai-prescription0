from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, crud, auth, database, ai_service
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Smart Prescription System API",
    description="Backend API for managing presciptions, users, and AI interactions.",
    version="1.0.0",
)

# Configure CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to AI Smart Prescription API"}

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.post("/ai/generate_prescription")
def generate_ai_prescription(
    diagnosis: str, 
    symptoms: str, 
    patient_age: int, 
    allergies: str = "",
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can use AI prescription generation")
    
    result = ai_service.generate_prescription(
        diagnosis=diagnosis,
        symptoms=symptoms,
        patient_age=patient_age,
        allergies=allergies
    )
    return result

@app.post("/ai/upload_prescription")
async def upload_handwritten_prescription(
    file: UploadFile = File(...),
):
    # Read the file contents (image bytes)
    image_bytes = await file.read()
    
    # Process the image using our AI OCR service
    digital_result = ai_service.process_handwritten_prescription(image_bytes)
    
    # Return the digitized prescription
    return digital_result

@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    # In a real app we would ensure the doctor/patient exist here.
    return crud.create_appointment(db=db, appointment=appointment)

@app.get("/doctors/{doctor_id}/appointments", response_model=list[schemas.Appointment])
def read_doctor_appointments(doctor_id: int, db: Session = Depends(get_db)):
    return crud.get_doctor_appointments(db, doctor_id=doctor_id)

@app.get("/patients/{patient_id}/appointments", response_model=list[schemas.Appointment])
def read_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    return crud.get_patient_appointments(db, patient_id=patient_id)
