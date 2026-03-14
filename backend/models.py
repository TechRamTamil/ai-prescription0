from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # 'admin', 'doctor', 'patient', 'pharmacy'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    pharmacy_profile = relationship("Pharmacy", back_populates="user", uselist=False)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date_of_birth = Column(String)
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)

    user = relationship("User", back_populates="patient_profile")
    prescriptions = relationship("Prescription", back_populates="patient")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    specialization = Column(String)
    license_number = Column(String, unique=True)

    user = relationship("User", back_populates="doctor_profile")
    prescriptions = relationship("Prescription", back_populates="doctor")


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String)
    license_number = Column(String, unique=True)

    user = relationship("User", back_populates="pharmacy_profile")
    prescriptions = relationship("Prescription", back_populates="pharmacy")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=True)
    
    diagnosis = Column(String)
    medications = Column(JSON)  # List of dicts: name, dosage, frequency
    ai_suggestions_used = Column(Boolean, default=False)
    status = Column(String, default="pending")  # pending, fulfilled
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    pharmacy = relationship("Pharmacy", back_populates="prescriptions")
