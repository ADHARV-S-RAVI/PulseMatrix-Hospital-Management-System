from flask import Blueprint, jsonify, request
from utils.db import query_db
from utils.priority_queue import EmergencyQueue
from utils.severity_engine import calculate_severity, classify_patient
from utils.dashboard_logic import get_dashboard_summary
from utils.viz_prep import get_severity_distribution_data, get_dept_distribution_data

engine_bp = Blueprint('engine', __name__)

@engine_bp.route('/engine/calculate_severity', methods=['POST'])
def api_calculate_severity():
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({"error": "Missing symptoms"}), 400
        
    symptoms = data.get('symptoms', [])
    if isinstance(symptoms, str):
        symptoms = [s.strip() for s in symptoms.split(',')]
        
    score = calculate_severity(symptoms)
    category = classify_patient(score)
    return jsonify({"score": score, "category": category}), 200

@engine_bp.route('/engine/emergency_queue', methods=['GET'])
def api_emergency_queue():
    patients = query_db("SELECT * FROM patients")
    queue = EmergencyQueue()
    for p in patients:
        queue.add_patient(p['patient_id'], p['name'], p['severity_score'])
    
    return jsonify(queue.peek_queue()), 200

@engine_bp.route('/engine/dashboard_summary', methods=['GET'])
def api_dashboard_summary():
    # Use optimized SQL for metrics where possible
    metrics_query = """
        SELECT 
            COUNT(*) as total_patients,
            SUM(CASE WHEN severity_score >= 85 THEN 1 ELSE 0 END) as critical_count
        FROM patients
    """
    metrics = query_db(metrics_query, one=True)
    
    patients = query_db("SELECT * FROM patients")
    doctors = query_db("SELECT * FROM doctors")
    
    for p in patients:
        p['category'] = classify_patient(p['severity_score'])
        p['status'] = 'Admitted'
        
    for d in doctors:
        d['status'] = 'Busy' if d.get('availability') == 'Unavailable' else 'Available'
        
    beds_count_row = query_db("SELECT COUNT(*) as count FROM beds", one=True)
    beds_count = beds_count_row['count'] if beds_count_row else 0
    
    summary = get_dashboard_summary(patients, doctors, beds_count)
    # Merge with SQL metrics
    summary.update(metrics)
    return jsonify(summary), 200

@engine_bp.route('/engine/viz/severity_distribution', methods=['GET'])
def api_viz_severity():
    patients = query_db("SELECT * FROM patients")
    for p in patients:
        p['category'] = classify_patient(p['severity_score'])
        
    data = get_severity_distribution_data(patients)
    return jsonify(data), 200

@engine_bp.route('/engine/viz/department_distribution', methods=['GET'])
def api_viz_dept():
    stats = query_db("SELECT department as name, COUNT(*) as count FROM patients GROUP BY department")
    data = get_dept_distribution_data(stats)
    return jsonify(data), 200

@engine_bp.route('/engine/viz/admission_trends', methods=['GET'])
def api_viz_trends():
    # Optimized SQL for daily trends
    trends_query = """
        SELECT DATE(admission_date) as day, COUNT(*) as count
        FROM patients
        GROUP BY day
        ORDER BY day DESC
        LIMIT 7
    """
    trends = query_db(trends_query)
    # Reverse to show chronological order for charts
    if trends:
        trends.reverse()
    labels = [t['day'] for t in trends]
    values = [t['count'] for t in trends]
    return jsonify({"labels": labels, "values": values}), 200
