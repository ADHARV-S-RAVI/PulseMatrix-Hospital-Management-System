from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db

doctor_bp = Blueprint('doctors', __name__)

@doctor_bp.route('/doctors', methods=['GET'])
def get_doctors():
    """
    GET /doctors
    Returns all doctors.
    """
    doctors = query_db("SELECT * FROM doctors")
    return jsonify(doctors), 200

@doctor_bp.route('/add_doctor', methods=['POST'])
def add_doctor():
    """
    POST /add_doctor
    Adds a new doctor.
    """
    data = request.get_json()
    if not data or 'doctor_name' not in data or 'specialization' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    query = "INSERT INTO doctors (doctor_name, specialization, availability) VALUES (?, ?, ?)"
    availability = data.get('availability', 'Available')
    params = (data['doctor_name'], data['specialization'], availability)
    
    doctor_id = execute_db(query, params)
    return jsonify({"message": "Doctor added", "doctor_id": doctor_id}), 201

@doctor_bp.route('/update_doctor/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    """
    PUT /update_doctor/<id>
    Updates doctor availability or other details.
    """
    data = request.get_json()
    
    fields = []
    params = []
    for key in ['doctor_name', 'specialization', 'availability']:
        if key in data:
            fields.append(f"{key} = ?")
            params.append(data[key])
            
    if not fields:
        return jsonify({"error": "No fields to update"}), 400
    
    params.append(doctor_id)
    query = f"UPDATE doctors SET {', '.join(fields)} WHERE doctor_id = ?"
    
    execute_db(query, params)
    return jsonify({"message": "Doctor updated"}), 200
