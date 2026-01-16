# Imports
import sqlite3


# Creates db
def init_db():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                type TEXT NOT NULL
            )
        """)

# Database Connection
def get_connection():
    con = sqlite3.connect('database.db')
    return con

# CREATE
def add_movie(item_name):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
            (item_name, "movie")
        )

def add_tv_show(item_name):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
            (item_name, "tv_show")
        )

def add_anime(item_name):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
            (item_name, "anime")
        )

# READ
def get_all_movies():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT id, name FROM media WHERE type = 'movie' ORDER BY id"
        )
        result = cur.fetchall()
    return result

def get_all_tv_shows():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT id, name FROM media WHERE type = 'tv_show' ORDER BY id"
        )
        result = cur.fetchall()
    return result

def get_all_anime():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT id, name FROM media WHERE type = 'anime' ORDER BY id"
        )
        result = cur.fetchall()
    return result

# UPDATE
def update(row_id, new_name):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "UPDATE media SET name = ? WHERE id = ?",
            (new_name, row_id)
        )

# DELETE
def delete(row_id):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "DELETE FROM media WHERE id = ?",
            (row_id,)
        )