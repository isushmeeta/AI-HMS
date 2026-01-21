import google.generativeai as genai
import os
import json
from flask import current_app

class GeminiService:
    def __init__(self):
        self.model = None

    def configure(self):
        # Called after app context is set up or lazily
        api_key = current_app.config.get('GEMINI_API_KEY')
        if api_key:
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _get_model(self):
        if not self.model:
            self.configure()
        return self.model

    def predict_diagnosis(self, symptoms):
        model = self._get_model()
        if not model:
            return [{"condition": "AI Service Unavailable", "confidence": 0}]

        prompt = f"""
        Act as a Doctor. Analyze these symptoms: "{symptoms}".
        Provide a list of up to 3 possible diagnoses.
        Return ONLY a JSON array with objects containing 'condition' (string) and 'confidence' (integer 0-100).
        Example: [{{"condition": "Flu", "confidence": 80}}]
        """
        try:
            response = model.generate_content(prompt)
            print(f"Gemini Response: {response.text}") # Debug log
            # Basic cleanup if markdown checks are included
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error details: {str(e)}")
            return [{"condition": f"Error: {str(e)}", "confidence": 0}]

    def suggest_prescription(self, diagnosis):
        model = self._get_model()
        if not model:
            return []

        prompt = f"""
        Act as a Doctor. Suggest a standard prescription for: "{diagnosis}".
        Return ONLY a JSON array of medicines. Each object:
        - name (string)
        - dosage (string)
        - frequency (string, e.g., '1-0-1')
        - duration (string)
        Example: [{{"name": "Paracetamol", "dosage": "500mg", "frequency": "1-0-1", "duration": "5 days"}}]
        """
        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return []
            
    def generate_notes(self, clinical_data):
        model = self._get_model()
        if not model:
            return "AI Service Unavailable"

        prompt = f"""
        Generate specialized medical notes (SOAP format) based on this input:
        {clinical_data}
        Return formatted markdown text.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating notes: {str(e)}"

    def check_interactions(self, medicines):
        model = self._get_model()
        if not model:
            return "AI Service Unavailable"

        med_list = ", ".join([m.get('name', 'Unknown') for m in medicines])
        prompt = f"""
        Act as a Clinical Pharmacist. Check for drug interactions between these medicines: "{med_list}".
        Return a short warning text if there are interactions, or "No significant interactions found." if safe.
        Keep it concise.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error checking interactions: {str(e)}"

gemini_service = GeminiService()
