from flask import Blueprint, request, jsonify
from models import db
from models.doctor import Doctor

doctor_bp = Blueprint('doctor_bp', __name__)

@doctor_bp.route('/doctors', methods=['POST'])
def add_doctor():
    data = request.get_json()
    new_doctor = Doctor(
        name=data['name'],
        specialization=data['specialization'],
        contact=data.get('contact'),
        availability=data.get('availability')
    )
    db.session.add(new_doctor)
    db.session.commit()
    return jsonify(new_doctor.to_dict()), 201

@doctor_bp.route('/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([d.to_dict() for d in doctors]), 200

@doctor_bp.route('/doctors/<int:id>', methods=['PUT'])
def update_doctor(id):
    doctor = Doctor.query.get_or_404(id)
    data = request.get_json()
    
    # Validation
    if 'email' in data:
        email = data['email']
        allowed_domains = ['gmail.com', 'ymail.com', 'outlook.com', 'yahoo.com', 'icloud.com']
        domain = email.split('@')[-1] if '@' in email else ''
        if domain not in allowed_domains:
            return jsonify({'error': 'Email must be one of: ' + ", ".join(allowed_domains)}), 400
            
    if 'contact' in data:
        contact = data['contact']
        import re
        if not re.match(r'^\+\d{1,4}\d{7,15}$', contact):
            return jsonify({'error': 'Mobile number must include country code (e.g., +1234567890)'}), 400

    try:
        doctor.name = data.get('name', doctor.name)
        doctor.specialization = data.get('specialization', doctor.specialization)
        doctor.contact = data.get('contact', doctor.contact)
        doctor.availability = data.get('availability', doctor.availability)
        
        db.session.commit()
        return jsonify({'message': 'Doctor updated successfully', 'doctor': doctor.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
