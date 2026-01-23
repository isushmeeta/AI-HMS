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

@ai_bp.route('/ai/patient/diagnose', methods=['POST'])
def patient_diagnose():
    print("DEBUG: Hit /ai/patient/diagnose endpoint")
    data = request.get_json()
    print(f"DEBUG: Request Data: {data}")
    symptoms = data.get('symptoms', '')
    if not symptoms:
        return jsonify({'error': 'Symptoms required'}), 400
    
    try:
        results = gemini_service.patient_ai_diagnosis(symptoms)
        print(f"DEBUG: AI Results: {results}")
        return jsonify(results), 200
    except Exception as e:
        print(f"DEBUG: AI Route Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/predict/prescription', methods=['POST'])
def suggest_prescription():
    data = request.get_json()
    diagnosis = data.get('diagnosis')
    patient_id = data.get('patient_id')
    
    if not diagnosis:
        return jsonify({'error': 'Diagnosis required'}), 400
    
    patient_context = None
    if patient_id:
        from models.patient import Patient
        patient = Patient.query.get(patient_id)
        if patient:
            # Calculate age (simplified)
            from datetime import date
            age = date.today().year - patient.dob.year if patient.dob else "unknown"
            patient_context = f"{age} year old {patient.gender} patient"
            if patient.blood_group:
                patient_context += f" with blood group {patient.blood_group}"

    prescriptions = gemini_service.suggest_prescription(diagnosis, patient_context)
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
@ai_bp.route('/ai/patient/chat', methods=['POST'])
def patient_chat():
    data = request.get_json()
    message = data.get('message', '')
    
    # Simple keyword routing for the "Patient Assistant"
    if any(k in message.lower() for k in ['prescription', 'medicine', 'meds']):
        response = gemini_service.explain_prescription(message)
    elif any(k in message.lower() for k in ['report', 'lab', 'test', 'result']):
        response = gemini_service.explain_lab_report(message)
    elif any(k in message.lower() for k in ['symptom', 'pain', 'feel', 'hurt']):
        response = gemini_service.symptom_pre_check(message)
    else:
        response = gemini_service.hospital_faq(message)
        
    return jsonify({'response': response}), 200
