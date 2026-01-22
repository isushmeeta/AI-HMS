from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db
from models.appointment import Appointment
from sqlalchemy import  and_

appointment_bp = Blueprint('appointment_bp', __name__)

@appointment_bp.route('/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()
    try:
        doctor_id = data['doctor_id']
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()
        time_obj = datetime.strptime(data['time'], '%H:%M').time()

        # Conflict Detection: Check if doctor has an appointment at the same slot
        # Assuming 30 min slots for simplicity, but for now exact time match
        conflict = Appointment.query.filter_by(
            doctor_id=doctor_id, 
            date=date_obj,
            time=time_obj,
            status='Scheduled'
        ).first()

        if conflict:
            return jsonify({'error': 'Slot not available'}), 409

        new_appointment = Appointment(
            patient_id=data['patient_id'],
            doctor_id=doctor_id,
            date=date_obj,
            time=time_obj,
            reason=data.get('reason'),
            status='Requested'
        )
        db.session.add(new_appointment)
        
        # Create Notification for the Doctor
        from models.notification import Notification
        patient_name = new_appointment.patient.first_name + " " + new_appointment.patient.last_name if new_appointment.patient else "A patient"
        notification_message = f"New appointment booked by {patient_name} for {date_obj} at {time_obj}"
        
        # We need to commit appointment first to ensure we have the patient data if we were querying it, 
        # but here we might rely on the relationship which might need the object to be in session. 
        # Actually safer to flush or commit.
        
        # Determine patient name for message. 
        # Since patient_id is in data, we can just use that, or query it.
        # Let's simple say "A new appointment..." or fetch patient.
        try:
           from models.patient import Patient
           pat = Patient.query.get(data['patient_id'])
           pat_name = f"{pat.first_name} {pat.last_name}" if pat else "Unknown Patient"
        except:
           pat_name = "Unknown Patient"

        notification_message = f"New appointment: {pat_name} on {date_obj} at {time_obj}"
        
        new_notification = Notification(
            doctor_id=doctor_id,
            message=notification_message
        )
        db.session.add(new_notification)

        db.session.commit()
        return jsonify(new_appointment.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/appointments', methods=['GET'])
def get_appointments():
    date_filter = request.args.get('date')
    doctor_filter = request.args.get('doctor_id')
    
    query = Appointment.query
    
    if date_filter:
        query = query.filter(Appointment.date == datetime.strptime(date_filter, '%Y-%m-%d').date())
    if doctor_filter:
        query = query.filter(Appointment.doctor_id == doctor_filter)
        
    appointments = query.order_by(Appointment.date, Appointment.time).all()
    return jsonify([a.to_dict() for a in appointments]), 200

@appointment_bp.route('/appointments/<int:id>/status', methods=['PUT'])
def update_status(id):
    appointment = Appointment.query.get_or_404(id)
    data = request.get_json()
    appointment.status = data['status']
    db.session.commit()
    return jsonify(appointment.to_dict()), 200

@appointment_bp.route('/appointments/<int:id>/confirm', methods=['PUT'])
def confirm_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    
    # Generate Serial Number
    existing_count = Appointment.query.filter_by(
        doctor_id=appointment.doctor_id,
        date=appointment.date,
        status='Scheduled' # Count only confirmed/scheduled ones
    ).count()
    
    appointment.serial_number = existing_count + 1
    appointment.status = 'Scheduled'
    
    # Create Notification for Patient (Optional but good)
    from models.notification import Notification
    # Assuming Notification model has patient_id or we use a generic role field
    # For now, let's just commit the status change
    
    db.session.commit()
    return jsonify(appointment.to_dict()), 200
