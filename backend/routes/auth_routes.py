from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /login
    Validates username and password. Returns user info if successful.
    """
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    # Query database for user
    user = query_db("SELECT user_id, username, role FROM users WHERE username = ? AND password = ?", 
                    (username, password), one=True)
    
    if user:
        return jsonify({
            "message": "Login successful",
            "user": user
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/register_admin', methods=['POST'])
def register_admin():
    """
    POST /register_admin
    Registers a new administrator with email/username and password.
    """
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing username or password"}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    # Check if user already exists
    existing = query_db("SELECT user_id FROM users WHERE username = ?", (username,), one=True)
    if existing:
        return jsonify({"error": "Administrator with this email already exists"}), 409
        
    try:
        user_id = execute_db("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')", (username, password))
        return jsonify({
            "message": "Administrator registered successfully",
            "user_id": user_id,
            "username": username
        }), 201
    except Exception as e:
        return jsonify({"error": f"Failed to register administrator: {str(e)}"}), 500

@auth_bp.route('/register_doctor', methods=['POST'])
def register_doctor():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data or 'name' not in data:
        return jsonify({"error": "Missing required doctor fields"}), 400
        
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    specialty = data.get('specialty', 'General')
    
    existing = query_db("SELECT user_id FROM users WHERE username = ?", (email,), one=True)
    if existing:
        return jsonify({"error": "Doctor with this email already exists"}), 409
        
    try:
        # Create users auth record
        execute_db("INSERT INTO users (username, password, role) VALUES (?, ?, 'doctor')", (email, password))
        # Create doctors clinical record, mapping email to contact_number
        doctor_id = execute_db("INSERT INTO doctors (doctor_name, specialization, contact_number) VALUES (?, ?, ?)", 
                               (name, specialty, email))
        return jsonify({
            "message": "Doctor registered successfully",
            "doctor_id": doctor_id,
            "username": email,
            "name": name
        }), 201
    except Exception as e:
        return jsonify({"error": f"Failed to register doctor: {str(e)}"}), 500

@auth_bp.route('/login_doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    # Authenticate via users table
    user = query_db("SELECT user_id, username, role FROM users WHERE username = ? AND password = ? AND role = 'doctor'", 
                    (email, password), one=True)
    if not user:
        return jsonify({"error": "Invalid credentials or not a doctor"}), 401
        
    # Get doctor_id via contact_number
    doctor = query_db("SELECT doctor_id, doctor_name FROM doctors WHERE contact_number = ?", (email,), one=True)
    if not doctor:
        return jsonify({"error": "Clinical record not found for this doctor"}), 404
        
    return jsonify({
        "message": "Doctor login successful",
        "doctor_id": doctor['doctor_id'],
        "name": doctor['doctor_name'],
        "email": email
    }), 200
