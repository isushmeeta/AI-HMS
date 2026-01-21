import joblib
import pandas as pd
import os

class MLService:
    def __init__(self):
        base_path = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_path, '../ml/models')
        
        try:
            self.risk_model = joblib.load(os.path.join(model_path, 'health_risk_model.joblib'))
            self.readmission_model = joblib.load(os.path.join(model_path, 'readmission_model.joblib'))
        except Exception as e:
            print(f"Error loading models: {e}")
            self.risk_model = None
            self.readmission_model = None

    def predict_health_risk(self, data):
        if not self.risk_model: return "Model Error"
        
        df = pd.DataFrame([data])
        prediction = self.risk_model.predict(df)[0]
        return prediction

    def predict_readmission(self, data):
        if not self.readmission_model: return 0.0
        
        df = pd.DataFrame([data])
        probability = self.readmission_model.predict_proba(df)[0][1] # Prob of class 1 (Yes)
        return round(float(probability) * 100, 2)

ml_service = MLService()
