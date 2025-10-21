#-------------------------------------------------------------------------------------------------------------------------------
# IMPORTANT: This python script automates the creation and population of an SQLite database
# from the Snugfit Order Capture Google Sheet document (tab "A00"), specifically designed for order management of online orders.
#-------------------------------------------------------------------------------------------------------------------------------

import sqlite3
import gspread
from oauth2client.service_account import ServiceAccountCredentials

#---------------------------------------------------------------------------
# GOOGLE SHEETS AND SQLITE CONFIGURATION
#---------------------------------------------------------------------------

SPREADSHEET_ID = "1CBs1X0cbDWphWTv7IzIriT16uDOZ0-vrXdk0aVnJY-M"
JSON_KEYFILE = "credentials.json"
DB_FILE = "snugfit_orders.db"

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_name(JSON_KEYFILE, scope)
client = gspread.authorize(creds)

sheet = client.open_by_key(SPREADSHEET_ID).worksheet("A00")
data = sheet.get_all_records()

conn = sqlite3.connect(DB_FILE)
cur = conn.cursor()

#---------------------------------------------------------------------------
# CUSTOMER, PRODUCT, AND ORDER TABLE CREATION
#---------------------------------------------------------------------------

cur.execute('''
CREATE TABLE IF NOT EXISTS Customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    surname TEXT,
    club_school TEXT,
    contact_number TEXT,
    contact_email TEXT
)
''')

# Product Table Creation
cur.execute('''
CREATE TABLE IF NOT EXISTS Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT,
    colour_selection TEXT,
    base_price REAL,
    colour_surcharge REAL,
    UNIQUE(product_code, colour_selection)
)
''')

# Order Table Creation
cur.execute('''
CREATE TABLE IF NOT EXISTS Orders (
    order_date TEXT,
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    impression_id TEXT UNIQUE,
    customer_id INTEGER,
    product_id INTEGER,
    payment_method TEXT,
    payment_status TEXT,
    total_price REAL,
    public_image_url TEXT,
    additional_notes TEXT,
    email_status TEXT,
    FOREIGN KEY(customer_id) REFERENCES Customers(customer_id),
    FOREIGN KEY(product_id) REFERENCES Products(product_id)
)
''')

# Product Catalog Insertion
products = [
    ("MG Standard", "Red", 800, 0),
    ("MG Standard", "Blue", 800, 0),
    ("MG Standard", "Green", 800, 0),
    ("MG Standard", "Black", 800, 0),
    ("MG Standard", "Purple", 800, 0),
    ("MG Standard", "Pink", 800, 0),
    ("MG Standard", "Orange", 800, 0),
    ("MG Standard", "Yellow", 800, 0),
    ("MG Standard", "White", 800, 0),
    ("MG Standard", "Clear", 800, 0),
    ("MG Standard", "Gold (+ R180)", 800, 180),
    ("MG Standard", "Silver (+ R180)", 800, 180),
    ("MG Standard", "Galaxy (+ R180)", 800, 180),
    ("MG Standard", "Dual Colour (+ R180)", 800, 180),
    ("MG Standard", "Tri Colour (+ R180)", 800, 180),
    ("Ortho (T)", "Red", 850, 0),
    ("Ortho (T)", "Blue", 850, 0),
    ("Ortho (T)", "Green", 850, 0),
    ("Ortho (T)", "Black", 850, 0),
    ("Ortho (T)", "Purple", 850, 0),
    ("Ortho (T)", "Pink", 850, 0),
    ("Ortho (T)", "Orange", 850, 0),
    ("Ortho (T)", "Yellow", 850, 0),
    ("Ortho (T)", "White", 850, 0),
    ("Ortho (T)", "Clear", 850, 0),
    ("Ortho (T)", "Gold (+ R180)", 850, 180),
    ("Ortho (T)", "Silver (+ R180)", 850, 180),
    ("Ortho (T)", "Galaxy (+ R180)", 850, 180),
    ("Ortho (T)", "Dual Colour (+ R180)", 850, 180),
    ("Ortho (T)", "Tri Colour (+ R180)", 850, 180),
    ("Ortho (T&B)", "Red", 980, 0),
    ("Ortho (T&B)", "Blue", 980, 0),
    ("Ortho (T&B)", "Green", 980, 0),
    ("Ortho (T&B)", "Black", 980, 0),
    ("Ortho (T&B)", "Purple", 980, 0),
    ("Ortho (T&B)", "Pink", 980, 0),
    ("Ortho (T&B)", "Orange", 980, 0),
    ("Ortho (T&B)", "Yellow", 980, 0),
    ("Ortho (T&B)", "White", 980, 0),
    ("Ortho (T&B)", "Clear", 980, 0),
    ("Ortho (T&B)", "Gold (+ R180)", 980, 180),
    ("Ortho (T&B)", "Silver (+ R180)", 980, 180),
    ("Ortho (T&B)", "Galaxy (+ R180)", 980, 180),
    ("Ortho (T&B)", "Dual Colour (+ R180)", 980, 180),
    ("Ortho (T&B)", "Tri Colour (+ R180)", 980, 180),
    ("Rubberised", "Clear", 980, 0),
    ("Retainer", "Clear", 1600, 0),
    ("Bleaching", "Clear", 1600, 0)
]
cur.executemany('''
INSERT OR IGNORE INTO Products (product_code, colour_selection, base_price, colour_surcharge)
VALUES (?, ?, ?, ?)
''', products)

#---------------------------------------------------------------------------
# FETCHING & SYNCING DATA FROM GOOGLE SHEET
#---------------------------------------------------------------------------

for row in data:
    # Customer Table Data Insertion 
    cur.execute('''
    SELECT customer_id FROM Customers 
    WHERE first_name=? AND surname=? AND contact_email=?''',
    (row.get('Name'), row.get('Surname'), row.get('Email Address')))
    result = cur.fetchone()

    if result:
        customer_id = result[0]
    else:
        cur.execute('''
        INSERT INTO Customers (first_name, surname, club_school, contact_number, contact_email)
        VALUES (?, ?, ?, ?, ?)''',
        (
            row.get('Name'),
            row.get('Surname'),
            row.get('School/Club'),
            row.get('Contact Number'),
            row.get('Email Address')
        ))
        customer_id = cur.lastrowid

    # Fetching Product ID based on Product Code and Colour
    product_code = row.get('Product ID')
    colour = row.get('Colour')

    cur.execute('SELECT product_id FROM Products WHERE product_code=? AND colour_selection=?',
                (product_code, colour))
    product_row = cur.fetchone()

    # Product Table Data Insertion
    if product_row:
        product_id = product_row[0]
    else:
        cur.execute('''
        INSERT INTO Products (product_code, colour_selection, base_price, colour_surcharge)
        VALUES (?, ?, ?, ?)''',
        (product_code, colour, row.get('Amount Due') or 0, 0))
        product_id = cur.lastrowid

    # Order Table Data Insertion 
    cur.execute('''
    INSERT OR IGNORE INTO Orders (
        order_date, impression_id, customer_id, product_id, payment_method, payment_status,
        total_price, public_image_url, additional_notes, email_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
    (
        row.get('Order Date'),
        row.get('Impression #'),
        customer_id,
        product_id,
        row.get('Payment Method'),
        row.get('Paid/Not Paid'),
        row.get('Amount Due'),
        row.get('Logo'),
        row.get('Additional Info'),
        row.get('Email Status')
    ))

conn.commit()
conn.close()
print("SQLite DB has synced successfully with the Google Sheet")
