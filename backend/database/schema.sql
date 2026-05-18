-- Database Schema for Smart Hospital Emergency Management System
PRAGMA foreign_keys = ON;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    department_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    head_doctor_id INTEGER,
    capacity INTEGER DEFAULT 0
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    availability TEXT DEFAULT 'Available',
    department_id INTEGER,
    contact_number TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- 4. Staff Table
CREATE TABLE IF NOT EXISTS staff (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department_id INTEGER,
    shift TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- 5. Beds Table
CREATE TABLE IF NOT EXISTS beds (
    bed_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bed_type TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    department_id INTEGER,
    is_icu BOOLEAN DEFAULT 0,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- 6. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    symptoms TEXT,
    severity_score INTEGER NOT NULL,
    department TEXT NOT NULL,
    admission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_doctor_id INTEGER,
    assigned_bed_id INTEGER,
    FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_bed_id) REFERENCES beds(bed_id) ON DELETE SET NULL
);

-- 7. Emergency Cases
CREATE TABLE IF NOT EXISTS emergency_cases (
    case_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    description TEXT NOT NULL,
    arrival_method TEXT,
    triage_level TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- 8. Appointments
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_date DATETIME NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- 9. Medicines
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10, 2)
);

-- 10. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    medicine_id INTEGER,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    prescribed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
);
