import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'hospital.db')

def update_schema():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ambulances (
        ambulance_id TEXT PRIMARY KEY,
        driver_name TEXT NOT NULL,
        emt_team TEXT NOT NULL,
        current_location TEXT NOT NULL,
        destination TEXT,
        priority_level TEXT NOT NULL,
        status TEXT DEFAULT 'Available',
        eta TEXT,
        x REAL DEFAULT 50.0,
        y REAL DEFAULT 50.0,
        color TEXT DEFAULT '#00E5FF'
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispatch_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ambulance_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (ambulance_id) REFERENCES ambulances(ambulance_id) ON DELETE CASCADE
    );
    """)

    # Check if empty, then seed
    cursor.execute("SELECT COUNT(*) FROM ambulances")
    if cursor.fetchone()[0] == 0:
        print("Seeding ambulances...")
        ambulances = [
            ("AMB-01", "John Doe", "Team Alpha", "Station 1", "Sector 4 Crash", "High", "In Transit", "4 mins", 20.0, 30.0, "#FF3366"),
            ("AMB-02", "Jane Smith", "Team Beta", "Station 2", "Cardiac Arrest", "Critical", "Responding", "9 mins", 80.0, 10.0, "#FFD700"),
            ("AMB-03", "Mike Ross", "Team Charlie", "Station 1", "", "Normal", "Standby", "0 mins", 50.0, 50.0, "#00FFAA"),
            ("AMB-04", "Sarah Lee", "Team Delta", "Station 3", "Trauma Pick-up", "High", "In Transit", "12 mins", 10.0, 70.0, "#00E5FF"),
            ("AMB-05", "David Kim", "Team Echo", "Station 2", "", "Normal", "Standby", "0 mins", 90.0, 80.0, "#1C4E80")
        ]
        cursor.executemany("""
            INSERT INTO ambulances (ambulance_id, driver_name, emt_team, current_location, destination, priority_level, status, eta, x, y, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ambulances)
    
    conn.commit()
    conn.close()
    print("Schema updated successfully.")

if __name__ == "__main__":
    update_schema()
