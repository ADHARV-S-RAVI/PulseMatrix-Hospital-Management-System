import sys
import os
import random
from datetime import datetime, timedelta

# Add parent directory to path to import utils
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.db import execute_db, get_db_connection

def seed_data():
    print("Seeding realistic sample data...")
    
    # Clean all tables first
    tables = ['prescriptions', 'medicines', 'appointments', 'emergency_cases', 
              'patients', 'beds', 'staff', 'doctors', 'users', 'departments']
    for t in tables:
        execute_db(f"DELETE FROM {t}")
        
    departments_list = ['Cardiology', 'Neurology', 'Emergency Medicine', 'Orthopedics', 
                        'Pediatrics', 'Oncology', 'General Surgery', 'Internal Medicine',
                        'Psychiatry', 'Radiology']

    # 1. Departments (10)
    for dept in departments_list:
        execute_db("INSERT INTO departments (name, capacity) VALUES (?, ?)", (dept, random.randint(20, 100)))

    # Fetch department IDs
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT department_id, name FROM departments")
    depts = cur.fetchall()
    dept_map = {row['name']: row['department_id'] for row in depts}
    dept_ids = list(dept_map.values())

    # 2. Users
    execute_db("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ('admin', 'admin123', 'Admin'))
    execute_db("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ('doctor1', 'pass123', 'Doctor'))

    first_names = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Elena", "Liam", "Sophia", "Noah", "Olivia", "Ethan", "Emma"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris"]
    symptoms_list = ["Chest pain, sweating", "High fever, cough", "Severe head injury", "Broken arm", "Shortness of breath", "Abdominal pain", "Dizziness, nausea", "Back pain", "Vision blurring", "Unconscious"]

    # 3. Doctors (50)
    print("Seeding Doctors...")
    doctor_ids = []
    for i in range(50):
        name = f"Dr. {random.choice(first_names)} {random.choice(last_names)}"
        spec = random.choice(departments_list)
        avail = random.choice(['Available', 'Available', 'Unavailable']) # 66% available
        dept_id = dept_map[spec]
        phone = f"555-{random.randint(1000, 9999)}"
        doc_id = execute_db("INSERT INTO doctors (doctor_name, specialization, availability, department_id, contact_number) VALUES (?, ?, ?, ?, ?)", 
                            (name, spec, avail, dept_id, phone))
        doctor_ids.append(doc_id)

    # Update Departments with head doctors
    for dept_id in dept_ids:
        dept_docs = [doc for doc in doctor_ids if cur.execute("SELECT department_id FROM doctors WHERE doctor_id=?", (doc,)).fetchone()['department_id'] == dept_id]
        if dept_docs:
            execute_db("UPDATE departments SET head_doctor_id = ? WHERE department_id = ?", (random.choice(dept_docs), dept_id))

    # 4. Staff (50)
    print("Seeding Staff...")
    roles = ['Nurse', 'Technician', 'Admin', 'Pharmacist', 'Janitor']
    shifts = ['Morning', 'Evening', 'Night']
    for i in range(50):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        role = random.choice(roles)
        dept_id = random.choice(dept_ids)
        shift = random.choice(shifts)
        execute_db("INSERT INTO staff (name, role, department_id, shift) VALUES (?, ?, ?, ?)", (name, role, dept_id, shift))

    # 5. Beds (150)
    print("Seeding Beds...")
    bed_ids = []
    bed_types = ['ICU', 'General Ward', 'Emergency', 'Pediatric', 'Private Room']
    for i in range(150):
        btype = random.choice(bed_types)
        status = random.choice(['Available', 'Available', 'Occupied', 'Maintenance'])
        dept_id = random.choice(dept_ids)
        is_icu = 1 if btype == 'ICU' else 0
        b_id = execute_db("INSERT INTO beds (bed_type, status, department_id, is_icu) VALUES (?, ?, ?, ?)", 
                          (btype, status, dept_id, is_icu))
        bed_ids.append(b_id)

    # 6. Patients (150)
    print("Seeding Patients...")
    patient_ids = []
    for i in range(150):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        age = random.randint(1, 90)
        gender = random.choice(['Male', 'Female'])
        sym = random.choice(symptoms_list)
        sev = random.randint(10, 100)
        dept = random.choice(departments_list)
        
        # assign doctor from that dept if possible
        doc = random.choice(doctor_ids)
        bed = random.choice(bed_ids)
        
        # randomize admission date within last 30 days
        admit_date = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        p_id = execute_db("""INSERT INTO patients (name, age, gender, symptoms, severity_score, department, admission_date, assigned_doctor_id, assigned_bed_id) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
                          (name, age, gender, sym, sev, dept, admit_date.strftime("%Y-%m-%d %H:%M:%S"), doc, bed))
        patient_ids.append(p_id)

    # 7. Emergency Cases (100)
    print("Seeding Emergency Cases...")
    arrival_methods = ['Ambulance', 'Walk-in', 'Helicopter']
    triage_levels = ['Resuscitation', 'Emergent', 'Urgent', 'Less Urgent', 'Non-Urgent']
    for i in range(100):
        p_id = random.choice(patient_ids)
        desc = random.choice(symptoms_list)
        arr = random.choice(arrival_methods)
        triage = random.choice(triage_levels)
        ts = datetime.now() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
        execute_db("INSERT INTO emergency_cases (patient_id, description, arrival_method, triage_level, timestamp) VALUES (?, ?, ?, ?, ?)",
                   (p_id, desc, arr, triage, ts.strftime("%Y-%m-%d %H:%M:%S")))

    # 8. Appointments (200)
    print("Seeding Appointments...")
    app_status = ['Scheduled', 'Completed', 'Cancelled']
    for i in range(200):
        p_id = random.choice(patient_ids)
        d_id = random.choice(doctor_ids)
        dt = datetime.now() + timedelta(days=random.randint(-15, 15), hours=random.randint(8, 17))
        stat = random.choice(app_status)
        execute_db("INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, notes) VALUES (?, ?, ?, ?, ?)",
                   (p_id, d_id, dt.strftime("%Y-%m-%d %H:%M:%S"), stat, "Routine checkup"))

    # 9. Medicines (100)
    print("Seeding Medicines...")
    med_names = ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Aspirin', 'Metformin', 'Lisinopril', 'Simvastatin', 'Omeprazole', 'Losartan', 'Albuterol']
    med_types = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler']
    medicine_ids = []
    for i in range(100):
        name = f"{random.choice(med_names)} {random.randint(100, 500)}mg"
        mtype = random.choice(med_types)
        stock = random.randint(10, 1000)
        price = round(random.uniform(5.0, 150.0), 2)
        m_id = execute_db("INSERT INTO medicines (name, type, stock_quantity, unit_price) VALUES (?, ?, ?, ?)",
                          (name, mtype, stock, price))
        medicine_ids.append(m_id)

    # 10. Prescriptions (150)
    print("Seeding Prescriptions...")
    freqs = ['1x/day', '2x/day', '3x/day', 'As needed']
    for i in range(150):
        p_id = random.choice(patient_ids)
        d_id = random.choice(doctor_ids)
        m_id = random.choice(medicine_ids)
        dose = f"{random.randint(1, 2)} unit(s)"
        freq = random.choice(freqs)
        dt = datetime.now() - timedelta(days=random.randint(0, 30))
        execute_db("INSERT INTO prescriptions (patient_id, doctor_id, medicine_id, dosage, frequency, prescribed_date) VALUES (?, ?, ?, ?, ?, ?)",
                   (p_id, d_id, m_id, dose, freq, dt.strftime("%Y-%m-%d %H:%M:%S")))

    print("All sample data seeded successfully. Ready for DBMS presentation.")

if __name__ == "__main__":
    seed_data()
