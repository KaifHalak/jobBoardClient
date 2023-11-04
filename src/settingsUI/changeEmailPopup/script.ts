 const CHANGE_EMAIL_POPUP_UI = {
    MAIN_CONTAINER: document.querySelector(".main-email-popup-container") as HTMLDivElement,
    POPUP_CONTAINER: document.querySelector(".email-popup-container") as HTMLDivElement
}

CHANGE_EMAIL_POPUP_UI.POPUP_CONTAINER.addEventListener("mousedown",(event) => {
    event.stopPropagation()
})

CHANGE_EMAIL_POPUP_UI.MAIN_CONTAINER.addEventListener("mousedown", () => {
    CHANGE_EMAIL_POPUP_UI.MAIN_CONTAINER.classList.add("hide")
})

