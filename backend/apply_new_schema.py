"""
apply_new_schema.py
Adds new tables to the existing hospital.db for the Doctor Portal enhancement.
Safe to run multiple times — uses IF NOT EXISTS.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'hospital.db')

NEW_TABLES_SQL = """
PRAGMA foreign_keys = ON;

-- Operations: generalized record for all 24 operation types
CREATE TABLE IF NOT EXISTS operations (
    operation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    operation_type TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal',
    status TEXT DEFAULT 'Submitted',
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL
);

-- Status history for audit trail
CREATE TABLE IF NOT EXISTS operation_status_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id INTEGER,
    old_status TEXT,
    new_status TEXT,
    changed_by_doctor_id INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (operation_id) REFERENCES operations(operation_id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER,
    patient_id INTEGER,
    operation_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER,
    patient_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Incident reports
CREATE TABLE IF NOT EXISTS incident_reports (
    incident_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'Moderate',
    actions_taken TEXT,
    status TEXT DEFAULT 'Reported',
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Handover records
CREATE TABLE IF NOT EXISTS handover_records (
    handover_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    from_doctor_id INTEGER,
    to_doctor_id INTEGER,
    content TEXT NOT NULL,
    ai_generated INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- AI recommendations log
CREATE TABLE IF NOT EXISTS ai_recommendations (
    rec_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    rec_type TEXT NOT NULL,
    prompt_hash TEXT,
    response TEXT NOT NULL,
    reviewed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);
"""

def apply_schema():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(NEW_TABLES_SQL)
        conn.commit()
        print("[OK] New tables created successfully (existing tables untouched).")
        
        # Verify
        cur = conn.cursor()
        new_tables = ['operations', 'operation_status_history', 'notifications', 
                      'audit_log', 'incident_reports', 'handover_records', 'ai_recommendations']
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
