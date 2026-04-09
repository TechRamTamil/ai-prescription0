from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_patient_profile(db: Session, patient: schemas.PatientCreate, user_id: int):
    db_patient = models.Patient(**patient.model_dump(), user_id=user_id)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def create_doctor_profile(db: Session, doctor: schemas.DoctorCreate, user_id: int):
    db_doctor = models.Doctor(**doctor.model_dump(), user_id=user_id)
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def create_pharmacy_profile(db: Session, pharmacy: schemas.PharmacyCreate, user_id: int):
    db_pharmacy = models.Pharmacy(**pharmacy.model_dump(), user_id=user_id)
    db.add(db_pharmacy)
    db.commit()
    db.refresh(db_pharmacy)
    return db_pharmacy

def get_doctor_by_user_id(db: Session, user_id: int):
    return db.query(models.Doctor).filter(models.Doctor.user_id == user_id).first()

def get_patient_by_user_id(db: Session, user_id: int):
    return db.query(models.Patient).filter(models.Patient.user_id == user_id).first()

def create_prescription(db: Session, prescription: schemas.PrescriptionCreate):
    db_prescription = models.Prescription(**prescription.model_dump())
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

def get_prescriptions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Prescription).offset(skip).limit(limit).all()

def get_patient_prescriptions(db: Session, patient_id: int):
    return db.query(models.Prescription).filter(models.Prescription.patient_id == patient_id).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    # Exclude patient_email from dumping into DB model as it's not a column
    appointment_data = appointment.model_dump(exclude={"patient_email"})
    db_appointment = models.Appointment(**appointment_data)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_doctor_appointments(db: Session, doctor_id: int):
    return db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_id).all()

def get_patient_appointments(db: Session, patient_id: int):
    return db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).all()

def create_health_metric(db: Session, metric: schemas.HealthMetricCreate):
    db_metric = models.HealthMetric(**metric.model_dump())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

def get_health_metrics(db: Session, patient_id: int):
    return db.query(models.HealthMetric).filter(models.HealthMetric.patient_id == patient_id).order_by(models.HealthMetric.timestamp.asc()).all()
