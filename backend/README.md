# AI-HMS Backend

## Setup
1.  Navigate to `backend` directory.
2.  Activate virtual environment:
    - Windows: `.\venv\Scripts\Activate`
    - Mac/Linux: `source venv/bin/activate`
3.  Install dependencies (if not already): `pip install -r requirements.txt`

## Running the App
```bash
python app.py
```

## API Endpoints (Patient Management)
- **POST /api/patients**: Register a new patient.
- **GET /api/patients**: Get all patients.
- **GET /api/patients/<id>**: Get a specific patient.
- **PUT /api/patients/<id>**: Update patient details.
- **DELETE /api/patients/<id>**: Delete a patient.
