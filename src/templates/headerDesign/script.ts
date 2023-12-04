const UI = {
    HOME_BTN: document.querySelector(".header .home-btn") as HTMLButtonElement
}

UI.HOME_BTN.addEventListener("click", () => {
    window.location.href = "/"
})