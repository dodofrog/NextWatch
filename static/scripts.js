const actionForm = document.getElementById("action_form");
const actionOverlay = document.getElementById("action_overlay");
const actionInput = document.getElementById("action_input");
const actionCancel = document.getElementById("action_cancel");
const actionAutocompleteList = document.getElementById("action_autocomplete_list");
const moreInfoOverlay = document.getElementById("more_info_overlay");
const moreInfoModalRight = document.getElementById("more_info_modal_right");
const moreInfoModalLeft = document.getElementById("more_info_modal_left");
const movieList = document.getElementById("movie_list");
const tvShowList = document.getElementById("tv_show_list");
const animeList = document.getElementById("anime_list");
const movieTableHeader = document.getElementById("movie_list_header");
const tvShowTableHeader = document.getElementById("tv_show_list_header");
const animeTableHeader = document.getElementById("anime_list_header");
const movieTable = document.getElementById("movie_table");
const tvShowTable = document.getElementById("tv_show_table");
const animeTable = document.getElementById("anime_table");
const movieAddButton = document.getElementById("movie_add_button");
const tvShowAddButton = document.getElementById("tv_show_add_button");
const animeAddButton = document.getElementById("anime_add_button");
const movies = JSON.parse(movieList.dataset.movies);
const tvShows = JSON.parse(tvShowList.dataset.tvShows);
const animes = JSON.parse(animeList.dataset.animes);

document.addEventListener("click", open_action_form);
document.addEventListener("click", open_more_info);
document.addEventListener("keydown", close_overlay_on_esc)
document.addEventListener("click", (event) => {
    const closeMoreInfoBtn = event.target.closest(".close_more_info_button");
    if (!closeMoreInfoBtn) return;
    all_overlay_off();
    return;
})
document.addEventListener("click", (event) => {
    const filterBtn = event.target.closest(".filter_button");
    if(!filterBtn) return;
    const type = filterBtn.dataset.type;
    const cur = document.getElementById(`${type}_filter_dropdown_content`);
    const wasOpen = cur.style.display === "flex";
    all_overlay_off();
    if(!wasOpen) open_dropdown(type);

    return;
})
actionCancel.addEventListener("click", all_overlay_off);
actionInput.addEventListener("input", function () {
    const query = actionInput.value.trim();

    if (searchTimer) clearTimeout(searchTimer);

    if (query.length < 3) {
        actionAutocompleteList.innerHTML = "";
        return;
    }

    searchTimer = setTimeout(() => {
        fetch_autocomplete_results(query);
    }, 300);
});
document.addEventListener("click", (event) => {
    if ((event.target == moreInfoOverlay) || (event.target == actionOverlay)) {
        all_overlay_off();
    }
});
document.addEventListener("DOMContentLoaded", init_page);
document.addEventListener("click", (event) => {
    const filterContent = event.target.closest(".filter_dropdown_content");
    const filterBtn = event.target.closest(".filter_button");
    if (!(filterContent || filterBtn)) filter_dropdown_off();
})


let overlayOpen = false;
let searchTimer = null;
let prevMovieGenre = sessionStorage.getItem("prevMovieGenre") || "reset";
let prevTvShowGenre = sessionStorage.getItem("prevTvShowGenre") || "reset";
let prevAnimeGenre = sessionStorage.getItem("prevAnimeGenre") || "reset";
let movieGenreCount = {};
let tvShowGenreCount = {};
let animeGenreCount = {};

/*
 * Overlay Functions
 */
function action_overlay_on() {
    actionOverlay.style.display = "flex";
    actionInput.value = "";
    overlayOpen = true;
}
function more_info_overlay_on() {
    moreInfoOverlay.style.display = "flex";
    moreInfoModalLeft.innerHTML = "";
    moreInfoModalRight.innerHTML = "";
    overlayOpen = true;
}
function all_overlay_off() {
    const dropdowns = document.getElementsByClassName("filter_dropdown_content");
    let i = 0;
    for (i = 0; i < dropdowns.length; i++){
        let cur = dropdowns[i];
        cur.style.display = "none";
    }
    actionOverlay.style.display = "none";
    moreInfoOverlay.style.display = "none";
    clear_autocomplete();
    overlayOpen = false;
}
function filter_dropdown_off() {
    const dropdowns = document.getElementsByClassName("filter_dropdown_content");
    let i = 0;
    for (i = 0; i < dropdowns.length; i++){
        let cur = dropdowns[i];
        cur.style.display = "none";
    }
}
function close_overlay_on_esc (event) {
    if(event.key === "Escape" && overlayOpen)
        all_overlay_off();
}

/*
 * Opening Functions
 */
function open_action_form(event) {
    const editBtn = event.target.closest(".edit_button");
    const addBtn = event.target.closest(".add_button");
    if (addBtn) {
        action_overlay_on();
        add_type({ target: addBtn });
        actionInput.focus();
    }
    else if (editBtn) {
        action_overlay_on();
        edit_pass_id({ target: editBtn });
        actionInput.focus();
    }
    else return;
}
async function open_more_info(event) {
    const moreInfoBtn = event.target.closest(".more_button");
    if (!moreInfoBtn) return;

    const imdbID = moreInfoBtn.dataset.imdbid;

    more_info_overlay_on();

    const data = await get_item_info({ target:moreInfoBtn });
    render_more_info(data, imdbID);
}
function open_dropdown(type) {
    const content = document.getElementById(`${type}_filter_dropdown_content`);
    content.style.display = "flex";
    overlayOpen = true;

    if (type == "movie") {
        content.innerHTML = "";
        if (Object.keys(movieGenreCount).length == 0) {
            content.innerHTML = "No movies!";
            return;
        }

        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = "RESET";

        li.appendChild(span);

        li.addEventListener("click", () => {
            render_movie_list("reset");
        })

        content.appendChild(li);

        for (let genre in movieGenreCount) {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${genre} - ${movieGenreCount[genre]}`;

            li.appendChild(span);

            li.addEventListener("click", () => {
                render_movie_list(genre);
            })

            content.appendChild(li);
        }
    }
    if (type == "tv_show") {
        content.innerHTML = "";
        if (Object.keys(tvShowGenreCount).length == 0) {
            content.innerHTML = "No tv shows!";
            return;
        }

        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = "RESET";

        li.appendChild(span);

        li.addEventListener("click", () => {
            render_tv_show_list("reset");
        })

        content.appendChild(li);

        for (let genre in tvShowGenreCount) {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${genre} - ${tvShowGenreCount[genre]}`;

            li.appendChild(span);

            li.addEventListener("click", () => {
                render_tv_show_list(genre);
            })

            content.appendChild(li);
        }
    }
    if (type == "anime") {
        content.innerHTML = "";
        if (Object.keys(animeGenreCount).length == 0) {
            content.innerHTML = "No anime!";
            return;
        }

        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = "RESET";

        li.appendChild(span);

        li.addEventListener("click", () => {
            render_anime_list("reset");
        })

        content.appendChild(li);

        for (let genre in animeGenreCount) {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${genre} - ${animeGenreCount[genre]}`;

            li.appendChild(span);

            li.addEventListener("click", () => {
                render_anime_list(genre);
            })

            content.appendChild(li);
        }
    }
}

/*
 * Fetching Functions
 */
async function get_item_info(event) {
    const id = event.target.dataset.idNum;

    try {
        const response = await fetch(`/get_json?id=${id}`);
        const data = await response.json();

        return data;
    } catch (err) { console.error(err); }
}
async function fetch_autocomplete_results(query) {
    let type = actionForm.dataset.type.split("_").pop();

    if ((type == "show") || (type == "movie")) {
        if (type == "show") type = "series";
        type = type.trim();

        try {
            const response = await fetch(`/search_${type}?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            render_autocomplete(data);
        } catch (err) { console.error(err); }
    }

    else if (type == "anime") {
        type.trim();

        try {
            const response = await fetch(`/search_omdb?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            render_autocomplete(data);
        } catch (err) { console.error(err); }
    }

}

/*
 * Rendering Functions
 */
function render_more_info(result, imdbid) {
    const left = moreInfoModalLeft;
    const right = moreInfoModalRight;
    left.innerHTML = "";
    right.innerHTML = "";

    const poster = document.createElement("img");
    poster.src = result.poster;
    poster.style.borderRadius = "8px";

    const title = document.createElement("span");
    title.textContent = `${result.title} | `;

    const year = document.createElement("span");
    year.textContent = result.year;

    const actors = document.createElement("span");
    actors.textContent = `Actors: ${result.actors}`;

    const director = document.createElement("span");
    director.textContent = `Director: ${result.director}`;

    const genre = document.createElement("span");
    genre.textContent = `Genres: ${result.genre}`;

    const plot = document.createElement("span");
    plot.textContent = `Plot: ${result.plot}`;

    const runtime = document.createElement("span");
    runtime.textContent = `Runtime: ${result.runtime}`;

    const writers = document.createElement("span");
    writers.textContent = `Writers: ${result.writer}`;

    const link = document.createElement("a");
    link.textContent = "IMDb Page";
    link.href = `https://www.imdb.com/title/${imdbid}/`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // left side
    left.appendChild(poster);
    left.appendChild(document.createElement("br"));
    left.appendChild(title);
    left.appendChild(year);

    // right side
    right.appendChild(plot);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));
    right.appendChild(director);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));
    right.appendChild(writers);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));
    right.appendChild(actors);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));
    right.appendChild(runtime);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));
    right.appendChild(genre);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));
    right.appendChild(link);
}
function render_autocomplete(results) {
    actionAutocompleteList.innerHTML = "";

    results.forEach(item => {
        const li = document.createElement("li");

        const poster = document.createElement("img");
        poster.src = item.poster;
        poster.style.borderRadius = "4px";

        const text = document.createElement("span");
        text.textContent = `${item.title} | ${item.year}`

        li.appendChild(poster);
        li.appendChild(text);

        li.addEventListener("click", () => {
            actionInput.value = item.title;
            actionAutocompleteList.innerHTML = "";

            const url = new URL(actionForm.action, window.location.origin);
            url.searchParams.set("imdbID", item.imdbID);
            actionForm.action = url.pathname + url.search;

            actionForm.submit();
        });

        actionAutocompleteList.appendChild(li);
    })
}
function render_movie_list(genre) {
    movieTable.innerHTML = "";
    prevMovieGenre = genre;
    sessionStorage.setItem("prevMovieGenre", genre);
    movieTable.appendChild(movieTableHeader);

    if(genre == "reset") {
        movies.forEach(movie => {
        const tr = document.createElement("tr");
        tr.className = ("movie_row");
        tr.id = `movie_row_${movie[0]}`;
        tr.dataset.idNum = `${movie[0]}`;
        tr.dataset.genres = `${movie[3]}`;

        const title = document.createElement("td");
        title.textContent = `${movie[1]}`;

        const rest = document.createElement("td");
        rest.style.display = "flex";
        rest.style.gap = "4px";

        const deleteForm = document.createElement("form");
        const deleteButton = document.createElement("button");
        const deleteImage = document.createElement("img");

        deleteForm.method = "POST";
        deleteForm.action = `/delete/${movie[0]}`;
        deleteForm.style.display = "inline";

        deleteButton.type = "submit";
        deleteButton.className = "delete_button";

        deleteImage.src = "/static/icons/deleteIcon.png";
        deleteImage.className = "action_images";

        deleteButton.appendChild(deleteImage);
        deleteForm.appendChild(deleteButton);

        const editButton = document.createElement("button");
        const editImage = document.createElement("img");

        editButton.type = "button";
        editButton.className = "edit_button";
        editButton.dataset.idNum = `${movie[0]}`;
        editButton.dataset.imdbid = `${movie[2]}`;
        editButton.dataset.type = "movie";

        editImage.src = "/static/icons/editIcon.png";
        editImage.className = "action_images";

        editButton.appendChild(editImage);

        const moreButton = document.createElement("button");
        const moreImage = document.createElement("img");

        moreButton.type = "button";
        moreButton.className = "more_button";
        moreButton.dataset.idNum = `${movie[0]}`;
        editButton.dataset.imdbid = `${movie[2]}`;

        moreImage.src = "/static/icons/moreIcon.png";
        moreImage.className = "action_images";

        moreButton.appendChild(moreImage);

        rest.appendChild(deleteForm);
        rest.appendChild(editButton);
        rest.appendChild(moreButton);

        tr.appendChild(title);
        tr.appendChild(rest);

        movieTable.appendChild(tr);
        })
    }

    movies.forEach(movie => {
        let movieGenres = movie[3].split(",");
        movieGenres = movieGenres.map(item => item.trim());
        console.log(movieGenres);
        if (movieGenres.includes(genre)) {
            const tr = document.createElement("tr");
            tr.className = ("movie_row");
            tr.id = `movie_row_${movie[0]}`;
            tr.dataset.idNum = `${movie[0]}`;
            tr.dataset.genres = `${movie[3]}`;

            const title = document.createElement("td");
            title.textContent = `${movie[1]}`;

            const rest = document.createElement("td");
            rest.style.display = "flex";
            rest.style.gap = "6px";

            const deleteForm = document.createElement("form");
            const deleteButton = document.createElement("button");
            const deleteImage = document.createElement("img");

            deleteForm.method = "POST";
            deleteForm.action = `/delete/${movie[0]}`;
            deleteForm.style.display = "inline";

            deleteButton.type = "submit";
            deleteButton.className = "delete_button";

            deleteImage.src = "/static/icons/deleteIcon.png";
            deleteImage.className = "action_images";

            deleteButton.appendChild(deleteImage);
            deleteForm.appendChild(deleteButton);

            const editButton = document.createElement("button");
            const editImage = document.createElement("img");

            editButton.type = "button";
            editButton.className = "edit_button";
            editButton.dataset.idNum = `${movie[0]}`;
            editButton.dataset.imdbid = `${movie[2]}`;
            editButton.dataset.type = "movie";

            editImage.src = "/static/icons/editIcon.png";
            editImage.className = "action_images";

            editButton.appendChild(editImage);

            const moreButton = document.createElement("button");
            const moreImage = document.createElement("img");

            moreButton.type = "button";
            moreButton.className = "more_button";
            moreButton.dataset.idNum = `${movie[0]}`;
            moreButton.dataset.imdbid = `${movie[2]}`;

            moreImage.src = "/static/icons/moreIcon.png";
            moreImage.className = "action_images";

            moreButton.appendChild(moreImage);

            rest.appendChild(deleteForm);
            rest.appendChild(editButton);
            rest.appendChild(moreButton);

            tr.appendChild(title);
            tr.appendChild(rest);

            movieTable.appendChild(tr);
        }
    })
    movieTable.appendChild(movieAddButton);
    filter_dropdown_off();
}
function render_tv_show_list(genre) {
    tvShowTable.innerHTML = "";
    prevTvShowGenre = genre;
    sessionStorage.setItem("prevTvShowGenre", genre);
    tvShowTable.appendChild(tvShowTableHeader);

    if(genre == "reset") {
        tvShows.forEach(tvShow => {
        const tr = document.createElement("tr");
        tr.className = ("tv_show_row");
        tr.id = `tv_show_row_${tvShow[0]}`;
        tr.dataset.idNum = `${tvShow[0]}`;
        tr.dataset.genres = `${tvShow[3]}`;

        const title = document.createElement("td");
        title.textContent = `${tvShow[1]}`;

        const rest = document.createElement("td");
        rest.style.display = "flex";
        rest.style.gap = "4px";

        const deleteForm = document.createElement("form");
        const deleteButton = document.createElement("button");
        const deleteImage = document.createElement("img");

        deleteForm.method = "POST";
        deleteForm.action = `/delete/${tvShow[0]}`;
        deleteForm.style.display = "inline";

        deleteButton.type = "submit";
        deleteButton.className = "delete_button";

        deleteImage.src = "/static/icons/deleteIcon.png";
        deleteImage.className = "action_images";

        deleteButton.appendChild(deleteImage);
        deleteForm.appendChild(deleteButton);

        const editButton = document.createElement("button");
        const editImage = document.createElement("img");

        editButton.type = "button";
        editButton.className = "edit_button";
        editButton.dataset.idNum = `${tvShow[0]}`;
        editButton.dataset.imdbid = `${tvShow[2]}`;
        editButton.dataset.type = "tvShow";

        editImage.src = "/static/icons/editIcon.png";
        editImage.className = "action_images";

        editButton.appendChild(editImage);

        const moreButton = document.createElement("button");
        const moreImage = document.createElement("img");

        moreButton.type = "button";
        moreButton.className = "more_button";
        moreButton.dataset.idNum = `${tvShow[0]}`;
        editButton.dataset.imdbid = `${tvShow[2]}`;

        moreImage.src = "/static/icons/moreIcon.png";
        moreImage.className = "action_images";

        moreButton.appendChild(moreImage);

        rest.appendChild(deleteForm);
        rest.appendChild(editButton);
        rest.appendChild(moreButton);

        tr.appendChild(title);
        tr.appendChild(rest);

        tvShowTable.appendChild(tr);
        })
    }

    tvShows.forEach(tvShow => {
        let tvShowGenres = tvShow[3].split(",");
        tvShowGenres = tvShowGenres.map(item => item.trim());
        console.log(tvShowGenres);
        if (tvShowGenres.includes(genre)) {
            const tr = document.createElement("tr");
            tr.className = ("tv_show_row");
            tr.id = `tv_show_row_${tvShow[0]}`;
            tr.dataset.idNum = `${tvShow[0]}`;
            tr.dataset.genres = `${tvShow[3]}`;

            const title = document.createElement("td");
            title.textContent = `${tvShow[1]}`;

            const rest = document.createElement("td");
            rest.style.display = "flex";
            rest.style.gap = "6px";

            const deleteForm = document.createElement("form");
            const deleteButton = document.createElement("button");
            const deleteImage = document.createElement("img");

            deleteForm.method = "POST";
            deleteForm.action = `/delete/${tvShow[0]}`;
            deleteForm.style.display = "inline";

            deleteButton.type = "submit";
            deleteButton.className = "delete_button";

            deleteImage.src = "/static/icons/deleteIcon.png";
            deleteImage.className = "action_images";

            deleteButton.appendChild(deleteImage);
            deleteForm.appendChild(deleteButton);

            const editButton = document.createElement("button");
            const editImage = document.createElement("img");

            editButton.type = "button";
            editButton.className = "edit_button";
            editButton.dataset.idNum = `${tvShow[0]}`;
            editButton.dataset.imdbid = `${tvShow[2]}`;
            editButton.dataset.type = "tvShow";

            editImage.src = "/static/icons/editIcon.png";
            editImage.className = "action_images";

            editButton.appendChild(editImage);

            const moreButton = document.createElement("button");
            const moreImage = document.createElement("img");

            moreButton.type = "button";
            moreButton.className = "more_button";
            moreButton.dataset.idNum = `${tvShow[0]}`;
            moreButton.dataset.imdbid = `${tvShow[2]}`;

            moreImage.src = "/static/icons/moreIcon.png";
            moreImage.className = "action_images";

            moreButton.appendChild(moreImage);

            rest.appendChild(deleteForm);
            rest.appendChild(editButton);
            rest.appendChild(moreButton);

            tr.appendChild(title);
            tr.appendChild(rest);

            tvShowTable.appendChild(tr);
        }
    })
    tvShowTable.appendChild(tvShowAddButton);
    filter_dropdown_off();
}
function render_anime_list(genre) {
    animeTable.innerHTML = "";
    prevAnimeGenre = genre;
    sessionStorage.setItem("prevAnimeGenre", genre);
    animeTable.appendChild(animeTableHeader);

    if(genre == "reset") {
        animes.forEach(anime => {
        const tr = document.createElement("tr");
        tr.className = ("anime_row");
        tr.id = `anime_row_${anime[0]}`;
        tr.dataset.idNum = `${anime[0]}`;
        tr.dataset.genres = `${anime[3]}`;

        const title = document.createElement("td");
        title.textContent = `${anime[1]}`;

        const rest = document.createElement("td");
        rest.style.display = "flex";
        rest.style.gap = "4px";

        const deleteForm = document.createElement("form");
        const deleteButton = document.createElement("button");
        const deleteImage = document.createElement("img");

        deleteForm.method = "POST";
        deleteForm.action = `/delete/${anime[0]}`;
        deleteForm.style.display = "inline";

        deleteButton.type = "submit";
        deleteButton.className = "delete_button";

        deleteImage.src = "/static/icons/deleteIcon.png";
        deleteImage.className = "action_images";

        deleteButton.appendChild(deleteImage);
        deleteForm.appendChild(deleteButton);

        const editButton = document.createElement("button");
        const editImage = document.createElement("img");

        editButton.type = "button";
        editButton.className = "edit_button";
        editButton.dataset.idNum = `${anime[0]}`;
        editButton.dataset.imdbid = `${anime[2]}`;
        editButton.dataset.type = "anime";

        editImage.src = "/static/icons/editIcon.png";
        editImage.className = "action_images";

        editButton.appendChild(editImage);

        const moreButton = document.createElement("button");
        const moreImage = document.createElement("img");

        moreButton.type = "button";
        moreButton.className = "more_button";
        moreButton.dataset.idNum = `${anime[0]}`;
        editButton.dataset.imdbid = `${anime[2]}`;

        moreImage.src = "/static/icons/moreIcon.png";
        moreImage.className = "action_images";

        moreButton.appendChild(moreImage);

        rest.appendChild(deleteForm);
        rest.appendChild(editButton);
        rest.appendChild(moreButton);

        tr.appendChild(title);
        tr.appendChild(rest);

        animeTable.appendChild(tr);
        })
    }

    animes.forEach(anime => {
        let animeGenres = anime[3].split(",");
        animeGenres = animeGenres.map(item => item.trim());
        console.log(animeGenres);
        if (animeGenres.includes(genre)) {
            const tr = document.createElement("tr");
            tr.className = ("anime_row");
            tr.id = `anime_row_${anime[0]}`;
            tr.dataset.idNum = `${anime[0]}`;
            tr.dataset.genres = `${anime[3]}`;

            const title = document.createElement("td");
            title.textContent = `${anime[1]}`;

            const rest = document.createElement("td");
            rest.style.display = "flex";
            rest.style.gap = "6px";

            const deleteForm = document.createElement("form");
            const deleteButton = document.createElement("button");
            const deleteImage = document.createElement("img");

            deleteForm.method = "POST";
            deleteForm.action = `/delete/${anime[0]}`;
            deleteForm.style.display = "inline";

            deleteButton.type = "submit";
            deleteButton.className = "delete_button";

            deleteImage.src = "/static/icons/deleteIcon.png";
            deleteImage.className = "action_images";

            deleteButton.appendChild(deleteImage);
            deleteForm.appendChild(deleteButton);

            const editButton = document.createElement("button");
            const editImage = document.createElement("img");

            editButton.type = "button";
            editButton.className = "edit_button";
            editButton.dataset.idNum = `${anime[0]}`;
            editButton.dataset.imdbid = `${anime[2]}`;
            editButton.dataset.type = "anime";

            editImage.src = "/static/icons/editIcon.png";
            editImage.className = "action_images";

            editButton.appendChild(editImage);

            const moreButton = document.createElement("button");
            const moreImage = document.createElement("img");

            moreButton.type = "button";
            moreButton.className = "more_button";
            moreButton.dataset.idNum = `${anime[0]}`;
            moreButton.dataset.imdbid = `${anime[2]}`;

            moreImage.src = "/static/icons/moreIcon.png";
            moreImage.className = "action_images";

            moreButton.appendChild(moreImage);

            rest.appendChild(deleteForm);
            rest.appendChild(editButton);
            rest.appendChild(moreButton);

            tr.appendChild(title);
            tr.appendChild(rest);

            animeTable.appendChild(tr);
        }
    })
    animeTable.appendChild(animeAddButton);
    filter_dropdown_off();
}

/*
 * Helper Functions
 */
function clear_autocomplete() {
    actionAutocompleteList.innerHTML = "";
}
function edit_pass_id(event) {
    const id = event.target.dataset.idNum;
    const type = event.target.dataset.type;

    actionForm.action = `/edit/${id}`;
    actionForm.dataset.type = type;
}
function add_type(event) {
    const type = event.target.dataset.type;

    actionForm.action = `/add_${type}`;
    actionForm.dataset.type = type;
}
function add_genres() {
    for (let i = 0; i < movies.length; i++) {
        const idNum = movies[i][0];
        const cur = document.getElementById(`movie_row_${idNum}`);
        let genres = cur.dataset.genres.split(",");
        for (let j = 0; j < genres.length; j++) {
            const genre = genres[j].trim();
            if (genre in movieGenreCount) movieGenreCount[genre] += 1;
            else movieGenreCount[genre] = 1;
        }
    }
    for (let i = 0; i < tvShows.length; i++) {
        const idNum = tvShows[i][0];
        const cur = document.getElementById(`tv_show_row_${idNum}`);
        let genres = cur.dataset.genres.split(",");
        for (let j = 0; j < genres.length; j++) {
            const genre = genres[j].trim();
            if (genre in tvShowGenreCount) tvShowGenreCount[genre] += 1;
            else tvShowGenreCount[genre] = 1;
        }
    }
    for (let i = 0; i < animes.length; i++) {
        const idNum = animes[i][0];
        const cur = document.getElementById(`anime_row_${idNum}`);
        let genres = cur.dataset.genres.split(",");
        for (let j = 0; j < genres.length; j++) {
            const genre = genres[j].trim();
            if (genre in animeGenreCount) animeGenreCount[genre] += 1;
            else animeGenreCount[genre] = 1;
        }
    }
}
function init_page() {
    add_genres();
    render_movie_list(prevMovieGenre);
    render_tv_show_list(prevTvShowGenre);
    render_anime_list(prevAnimeGenre);
}