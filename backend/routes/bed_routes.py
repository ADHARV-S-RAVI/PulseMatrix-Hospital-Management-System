from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db

bed_bp = Blueprint('beds', __name__)

@bed_bp.route('/beds', methods=['GET'])
def get_beds():
    """
    GET /beds
    Returns all beds and their status.
    """
    beds = query_db("SELECT * FROM beds")
    return jsonify(beds), 200

@bed_bp.route('/add_bed', methods=['POST'])
def add_bed():
    """
    POST /add_bed
    Adds a new bed to the system.
    """
    data = request.get_json()
    if not data or 'bed_type' not in data:
        return jsonify({"error": "Missing bed_type"}), 400
    
    status = data.get('status', 'Available')
    query = "INSERT INTO beds (bed_type, status) VALUES (?, ?)"
    bed_id = execute_db(query, (data['bed_type'], status))
    
    return jsonify({"message": "Bed added", "bed_id": bed_id}), 201

@bed_bp.route('/update_bed/<int:bed_id>', methods=['PUT'])
def update_bed(bed_id):
    """
    PUT /update_bed/<id>
    Updates bed status (Available/Occupied).
    """
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "Missing status"}), 400
    
    query = "UPDATE beds SET status = ? WHERE bed_id = ?"
    execute_db(query, (data['status'], bed_id))
    
    return jsonify({"message": "Bed status updated"}), 200
