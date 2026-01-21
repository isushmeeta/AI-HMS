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
