import sqlite3
import os

# Database path configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'hospital.db')

def get_db_connection():
    """
    Creates and returns a connection to the SQLite database.
    Row factory is set to sqlite3.Row for dictionary-like access.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def query_db(query, args=(), one=False):
    """
    Helper function to execute queries and return results as list of dictionaries.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, args)
    rv = cur.fetchall()
    conn.commit()
    conn.close()
    
    # Convert sqlite3.Row objects to dictionaries for JSON serialization
    results = [dict(row) for row in rv]
    return (results[0] if results else None) if one else results

def execute_db(query, args=()):
    """
    Helper function to execute non-query commands (INSERT, UPDATE, DELETE).
    Returns the lastrowid if applicable.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(query, args)
    last_id = cur.lastrowid
    conn.commit()
    conn.close()
    return last_id
