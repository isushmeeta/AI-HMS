from flask import Blueprint, request, jsonify
from models import db
from models.notification import Notification

notification_bp = Blueprint('notification_bp', __name__)

@notification_bp.route('/notifications', methods=['GET'])
def get_notifications():
    doctor_id = request.args.get('doctor_id')
    if not doctor_id:
        return jsonify({'error': 'Doctor ID is required'}), 400

    notifications = Notification.query.filter_by(doctor_id=doctor_id).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

@notification_bp.route('/notifications/<int:id>/read', methods=['PUT'])
def mark_as_read(id):
    notification = Notification.query.get_or_404(id)
    notification.is_read = True
    db.session.commit()
    return jsonify(notification.to_dict()), 200
