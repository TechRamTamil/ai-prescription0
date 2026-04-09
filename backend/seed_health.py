import datetime
from sqlalchemy.orm import Session
import sys
import os

# Add parent directory to path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

import models
from database import SessionLocal, engine

def seed_health_data():
    db = SessionLocal()
    try:
        # Get first patient
        patient = db.query(models.Patient).first()
        if not patient:
            print("No patient found. Please register a patient first.")
            return

        print(f"Seeding data for patient: {patient.id}")

        # Metrics types
        metrics = [
            ('BP', 'mmHg', [120, 122, 118, 121, 125, 123, 119]),
            ('Weight', 'kg', [70.5, 70.8, 70.2, 71.0, 70.5, 70.1, 70.3]),
            ('Sugar', 'mg/dL', [95, 110, 88, 102, 115, 98, 92]),
            ('HeartRate', 'bpm', [72, 75, 78, 74, 76, 73, 75])
        ]

        now = datetime.datetime.utcnow()
        for m_type, unit, values in metrics:
            for i, val in enumerate(values):
                timestamp = now - datetime.timedelta(days=(len(values) - i))
                db_metric = models.HealthMetric(
                    type=m_type,
                    value=val,
                    unit=unit,
                    timestamp=timestamp,
                    patient_id=patient.id
                )
                db.add(db_metric)
        
        db.commit()
        print("Health data seeded successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_health_data()
