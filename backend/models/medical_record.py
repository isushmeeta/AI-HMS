from datetime import datetime
from . import db

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    prescription = db.Column(db.Text, nullable=True)
    tests = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    symptoms = db.Column(db.Text, nullable=True)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='medical_records')
    doctor = db.relationship('Doctor', backref='medical_records')

    def to_dict(self):
        # Try to parse prescription as JSON, otherwise return as string
        prescription_data = self.prescription
        try:
            import json
            if self.prescription:
                prescription_data = json.loads(self.prescription)
        except (ValueError, TypeError):
            pass

        patient_age = "Unknown"
        patient_gender = "Unknown"
        if self.patient:
            patient_gender = self.patient.gender
            if self.patient.dob:
                from datetime import date
                today = date.today()
                patient_age = today.year - self.patient.dob.year - ((today.month, today.day) < (self.patient.dob.month, self.patient.dob.day))

        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}" if self.patient else "Unknown",
            'patient_gender': patient_gender,
            'patient_age': patient_age,
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else "Unknown",
            'diagnosis': self.diagnosis,
            'prescription': prescription_data,
            'tests': self.tests,
            'notes': self.notes,
            'symptoms': self.symptoms,
            'visit_date': self.visit_date.isoformat()
        }
