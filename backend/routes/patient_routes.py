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
    Returns a single patient by ID.
    """
    patient = query_db("SELECT * FROM patients WHERE patient_id = ?", (patient_id,), one=True)
    if patient:
        return jsonify(patient), 200
    return jsonify({"error": "Patient not found"}), 404

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
