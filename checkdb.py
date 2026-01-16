import sqlite3

con = sqlite3.connect("database.db")
cur = con.cursor()

cur.execute("SELECT * FROM media")
rows = cur.fetchall()

for row in rows:
    print(row)

con.close()