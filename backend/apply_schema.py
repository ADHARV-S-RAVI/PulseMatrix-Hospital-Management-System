import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'hospital.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')

def apply_schema():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    with open(SCHEMA_PATH, 'r') as f:
        schema_script = f.read()
        
    cursor.executescript(schema_script)
    
    conn.commit()
    conn.close()
    print("Schema applied successfully from schema.sql.")

if __name__ == "__main__":
    apply_schema()
