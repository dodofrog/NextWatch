// Allows add/edit/more info buttons to work
document.addEventListener("click", openActionForm);
document.addEventListener("click", openMoreInfo);

// Allows esc to close overlays
document.addEventListener("keydown", close_overlay_on_esc)

// Turns overlay off if add/edit is cancelled
document.getElementById("action_cancel").addEventListener("click", all_overlay_off);

// Allows x button to work for info overlay
document.addEventListener("click", (event) => {
    const closeBtn = event.target.closest(".close_button");
    if (!closeBtn) return;

    all_overlay_off();
})

let overlayOpen = false;

const omdb_cache = {};

// Opens add/edit form
function openActionForm(event) {
    const editBtn = event.target.closest(".edit_button");
    const addBtn = event.target.closest(".add_button");
    if (addBtn) {
        action_overlay_on();
        add_type({ target: addBtn });
        document.getElementById("new_name").focus();
    }
    else if (editBtn) {
        action_overlay_on();
        edit_pass_id({ target: editBtn });
        document.getElementById("new_name").focus();
    }
    else return;
}

// Open more info tab
function openMoreInfo(event) {
    const moreInfoBtn = event.target.closest(".more_button");
    if (!moreInfoBtn) return;

    more_info_overlay_on();
    getItemInfo({ target:moreInfoBtn });
}

async function getItemInfo(event) {
    const imdbID = event.target.dataset.imdbid;

    if (omdb_cache[imdbID]) {
        renderMoreInfo(omdb_cache[imdbID]);
        return;
    }

    try {
        const response = await fetch(`/search_imdbid?i=${imdbID}`);
        const data = await response.json();

        omdb_cache[imdbID] = data;

        renderMoreInfo(data);
    } catch (err) { console.error(err); }
}

function renderMoreInfo(result) {
    const left = document.getElementById("more_info_modal_left");
    const right = document.getElementById("more_info_modal_right");
    left.innerHTML = "";
    right.innerHTML = "";

    // poster
    const img = document.createElement("img");
    img.src = result.poster;

    // title
    const title = document.createElement("span");
    title.textContent = `${result.title} | `;

    // year
    const year = document.createElement("span");
    year.textContent = result.year;

    // actors
    const actors = document.createElement("span");
    actors.textContent = `Actors: ${result.actors}`;

    // director
    const director = document.createElement("span");
    director.textContent = `Director: ${result.director}`;

    // genres
    const genres = document.createElement("span");
    genres.textContent = `Genres: ${result.genre}`;

    // plot
    const plot = document.createElement("span");
    plot.textContent = `Plot: ${result.plot}`;

    // runtime
    const runtime = document.createElement("span");
    runtime.textContent = `Runtime: ${result.runtime}`;

    // writer
    const writers = document.createElement("span");
    writers.textContent = `Writers: ${result.writer}`;

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
    right.appendChild(genres);
    right.appendChild(document.createElement("br"));
}

// Toggles overlays
function action_overlay_on() {
    document.getElementById("action_overlay").style.display = "flex";
    document.getElementById("new_name").value = "";
    overlayOpen = true;
}

function more_info_overlay_on() {
    document.getElementById("more_info_overlay").style.display = "flex";
    document.getElementById("more_info_modal_left").innerHTML = "";
    document.getElementById("more_info_modal_right").innerHTML = "";
    overlayOpen = true;
}

function all_overlay_off() {
    document.getElementById("action_overlay").style.display = "none";
    document.getElementById("more_info_overlay").style.display = "none";
    clearAutocomplete();
    overlayOpen = false;
}

function close_overlay_on_esc (event) {
    if(event.key === "Escape" && overlayOpen) all_overlay_off();
}

// Assigns edit action for action form
function edit_pass_id(event) {
    const id = event.target.dataset.idNum;
    const type = event.target.dataset.type;
    const imdbid = event.target.dataset.imdbid;

    const url = new URL(`/edit/${id}`, window.location.origin);

    if (imdbid) {
        url.searchParams.set("i", imdbid);
    }

    actionForm.action = url.pathname + url.search;
    actionForm.dataset.type = type;
}

// Assigns add action for action form
function add_type(event) {
    const type = event.target.dataset.type;
    document.getElementById("actionForm").action = `/add_${type}`;
    document.getElementById("actionForm").dataset.type = type;
}

/*
 * AUTOCOMPLETE SEARCH
 */

const action_form = document.getElementById("actionForm");
const new_name = document.getElementById("new_name");
const action_autocomplete_list = document.getElementById("action_autocomplete_list");

let search_timer = null;

// Listens to the add_form
new_name.addEventListener("input", function () {
    const query = new_name.value.trim();

    if (search_timer) clearTimeout(search_timer);   // Clears old timer if exists

    if (query.length < 3) {                         // Ignores queries of length < 3
        action_autocomplete_list.innerHTML = "";
        return;
    }

    search_timer = setTimeout(() => {               // Sets new timer for when to fetchResults
        fetchResults(query);
    }, 300);
});

async function fetchResults(query) {
    let type = action_form.dataset.type.split("_").pop();   // Gets type for correct url later

    if ((type == "show") || (type == "anime")) type = "series";
    type.trim();

    try {                                                   // Requests flask to request results from OMDB
        const response = await fetch(`/search_${type}?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderResults(data);
    } catch (err) { console.error(err); }

}

function renderResults(results) {
    action_autocomplete_list.innerHTML = "";

    results.forEach(item => {                       // Creates element for each result
        const li = document.createElement("li");

        // poster
        const img = document.createElement("img");
        img.src = item.poster;

        // text
        const text = document.createElement("span");
        text.textContent = `${item.title} | ${item.year}`

        li.appendChild(img);
        li.appendChild(text);

        li.addEventListener("click", () => {
            new_name.value = item.title;
            action_autocomplete_list.innerHTML = "";

            const url = new URL(action_form.action, window.location.origin);        // Allows clicking result to autofill + submit
            url.searchParams.set("i", item.imdbID);
            action_form.action = url.pathname + url.search;

            action_form.submit();
        });

        action_autocomplete_list.appendChild(li);
    })


}

// Clears autocomplete list
function clearAutocomplete() {
    action_autocomplete_list.innerHTML = "";
}