const ShowButton = document.querySelector("#instructions-button");
const CloseButton = document.querySelector("#close-button");
const dialog = document.querySelector("#dialog");
const body = document.querySelector("body");

const showDialog = () => {
    dialog.showModal();
    body.style.overflow = "hidden";
}

const closeDialog = () => {
    dialog.close();
}

// Fires no matter how the dialog is closed (button, Escape, ...)
dialog.addEventListener("close", () => {
    body.style.overflow = "auto";
});

ShowButton.addEventListener("click", showDialog);
CloseButton.addEventListener("click", closeDialog);

    

