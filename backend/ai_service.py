import json

def generate_prescription(diagnosis: str, symptoms: str, patient_age: int, allergies: str = ""):
    # In a real scenario, this would call OpenAI API or a medical LLM.
    # For scaffolding, we return a mock structured response.
    
    mock_response = {
        "diagnosis": diagnosis,
        "medications": [
            {
                "name": "Amoxicillin",
                "dosage": "500mg",
                "frequency": "Three times a day for 7 days",
                "reason": "Standard antibiotic for bacterial infections."
            },
            {
                "name": "Ibuprofen",
                "dosage": "400mg",
                "frequency": "Every 6 hours as needed for pain/fever",
                "reason": "Reduces inflammation and manages fever."
            }
        ],
        "warnings": [],
        "ai_suggestions_used": True
    }
    
    if "penicillin" in allergies.lower():
        mock_response["warnings"].append("Patient is allergic to Penicillin. Alternative antibiotics should be considered.")
        mock_response["medications"][0] = {
            "name": "Azithromycin",
            "dosage": "500mg on day 1, 250mg on days 2-5",
            "frequency": "Once daily",
            "reason": "Alternative antibiotic due to penicillin allergy."
        }
        
    return mock_response

def process_handwritten_prescription(image_bytes: bytes):
    # In a real scenario, this would send the image to a Vision API (like GPT-4o)
    # For scaffolding, we mock a successful OCR extraction
    
    # Simulate processing delay
    import time
    time.sleep(1.5)
    
    mock_digital_prescription = {
        "doctor_name": "Dr. Sarah Smith",
        "clinic": "City General Hospital",
        "date": "2026-03-14",
        "patient_name": "Michael",
        "diagnosis": "Upper Respiratory Infection",
        "medications": [
            {
                "name": "Azithromycin",
                "dosage": "500mg",
                "frequency": "1 tablet daily for 5 days",
                "notes": "Take after meals"
            },
            {
                "name": "Cetirizine",
                "dosage": "10mg",
                "frequency": "1 tablet at night",
                "notes": "For running nose"
            }
        ],
        "confidence_score": 0.92,
        "raw_text_extracted": "Rx: Azithromycin 500mg OD x 5d. Cetirizine 10mg HS. - Dr. Smith"
    }
    
    return mock_digital_prescription
