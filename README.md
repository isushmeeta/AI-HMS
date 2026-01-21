# AI-HMS
# 🏥 AI-Powered Hospital Management System
### A Decision-Support Oriented Healthcare Information System

---

## 📌 Project Overview
The **AI-Powered Hospital Management System (AI-HMS)** is a modular, intelligent healthcare information system designed to automate hospital workflows and provide **AI-assisted decision support** for medical staff.  
The system integrates **machine learning models**, **role-based access control**, **analytics dashboards**, and an **AI chatbot interface** to enhance hospital efficiency and interpretability of clinical data.

This project is developed as a **400-level, multi-semester undergraduate capstone project**, focusing on system architecture, data integrity, and responsible AI integration rather than UI complexity.

---

## 🎯 Objectives
- Automate hospital administrative workflows
- Maintain structured and secure patient records
- Assist doctors with AI-based patient risk analysis
- Provide analytics for hospital management
- Improve system usability through an AI chatbot
- Demonstrate scalable and modular system design

---

## 🧩 System Architecture
Frontend (React + Tailwind)
↓ REST API
Backend (Flask)
↓
PostgreSQL Database + ML Engine
↓
AI Chatbot (LLM API)


----------

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Recharts (Analytics Visualization)

### Backend
- Flask (REST API)
- SQLAlchemy ORM
- JWT Authentication

### Database
- PostgreSQL (Primary Database)
- JSONB support for semi-structured medical data

### Artificial Intelligence
- Machine Learning (Scikit-learn)
- Logistic Regression / Random Forest
- Text Vectorization (TF-IDF)
- LLM-based Chatbot (API-driven)

### Deployment
- Backend: Render
- Frontend: Vercel

---

## 🔐 User Roles & Access Control

| Role | Permissions |
|------|------------|
| Admin | User management, analytics, system overview |
| Doctor | Patient records, diagnosis, AI insights |
| Receptionist | Patient registration, appointment scheduling |

Role-based authorization ensures data security and accountability.

---

## 📂 Core Features

### 1️⃣ Patient Management
- Patient registration and updates
- Medical history tracking
- Visit records and clinical notes
- Secure relational data storage

---

### 2️⃣ Appointment & Queue Management
- Appointment scheduling
- Conflict detection
- Doctor-wise patient queues
- Appointment lifecycle management

---

### 3️⃣ Medical Records Module
- Diagnosis records
- Prescriptions
- Test recommendations
- Longitudinal patient data analysis

---

### 4️⃣ AI-Based Decision Support System
The system includes a **machine learning module** that analyzes patient data to:
- Predict patient health risk levels (Low / Medium / High)
- Identify potential readmission risks
- Highlight high-risk patients for prioritization

The AI module is designed as a **decision support tool**, not a diagnostic replacement.

---

### 5️⃣ Analytics & Reporting Dashboard
- Daily patient statistics
- Doctor workload analysis
- High-risk patient monitoring
- Hospital utilization trends

---

### 6️⃣ AI Chatbot Assistant
A controlled, domain-restricted chatbot that:
- Explains AI predictions and analytics
- Summarizes patient histories
- Answers hospital workflow queries
- Enhances system interpretability

⚠️ The chatbot does **not provide medical diagnosis**.

---

## 🤖 Machine Learning Pipeline
PostgreSQL Data
↓
Data Preprocessing (Pandas)
↓
Feature Engineering
↓
ML Model Training
↓
Prediction API
↓
Stored Results + Chatbot Explanation


---

## 📊 Database Design Overview
Key Tables:
- users
- patients
- appointments
- medical_records
- ml_predictions
- audit_logs

Relational design ensures data consistency and reproducibility of AI predictions.

---

## 🔒 Security Measures
- Password hashing
- JWT-based authentication
- Role-based authorization
- Input validation
- Audit logging

---

## 📄 Documentation & Research
This project includes:
- Literature review on AI in healthcare
- System design documentation
- Database schema diagrams
- AI model justification

---

## ⚠️ Limitations
- Prototype system (not production-ready)
- Limited dataset for ML training
- AI predictions are advisory only
- No real-time medical device integration

---

## 🚀 Future Enhancements
- Deep learning models for diagnosis assistance
- Integration with real hospital information systems
- Mobile application support
- Advanced NLP for clinical text analysis
- Real-time alerting system

---

## 🎓 Academic Relevance
This project demonstrates:
- Applied machine learning
- Secure system architecture
- Responsible AI design
- Database-driven analytics
- Full-stack development skills

---

## 🧠 Ethical Disclaimer
> This system is a prototype intended solely for academic purposes and is not designed for real clinical deployment.

---

## 🏁 Conclusion
The **AI-Powered Hospital Management System** illustrates how artificial intelligence, database systems, and modular software architecture can be combined to improve hospital efficiency and support clinical decision-making while maintaining ethical and security considerations.

---

## 👩‍💻 Author

