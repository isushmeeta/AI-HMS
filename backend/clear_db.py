from app import create_app
from models import db
from models.user import User
from models.patient import Patient
from models.doctor import Doctor
from models.appointment import Appointment
from models.notification import Notification

# Need to import MedicalRecord if it exists as a model
try:
    from models.medical_record import MedicalRecord
except ImportError:
    MedicalRecord = None

app = create_app()
with app.app_context():
    print("Clearing all data...")
    
    # Order matters for foreign keys
    Appointment.query.delete()
    if MedicalRecord:
        MedicalRecord.query.delete()
    Notification.query.delete()
    Patient.query.delete()
    Doctor.query.delete()
    User.query.delete()
    
    db.session.commit()
    print("Database cleared successfully. You can now register as a new user.")
