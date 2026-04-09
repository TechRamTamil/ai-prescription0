import traceback
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, crud, schemas

# Create tables
models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Check if users already exist
        if not crud.get_user_by_email(db, "doctor@example.com"):
            print("Seeding doctor...")
            user_in = schemas.UserCreate(
                name="Dr. Smith",
                email="doctor@example.com",
                password="password123",
                role="doctor"
            )
            user = crud.create_user(db, user_in)
            crud.create_doctor_profile(db, schemas.DoctorCreate(
                specialization="General Physician",
                license_number="MD12345"
            ), user.id)
            print("Created Doctor: doctor@example.com / password123")

        if not crud.get_user_by_email(db, "patient@example.com"):
            print("Seeding patient...")
            user = crud.create_user(db, schemas.UserCreate(
                name="Michael Scott",
                email="patient@example.com",
                password="password123",
                role="patient"
            ))
            crud.create_patient_profile(db, schemas.PatientCreate(
                date_of_birth="1980-01-01",
                medical_history="None",
                allergies="None"
            ), user.id)
            print("Created Patient: patient@example.com / password123")

    except Exception as e:
        print(f"Error seeding: {e}")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
