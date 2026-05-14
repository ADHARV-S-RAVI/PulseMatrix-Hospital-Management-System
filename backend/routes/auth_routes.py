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
