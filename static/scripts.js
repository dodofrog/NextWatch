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
}

function edit_overlay_off() {
    document.getElementById("edit_overlay").style.display = "none";
}

function add_overlay_on() {
    document.getElementById("add_overlay").style.display = "block";
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
    type = event.target.dataset.type;
    document.getElementById("addForm").action = `/add_${type}`;
}