from app import create_app
from models import db
import models.user
import models.patient
import models.doctor
import models.appointment
import models.notification

app = create_app()
with app.app_context():
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()
    print("Database schema updated successfully.")
