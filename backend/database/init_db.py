import sqlite3
import os

def init_db():
    # Define paths
    db_path = os.path.join(os.path.dirname(__file__), '..', 'hospital.db')
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    
    # Connect to the database (it will be created if it doesn't exist)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Read the schema file
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Execute the schema
    cursor.executescript(schema_sql)
    
    conn.commit()
    conn.close()
    print(f"Database initialized successfully at {db_path}")

if __name__ == "__main__":
    init_db()
