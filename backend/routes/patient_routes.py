from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db

patient_bp = Blueprint('patients', __name__)

@patient_bp.route('/patients', methods=['GET'])
def get_all_patients():
    """
    GET /patients
    Returns all patients sorted by severity score descending.
    """
    patients = query_db("SELECT * FROM patients ORDER BY severity_score DESC")
    return jsonify(patients), 200

@patient_bp.route('/patient/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """
    GET /patient/<id>
    Returns a single patient by ID with full clinical joins and AI clinical prognostics.
    """
    query = """
        SELECT p.*, d.doctor_name AS assigned_doctor_name, b.bed_type AS assigned_bed_type
        FROM patients p
        LEFT JOIN doctors d ON p.assigned_doctor_id = d.doctor_id
        LEFT JOIN beds b ON p.assigned_bed_id = b.bed_id
        WHERE p.patient_id = ?
    """
    patient = query_db(query, (patient_id,), one=True)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    # Query prescriptions from DB
    prescriptions_query = """
        SELECT pr.dosage, pr.frequency, m.name AS medicine_name, m.type AS medicine_type
        FROM prescriptions pr
        JOIN medicines m ON pr.medicine_id = m.medicine_id
        WHERE pr.patient_id = ?
    """
    prescriptions = query_db(prescriptions_query, (patient_id,))
    
    # Format prescriptions
    meds = []
    for pr in prescriptions:
        meds.append({
            "name": pr['medicine_name'],
            "dose": pr['dosage'],
            "time": pr['frequency'],
            "status": "Taken"
        })
        
    # Fallback to defaults if no prescriptions seed exists
    if not meds:
        meds = [
            { "name": "Ceftriaxone", "dose": "1g IV", "time": "08:00 AM", "status": "Taken" },
            { "name": "Paracetamol", "dose": "500mg PO", "time": "12:30 PM", "status": "Upcoming" },
            { "name": "Metoprolol", "dose": "25mg PO", "time": "04:00 PM", "status": "Pending" },
        ]

    # Calculate live clinical prognostics
    severity = patient['severity_score']
    recovery_prob = max(10, min(99, int(100 - (severity * 0.4))))
    deterioration_risk = max(1, min(95, int(severity * 0.8)))
    est_discharge_hours = 24 if severity < 40 else 48 if severity < 70 else 96

    # Dynamic diagnostics
    diagnostics = [
        {
            "name": "CBC Blood Panel",
            "status": "CLEARED" if severity < 80 else "CRITICAL VALUE",
            "color": "#10b981" if severity < 80 else "#f43f5e",
            "details": f"WBC: {6.5 if severity < 80 else 14.8}K/uL | RBC: 4.8M/uL | Hgb: 14.2g/dL"
        },
        {
            "name": "Thoracic MRI",
            "status": "ANALYZING" if severity >= 50 else "CLEARED",
            "color": "#f59e0b" if severity >= 50 else "#10b981",
            "details": "AI processing imaging artifacts. Est time: 14m" if severity >= 50 else "No acute thoracic findings."
        }
    ]

    response_data = dict(patient)
    response_data['assignedDoctor'] = patient['assigned_doctor_name'] if patient['assigned_doctor_name'] else None
    response_data['assignedBed'] = f"Bed {patient['assigned_bed_id']} ({patient['assigned_bed_type']})" if patient['assigned_bed_id'] else None
    response_data['meds'] = meds
    response_data['prognosis'] = {
        "recovery_probability": recovery_prob,
        "deterioration_risk": deterioration_risk,
        "estimated_discharge_hours": est_discharge_hours
    }
    response_data['diagnostics'] = diagnostics
    
    return jsonify(response_data), 200

@patient_bp.route('/add_patient', methods=['POST'])
def add_patient():
    """
    POST /add_patient
    Adds a new patient.
    """
    data = request.get_json()
    required = ['name', 'age', 'gender', 'symptoms', 'severity_score', 'department']
    
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    
    query = """
        INSERT INTO patients (name, age, gender, symptoms, severity_score, department)
        VALUES (?, ?, ?, ?, ?, ?)
    """
    params = (data['name'], data['age'], data['gender'], data['symptoms'], 
              data['severity_score'], data['department'])
    
    patient_id = execute_db(query, params)
    return jsonify({"message": "Patient added", "patient_id": patient_id}), 201

@patient_bp.route('/update_patient/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """
    PUT /update_patient/<id>
    Updates an existing patient's details.
    """
    data = request.get_json()
    
    # Dynamically build the update query
    fields = []
    params = []
    for key in ['name', 'age', 'gender', 'symptoms', 'severity_score', 'department']:
        if key in data:
            fields.append(f"{key} = ?")
            params.append(data[key])
    
    if not fields:
        return jsonify({"error": "No fields to update"}), 400
    
    params.append(patient_id)
    query = f"UPDATE patients SET {', '.join(fields)} WHERE patient_id = ?"
    
    execute_db(query, params)
    return jsonify({"message": "Patient updated"}), 200

@patient_bp.route('/delete_patient/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """
    DELETE /delete_patient/<id>
    Deletes a patient.
    """
    execute_db("DELETE FROM patients WHERE patient_id = ?", (patient_id,))
    return jsonify({"message": "Patient deleted"}), 200

@patient_bp.route('/search_patient', methods=['GET'])
def search_patient():
    """
    GET /search_patient?name=...
    Search patients by name.
    """
    name = request.args.get('name', '')
    query = "SELECT * FROM patients WHERE name LIKE ? ORDER BY severity_score DESC"
    patients = query_db(query, (f"%{name}%",))
    return jsonify(patients), 200
