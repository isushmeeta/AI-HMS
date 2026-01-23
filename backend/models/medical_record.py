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

        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}" if self.patient else "Unknown",
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else "Unknown",
            'diagnosis': self.diagnosis,
            'prescription': prescription_data,
            'tests': self.tests,
            'notes': self.notes,
            'visit_date': self.visit_date.isoformat()
        }
