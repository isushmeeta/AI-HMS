from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.patient_routes import patient_bp
from routes.doctor_routes import doctor_bp
from routes.appointment_routes import appointment_bp
from routes.record_routes import record_bp
from routes.ai_routes import ai_bp
from routes.analytics_routes import analytics_bp
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.notification_routes import notification_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    app.register_blueprint(patient_bp, url_prefix='/api')
    app.register_blueprint(doctor_bp, url_prefix='/api')
    app.register_blueprint(appointment_bp, url_prefix='/api')
    app.register_blueprint(record_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(notification_bp, url_prefix='/api')

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
