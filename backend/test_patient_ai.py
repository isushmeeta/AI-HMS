import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_patient_ai():
    print("Testing Patient AI Chat...")
    
    test_messages = [
        "What are the hospital visiting hours?",
        "Explain my prescription: Amoxicillin 500mg, 1-0-1 for 7 days",
        "Explain this lab report: Hemoglobin 10.5 g/dL (Normal 12-16)",
        "I have a mild fever and cough, what should I do?"
    ]
    
    for msg in test_messages:
        print(f"\nUser: {msg}")
        try:
            response = requests.post(f"{BASE_URL}/ai/patient/chat", json={"message": msg})
            if response.status_code == 200:
                print(f"AI: {response.json()['response']}")
            else:
                print(f"Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Connection Error: {e}")

if __name__ == "__main__":
    # Note: Requires the backend to be running
    test_patient_ai()
