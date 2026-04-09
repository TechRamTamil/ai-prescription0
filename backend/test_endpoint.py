import requests
import json

url = "http://127.0.0.1:8000/doctor-login"
payload = {
    "email": "doctor@example.com",
    "password": "password123",
    "doctor_secret_key": "2024"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
