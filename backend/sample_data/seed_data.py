import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.db import execute_db

def seed_data():
    print("Seeding sample data...")

    # 1. Seed Users
    execute_db("DELETE FROM users")
    execute_db("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", 
               ('admin', 'admin123', 'Admin'))
    execute_db("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", 
               ('doctor1', 'pass123', 'Doctor'))

    # 2. Seed Doctors
    execute_db("DELETE FROM doctors")
    doctors = [
        ('Dr. Smith', 'Cardiology', 'Available'),
        ('Dr. Jones', 'Neurology', 'Available'),
        ('Dr. Williams', 'Emergency Medicine', 'Unavailable'),
        ('Dr. Brown', 'Orthopedics', 'Available')
    ]
    for doc in doctors:
        execute_db("INSERT INTO doctors (doctor_name, specialization, availability) VALUES (?, ?, ?)", doc)

    # 3. Seed Beds
    execute_db("DELETE FROM beds")
    beds = [
        ('ICU', 'Occupied'),
        ('General Ward', 'Available'),
        ('Emergency', 'Available'),
        ('Emergency', 'Occupied'),
        ('Pediatric', 'Available')
    ]
    for bed in beds:
        execute_db("INSERT INTO beds (bed_type, status) VALUES (?, ?)", bed)

    # 4. Seed Patients
    execute_db("DELETE FROM patients")
    patients = [
        ('John Doe', 45, 'Male', 'Chest pain, sweating', 85, 'Cardiology'),
        ('Jane Roe', 28, 'Female', 'High fever, cough', 40, 'General Medicine'),
        ('Jim Bean', 60, 'Male', 'Severe head injury', 95, 'Neurology'),
        ('Jake Blake', 15, 'Male', 'Broken arm', 30, 'Orthopedics'),
        ('Jill Hill', 35, 'Female', 'Shortness of breath', 75, 'Emergency')
    ]
    for p in patients:
        execute_db("INSERT INTO patients (name, age, gender, symptoms, severity_score, department) VALUES (?, ?, ?, ?, ?, ?)", p)

    print("Sample data seeded successfully.")

if __name__ == "__main__":
    seed_data()
