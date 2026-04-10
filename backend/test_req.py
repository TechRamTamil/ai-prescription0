import urllib.request
import json
import urllib.error

req = urllib.request.Request(
    'http://127.0.0.1:8000/appointments/',
    data=json.dumps({'patient_id':1,'doctor_id':1,'date':'2026-03-14','time':'10:00','reason':'test'}).encode(),
    headers={'Content-Type':'application/json'}
)
try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(str(e))
