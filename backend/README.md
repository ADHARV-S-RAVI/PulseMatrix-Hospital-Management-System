# Smart Hospital Emergency Management System - Backend

This is a modular Flask-based backend for a Smart Hospital Emergency Management System. It provides REST APIs for authentication, patient management, doctor scheduling, bed occupancy tracking, and real-time analytics.

## Tech Stack
- **Language**: Python 3.x
- **Framework**: Flask
- **Database**: SQLite3
- **Tools**: Flask-CORS (for frontend integration)

## Project Structure
```
backend/
├── app.py              # Main entry point
├── requirements.txt    # Dependencies
├── hospital.db         # SQLite Database
├── README.md           # Documentation
├── database/
│   ├── init_db.py      # Database initialization script
│   └── schema.sql      # Database schema
├── routes/
│   ├── auth_routes.py
│   ├── patient_routes.py
│   ├── doctor_routes.py
│   ├── bed_routes.py
│   └── analytics_routes.py
├── utils/
│   ├── db.py           # Database helpers
│   └── severity.py     # Severity logic
└── sample_data/
    └── seed_data.py    # Sample data script
```

## Installation & Setup

1. **Clone the repository** (or navigate to the project folder).
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Initialize the Database**:
   ```bash
   python database/init_db.py
   ```
4. **Seed Sample Data**:
   ```bash
   python sample_data/seed_data.py
   ```
5. **Run the Backend**:
   ```bash
   python app.py
   ```
   The server will start at `http://127.0.0.1:5000`.

## API Endpoints

### Authentication
- `POST /login`: Validate credentials (`username`, `password`).

### Patient Management
- `POST /add_patient`: Add a new patient.
- `GET /patients`: List all patients (sorted by severity score DESC).
- `GET /patient/<id>`: Get specific patient details.
- `PUT /update_patient/<id>`: Update patient information.
- `DELETE /delete_patient/<id>`: Remove a patient.
- `GET /search_patient?name=...`: Search for patients by name.

### Doctor Management
- `POST /add_doctor`: Add a new doctor.
- `GET /doctors`: List all doctors.
- `PUT /update_doctor/<id>`: Update availability or details.

### Bed Management
- `POST /add_bed`: Add a new hospital bed.
- `GET /beds`: List all beds and status.
- `PUT /update_bed/<id>`: Update bed occupancy status.

### Analytics
- `GET /analytics/total_patients`: Total patient count.
- `GET /analytics/critical_patients`: Count of critical patients (Score 80+).
- `GET /analytics/bed_occupancy`: Bed usage statistics.
- `GET /analytics/department_stats`: Patients per department.
- `GET /analytics/doctor_availability`: Count of available doctors.

## Example Request (Add Patient)
**URL**: `http://127.0.0.1:5000/add_patient`  
**Method**: `POST`  
**Body (JSON)**:
```json
{
  "name": "Sarah Connor",
  "age": 32,
  "gender": "Female",
  "symptoms": "Broken leg",
  "severity_score": 35,
  "department": "Orthopedics"
}
```

## Severity Scoring System
- **80+**: Critical
- **50–79**: High
- **20–49**: Medium
- **Below 20**: Low

Patients are automatically sorted by this score in the emergency queue.
