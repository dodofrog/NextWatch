// Allows add/edit buttons to work
document.addEventListener("click", openEditForm);
document.addEventListener("click", openAddForm);

// Allows esc to close overlays
document.addEventListener("keydown", close_overlay_on_esc)

// Turns overlay off if add/edit is cancelled
document.getElementById("edit_cancel").addEventListener("click", edit_overlay_off);
document.getElementById("add_cancel").addEventListener("click", add_overlay_off);

let overlayOpen = false;

// --------- Opens respective form ---------
function openEditForm(event) {
    const editBtn = event.target.closest(".edit_button");
    if (!editBtn) return;

    edit_overlay_on();
    edit_pass_id({ target: editBtn });
    document.getElementById("new_name").focus();
}

function openAddForm(event) {
    const addBtn = event.target.closest(".add_button");
    if (!addBtn) return;

    add_overlay_on();
    add_type({ target: addBtn });
    document.getElementById("add_name").focus();
}

// --------- Toggles overlays ---------
function close_overlay_on_esc (event) {
    if(event.key === "Escape" && overlayOpen) {
        edit_overlay_off();
        add_overlay_off();
    }
}

function edit_overlay_on() {
    document.getElementById("edit_overlay").style.display = "block";
    document.getElementById("new_name").value = "";
    overlayOpen = true;
}

function edit_overlay_off() {
    document.getElementById("edit_overlay").style.display = "none";
    clearAutocomplete();
    overlayOpen = false;
}

function add_overlay_on() {
    document.getElementById("add_overlay").style.display = "block";
    document.getElementById("add_name").value = "";
    overlayOpen = true;
}

function add_overlay_off() {
    document.getElementById("add_overlay").style.display = "none";
    clearAutocomplete();
    overlayOpen = false;
}

// Passes ID number from edit button to edit form
function edit_pass_id(event) {
    const id = event.target.dataset.idNum;
    const type = event.target.dataset.type;

    document.getElementById("editForm").action = `/edit/${id}`;
    document.getElementById("editForm").dataset.type = type;
}

// Passes data type (movie/tv_show/anime) to add form
function add_type(event) {
    const type = event.target.dataset.type;

    document.getElementById("addForm").action = `/add_${type}`;
    document.getElementById("addForm").dataset.type = type;
}

/*
 * AUTOCOMPLETE SEARCH
 */

const add_form = document.getElementById("addForm");
const add_name = document.getElementById("add_name");
const edit_form = document.getElementById("editForm");
const edit_name = document.getElementById("new_name");
const add_autocomplete_list = document.getElementById("add_autocomplete_list");
const edit_autocomplete_list = document.getElementById("edit_autocomplete_list");

let search_timer = null;

// Listens to the add_form
add_name.addEventListener("input", function () {
    const query = add_name.value.trim();

    if (search_timer) clearTimeout(search_timer);

    if (query.length < 4) {
        add_autocomplete_list.innerHTML = "";
        return;
    }

    search_timer = setTimeout(() => {
        fetchResults(query, add_form, add_name, add_autocomplete_list);
    }, 300);
});

// Listens to the edit form
edit_name.addEventListener("input", function () {
    const query = edit_name.value.trim();

    if (search_timer) clearTimeout(search_timer);

    if (query.length < 4) {
        edit_autocomplete_list.innerHTML = "";
        return;
    }

    search_timer = setTimeout(() => {
        fetchResults(query, edit_form, edit_name, edit_autocomplete_list);
    }, 300);
});


async function fetchResults(query, input_form, input_box, autocomplete_list) {
    let type = input_form.dataset.type.split("_").pop();

    if ((type == "show") || (type == "anime")) type = "series";
    type.trim();

    if(type == "movie"){
        try {
        const response = await fetch(`/search_movie?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderResults(data, input_form, input_box, autocomplete_list);
        } catch (err) {
            console.error(err);
        }
    }

    if(type == "series"){
        try {
        const response = await fetch(`/search_series?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderResults(data, input_form, input_box, autocomplete_list);
        } catch (err) {
            console.error(err);
        }
    }


}

function renderResults(results, input_form, input_box, autocomplete_list) {
    autocomplete_list.innerHTML = "";

    results.forEach(item => {
        const li = document.createElement("li");

        // image
        const img = document.createElement("img");
        img.src = item.poster;

        // text
        const text = document.createElement("span");
        text.textContent = `${item.title} | ${item.year}`

        li.appendChild(img);
        li.appendChild(text);

        li.addEventListener("click", () => {
            input_box.value = item.title;
            autocomplete_list.innerHTML = "";

            let action = input_form.action;
            action += `?imdbID=${item.imdbID}`
            input_form.action = action;

            input_form.submit();
        });

        autocomplete_list.appendChild(li);
    })

}

function clearAutocomplete() {
    add_autocomplete_list.innerHTML = "";
    edit_autocomplete_list.innerHTML = "";
}