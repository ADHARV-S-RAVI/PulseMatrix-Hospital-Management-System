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
    total = query_db("SELECT COUNT(*) as count FROM beds", one=True)['count']
    occupied = query_db("SELECT COUNT(*) as count FROM beds WHERE status = 'Occupied'", one=True)['count']
    
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
    total = query_db("SELECT COUNT(*) as count FROM doctors", one=True)['count']
    available = query_db("SELECT COUNT(*) as count FROM doctors WHERE availability = 'Available'", one=True)['count']
    
    return jsonify({
        "total_doctors": total,
        "available_doctors": available
    }), 200
