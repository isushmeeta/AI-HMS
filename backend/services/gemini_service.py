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
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

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

    def hospital_faq(self, question):
        model = self._get_model()
        if not model: return "AI Service Unavailable"
        
        prompt = f"""
        Act as a Hospital Receptionist. Answer: "{question}".
        Context: AI-HMS General Hospital, 123 Health Ave, Open 24/7. OPD: 9-5. Visiting: 4-7 PM.
        Formatting Rules:
        - Use ONLY bullet points for main facts.
        - EXTREMELY concise. Max 3-4 bullets.
        - No long paragraphs.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    def explain_prescription(self, med_list):
        model = self._get_model()
        if not model: return "AI Service Unavailable"

        prompt = f"""
        Act as a Patient Assistant. Briefly explain: "{med_list}".
        Formatting Rules:
        1. **Medicine Name** (Bold)
        2. **Main Use**: (1 short bullet)
        3. **Key Advice**: (Quick bullets like "Take with food", "No alcohol")
        4. **Safety**: (1 critical warning bullet)
        - NO long intros or outros. Keep it visual and clean.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    def explain_lab_report(self, report_text):
        model = self._get_model()
        if not model: return "AI Service Unavailable"

        prompt = f"""
        Act as a Patient Assistant. Explain simply: "{report_text}".
        Formatting Rules:
        - **Subject**: (Bold)
        - **Current Value**: (Brief)
        - **Status**: (High/Low/Normal - 1 word)
        - **What it means**: (1 short sentence)
        - **Disclaimer**: (1 short line: Consult your doctor.)
        - Use bullets and BOLDS. STRICTLY CONCISE.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    def symptom_pre_check(self, symptoms):
        model = self._get_model()
        if not model: return "AI Service Unavailable"

        prompt = f"""
        Act as a Triage Assistant. Symptoms: "{symptoms}".
        Formatting Rules:
        - **Potential Cause**: (Short bullet)
        - **Suggested Care**: (Short bullets, e.g., Rest, Fluids)
        - **Urgency**: (Normal/Urgent/Emergency - 1 word)
        - **Disclaimer**: (Required short sentence)
        - Max 5 total bullets. NO paragraphs.
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

gemini_service = GeminiService()
