const actionForm = document.getElementById("action_form");
const actionOverlay = document.getElementById("action_overlay");
const actionInput = document.getElementById("action_input");
const actionCancel = document.getElementById("action_cancel");
const actionAutocompleteList = document.getElementById("action_autocomplete_list");
const moreInfoOverlay = document.getElementById("more_info_overlay");
const moreInfoModalRight = document.getElementById("more_info_modal_right");
const moreInfoModalLeft = document.getElementById("more_info_modal_left");

document.addEventListener("click", open_action_form);
document.addEventListener("click", open_more_info);
document.addEventListener("keydown", close_overlay_on_esc)
document.addEventListener("click", (event) => {
    const closeBtn = event.target.closest(".close_button");
    if (!closeBtn) return;

    all_overlay_off();
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

let overlayOpen = false;
let search_timer = null;

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

    const img = document.createElement("img");
    img.src = result.poster;

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
    left.appendChild(img);
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

        const img = document.createElement("img");
        img.src = item.poster;

        const text = document.createElement("span");
        text.textContent = `${item.title} | ${item.year}`

        li.appendChild(img);
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