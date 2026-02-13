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

    if(overlayOpen) all_overlay_off();
    else open_dropdown(type);

    return;
})
actionCancel.addEventListener("click", all_overlay_off);
actionInput.addEventListener("input", function () {
    const query = actionInput.value.trim();

    if (search_timer) clearTimeout(search_timer);

    if (query.length < 3) {
        actionAutocompleteList.innerHTML = "";
        return;
    }

    search_timer = setTimeout(() => {
        fetch_autocomplete_results(query);
    }, 300);
});
document.addEventListener("click", (event) => {
    if ((event.target == moreInfoOverlay) || (event.target == actionOverlay)) {
        all_overlay_off();
    }
});
document.addEventListener("DOMContentLoaded", init_page);

let overlayOpen = false;
let search_timer = null;
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
    let dropdowns = document.getElementsByClassName("filter_dropdown_content");
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
        for (let genre in movieGenreCount) {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${genre} - ${movieGenreCount[genre]}`;

            li.appendChild(span);
            content.appendChild(li);
        }
    }
    if (type == "tv_show") {
        content.innerHTML = "";
        for (let genre in tvShowGenreCount) {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${genre} - ${tvShowGenreCount[genre]}`;

            li.appendChild(span);
            content.appendChild(li);
        }
    }
    if (type == "anime") {
        content.innerHTML = "";
        for (let genre in animeGenreCount) {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = `${genre} - ${animeGenreCount[genre]}`;

            li.appendChild(span);
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
        type.trim();

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
function render_movie_list() {
}
function render_tv_show_list() {
}
function render_anime_list() {
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

    console.log(movieGenreCount);
    console.log(tvShowGenreCount);
    console.log(animeGenreCount);
}
function init_page() {
    add_genres();
}