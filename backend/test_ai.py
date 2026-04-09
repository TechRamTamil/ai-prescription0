import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:8000"
TOKEN = "guest-token" # Or any token if needed

payload = {
    "diagnosis": "Common Cold",
    "symptoms": "Runny nose, sneezing, mild fever",
    "patient_age": 25,
    "allergies": "None"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

print(f"Testing {API_URL}/ai/generate_prescription...")
try:
    response = requests.post(f"{API_URL}/ai/generate_prescription", json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Connection Error: {e}")
