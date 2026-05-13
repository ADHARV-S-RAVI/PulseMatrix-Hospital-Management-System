from flask import Blueprint, request, jsonify
from utils.db import query_db

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
