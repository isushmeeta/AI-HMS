from flask import Blueprint, request, jsonify
from services.ml_service import ml_service

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/predict/risk', methods=['POST'])
def predict_risk():
    data = request.get_json()
    # Expects: age, sys_bp, dia_bp, heart_rate
    try:
        prediction = ml_service.predict_health_risk(data)
        return jsonify({'risk_level': prediction}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/predict/readmission', methods=['POST'])
def predict_readmission():
    data = request.get_json()
    # Expects: age, prev_visits, chronic (0/1), days_since
    try:
        probability = ml_service.predict_readmission(data)
        return jsonify({'readmission_probability': probability}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from services.gemini_service import gemini_service

@ai_bp.route('/predict/disease', methods=['POST'])
def predict_disease():
    data = request.get_json()
    try:
        symptoms = data.get('symptoms', '')
        if not symptoms:
            return jsonify({'error': 'Symptoms required'}), 400
            
        # Use Gemini Service
        predictions = gemini_service.predict_diagnosis(symptoms)
        return jsonify(predictions), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/predict/prescription', methods=['POST'])
def suggest_prescription():
    data = request.get_json()
    diagnosis = data.get('diagnosis')
    if not diagnosis:
        return jsonify({'error': 'Diagnosis required'}), 400
    
    prescriptions = gemini_service.suggest_prescription(diagnosis)
    return jsonify(prescriptions), 200

@ai_bp.route('/generate/notes', methods=['POST'])
def generate_notes():
    data = request.get_json()
    clinical_data = data.get('data')
    notes = gemini_service.generate_notes(clinical_data)
    return jsonify({'notes': notes}), 200

@ai_bp.route('/predict/interactions', methods=['POST'])
def check_interactions():
    data = request.get_json()
    medicines = data.get('medicines', [])
    if not medicines:
        return jsonify({'error': 'Medicines list required'}), 400
        
    interactions = gemini_service.check_interactions(medicines)
    return jsonify({'interactions': interactions}), 200
