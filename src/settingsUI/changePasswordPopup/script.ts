const CHANGE_PASSWORD_POPUP_UI = {
    MAIN_CONTAINER: document.querySelector(".main-password-popup-container") as HTMLDivElement,
    POPUP_CONTAINER: document.querySelector(".password-popup-container") as HTMLDivElement
}

CHANGE_PASSWORD_POPUP_UI.POPUP_CONTAINER.addEventListener("mousedown",(event) => {
    event.stopPropagation()
})


CHANGE_PASSWORD_POPUP_UI.MAIN_CONTAINER.addEventListener("mousedown", () => {
    CHANGE_PASSWORD_POPUP_UI.MAIN_CONTAINER.classList.add("hide")
})

