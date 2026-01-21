from flask import Blueprint, jsonify
from sqlalchemy import func
from datetime import datetime, timedelta
from models import db
from models.patient import Patient
from models.doctor import Doctor
from models.appointment import Appointment
from models.medical_record import MedicalRecord

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/analytics/stats', methods=['GET'])
def get_stats():
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_records = MedicalRecord.query.count()
    
    today = datetime.utcnow().date()
    appointments_today = Appointment.query.filter_by(date=today).count()
    
    return jsonify({
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_records': total_records,
        'appointments_today': appointments_today
    }), 200

@analytics_bp.route('/analytics/trends', methods=['GET'])
def get_trends():
    # Last 7 days appointment counts
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=6)
    
    data = db.session.query(Appointment.date, func.count(Appointment.id))\
        .filter(Appointment.date >= start_date)\
        .group_by(Appointment.date)\
        .order_by(Appointment.date).all()
        
    # Format for frontend
    result = []
    current = start_date
    data_dict = {d[0]: d[1] for d in data}
    
    while current <= end_date:
        result.append({
            'name': current.strftime('%a'), # Mon, Tue...
            'date': current.strftime('%Y-%m-%d'),
            'appointments': data_dict.get(current, 0)
        })
        current += timedelta(days=1)
        
    return jsonify(result), 200
