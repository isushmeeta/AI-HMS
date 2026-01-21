import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib
import os

# Create directory if not exists
os.makedirs('backend/ml/models', exist_ok=True)

def train_health_risk_model():
    print("Training Health Risk Model...")
    # Synthetic Data: Age, SystolicBP, DiastolicBP, HeartRate
    # Logic: High BP + High Age = High Risk
    np.random.seed(42)
    n_samples = 1000
    
    age = np.random.randint(20, 90, n_samples)
    sys_bp = np.random.randint(90, 180, n_samples)
    dia_bp = np.random.randint(60, 120, n_samples)
    heart_rate = np.random.randint(50, 110, n_samples)
    
    X = pd.DataFrame({
        'age': age,
        'sys_bp': sys_bp,
        'dia_bp': dia_bp,
        'heart_rate': heart_rate
    })
    
    # Simple rule-based labelling for valid training data
    y = []
    for i in range(n_samples):
        score = 0
        if age[i] > 60: score += 1
        if sys_bp[i] > 140 or dia_bp[i] > 90: score += 2
        if heart_rate[i] > 100: score += 1
        
        if score >= 3: y.append('High')
        elif score >= 1: y.append('Medium')
        else: y.append('Low')
        
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, 'backend/ml/models/health_risk_model.joblib')
    print("Health Risk Model Saved.")

def train_readmission_model():
    print("Training Readmission Risk Model...")
    # Synthetic Data: Age, PreviousVisits, ChronicCondition(0/1), DaysSinceLastVisit
    n_samples = 1000
    
    age = np.random.randint(20, 90, n_samples)
    prev_visits = np.random.randint(0, 10, n_samples)
    chronic = np.random.randint(0, 2, n_samples)
    days_since = np.random.randint(1, 365, n_samples)
    
    X = pd.DataFrame({
        'age': age,
        'prev_visits': prev_visits,
        'chronic': chronic,
        'days_since': days_since
    })
    
    # Label logic
    y = []
    for i in range(n_samples):
        prob = 0.1
        if age[i] > 70: prob += 0.3
        if prev_visits[i] > 5: prob += 0.4
        if chronic[i] == 1: prob += 0.2
        
        y.append(1 if np.random.random() < prob else 0)
        
    clf = LogisticRegression(random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, 'backend/ml/models/readmission_model.joblib')
    print("Readmission Model Saved.")

if __name__ == "__main__":
    train_health_risk_model()
    train_readmission_model()
