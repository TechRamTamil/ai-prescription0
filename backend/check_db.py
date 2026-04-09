import auth, os
from database import SessionLocal
import models
from dotenv import load_dotenv

load_dotenv()

db = SessionLocal()
try:
    doctor = db.query(models.User).filter(models.User.email == "doctor@example.com").first()
    
    if doctor:
        print(f"Doctor Status: Exists")
        pw_ok = auth.verify_password("password123", doctor.hashed_password)
        print(f"Password 'password123' verification: {'SUCCESS' if pw_ok else 'FAILED'}")
        
        env_secret = os.getenv("DOCTOR_SECRET_KEY")
        print(f"DOCTOR_SECRET_KEY from .env: '{env_secret}'")
    else:
        print("Doctor Not Found")
finally:
    db.close()
