import urllib.request, json
req = urllib.request.Request(
    'http://127.0.0.1:8000/appointments/',
    data=json.dumps({'patient_id':1,'doctor_id':1,'date':'2026-03-14','time':'10:00','reason':'test'}).encode(),
    headers={'Content-Type':'application/json'}
)
try:
    print(urllib.request.urlopen(req).read())
except Exception as e:
    print(e.read().decode())
