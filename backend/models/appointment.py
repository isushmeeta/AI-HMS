from datetime import datetime
from . import db

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='Scheduled') # Scheduled, Completed, Cancelled
    reason = db.Column(db.String(255), nullable=True)
    serial_number = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    patient = db.relationship('Patient', backref='appointments')
    doctor = db.relationship('Doctor', backref='appointments')

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}" if self.patient else "Unknown",
            'doctor_id': self.doctor_id,
            'doctor_name': self.doctor.name if self.doctor else "Unknown",
            'date': self.date.isoformat(),
            'time': self.time.strftime('%H:%M'),
            'status': self.status,
            'reason': self.reason,
            'serial_number': self.serial_number
        }
