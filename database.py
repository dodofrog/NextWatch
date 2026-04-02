# Imports
import psycopg, os, json
from dotenv import load_dotenv

load_dotenv()

# Server connection
def get_connection():
    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", 5432)
    )

# Creates db
def init_db():
    with get_connection() as con:
        with con.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS media (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    type TEXT NOT NULL,
                    imdbID TEXT UNIQUE,
                    JSON JSONB UNIQUE,
                    genres TEXT
                )
            """)
        con.commit()

# CREATE
def add_movie(*args):
    with get_connection() as con:
        with con.cursor() as cur:
            if len(args) == 1:
                cur.execute(
                    "INSERT INTO media (name, type) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (args[0], "movie")
                )
            elif len(args) == 4:
                cur.execute(
                    "INSERT INTO media (imdbID, name, type, JSON, genres) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                    (args[1], args[0], "movie", json.dumps(args[2]), args[3])
                )
        con.commit()

def add_tv_show(*args):
    with get_connection() as con:
        with con.cursor() as cur:
            if len(args) == 1:
                cur.execute(
                    "INSERT INTO media (name, type) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (args[0], "tv_show")
                )
            elif len(args) == 4:
                cur.execute(
                    "INSERT INTO media (imdbID, name, type, JSON, genres) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                    (args[1], args[0], "tv_show", json.dumps(args[2]), args[3])
                )
        con.commit()

def add_anime(*args):
    with get_connection() as con:
        with con.cursor() as cur:
            if len(args) == 1:
                cur.execute(
                    "INSERT INTO media (name, type) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (args[0], "anime")
                )
            elif len(args) == 4:
                cur.execute(
                    "INSERT INTO media (imdbID, name, type, JSON, genres) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                    (args[1], args[0], "anime", json.dumps(args[2]), args[3])
                )
        con.commit()

# READ
def get_all_movies():
    with get_connection() as con:
        with con.cursor() as cur:
            cur.execute(
                "SELECT id, name, imdbID, genres FROM media WHERE type = 'movie' ORDER BY id"
            )
            result = cur.fetchall()
    return result

def get_all_tv_shows():
    with get_connection() as con:
        with con.cursor() as cur:
            cur.execute(
                "SELECT id, name, imdbID, genres FROM media WHERE type = 'tv_show' ORDER BY id"
            )
            result = cur.fetchall()
    return result

def get_all_anime():
    with get_connection() as con:
        with con.cursor() as cur:
            cur.execute(
                "SELECT id, name, imdbID, genres FROM media WHERE type = 'anime' ORDER BY id"
            )
            result = cur.fetchall()
    return result

def get_json(*args):
    with get_connection() as con:
        with con.cursor() as cur:
            cur.execute(
                "SELECT JSON FROM media WHERE id = %s",
                (args[0],)
            )

            result = cur.fetchone()
        if result is None:
            return None
        return json.loads(result[0])

# UPDATE
def update(*args):
    with get_connection() as con:
        with con.cursor() as cur:
            if len(args) == 2:
                cur.execute(
                    "UPDATE media SET name = %s WHERE id = %s",
                    (args[0], args[1])
                )
            elif len(args) == 5:
                cur.execute(
                    "UPDATE media SET name = %s, imdbID = %s, JSON = %s, genres = %s WHERE id = %s",
                    (args[0], args[2], args[3], args[4], args[1])
                )
        con.commit()

# DELETE
def delete(row_id):
    with get_connection() as con:
        with con.cursor() as cur:
            cur.execute(
                "DELETE FROM media WHERE id = %s",
                (row_id,)
            )
        con.commit()