"""
notification_routes.py
Notification center backend for the Doctor Portal.
"""
from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db

notification_bp = Blueprint('notifications', __name__)


@notification_bp.route('/notifications/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_notifications(doctor_id):
    """
    GET /notifications/doctor/<doctor_id>
    Returns unread + recent notifications for a doctor (last 50).
    """
    doctor = query_db("SELECT doctor_id FROM doctors WHERE doctor_id = ?", (doctor_id,), one=True)
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404

    notifications = query_db(
        """SELECT n.*, p.name as patient_name
           FROM notifications n
           LEFT JOIN patients p ON n.patient_id = p.patient_id
           WHERE n.doctor_id = ?
           ORDER BY n.created_at DESC
           LIMIT 50""",
        (doctor_id,)
    )

    unread_count = sum(1 for n in notifications if not n['is_read'])
    return jsonify({
        "notifications": notifications,
        "unread_count": unread_count
    }), 200


@notification_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """POST /notifications/<notification_id>/read"""
    notif = query_db("SELECT notification_id FROM notifications WHERE notification_id = ?", (notification_id,), one=True)
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    execute_db("UPDATE notifications SET is_read = 1 WHERE notification_id = ?", (notification_id,))
    return jsonify({"message": "Notification marked as read"}), 200


@notification_bp.route('/notifications/mark-all-read/<int:doctor_id>', methods=['POST'])
def mark_all_read(doctor_id):
    """POST /notifications/mark-all-read/<doctor_id>"""
    execute_db("UPDATE notifications SET is_read = 1 WHERE doctor_id = ?", (doctor_id,))
    return jsonify({"message": "All notifications marked as read"}), 200
