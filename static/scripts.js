// Allows add/edit buttons to work
document.addEventListener("click", openEditForm);
document.addEventListener("click", openAddForm);

// Allows esc to close overlays
document.addEventListener("keydown", close_overlay_on_esc)

// Turns overlay off if add/edit is cancelled
document.getElementById("edit_cancel").addEventListener("click", edit_overlay_off);
document.getElementById("add_cancel").addEventListener("click", add_overlay_off);


// --------- Opens respective form ---------
function openEditForm(event) {
    if(event.target.classList.contains("edit_button")) {
        edit_overlay_on();
        edit_pass_id(event);
        document.getElementById("new_name").focus();
    }
}

function openAddForm(event) {
    if(event.target.classList.contains("add_button")) {
        add_overlay_on();
        add_type(event);
        document.getElementById("add_name").focus();
    }
}

// --------- Toggles overlays ---------
function close_overlay_on_esc (event) {
    if(event.key === "Escape")
        if((document.getElementById("edit_overlay").style.display === "block") || (document.getElementById("add_overlay").style.display === "block")) {
            edit_overlay_off();
            add_overlay_off();
        }
}

function edit_overlay_on() {
    document.getElementById("edit_overlay").style.display = "block";
    document.getElementById("new_name").value = "";
}

function edit_overlay_off() {
    document.getElementById("edit_overlay").style.display = "none";
    autocomplete_list.innerHTML = "";
}

function add_overlay_on() {
    document.getElementById("add_overlay").style.display = "block";
    document.getElementById("add_name").value = "";
}

function add_overlay_off() {
    document.getElementById("add_overlay").style.display = "none";
}

// Passes ID number from edit button to edit form
function edit_pass_id(event) {
    id = event.target.dataset.idNum;
    document.getElementById("editForm").action = `/edit/${id}`;
}

// Passes data type (movie/tv_show/anime) to add form
function add_type(event) {
    let type = event.target.dataset.type;
    document.getElementById("addForm").action = `/add_${type}`;
}

/*
 * AUTOCOMPLETE SEARCH
 */

const add_name = document.getElementById("add_name");
const autocomplete_list = document.getElementById("autocomplete_list");

let search_timer = null;

// Listens to the add_form
add_name.addEventListener("input", function () {
    const query = add_name.value.trim();
    console.log("Typing:", query);

    if (search_timer) clearTimeout(search_timer);

    if (query.length < 4) {
        autocomplete_list.innerHTML = "";
        return;
    }

    search_timer = setTimeout(() => {
        fetchResults(query);
    }, 300);
});


async function fetchResults(query) {
    console.log("Fetching for:", query);
    const formAction = document.getElementById("addForm").action;
    let type = formAction.split("_").pop();

    if ((type == "show") || (type == "anime")) type = "series";
    type.trim();

    if(type == "movie"){
        try {
        const response = await fetch(`/search_movie?q=${encodeURIComponent(query)}`);
        console.log(response);
        const data = await response.json();
        console.log(data);
        renderResults(data);
        } catch (err) {
            console.error(err);
        }
    }

    if(type == "series"){
        try {
        const response = await fetch(`/search_series?q=${encodeURIComponent(query)}`);
        console.log(response);
        const data = await response.json();
        console.log(data);
        renderResults(data);
        } catch (err) {
            console.error(err);
        }
    }


}

function renderResults(results) {
    autocomplete_list.innerHTML = "";

    results.forEach(item => {
        const li = document.createElement("li");

        // image
        const img = document.createElement("img");
        img.src = item.poster;
        img.alt = "Poster not found";

        // text
        const text = document.createElement("span");
        text.textContent = `${item.title} | ${item.year}`

        li.appendChild(img);
        li.appendChild(text);

        li.addEventListener("click", () => {
            add_name.value = item.title;
            autocomplete_list.innerHTML = "";
        });

        autocomplete_list.appendChild(li);
    })

}