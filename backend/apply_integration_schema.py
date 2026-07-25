import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'hospital.db')

NEW_TABLES_SQL = """
PRAGMA foreign_keys = ON;

-- 1. Doctor Assignments History
CREATE TABLE IF NOT EXISTS doctor_assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    assignment_type TEXT DEFAULT 'PRIMARY', -- PRIMARY, CONSULTING, SPECIALIST, SURGEON
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, TRANSFERRED, DISCHARGED
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- 2. Bed Assignments / Transfers History
CREATE TABLE IF NOT EXISTS bed_assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    bed_id INTEGER,
    status TEXT DEFAULT 'OCCUPIED', -- OCCUPIED, TRANSFERRED, DISCHARGED
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE CASCADE
);

-- 3. Unified Vitals History
CREATE TABLE IF NOT EXISTS vitals (
    vital_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    recorded_by TEXT, -- e.g., 'SYSTEM', 'Dr. Smith', 'Nurse'
    heart_rate INTEGER,
    blood_pressure TEXT, -- e.g. '120/80'
    spo2 INTEGER,
    respiratory_rate INTEGER,
    temperature REAL,
    glucose INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);
"""

def apply_schema():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(NEW_TABLES_SQL)
        conn.commit()
        print("[OK] Integration tables created successfully.")
        
        # Verify
        cur = conn.cursor()
        new_tables = ['doctor_assignments', 'bed_assignments', 'vitals']
        for table in new_tables:
            cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
            result = cur.fetchone()
            status = "[OK]" if result else "[MISSING]"
            print(f"  {status} {table}")
    except Exception as e:
        print(f"[ERROR] Error applying schema: {e}")
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    apply_schema()
