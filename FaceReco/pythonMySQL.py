import mysql.connector

# Establishing a connection to the MySQL database
connection = mysql.connector.connect(
    host="localhost",
    user="project",
    password="Barwadia@2002",
    database="attendance_tracking",
    autocommit=True
)

# Checking if the connection is successful
if connection.is_connected():
    print("Connected to MySQL database")
