from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    date_of_birth: str
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class DoctorBase(BaseModel):
    specialization: str
    license_number: str

class DoctorCreate(DoctorBase):
    pass

class Doctor(DoctorBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class PharmacyBase(BaseModel):
    location: str
    license_number: str

class PharmacyCreate(PharmacyBase):
    pass

class Pharmacy(PharmacyBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    pharmacy_id: Optional[int] = None
    diagnosis: str
    medications: List[Dict[str, Any]]
    ai_suggestions_used: bool = False

class PrescriptionCreate(PrescriptionBase):
    pass

class Prescription(PrescriptionBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    patient_email: Optional[str] = None # Allowing email input from frontend directly
    date: str
    time: str
    reason: str

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AIRequest(BaseModel):
    symptoms: str

class PrescriptionAIRequest(BaseModel):
    diagnosis: str
    symptoms: str
    patient_age: int
    allergies: Optional[str] = ""

class HealthMetricBase(BaseModel):
    type: str # 'BP', 'Weight', 'Sugar', 'HeartRate'
    value: float
    unit: str
    patient_id: int

class HealthMetricCreate(HealthMetricBase):
    pass

class HealthMetric(HealthMetricBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
