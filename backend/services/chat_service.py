import random
from models import db
from models.patient import Patient
from models.appointment import Appointment
from models.doctor import Doctor
from models.medical_record import MedicalRecord
from datetime import datetime

class ChatService:
    def process_query(self, user_id, query):
        query = query.lower()
        
        # 1. Intent: Greeting
        if any(word in query for word in ['hi', 'hello', 'hey']):
            return "Hello! I am your AI Hospital Assistant. Ask me about patients, stats, or schedules."

        # 2. Intent: System Stats (Analytics)
        if 'how many' in query or 'count' in query or 'stats' in query:
            pat_count = Patient.query.count()
            doc_count = Doctor.query.count()
            return f"Currently, we have {pat_count} registered patients and {doc_count} active doctors in the system."

        # 3. Intent: Patient Info (Simple RAG - Retrieval)
        # Look for patient names in the query
        patients = Patient.query.all()
        found_patient = None
        for p in patients:
            if p.first_name.lower() in query or p.last_name.lower() in query:
                found_patient = p
                break
        
        if found_patient:
            # Context found - generate specific answer
            if 'record' in query or 'history' in query:
                records = MedicalRecord.query.filter_by(patient_id=found_patient.id).all()
                if not records:
                    return f"I found patient {found_patient.first_name}, but they have no medical records yet."
                
                latest = records[-1]
                return f"Patient {found_patient.first_name} {found_patient.last_name} was last seen on {latest.visit_date.strftime('%Y-%m-%d')}. Diagnosis: {latest.diagnosis}. Prescription: {latest.prescription or 'None'}."
            
            return f"Patient Details: {found_patient.first_name} {found_patient.last_name}, DOB: {found_patient.dob}, Blood Group: {found_patient.blood_group}."

        # 4. Intent: Doctor Information
        if 'doctor' in query:
            doctors = Doctor.query.limit(3).all()
            doc_names = ", ".join([f"Dr. {d.name} ({d.specialization})" for d in doctors])
            return f"Here are some of our specialists: {doc_names}."

        # 5. Fallback (Simulated AI personality)
        return "I'm not sure about that. Try asking 'Who is patient John?' or 'How many doctors do we have?'"

chat_service = ChatService()
