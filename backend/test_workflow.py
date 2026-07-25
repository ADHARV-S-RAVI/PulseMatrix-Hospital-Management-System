import urllib.request
import json

def test_workflow():
    print("Testing Patient Creation...")
    req = urllib.request.Request(
        'http://127.0.0.1:5000/add_patient',
        data=json.dumps({
            "name": "John Verification",
            "age": 45,
            "gender": "Male",
            "symptoms": "Chest pain, shortness of breath",
            "severity_score": 85,
            "department": "Cardiology"
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as f:
        res = json.loads(f.read().decode('utf-8'))
        print(res)
        patient_id = res['patient_id']

    print(f"\nTesting Assign Doctor to Patient {patient_id}...")
    req = urllib.request.Request(
        f'http://127.0.0.1:5000/patient/{patient_id}/assign_doctor',
        data=json.dumps({"doctor_id": 1, "assigned_by": "SystemTest"}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as f:
        print(json.loads(f.read().decode('utf-8')))

    print(f"\nTesting Assign Bed to Patient {patient_id}...")
    req = urllib.request.Request(
        f'http://127.0.0.1:5000/patient/{patient_id}/assign_bed',
        data=json.dumps({"bed_id": 1}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as f:
        print(json.loads(f.read().decode('utf-8')))
        
    print(f"\nTesting Patient Timeline for {patient_id}...")
    req = urllib.request.Request(f'http://127.0.0.1:5000/clinical/patient/{patient_id}/timeline')
    with urllib.request.urlopen(req) as f:
        print(json.loads(f.read().decode('utf-8')))

if __name__ == '__main__':
    test_workflow()
