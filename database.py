# Imports
import sqlite3, os, json


# Creates db
def init_db():
    with get_connection() as con:
        cur = con.cursor()

        #cur.execute("DROP TABLE IF EXISTS media")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                type TEXT NOT NULL,
                imdbID TEXT UNIQUE,
                movieJSON TEXT UNIQUE,
                genres TEXT
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
        elif len(args) == 4:
            cur.execute(
                "INSERT OR IGNORE INTO media (imdbID, name, type, movieJSON, genres) VALUES (?, ?, ?, ?, ?)",
                (args[1], args[0], "movie", args[2], args[3])
            )

def add_tv_show(*args):
    with get_connection() as con:
        cur = con.cursor()
        if len(args) == 1:
            cur.execute(
                "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
                (args[0], "tv_show")
            )
        elif len(args) == 4:
            cur.execute(
                "INSERT OR IGNORE INTO media (imdbID, name, type, movieJSON, genres) VALUES (?, ?, ?, ?, ?)",
                (args[1], args[0], "tv_show", args[2], args[3])
            )

def add_anime(*args):
    with get_connection() as con:
        cur = con.cursor()
        if len(args) == 1:
            cur.execute(
                "INSERT OR IGNORE INTO media (name, type) VALUES (?, ?)",
                (args[0], "anime")
            )
        elif len(args) == 4:
            cur.execute(
                "INSERT OR IGNORE INTO media (imdbID, name, type, movieJSON, genres) VALUES (?, ?, ?, ?, ?)",
                (args[1], args[0], "anime", args[2], args[3])
            )

# READ
def get_all_movies():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT id, name, imdbID FROM media WHERE type = 'movie' ORDER BY id"
        )
        result = cur.fetchall()
    return result

def get_all_tv_shows():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT id, name, imdbID FROM media WHERE type = 'tv_show' ORDER BY id"
        )
        result = cur.fetchall()
    return result

def get_all_anime():
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT id, name, imdbID FROM media WHERE type = 'anime' ORDER BY id"
        )
        result = cur.fetchall()
    return result

def get_json(*args):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "SELECT movieJSON FROM media WHERE id = ?",
            (args[0],)
        )

        result = cur.fetchone()
        if result is None:
            return None
        return json.loads(result[0])

# UPDATE
def update(*args):
    with get_connection() as con:
        cur = con.cursor()
        if len(args) == 2:
            cur.execute(
                "UPDATE media SET name = ? WHERE id = ?",
                (args[0], args[1])
            )
        elif len(args) == 4:
            cur.execute(
                "UPDATE media SET name = ?, imdbID = ?, movieJSON = ? WHERE id = ?",
                (args[0], args[2], args[3], args[1])
            )

# DELETE
def delete(row_id):
    with get_connection() as con:
        cur = con.cursor()
        cur.execute(
            "DELETE FROM media WHERE id = ?",
            (row_id,)
        )