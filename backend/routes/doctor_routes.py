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
