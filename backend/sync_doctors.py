from app import create_app
from models import db
from models.user import User
from models.doctor import Doctor

app = create_app()
with app.app_context():
    doctor_users = User.query.filter_by(role='Doctor').all()
    for user in doctor_users:
        existing_doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not existing_doctor:
            print(f"Creating doctor record for {user.username}")
            new_doctor = Doctor(
                user_id=user.id,
                name=user.username,
                specialization='General Practitioner',
                contact=user.mobile
            )
            db.session.add(new_doctor)
    db.session.commit()
    print("Doctor sync complete.")
