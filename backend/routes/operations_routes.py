"""
operations_routes.py
Handles all 24 operation types for the Doctor Portal.
Follows existing Flask blueprint + sqlite3 pattern from clinical_routes.py.
"""
from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db
import json
import datetime

operations_bp = Blueprint('operations', __name__)

VALID_OPERATION_TYPES = [
    'discharge', 'surgery', 'bed_transfer', 'critical_resources',
    'emergency_code', 'blood_request', 'specialist_consult', 'ventilator',
    'emergency_ot', 'nurse_assistance', 'infusion', 'lab_escalation',
    'imaging_priority', 'deterioration', 'icu_team', 'transport',
    'patient_movement', 'oxygen', 'equipment', 'isolation',
    'documents', 'referral', 'incident', 'handover'
]

VALID_STATUSES = ['Draft', 'Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Completed', 'Rejected', 'Cancelled', 'Failed']

def _create_notification(doctor_id, patient_id, operation_id, op_type, title, message, priority='Normal'):
    """Helper to create a notification when an operation is created or updated."""
    try:
        execute_db(
            "INSERT INTO notifications (doctor_id, patient_id, operation_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (doctor_id, patient_id, operation_id, op_type, title, message, priority)
        )
    except Exception:
        pass  # Notifications are non-critical

def _log_audit(doctor_id, patient_id, action, entity_type, entity_id, details=None):
    """Helper to write an audit log entry."""
    try:
        execute_db(
            "INSERT INTO audit_log (doctor_id, patient_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
            (doctor_id, patient_id, action, entity_type, entity_id, json.dumps(details) if details else None)
        )
    except Exception:
        pass


# ── GET: All operations for a patient ─────────────────────────────────────────
@operations_bp.route('/operations/patient/<int:patient_id>', methods=['GET'])
def get_patient_operations(patient_id):
    """
    GET /operations/patient/<patient_id>
    Returns all operations for a patient, newest first.
    """
    # Verify patient exists
    patient = query_db("SELECT patient_id FROM patients WHERE patient_id = ?", (patient_id,), one=True)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    query = """
        SELECT o.*, d.doctor_name
        FROM operations o
        LEFT JOIN doctors d ON o.doctor_id = d.doctor_id
        WHERE o.patient_id = ?
        ORDER BY o.created_at DESC
    """
    ops = query_db(query, (patient_id,))

    # Parse details JSON for each operation
    for op in ops:
        if op.get('details'):
            try:
                op['details'] = json.loads(op['details'])
            except (json.JSONDecodeError, TypeError):
                pass

    return jsonify(ops), 200

# ── GET: All operations (Admin View) ──────────────────────────────────────────
@operations_bp.route('/operations/all', methods=['GET'])
def get_all_operations():
    """
    GET /operations/all
    Returns all operations for the Admin dashboard.
    """
    query = """
        SELECT o.*, d.doctor_name, p.name as patient_name
        FROM operations o
        LEFT JOIN doctors d ON o.doctor_id = d.doctor_id
        LEFT JOIN patients p ON o.patient_id = p.patient_id
        ORDER BY o.created_at DESC
    """
    ops = query_db(query)

    for op in ops:
        if op.get('details'):
            try:
                op['details'] = json.loads(op['details'])
            except (json.JSONDecodeError, TypeError):
                pass

    return jsonify(ops), 200


# ── POST: Create a new operation ──────────────────────────────────────────────
@operations_bp.route('/operations/patient/<int:patient_id>', methods=['POST'])
def create_operation(patient_id):
    """
    POST /operations/patient/<patient_id>
    Creates a new operation request for a patient.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    # Validate patient exists
    patient = query_db("SELECT patient_id, name FROM patients WHERE patient_id = ?", (patient_id,), one=True)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    operation_type = data.get('operation_type')
    if not operation_type or operation_type not in VALID_OPERATION_TYPES:
        return jsonify({"error": f"Invalid operation_type. Must be one of: {', '.join(VALID_OPERATION_TYPES)}"}), 400

    doctor_id = data.get('doctor_id')
    if not doctor_id:
        return jsonify({"error": "doctor_id required"}), 400

    # Verify doctor exists
    doctor = query_db("SELECT doctor_id, doctor_name FROM doctors WHERE doctor_id = ?", (doctor_id,), one=True)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    priority = data.get('priority', 'Normal')
    status = data.get('status', 'Submitted')
    details = data.get('details', {})

    op_id = execute_db(
        """INSERT INTO operations (patient_id, doctor_id, operation_type, priority, status, details)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (patient_id, doctor_id, operation_type, priority, status, json.dumps(details))
    )

    # Record initial status in history
    execute_db(
        "INSERT INTO operation_status_history (operation_id, old_status, new_status, changed_by_doctor_id) VALUES (?, ?, ?, ?)",
        (op_id, None, status, doctor_id)
    )

    # Create notification
    type_labels = {
        'emergency_code': 'Emergency Code',
        'blood_request': 'Blood Request',
        'specialist_consult': 'Specialist Consultation',
        'ventilator': 'Ventilator Request',
        'emergency_ot': 'Emergency OT',
        'nurse_assistance': 'Nurse Assistance',
        'infusion': 'IV/Infusion Request',
        'lab_escalation': 'Lab Escalation',
        'imaging_priority': 'Imaging Priority',
        'deterioration': 'Deterioration Escalation',
        'icu_team': 'ICU Team Activation',
        'transport': 'Transport Request',
        'patient_movement': 'Patient Movement',
        'oxygen': 'Oxygen Support',
        'equipment': 'Equipment Request',
        'isolation': 'Isolation Request',
        'documents': 'Medical Documents',
        'referral': 'Referral/Transfer',
        'incident': 'Incident Report',
        'handover': 'Shift Handover',
        'discharge': 'Discharge Workflow',
        'surgery': 'Surgery Scheduling',
        'bed_transfer': 'Bed/ICU Transfer',
        'critical_resources': 'Critical Resources',
    }
    label = type_labels.get(operation_type, operation_type.replace('_', ' ').title())
    notif_priority = 'Critical' if operation_type in ['emergency_code', 'deterioration', 'icu_team'] else 'Normal'

    _create_notification(
        doctor_id, patient_id, op_id, operation_type,
        f"{label} Submitted",
        f"{label} request submitted for {patient['name']}.",
        notif_priority
    )

    _log_audit(doctor_id, patient_id, f"CREATE_{operation_type.upper()}", "operations", op_id, details)

    return jsonify({
        "message": f"{label} created successfully",
        "operation_id": op_id,
        "status": status
    }), 201


# ── GET: Single operation ─────────────────────────────────────────────────────
@operations_bp.route('/operations/<int:operation_id>', methods=['GET'])
def get_operation(operation_id):
    """GET /operations/<operation_id>"""
    query = """
        SELECT o.*, d.doctor_name, p.name as patient_name
        FROM operations o
        LEFT JOIN doctors d ON o.doctor_id = d.doctor_id
        LEFT JOIN patients p ON o.patient_id = p.patient_id
        WHERE o.operation_id = ?
    """
    op = query_db(query, (operation_id,), one=True)
    if not op:
        return jsonify({"error": "Operation not found"}), 404

    if op.get('details'):
        try:
            op['details'] = json.loads(op['details'])
        except (json.JSONDecodeError, TypeError):
            pass

    # Get status history
    history = query_db(
        """SELECT h.*, d.doctor_name as changed_by
           FROM operation_status_history h
           LEFT JOIN doctors d ON h.changed_by_doctor_id = d.doctor_id
           WHERE h.operation_id = ? ORDER BY h.changed_at ASC""",
        (operation_id,)
    )
    op['status_history'] = history
    return jsonify(op), 200


# ── PATCH: Update operation status ────────────────────────────────────────────
@operations_bp.route('/operations/<int:operation_id>/status', methods=['PATCH'])
def update_operation_status(operation_id):
    """PATCH /operations/<operation_id>/status"""
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "status field required"}), 400

    new_status = data['status']
    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"}), 400

    op = query_db("SELECT * FROM operations WHERE operation_id = ?", (operation_id,), one=True)
    if not op:
        return jsonify({"error": "Operation not found"}), 404

    old_status = op['status']
    doctor_id = data.get('doctor_id', op['doctor_id'])
    notes = data.get('notes', '')

    now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    completed_at = now if new_status == 'Completed' else None

    if completed_at:
        execute_db(
            "UPDATE operations SET status = ?, updated_at = ?, completed_at = ? WHERE operation_id = ?",
            (new_status, now, completed_at, operation_id)
        )
    else:
        execute_db(
            "UPDATE operations SET status = ?, updated_at = ? WHERE operation_id = ?",
            (new_status, now, operation_id)
        )

    execute_db(
        "INSERT INTO operation_status_history (operation_id, old_status, new_status, changed_by_doctor_id, notes) VALUES (?, ?, ?, ?, ?)",
        (operation_id, old_status, new_status, doctor_id, notes)
    )

    _log_audit(doctor_id, op['patient_id'], f"STATUS_UPDATE_{new_status.upper()}", "operations", operation_id,
               {"old_status": old_status, "new_status": new_status})

    # Notify doctor of status change
    _create_notification(
        op['doctor_id'], op['patient_id'], operation_id, op['operation_type'],
        f"Operation {new_status}",
        f"Your {op['operation_type']} request is now {new_status}.",
        "High" if new_status in ['Completed', 'Rejected'] else "Normal"
    )

    return jsonify({"message": "Status updated", "old_status": old_status, "new_status": new_status}), 200


# ── POST: Cancel an operation ─────────────────────────────────────────────────
@operations_bp.route('/operations/<int:operation_id>/cancel', methods=['POST'])
def cancel_operation(operation_id):
    """POST /operations/<operation_id>/cancel"""
    data = request.get_json() or {}
    doctor_id = data.get('doctor_id')

    op = query_db("SELECT * FROM operations WHERE operation_id = ?", (operation_id,), one=True)
    if not op:
        return jsonify({"error": "Operation not found"}), 404

    if op['status'] in ['Completed', 'Cancelled']:
        return jsonify({"error": f"Cannot cancel an operation with status: {op['status']}"}), 400

    old_status = op['status']
    now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    execute_db(
        "UPDATE operations SET status = 'Cancelled', updated_at = ? WHERE operation_id = ?",
        (now, operation_id)
    )
    execute_db(
        "INSERT INTO operation_status_history (operation_id, old_status, new_status, changed_by_doctor_id, notes) VALUES (?, ?, ?, ?, ?)",
        (operation_id, old_status, 'Cancelled', doctor_id, data.get('reason', ''))
    )

    _log_audit(doctor_id, op['patient_id'], "CANCEL_OPERATION", "operations", operation_id)
    return jsonify({"message": "Operation cancelled"}), 200


# ── Typed helper endpoints ────────────────────────────────────────────────────
def _typed_operation_route(operation_type):
    """Factory for typed operation POST endpoints."""
    def handler():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body required"}), 400
        patient_id = data.get('patient_id')
        if not patient_id:
            return jsonify({"error": "patient_id required"}), 400
        data['operation_type'] = operation_type
        # Forward to main create endpoint logic inline
        with operations_bp.open_resource if False else (lambda: None)():
            pass

        patient = query_db("SELECT patient_id, name FROM patients WHERE patient_id = ?", (patient_id,), one=True)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        doctor_id = data.get('doctor_id')
        if not doctor_id:
            return jsonify({"error": "doctor_id required"}), 400

        priority = data.get('priority', 'Normal')
        status = data.get('status', 'Submitted')
        details = {k: v for k, v in data.items() if k not in ['patient_id', 'doctor_id', 'priority', 'status', 'operation_type']}

        op_id = execute_db(
            "INSERT INTO operations (patient_id, doctor_id, operation_type, priority, status, details) VALUES (?, ?, ?, ?, ?, ?)",
            (patient_id, doctor_id, operation_type, priority, status, json.dumps(details))
        )
        execute_db(
            "INSERT INTO operation_status_history (operation_id, old_status, new_status, changed_by_doctor_id) VALUES (?, ?, ?, ?)",
            (op_id, None, status, doctor_id)
        )
        _log_audit(doctor_id, patient_id, f"CREATE_{operation_type.upper()}", "operations", op_id, details)
        _create_notification(doctor_id, patient_id, op_id, operation_type,
                             f"{operation_type.replace('_',' ').title()} Submitted",
                             f"Request submitted for {patient['name']}.",
                             'Critical' if operation_type in ['emergency_code', 'deterioration', 'icu_team'] else 'Normal')

        return jsonify({"message": "Operation created", "operation_id": op_id, "status": status}), 201
    handler.__name__ = f"handle_{operation_type}"
    return handler

# Register all typed routes
TYPED_ROUTES = [
    ('emergency-code', 'emergency_code'),
    ('blood-request', 'blood_request'),
    ('specialist-consult', 'specialist_consult'),
    ('ventilator', 'ventilator'),
    ('emergency-ot', 'emergency_ot'),
    ('nurse-assistance', 'nurse_assistance'),
    ('infusion', 'infusion'),
    ('lab-escalation', 'lab_escalation'),
    ('imaging-priority', 'imaging_priority'),
    ('deterioration', 'deterioration'),
    ('icu-team', 'icu_team'),
    ('transport', 'transport'),
    ('patient-movement', 'patient_movement'),
    ('oxygen', 'oxygen'),
    ('equipment', 'equipment'),
    ('isolation', 'isolation'),
    ('documents', 'documents'),
    ('referral', 'referral'),
    ('incidents', 'incident'),
    ('handover', 'handover'),
]

for url_suffix, op_type in TYPED_ROUTES:
    handler = _typed_operation_route(op_type)
    operations_bp.add_url_rule(
        f'/operations/{url_suffix}',
        endpoint=f'op_{op_type}',
        view_func=handler,
        methods=['POST']
    )
