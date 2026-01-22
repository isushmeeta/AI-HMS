import sqlite3
import os

db_path = 'instance/site.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Add user_id column to patients table
        cursor.execute('ALTER TABLE patients ADD COLUMN user_id INTEGER REFERENCES users(id)')
        print("Successfully added user_id column to patients table.")
        conn.commit()
    except sqlite3.OperationalError as e:
        if "duplicate column name: user_id" in str(e):
            print("user_id column already exists.")
        else:
            print(f"An error occurred: {e}")
    finally:
        conn.close()
else:
    print(f"Database not found at {db_path}")
