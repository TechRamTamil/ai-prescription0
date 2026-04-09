from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
import models, schemas, crud, auth, database, ai_service, notification_service, ml_service
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

import os
from dotenv import load_dotenv

# Load from .env file
load_dotenv()

app = FastAPI(
    title="SCRIPGUARD AI",
    description="SMART PRESCRIPTION UNDERSTANDING WITH DRUG DETECTION",
    version="1.0.0",
)

# ── WebSocket Connection Manager ──────────────────────────────────────────
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Handle incoming client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
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


# ── Doctor login with secret key verification ────────────────────────────────
from pydantic import BaseModel as PydanticBaseModel

class DoctorLoginRequest(PydanticBaseModel):
    email: str
    password: str
    doctor_secret_key: str

@app.post("/doctor-login", response_model=schemas.Token)
def doctor_login(request: DoctorLoginRequest, db: Session = Depends(get_db)):
    # 1. Verify the secret key
    DOCTOR_SECRET_KEY = os.getenv("DOCTOR_SECRET_KEY", "DOC-SECRET-2024")
    if request.doctor_secret_key != DOCTOR_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Doctor Secret Key. Access denied.",
        )
    # 2. Verify email & password
    user = crud.get_user_by_email(db, email=request.email)
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 3. Verify role is doctor
    if user.role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for doctors only.",
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
    request: schemas.PrescriptionAIRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can use AI prescription generation")
    
    result = ai_service.generate_prescription(
        diagnosis=request.diagnosis,
        symptoms=request.symptoms,
        patient_age=request.patient_age,
        allergies=request.allergies
    )
    return result

@app.post("/ai/upload_prescription")
async def upload_prescription(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Simulates OCR processing of an uploaded handwritten prescription image.
    In a real system, you would pass the image bytes to a Vision model.
    """
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    result = ai_service.process_handwritten_prescription(image_bytes)
    return result

@app.post("/ai/chat")
def patient_ai_chat(
    payload: Dict[str, str], 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    message = payload.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Optional: fetch patient context if needed
    patient_context = ""
    if current_user.role == "patient" and current_user.patient_profile:
        patient_context = f"Allergies: {current_user.patient_profile.allergies}. History: {current_user.patient_profile.medical_history}"

    response = ai_service.get_chat_response(message, patient_context)
    return {"response": response}

from fastapi.responses import StreamingResponse

@app.post("/ai/chat-stream")
async def patient_ai_chat_stream(
    payload: Dict[str, str], 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    message = payload.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    patient_context = ""
    if current_user.role == "patient" and current_user.patient_profile:
        patient_context = f"Allergies: {current_user.patient_profile.allergies}. History: {current_user.patient_profile.medical_history}"

    return StreamingResponse(
        ai_service.get_chat_stream(message, patient_context),
        media_type="text/event-stream"
    )

@app.post("/ai/predict")
def predict_disease(
    request: schemas.AIRequest, 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    prediction = ai_service.get_disease_prediction(request.symptoms)
    print(f"Prediction result: {prediction}")
    return prediction

@app.post("/ai/analyze-image")
async def analyze_image_endpoint(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Endpoint to analyze a clinical image (skin, X-ray, etc.)"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    analysis = ai_service.analyze_image(contents)
    return analysis

from fastapi import BackgroundTasks

@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # In a real app we would ensure the doctor/patient exist here.
    created_appointment = crud.create_appointment(db=db, appointment=appointment)
    
    # Notification
    try:
        # Try to fetch patient email
        patient = db.query(models.User).join(models.Patient).filter(models.Patient.id == created_appointment.patient_id).first()
        patient_email = patient.email if patient else (appointment.patient_email or "patient@example.com")
        
        background_tasks.add_task(notification_service.notify_appointment_created, appointment.model_dump(), patient_email)
        
        background_tasks.add_task(manager.broadcast, {
            "type": "NEW_APPOINTMENT",
            "data": schemas.Appointment.model_validate(created_appointment).model_dump()
        })
    except Exception as e:
        print(f"Notification error: {e}")

    return created_appointment

@app.post("/prescriptions/", response_model=schemas.Prescription)
def create_prescription(prescription: schemas.PrescriptionCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_prescription = crud.create_prescription(db, prescription)
    
    # Notification
    try:
        patient = db.query(models.User).join(models.Patient).filter(models.Patient.id == db_prescription.patient_id).first()
        patient_email = patient.email if patient else "patient@example.com"
        
        background_tasks.add_task(notification_service.notify_prescription_ready, prescription.model_dump(), patient_email)
        
        background_tasks.add_task(manager.broadcast, {
            "type": "NEW_PRESCRIPTION",
            "data": schemas.Prescription.model_validate(db_prescription).model_dump()
        })
    except Exception as e:
        print(f"Notification error: {e}")
        
    return db_prescription

@app.get("/doctors/{doctor_id}/appointments", response_model=list[schemas.Appointment])
def read_doctor_appointments(doctor_id: int, db: Session = Depends(get_db)):
    return crud.get_doctor_appointments(db, doctor_id=doctor_id)

@app.get("/doctors/me/profile", response_model=schemas.Doctor)
def get_my_doctor_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not a doctor")
    profile = crud.get_doctor_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return profile

@app.get("/patients/me/profile", response_model=schemas.Patient)
def get_my_patient_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not a patient")
    profile = crud.get_patient_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return profile

@app.get("/patients/{patient_id}/prescriptions", response_model=list[schemas.Prescription])
def read_patient_prescriptions(
    patient_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Security: Ensure patients can only see their own prescriptions
    # Simplified for demo: allow doctors to see any patient's prescriptions
    if current_user.role == "patient":
        my_profile = crud.get_patient_by_user_id(db, current_user.id)
        if not my_profile or my_profile.id != patient_id:
            raise HTTPException(status_code=403, detail="Not authorized to view these prescriptions")
            
    return crud.get_patient_prescriptions(db, patient_id=patient_id)

@app.get("/patients/{patient_id}/appointments", response_model=list[schemas.Appointment])
def read_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    return crud.get_patient_appointments(db, patient_id=patient_id)

# ── Emergency & Reminder Endpoints ───────────────────────────────────────────
from typing import List

@app.post("/health-metrics/", response_model=schemas.HealthMetric)
def create_health_metric(metric: schemas.HealthMetricCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return crud.create_health_metric(db=db, metric=metric)

@app.get("/health-metrics/me", response_model=List[schemas.HealthMetric])
def get_my_health_metrics(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    patient = crud.get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return crud.get_health_metrics(db=db, patient_id=patient.id)

# SOS & Alerts
@app.post("/sos/trigger")
async def trigger_sos(
    payload: Dict[str, Any],
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Broadcasts a high-priority SOS alert to all connected dashboards."""
    location = payload.get("location", "Unknown Location")
    message = {
        "type": "EMERGENCY_SOS",
        "data": {
            "patient_name": current_user.name,
            "patient_id": current_user.id,
            "location": location,
            "time": auth.datetime.now().strftime("%H:%M:%S")
        }
    }
    await manager.broadcast(message)
    return {"status": "SOS broadcasted"}

@app.post("/reminders/send")
async def send_reminder(
    payload: Dict[str, Any],
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Sends a medicine reminder to the patient."""
    # In a real app, this would be triggered by a scheduler.
    # For now, we allow the doctor/system to trigger it for the patient.
    message = {
        "type": "MEDICINE_REMINDER",
        "data": {
            "medicine_name": payload.get("medicine_name"),
            "dosage": payload.get("dosage"),
            "instructions": payload.get("instructions", "Take your medicine now.")
        }
    }
    await manager.broadcast(message)
    return {"status": "Reminder sent"}

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    user_count = db.query(models.User).count()
    prescription_count = db.query(models.Prescription).count()
    appointment_count = db.query(models.Appointment).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    
    # Get recent activity
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
    recent_appointments = db.query(models.Appointment).order_by(models.Appointment.id.desc()).limit(5).all()
    
    return {
        "total_users": user_count,
        "active_prescriptions": prescription_count,
        "total_appointments": appointment_count,
        "active_users": active_users,
        "recent_activity": [
            {"id": u.id, "name": u.name, "role": u.role, "email": u.email, "time": u.created_at.strftime("%Y-%m-%d %H:%M")} 
            for u in recent_users
        ],
        "recent_appointments": [
            {"id": a.id, "patient_id": a.patient_id, "doctor_id": a.doctor_id, "date": a.date, "time": a.time, "status": a.status}
            for a in recent_appointments
        ]
    }


# ── Handwriting / Digit Analysis (ML) ──────────────────────────────────────────
@app.post("/ai/analyze-handwriting")
async def analyze_handwriting(file: UploadFile = File(...)):
    """
    Accepts an image file (PNG/JPG/WebP) containing a handwritten digit (0-9).
    Returns the predicted digit, confidence score, and per-class probabilities.
    The content_type check is intentionally lenient because canvas blobs sent
    from browsers may carry an empty or application/octet-stream content type.
    """
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    result = ml_service.predict_digit(image_bytes)
    return result

