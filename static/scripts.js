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

function getItemInfo(event) {
    const imdbID = event.target.dataset.imdbid;


}

// Toggles overlays
function action_overlay_on() {
    document.getElementById("action_overlay").style.display = "flex";
    document.getElementById("new_name").value = "";
    overlayOpen = true;
}

function more_info_overlay_on() {
    document.getElementById("more_info_overlay").style.display = "flex";
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

    document.getElementById("actionForm").action = `/edit/${id}`;
    document.getElementById("actionForm").dataset.type = type;
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

            let action = action_form.action;            // Allows clicking a result to autofill and submit form
            action += `?imdbID=${item.imdbID}`
            action_form.action = action;

            action_form.submit();
        });

        action_autocomplete_list.appendChild(li);
    })


}

// Clears autocomplete list
function clearAutocomplete() {
    action_autocomplete_list.innerHTML = "";
}