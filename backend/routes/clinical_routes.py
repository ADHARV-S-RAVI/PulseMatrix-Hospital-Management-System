from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db
import datetime

clinical_bp = Blueprint('clinical', __name__)

@clinical_bp.route('/clinical/doctor/<int:doctor_id>/patients', methods=['GET'])
def get_assigned_patients(doctor_id):
    """
    Returns patients assigned to a specific doctor.
    """
    query = """
        SELECT p.*, d.doctor_name AS assigned_doctor_name, b.bed_type AS assigned_bed_type
        FROM patients p
        LEFT JOIN doctors d ON p.assigned_doctor_id = d.doctor_id
        LEFT JOIN beds b ON p.assigned_bed_id = b.bed_id
        WHERE p.assigned_doctor_id = ?
        ORDER BY p.severity_score DESC
    """
    patients = query_db(query, (doctor_id,))
    return jsonify(patients), 200

@clinical_bp.route('/clinical/patient/<int:patient_id>/notes', methods=['GET', 'POST'])
def manage_notes(patient_id):
    """
    GET: Retrieve all clinical notes for a patient.
    POST: Add a new clinical note.
    """
    if request.method == 'GET':
        query = """
            SELECT n.*, d.doctor_name 
            FROM clinical_notes n
            LEFT JOIN doctors d ON n.doctor_id = d.doctor_id
            WHERE n.patient_id = ?
            ORDER BY n.timestamp DESC
        """
        notes = query_db(query, (patient_id,))
        return jsonify(notes), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'note_type' not in data or 'content' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        doctor_id = data.get('doctor_id')
        query = "INSERT INTO clinical_notes (patient_id, doctor_id, note_type, content) VALUES (?, ?, ?, ?)"
        params = (patient_id, doctor_id, data['note_type'], data['content'])
        
        note_id = execute_db(query, params)
        return jsonify({"message": "Note added", "note_id": note_id}), 201

@clinical_bp.route('/clinical/patient/<int:patient_id>/labs', methods=['GET', 'POST'])
def manage_labs(patient_id):
    if request.method == 'GET':
        labs = query_db("SELECT * FROM lab_requests WHERE patient_id = ? ORDER BY request_date DESC", (patient_id,))
        return jsonify(labs), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        doctor_id = data.get('doctor_id')
        query = "INSERT INTO lab_requests (patient_id, doctor_id, test_name) VALUES (?, ?, ?)"
        req_id = execute_db(query, (patient_id, doctor_id, data['test_name']))
        return jsonify({"message": "Lab requested", "request_id": req_id}), 201

@clinical_bp.route('/clinical/patient/<int:patient_id>/imaging', methods=['GET', 'POST'])
def manage_imaging(patient_id):
    if request.method == 'GET':
        imaging = query_db("SELECT * FROM imaging_requests WHERE patient_id = ? ORDER BY request_date DESC", (patient_id,))
        return jsonify(imaging), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        doctor_id = data.get('doctor_id')
        query = "INSERT INTO imaging_requests (patient_id, doctor_id, imaging_type) VALUES (?, ?, ?)"
        req_id = execute_db(query, (patient_id, doctor_id, data['imaging_type']))
        return jsonify({"message": "Imaging requested", "request_id": req_id}), 201

@clinical_bp.route('/clinical/patient/<int:patient_id>/prescriptions', methods=['GET', 'POST'])
def manage_prescriptions(patient_id):
    if request.method == 'GET':
        query = """
            SELECT pr.*, m.name AS medicine_name, m.type AS medicine_type, d.doctor_name
            FROM prescriptions pr
            LEFT JOIN medicines m ON pr.medicine_id = m.medicine_id
            LEFT JOIN doctors d ON pr.doctor_id = d.doctor_id
            WHERE pr.patient_id = ?
            ORDER BY pr.prescribed_date DESC
        """
        prescriptions = query_db(query, (patient_id,))
        return jsonify(prescriptions), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        doctor_id = data.get('doctor_id')
        medicine_id = data.get('medicine_id')
        
        # If no medicine_id is provided, try to find or create the medicine by name
        if not medicine_id and 'medicine_name' in data:
            med_name = data['medicine_name']
            med = query_db("SELECT medicine_id FROM medicines WHERE name = ?", (med_name,), one=True)
            if med:
                medicine_id = med['medicine_id']
            else:
                # Create a new medicine entry
                medicine_id = execute_db("INSERT INTO medicines (name, type) VALUES (?, ?)", (med_name, data.get('medicine_type', 'General')))
                
        if not medicine_id:
            return jsonify({"error": "medicine_id or medicine_name is required"}), 400

        query = "INSERT INTO prescriptions (patient_id, doctor_id, medicine_id, dosage, frequency) VALUES (?, ?, ?, ?, ?)"
        req_id = execute_db(query, (patient_id, doctor_id, medicine_id, data.get('dosage', ''), data.get('frequency', '')))
        return jsonify({"message": "Prescription added", "prescription_id": req_id}), 201

@clinical_bp.route('/clinical/surgeries', methods=['GET', 'POST'])
def manage_surgeries():
    if request.method == 'GET':
        # Get surgeries for today onwards
        query = """
            SELECT s.*, p.name as patient_name, d.doctor_name 
            FROM surgeries s
            LEFT JOIN patients p ON s.patient_id = p.patient_id
            LEFT JOIN doctors d ON s.doctor_id = d.doctor_id
            ORDER BY s.scheduled_date ASC
        """
        surgeries = query_db(query)
        return jsonify(surgeries), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        query = "INSERT INTO surgeries (patient_id, doctor_id, surgery_type, scheduled_date, notes) VALUES (?, ?, ?, ?, ?)"
        params = (data['patient_id'], data['doctor_id'], data['surgery_type'], data['scheduled_date'], data.get('notes', ''))
        req_id = execute_db(query, params)
        return jsonify({"message": "Surgery scheduled", "surgery_id": req_id}), 201

@clinical_bp.route('/clinical/doctor/<int:doctor_id>/dashboard_stats', methods=['GET'])
def get_dashboard_stats(doctor_id):
    """
    Returns aggregated stats for the Doctor Command Center.
    """
    # 1. Assigned Patients & Critical Patients
    patients = query_db("SELECT patient_id, severity_score FROM patients WHERE assigned_doctor_id = ?", (doctor_id,))
    assigned_count = len(patients)
    critical_count = sum(1 for p in patients if p['severity_score'] >= 70)
    
    # 2. Pending Diagnostics (Labs + Imaging for doctor's patients)
    # Just counting all for now for simplicity, or we could join
    pending_labs = query_db("SELECT COUNT(*) as count FROM lab_requests lr JOIN patients p ON lr.patient_id = p.patient_id WHERE p.assigned_doctor_id = ? AND lr.status = 'Pending'", (doctor_id,), one=True)
    pending_img = query_db("SELECT COUNT(*) as count FROM imaging_requests ir JOIN patients p ON ir.patient_id = p.patient_id WHERE p.assigned_doctor_id = ? AND ir.status = 'Pending'", (doctor_id,), one=True)
    
    # Fallback to general count if status column doesn't exist/work easily in old tables
    if pending_labs is None or 'count' not in pending_labs:
        # Fallback query if status column is missing
        pending_labs = query_db("SELECT COUNT(*) as count FROM lab_requests lr JOIN patients p ON lr.patient_id = p.patient_id WHERE p.assigned_doctor_id = ?", (doctor_id,), one=True)
        pending_img = query_db("SELECT COUNT(*) as count FROM imaging_requests ir JOIN patients p ON ir.patient_id = p.patient_id WHERE p.assigned_doctor_id = ?", (doctor_id,), one=True)
        
    pending_count = (pending_labs['count'] if pending_labs else 0) + (pending_img['count'] if pending_img else 0)

    # 3. Upcoming Surgeries (Operations with type 'surgery' or 'emergency_ot' not completed)
    ops_query = """
        SELECT COUNT(*) as count FROM operations o
        JOIN patients p ON o.patient_id = p.patient_id
        WHERE p.assigned_doctor_id = ? AND o.status NOT IN ('Completed', 'Cancelled', 'Failed')
    """
    active_ops = query_db(ops_query, (doctor_id,), one=True)
    active_ops_count = active_ops['count'] if active_ops else 0
    
    surg_query = """
        SELECT COUNT(*) as count FROM operations o
        JOIN patients p ON o.patient_id = p.patient_id
        WHERE p.assigned_doctor_id = ? AND o.operation_type IN ('surgery', 'emergency_ot') AND o.status NOT IN ('Completed', 'Cancelled', 'Failed')
    """
    surg_ops = query_db(surg_query, (doctor_id,), one=True)
    upcoming_surgeries = surg_ops['count'] if surg_ops else 0

    # 4. AI Alerts (Unread critical/high notifications)
    notifs = query_db("SELECT COUNT(*) as count FROM notifications WHERE doctor_id = ? AND is_read = 0 AND priority IN ('Critical', 'High')", (doctor_id,), one=True)
    ai_alerts = notifs['count'] if notifs else 0

    return jsonify({
        "assignedPatients": assigned_count,
        "criticalPatients": critical_count,
        "pendingDiagnostics": pending_count,
        "upcomingSurgeries": upcoming_surgeries,
        "activeOperations": active_ops_count,
        "aiAlerts": ai_alerts
    }), 200

# ---------------------------------------------------------
# NEW INTEGRATION ROUTES: Patient Timeline
# ---------------------------------------------------------

@clinical_bp.route('/clinical/patient/<int:patient_id>/timeline', methods=['GET'])
def get_patient_timeline(patient_id):
    """
    GET /clinical/patient/<id>/timeline
    Returns a unified, chronologically sorted timeline of patient events.
    """
    events = []

    # 1. Admission
    pat = query_db("SELECT admission_date FROM patients WHERE patient_id = ?", (patient_id,), one=True)
    if pat and pat['admission_date']:
        events.append({"type": "ADMISSION", "title": "Patient Admitted", "timestamp": pat['admission_date'], "details": "Initial triage & admission"})

    # 2. Prescriptions
    rx = query_db("SELECT p.prescribed_date, m.name, p.dosage FROM prescriptions p JOIN medicines m ON p.medicine_id = m.medicine_id WHERE p.patient_id = ?", (patient_id,))
    for r in rx:
        events.append({"type": "PRESCRIPTION", "title": f"Prescription: {r['name']}", "timestamp": r['prescribed_date'], "details": r['dosage']})

    # 3. Labs
    labs = query_db("SELECT request_date, test_name, status FROM lab_requests WHERE patient_id = ?", (patient_id,))
    for l in labs:
        events.append({"type": "LAB", "title": f"Lab Ordered: {l['test_name']}", "timestamp": l['request_date'], "details": f"Status: {l['status']}"})

    # 4. Imaging
    imgs = query_db("SELECT request_date, imaging_type, status FROM imaging_requests WHERE patient_id = ?", (patient_id,))
    for i in imgs:
        events.append({"type": "IMAGING", "title": f"Imaging Ordered: {i['imaging_type']}", "timestamp": i['request_date'], "details": f"Status: {i['status']}"})

    # 5. Doctor Assignments
    try:
        d_assign = query_db("SELECT da.assigned_at, d.doctor_name, da.status FROM doctor_assignments da JOIN doctors d ON da.doctor_id = d.doctor_id WHERE da.patient_id = ?", (patient_id,))
        for da in d_assign:
            events.append({"type": "ASSIGNMENT", "title": f"Assigned to {da['doctor_name']}", "timestamp": da['assigned_at'], "details": f"Status: {da['status']}"})
    except:
        pass

    # 6. Bed Assignments
    try:
        b_assign = query_db("SELECT ba.assigned_at, b.bed_type, ba.status, ba.bed_id FROM bed_assignments ba JOIN beds b ON ba.bed_id = b.bed_id WHERE ba.patient_id = ?", (patient_id,))
        for ba in b_assign:
            events.append({"type": "TRANSFER", "title": f"Bed {ba['bed_id']} ({ba['bed_type']})", "timestamp": ba['assigned_at'], "details": f"Status: {ba['status']}"})
    except:
        pass

    # 7. Operations
    try:
        ops = query_db("SELECT created_at, operation_type, status FROM operations WHERE patient_id = ?", (patient_id,))
        for op in ops:
            events.append({"type": "OPERATION", "title": f"Operation: {op['operation_type']}", "timestamp": op['created_at'], "details": f"Status: {op['status']}"})
    except:
        pass

    # Sort events by timestamp descending
    events.sort(key=lambda x: x['timestamp'] if x['timestamp'] else '1970-01-01', reverse=True)

    return jsonify(events), 200
