# Imports
import os, requests
import database
import json

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

@app.route('/search_omdb')
def search_omdb():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify([])

    response = requests.get(f"{base_url}s={query}", timeout=5)
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

@app.route('/search_movie')
def search_movie():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify([])

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
        return jsonify([])

    response = requests.get(f"{base_url}s={query}&type=series", timeout=5)
    data = response.json()

    if not (response.status_code == 200):
        return jsonify([])

    if data.get("Response") == "False":
        return jsonify([])

    results = []
    for item in data.get("Search", [])[:5]:
        results.append({
            "title": item.get("Title"),
            "year": item.get("Year"),
            "imdbID": item.get("imdbID"),
            "poster": item.get("Poster") if item.get("Poster") != "N/A" else "/static/no-poster.png"
        })

    return jsonify(results)

def search_imdbid(imdbid):
    response = requests.get(f"{base_url}i={imdbid}", timeout=5)
    data = response.json()

    if not (response.status_code == 200):
        return jsonify([])

    if data.get("Response") == "False":
        return jsonify([])

    result = {
        "title": data.get("Title"),
        "year": data.get("Year"),
        "rated": data.get("Rated"),
        "runtime": data.get("Runtime"),
        "genre": data.get("Genre"),
        "director": data.get("Director"),
        "writer": data.get("Writer"),
        "actors": data.get("Actors"),
        "plot": data.get("Plot"),
        "poster": data.get("Poster")
    }

    return result

@app.route('/get_json')
def get_json():
    imdbid = request.args.get("id", "").strip()

    data = database.get_json(imdbid)
    return jsonify(data)

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
    imdbid = request.args.get("imdbID", "").strip()
    movie_title = request.form.get("title")

    if not imdbid:
        database.add_movie(movie_title)
    else:
        movie_data = search_imdbid(imdbid)
        movie_json = json.dumps(movie_data)
        genres = movie_data.get("genre")
        database.add_movie(movie_title, imdbid, movie_json, genres)

    return redirect(url_for('index'))

@app.route('/add_tv_show', methods=['POST'])
def add_tv_show():
    imdbid = request.args.get("imdbID", "").strip()
    tv_show_title = request.form.get("title")

    if not imdbid:
        database.add_tv_show(tv_show_title)
    else:
        tv_show_data = search_imdbid(imdbid)
        tv_show_json = json.dumps(tv_show_data)
        genres = tv_show_data.get("genre")
        database.add_tv_show(tv_show_title, imdbid, tv_show_json, genres)

    return redirect(url_for('index'))

@app.route('/add_anime', methods=['POST'])
def add_anime():
    imdbid = request.args.get("imdbID", "").strip()
    anime_title = request.form.get("title")

    if not imdbid:
        database.add_anime(anime_title)
    else:
        anime_data = search_imdbid(imdbid)
        anime_json = json.dumps(anime_data)
        genres = anime_data.get("genre")
        database.add_anime(anime_title, imdbid, anime_json, genres)

    return redirect(url_for('index'))

@app.route('/delete/<int:id_num>', methods=['POST'])
def delete(id_num:int):
    database.delete(id_num)
    return redirect(url_for('index'))

@app.route('/edit/<int:id_num>', methods=['POST'])
def edit(id_num:int):
    imdbid = request.args.get("imdbID", "").strip()
    if not imdbid:
        new_title = request.form.get("title")
        database.update(new_title, id_num)
        return redirect(url_for('index'))
    else:
        data = search_imdbid(imdbid)
        json_data = json.dumps(data)
        genres = data.get("genre")
        new_title = request.form.get("title")
        database.update(new_title, id_num, imdbid, json_data, genres)
        return redirect(url_for('index'))