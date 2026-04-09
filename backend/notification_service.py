import smtplib
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# SMTP Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")

def send_email(to_email: str, subject: str, body: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"Skipping email to {to_email} (SMTP not configured)")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def trigger_webhook(event_type: str, data: dict):
    if not N8N_WEBHOOK_URL:
        return False
    
    try:
        payload = {
            "event": event_type,
            "data": data
        }
        requests.post(N8N_WEBHOOK_URL, json=payload, timeout=5)
        return True
    except Exception as e:
        print(f"Webhook failed: {e}")
        return False

def notify_appointment_created(appointment_data: dict, patient_email: str):
    subject = "Appointment Confirmed - Smart Prescription System"
    body = f"""
    <html>
    <body>
        <h2>Your Appointment is Confirmed!</h2>
        <p><strong>Date:</strong> {appointment_data.get('date')}</p>
        <p><strong>Time:</strong> {appointment_data.get('time')}</p>
        <p><strong>Reason:</strong> {appointment_data.get('reason')}</p>
        <hr>
        <p>Please arrive 10 minutes early. Thank you!</p>
    </body>
    </html>
    """
    send_email(patient_email, subject, body)
    trigger_webhook("appointment_created", {**appointment_data, "patient_email": patient_email})

def notify_prescription_ready(prescription_data: dict, patient_email: str):
    subject = "New Digital Prescription - Smart Prescription System"
    meds_list = "".join([f"<li>{m.get('name')} - {m.get('dosage')} ({m.get('frequency')})</li>" for m in prescription_data.get('medications', [])])
    
    body = f"""
    <html>
    <body>
        <h2>Your Digital Prescription is Ready</h2>
        <p><strong>Diagnosis:</strong> {prescription_data.get('diagnosis')}</p>
        <h3>Medications:</h3>
        <ul>
            {meds_list}
        </ul>
        <p>You can fulfill this at any participating pharmacy using your Patient ID.</p>
    </body>
    </html>
    """
    send_email(patient_email, subject, body)
    trigger_webhook("prescription_created", {**prescription_data, "patient_email": patient_email})
