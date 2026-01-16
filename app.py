# Imports
from flask import Flask, render_template, request, redirect, url_for
import database

# App
app = Flask(__name__)

# Database
database.init_db()


@app.route('/')
def index():
    all_movies = database.get_all_movies()
    all_tv_shows = database.get_all_tv_shows()
    all_anime = database.get_all_anime()
    return render_template("index.html", movie_list=all_movies, tv_show_list=all_tv_shows, anime_list=all_anime)


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
