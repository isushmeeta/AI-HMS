from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db
from models.patient import Patient

patient_bp = Blueprint('patient_bp', __name__)

@patient_bp.route('/patients', methods=['POST'])
def add_patient():
    data = request.get_json()
    try:
        dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        new_patient = Patient(
            first_name=data['first_name'],
            last_name=data['last_name'],
            dob=dob,
            gender=data['gender'],
            contact_number=data['contact_number'],
            email=data.get('email'),
            address=data.get('address'),
            blood_group=data.get('blood_group'),
            emergency_contact=data.get('emergency_contact')
        )
        db.session.add(new_patient)
        db.session.commit()
        return jsonify({'message': 'Patient added successfully', 'patient': new_patient.to_dict()}), 201
    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/patients', methods=['GET'])
def get_patients():
    doctor_id = request.args.get('doctor_id')
    
    if doctor_id:
        from models.appointment import Appointment
        # Join Patient with Appointment to find patients who have an appointment with this doctor
        patients = Patient.query.join(Appointment, Appointment.patient_id == Patient.id)\
                                .filter(Appointment.doctor_id == doctor_id).all()
        # Use set to remove duplicates if a patient has multiple appointments with the same doctor
        # SQLAlchmey .distinct() can also work but list(set()) is Pythonic safe fallback for simple object lists, 
        # though objects might not hash correctly without __hash__.
        # Better to query distinct IDs via SQLAlchemy:
        patients = Patient.query.join(Appointment, Appointment.patient_id == Patient.id)\
                                .filter(Appointment.doctor_id == doctor_id)\
                                .distinct().all()
    else:
        patients = Patient.query.all()
        
    return jsonify([p.to_dict() for p in patients]), 200

@patient_bp.route('/patients/<int:id>', methods=['GET'])
def get_patient(id):
    patient = Patient.query.get_or_404(id)
    return jsonify(patient.to_dict()), 200

@patient_bp.route('/patients/<int:id>', methods=['PUT'])
def update_patient(id):
    patient = Patient.query.get_or_404(id)
    data = request.get_json()
    try:
        if 'dob' in data:
            patient.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        
        patient.first_name = data.get('first_name', patient.first_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.gender = data.get('gender', patient.gender)
        patient.contact_number = data.get('contact_number', patient.contact_number)
        patient.email = data.get('email', patient.email)
        patient.address = data.get('address', patient.address)
        patient.blood_group = data.get('blood_group', patient.blood_group)
        patient.emergency_contact = data.get('emergency_contact', patient.emergency_contact)
        
        db.session.commit()
        return jsonify({'message': 'Patient updated successfully', 'patient': patient.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/patients/<int:id>', methods=['DELETE'])
def delete_patient(id):
    # Check for Admin Role
    import jwt
    from flask import current_app
    
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        if decoded.get('role') != 'Admin':
            return jsonify({'error': 'Unauthorized: Only Admins can delete patients'}), 403
            
        patient = Patient.query.get_or_404(id)
        db.session.delete(patient)
        db.session.commit()
        return jsonify({'message': 'Patient deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
