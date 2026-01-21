from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db
from models.medical_record import MedicalRecord

record_bp = Blueprint('record_bp', __name__)

@record_bp.route('/medical_records', methods=['POST'])
def create_record():
    import json
    data = request.get_json()
    try:
        # Serialize prescription to JSON string if it's a list/dict
        prescription_val = data.get('prescription')
        if isinstance(prescription_val, (list, dict)):
            prescription_val = json.dumps(prescription_val)

        new_record = MedicalRecord(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            diagnosis=data['diagnosis'],
            prescription=prescription_val,
            tests=data.get('tests')
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify(new_record.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@record_bp.route('/medical_records', methods=['GET'])
def get_records():
    patient_filter = request.args.get('patient_id')
    query = MedicalRecord.query
    
    if patient_filter:
        query = query.filter_by(patient_id=patient_filter)
        
    records = query.order_by(MedicalRecord.visit_date.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200

@record_bp.route('/medical_records/<int:id>', methods=['DELETE'])
def delete_record(id):
    record = MedicalRecord.query.get_or_404(id)
    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': 'Record deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
