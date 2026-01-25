# Imports
import sqlite3, os


# Creates db
def init_db():
    with get_connection() as con:
        cur = con.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                type TEXT NOT NULL,
                imdbID TEXT UNIQUE
            )
        """)

# Database Connection
def get_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'database.db')
    con = sqlite3.connect(db_path)
    return con

# CREATE
def add_movie(*args):
    with get_connection() as con:
        cur = con.cursor()
        if len(args) == 1:
            cur.execute(
                "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
                (args[0], "movie")
            )
        elif len(args) == 2:
            cur.execute(
                "INSERT OR IGNORE INTO media (imdbID, name, type) VALUES (?, ?, ?)",
                (args[1], args[0], "movie")
            )

def add_tv_show(*args):
    with get_connection() as con:
        cur = con.cursor()
        if len(args) == 1:
            cur.execute(
                "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
                (args[0], "tv_show")
            )
        elif len(args) == 2:
            cur.execute(
                "INSERT OR IGNORE INTO media (imdbID, name, type) VALUES (?, ?, ?)",
                (args[1], args[0], "tv_show")
            )

def add_anime(*args):
    with get_connection() as con:
        cur = con.cursor()
        if len(args) == 1:
            cur.execute(
                "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
                (args[0], "anime")
            )
        elif len(args) == 2:
            cur.execute(
                "INSERT OR IGNORE INTO media (imdbID, name, type) VALUES (?, ?, ?)",
                (args[1], args[0], "anime")
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