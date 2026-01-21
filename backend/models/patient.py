from datetime import datetime
from . import db

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) 
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    contact_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    address = db.Column(db.Text, nullable=True)
    blood_group = db.Column(db.String(5), nullable=True)
    emergency_contact = db.Column(db.String(15), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'dob': self.dob.isoformat() if self.dob else None,
            'gender': self.gender,
            'contact_number': self.contact_number,
            'email': self.email,
            'address': self.address,
            'blood_group': self.blood_group,
            'emergency_contact': self.emergency_contact,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
