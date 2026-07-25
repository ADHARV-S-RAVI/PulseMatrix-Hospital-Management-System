from flask import Blueprint, jsonify, request
from utils.db import query_db, execute_db

ambulance_bp = Blueprint('ambulance_bp', __name__, url_prefix='/ambulances')

@ambulance_bp.route('/', methods=['GET'])
def get_ambulances():
    try:
        ambulances = query_db("SELECT * FROM ambulances")
        return jsonify({"ambulances": ambulances}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ambulance_bp.route('/', methods=['POST'])
def add_ambulance():
    try:
        data = request.json
        required_fields = ['ambulance_id', 'driver_name', 'emt_team', 'current_location', 'priority_level']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        ambulance_id = data['ambulance_id']
        driver_name = data['driver_name']
        emt_team = data['emt_team']
        current_location = data['current_location']
        destination = data.get('destination', '')
        priority_level = data['priority_level']
        status = data.get('status', 'Available')
        eta = data.get('eta', '')
        
        # Determine color based on status/priority
        color = "#00FFAA" # Standby / Available
        if status in ["Dispatched", "Responding"]:
            color = "#FFD700" if priority_level != "Critical" else "#FF3366"
        elif status == "In Transit":
            color = "#00E5FF"
            
        x = data.get('x', 50.0)
        y = data.get('y', 50.0)

        # Check if exists
        existing = query_db("SELECT ambulance_id FROM ambulances WHERE ambulance_id = ?", (ambulance_id,), one=True)
        if existing:
            return jsonify({"error": "Ambulance ID already exists"}), 400

        execute_db("""
            INSERT INTO ambulances 
            (ambulance_id, driver_name, emt_team, current_location, destination, priority_level, status, eta, x, y, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ambulance_id, driver_name, emt_team, current_location, destination, priority_level, status, eta, x, y, color))
        
        # Log dispatch
        execute_db("""
            INSERT INTO dispatch_logs (ambulance_id, action, notes)
            VALUES (?, ?, ?)
        """, (ambulance_id, f"Added/Dispatched: {status}", f"To {destination} from {current_location}"))

        return jsonify({"message": "Ambulance added successfully", "ambulance_id": ambulance_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ambulance_bp.route('/<ambulance_id>', methods=['PATCH'])
def update_ambulance(ambulance_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        updates = []
        params = []
        for key in ['status', 'destination', 'eta', 'x', 'y', 'priority_level']:
            if key in data:
                updates.append(f"{key} = ?")
                params.append(data[key])
                
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
            
        params.append(ambulance_id)
        execute_db(f"UPDATE ambulances SET {', '.join(updates)} WHERE ambulance_id = ?", tuple(params))
        
        # Log status change if status changed
        if 'status' in data:
            execute_db("""
                INSERT INTO dispatch_logs (ambulance_id, action)
                VALUES (?, ?)
            """, (ambulance_id, f"Status changed to {data['status']}"))

        return jsonify({"message": "Ambulance updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
