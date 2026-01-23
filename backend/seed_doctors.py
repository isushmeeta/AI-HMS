import sqlite3
import os

db_path = os.path.join('instance', 'site.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

doctors = [
    ('Dr. John Smith', 'Cardiology', '+1234567890', 'Mon-Fri 09:00-17:00'),
    ('Dr. Sarah Johnson', 'Pediatrics', '+1987654321', 'Tue-Sat 10:00-18:00'),
    ('Dr. Michael Chen', 'Neurology', '+1122334455', 'Mon, Wed, Fri 08:00-16:00'),
    ('Dr. Emily Davis', 'Dermatology', '+1555666777', 'Mon-Thu 09:00-15:00')
]

cursor.executemany('''
    INSERT INTO doctors (name, specialization, contact, availability)
    VALUES (?, ?, ?, ?)
''', doctors)

conn.commit()
conn.close()
print("Sample doctors added successfully.")
