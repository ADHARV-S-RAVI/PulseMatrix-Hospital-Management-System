from flask import Blueprint, jsonify
from utils.db import query_db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/total_patients', methods=['GET'])
def total_patients():
    """
    GET /analytics/total_patients
    """
    result = query_db("SELECT COUNT(*) as count FROM patients", one=True)
    return jsonify(result), 200

@analytics_bp.route('/analytics/critical_patients', methods=['GET'])
def critical_patients():
    """
    GET /analytics/critical_patients
    Patients with severity_score >= 80.
    """
    result = query_db("SELECT COUNT(*) as count FROM patients WHERE severity_score >= 80", one=True)
    return jsonify(result), 200

@analytics_bp.route('/analytics/bed_occupancy', methods=['GET'])
def bed_occupancy():
    """
    GET /analytics/bed_occupancy
    """
    query = """
        SELECT 
            COUNT(*) as total_beds,
            SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied_beds
        FROM beds
    """
    result = query_db(query, one=True)
    total = result['total_beds'] if result['total_beds'] else 0
    occupied = result['occupied_beds'] if result['occupied_beds'] else 0
    
    return jsonify({
        "total_beds": total,
        "occupied_beds": occupied,
        "occupancy_rate": (occupied / total * 100) if total > 0 else 0
    }), 200

@analytics_bp.route('/analytics/department_stats', methods=['GET'])
def department_stats():
    """
    GET /analytics/department_stats
    Count of patients per department.
    """
    stats = query_db("SELECT department, COUNT(*) as patient_count FROM patients GROUP BY department")
    return jsonify(stats), 200

@analytics_bp.route('/analytics/doctor_availability', methods=['GET'])
def doctor_availability():
    """
    GET /analytics/doctor_availability
    Count of available doctors.
    """
    query = """
        SELECT 
            COUNT(*) as total_doctors,
            SUM(CASE WHEN availability = 'Available' THEN 1 ELSE 0 END) as available_doctors
        FROM doctors
    """
    result = query_db(query, one=True)
    total = result['total_doctors'] if result['total_doctors'] else 0
    available = result['available_doctors'] if result['available_doctors'] else 0
    
    return jsonify({
        "total_doctors": total,
        "available_doctors": available
    }), 200
