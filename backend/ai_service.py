import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict, List, Any

load_dotenv()

import logging
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_prescription(diagnosis: str, symptoms: str, patient_age: int, allergies: str = "") -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        return get_mock_prescription(diagnosis, allergies)

    try:
        # Define a list of authorized models to try in order of preference
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-1.5-flash-latest',
            'gemini-pro-latest'
        ]
        
        model = None
        last_error = "No supported models found."
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Quick test (lightweight)
                model.generate_content("Briefly say hello.") 
                break # Found a working model!
            except Exception as e:
                last_error = str(e)
                model = None
                continue
        
        if not model:
            raise Exception(f"All authorized models failed/quota exceeded. Last Error: {last_error}")
            
        prompt = f"""
        As a clinical assistant, suggest a safe prescription for:
        Diagnosis: {diagnosis}
        Symptoms: {symptoms}
        Patient Age: {patient_age}
        Allergies: {allergies}

        Return a JSON object with:
        - medications: list of {{name, dosage, frequency, reason}}
        - warnings: list of strings
        - tamil_instructions: list of strings (Translation of medication names and usage into Tamil)
        - toxicology_report: {{
            "interactions": "Potential drug-drug or drug-allergy interactions",
            "side_effects": "Common and severe side effects",
            "dosage_risk": "Analysis of dosage safety for age/history"
          }}
        """
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(text)
        
        # Ensure fields exist
        if "tamil_instructions" not in result: result["tamil_instructions"] = []
        if "toxicology_report" not in result: result["toxicology_report"] = {}
        
        return result
    except Exception as e:
        print(f"Gemini error: {e}")
        return get_mock_prescription(diagnosis, allergies)

def get_mock_prescription(diagnosis: str, allergies: str) -> Dict[str, Any]:
    # Mock data only returned if deliberately requested or as a last-resort with a warning
    medications = [
        {
            "name": "Amoxicillin",
            "dosage": "500mg",
            "frequency": "Three times a day for 7 days",
            "reason": "Standard antibiotic for bacterial infections."
        }
    ]
    return {
        "diagnosis": diagnosis,
        "medications": medications,
        "warnings": ["AI Model Unavailable. Using fallback clinical template."],
        "ai_suggestions_used": True,
        "is_mock": True
    }

def process_handwritten_prescription(image_bytes: bytes) -> Dict[str, Any]:
    dummy_data = {
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
            }
        ],
        "confidence_score": 0.92,
        "raw_text_extracted": "Rx: Azithromycin 500mg OD x 5d. - Dr. Smith"
    }

    if not GEMINI_API_KEY:
        import time
        time.sleep(1.5)
        return dummy_data
        
    try:
        # Define a list of authorized models to try in order of preference
        models_to_try = [
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-1.5-flash-latest',
            'gemini-pro-latest'
        ]
        
        model = None
        last_error = "No supported models found."
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Quick test (lightweight)
                model.generate_content("Briefly say hello.") 
                break # Found a working model!
            except Exception as e:
                last_error = str(e)
                model = None
                continue
        
        if not model:
            raise Exception(f"All authorized models failed/quota exceeded. Last Error: {last_error}")
            
        prompt = """
        You are a medical assistant OCR system. Extract the details from this handwritten or printed prescription image.
        Return ONLY a JSON object (without markdown blocks) with the following structure:
        {
            "doctor_name": "string",
            "clinic": "string",
            "date": "string",
            "patient_name": "string",
            "diagnosis": "string",
            "medications": [
                {
                    "name": "string",
                    "dosage": "string",
                    "frequency": "string",
                    "reason": "string"
                }
            ],
            "confidence_score": 0.95,
            "raw_text_extracted": "string"
        }
        """
        
        import io
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        
        response = model.generate_content([img, prompt])
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        
        # Ensure confidence score exists
        if "confidence_score" not in data:
            data["confidence_score"] = 0.85
            
        return data

    except Exception as e:
        import traceback
        error_msg = str(e)
        logger.error(f"Gemini Vision error: {error_msg}")
        
        # Consistent mock fallback for demo/quota issues
        mock_data = {
            "doctor_name": "AI System (Fallback)",
            "clinic": "Clinical Demo Center",
            "date": "2026-03-26",
            "patient_name": "Demo Patient",
            "diagnosis": "Analysis Unavailable (Quota Limit)",
            "medications": [
                {
                    "name": "Consult Physician",
                    "dosage": "N/A",
                    "frequency": "Immediate",
                    "reason": "AI Service is temporarily at capacity. Using fallback mode."
                }
            ],
            "confidence_score": 0.0,
            "raw_text_extracted": "Mock data due to API quota limit.",
            "is_mock": True,
            "error_detail": error_msg
        }
        return mock_data

def get_chat_response(message: str, patient_context: str = "") -> str:
    if not GEMINI_API_KEY:
        return "I am your AI Patient Assistant (Demo Mode). Please provide a Gemini API Key for real AI responses."

    try:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception:
            model = genai.GenerativeModel('gemini-2.5-pro')
            
        chat = model.start_chat(history=[])
        response = chat.send_message(f"Context: {patient_context}\nUser: {message}")
        return response.text
    except Exception as e:
        print(f"Gemini chat error: {e}")
        return "I'm having trouble connecting to Gemini. Please check the API key."

def get_chat_stream(message: str, patient_context: str = ""):
    """Generator for streaming AI responses."""
    if not GEMINI_API_KEY:
        yield "I am your AI Patient Assistant (Demo Mode). Please provide a Gemini API Key for real AI responses."
        return

    try:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception:
            model = genai.GenerativeModel('gemini-2.5-pro')
            
        chat = model.start_chat(history=[])
        response = chat.send_message(f"Context: {patient_context}\nUser: {message}", stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Gemini stream error: {e}")
        yield f"Error: {str(e)}"

def analyze_image(image_bytes: bytes):
    """Analyze a clinical image using Gemini Vision."""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Binary data to PIL Image
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))

        prompt = """
        Analyze this clinical image (e.g., skin condition, X-ray, or medical scan). 
        Provide a structured clinical impression as a JSON object:
        - analysis: string (detailed description of findings)
        - potential_diagnosis: string (most likely clinical condition)
        - severity: string (Low / Medium / High)
        - recommendations: list of strings (clinical next steps)
        - disclaimer: string (Standard medical assistant disclaimer)
        """
        
        response = model.generate_content([prompt, img])
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        print(f"Vision error: {e}")
        return {
            "analysis": "Error analyzing image. Please ensure the image is clear and in a supported format.",
            "severity": "Unknown",
            "potential_diagnosis": "N/A",
            "recommendations": ["Re-take photo", "Manual clinical inspection required"],
            "disclaimer": "AI analysis failed."
        }

def get_disease_prediction(symptoms: str) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        return {
            "predictions": [
                {"disease": "Common Cold", "probability": 0.65},
                {"disease": "Flu", "probability": 0.25}
            ],
            "reasoning": "Mock reasoning for demo (Set GEMINI_API_KEY for real prediction)."
        }

    try:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception:
            model = genai.GenerativeModel('gemini-2.5-pro')
            
        prompt = f"""
        Analyze these symptoms and predict the most likely diseases:
        Symptoms: {symptoms}

        Return a JSON object with:
        - predictions: list of {{disease, probability}}
        - reasoning: string explaining the choices
        """
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return data
    except Exception as e:
        print(f"Gemini predict error: {e}")
        return {"error": str(e)}
