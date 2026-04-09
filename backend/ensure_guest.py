from database import SessionLocal
import models, crud

def ensure_guest_doctor():
    db = SessionLocal()
    try:
        guest_email = "guest@prescription.ai"
        user = crud.get_user_by_email(db, email=guest_email)
        if not user:
            print("Creating Guest Doctor...")
            # Create user
            user = models.User(
                name="Guest Physician",
                email=guest_email,
                hashed_password=crud.get_password_hash("guest-password"),
                role="doctor",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create doctor profile
            doctor = models.Doctor(
                user_id=user.id,
                specialty="General Medicine",
                registration_number="GUEST-001",
                experience_years=10,
                consultation_fee=0.0
            )
            db.add(doctor)
            db.commit()
            print(f"Guest Doctor created with ID: {user.id}")
        else:
            print("Guest Doctor already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    ensure_guest_doctor()
