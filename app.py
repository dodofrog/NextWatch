# Imports
import os, requests
import database

from flask import Flask, render_template, request, redirect, url_for, jsonify
from dotenv import load_dotenv

# App
app = Flask(__name__)

# Database
database.init_db()

# OMDb
load_dotenv()
OMDB_API_KEY = os.getenv("OMDB_API_KEY")
base_url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&"

@app.route('/search_movie')
def search_movie():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify(["not query"])

    response = requests.get(f"{base_url}s={query}&type=movie", timeout=5)
    data = response.json()

    if not (response.status_code == 200):
        return jsonify(["status code not 200"])

    if data.get("Response") == "False":
        return jsonify(data)

    results = []
    for item in data.get("Search", [])[:10]:
        results.append({
            "title": item.get("Title"),
            "year": item.get("Year"),
            "imdbID": item.get("imdbID"),
            "poster": item.get("Poster") if item.get("Poster") != "N/A" else "/static/no-poster.png"
        })

    return jsonify(results)

@app.route('/search_series')
def search_series():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify(["not query"])

    response = requests.get(f"{base_url}s={query}&type=series", timeout=5)
    data = response.json()

    if not (response.status_code == 200):
        return jsonify(["status code not 200"])

    if data.get("Response") == "False":
        return jsonify(data)

    results = []
    for item in data.get("Search", [])[:5]:
        results.append({
            "title": item.get("Title"),
            "year": item.get("Year"),
            "imdbID": item.get("imdbID"),
            "poster": item.get("Poster") if item.get("Poster") != "N/A" else "/static/no-poster.png"
        })

    return jsonify(results)

@app.route('/')
def index():
    all_movies = database.get_all_movies()
    all_tv_shows = database.get_all_tv_shows()
    all_anime = database.get_all_anime()
    args = {
        "movie_list": all_movies,
        "tv_show_list": all_tv_shows,
        "anime_list": all_anime
    }
    return render_template("index.html", **args)

@app.route('/add_movie', methods=['POST'])
def add_movie():
    movie_title = request.form.get("title")
    database.add_movie(movie_title)
    return redirect(url_for('index'))

@app.route('/add_tv_show', methods=['POST'])
def add_tv_show():
    tv_show_title = request.form.get("title")
    database.add_tv_show(tv_show_title)
    return redirect(url_for('index'))

@app.route('/add_anime', methods=['POST'])
def add_anime():
    anime_title = request.form.get("title")
    database.add_anime(anime_title)
    return redirect(url_for('index'))

@app.route('/delete/<int:id_num>', methods=['POST'])
def delete(id_num:int):
    database.delete(id_num)
    return redirect(url_for('index'))

@app.route('/edit/<int:id_num>', methods=['POST'])
def edit(id_num:int):
    new_title = request.form.get("title")
    database.update(id_num, new_title)
    return redirect(url_for('index'))