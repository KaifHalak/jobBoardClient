const UI = {
    USERNAME_INPUT_FIELD: document.querySelector(".username-input-field") as HTMLInputElement,
    SAVE_USERNAME_BTN: document.querySelector(".save-email-button") as HTMLButtonElement,

    CHANGE_EMAIL_BTN: document.querySelector(".change-email-button") as HTMLButtonElement,
    CHANGE_PASSWORD_BTN: document.querySelector(".change-password-button") as HTMLButtonElement,

    USERNAME_CHANGE_MSG: document.querySelector(".username-change-msg") as HTMLSpanElement,

    EMAIL_VALUE: document.querySelector(".email-container .value") as HTMLSpanElement,
    CHANGE_EMAIL_STATUS_MSG: document.querySelector(".email-status-msg") as HTMLSpanElement,
    CHANGE_PASSWORD_STATUS_MSG: document.querySelector(".password-status-msg") as HTMLSpanElement,

    //CHANGE_EMAIL_POPUP_UI
    MAIN_EMAIL_POPUP_CONTAINER: document.querySelector(".main-email-popup-container") as HTMLDivElement,

    //CHANGE_PASSWORD_POPUP_UI
    MAIN_PASSWORD_POPUP_CONTAINER: document.querySelector(".main-password-popup-container") as HTMLDivElement
}

let currentUsername = UI.USERNAME_INPUT_FIELD.value

// Enable the "save" button when the username is changed
UI.USERNAME_INPUT_FIELD.addEventListener("input", () => {
    UI.SAVE_USERNAME_BTN.disabled = false
})


UI.SAVE_USERNAME_BTN.addEventListener("click", async () => {
    
    let newUsername = UI.USERNAME_INPUT_FIELD.value
    // To prevent unnecessary API calls
    if (newUsername === currentUsername){
        return
    }

    let result = await SendUpdateUsernameReq(newUsername)

    if (!result){
        //server offline
        UI.USERNAME_CHANGE_MSG.innerText = "Server error. Please try again later."
        UI.USERNAME_CHANGE_MSG.style.color = "red"
    }

    if (result?.error){
        // Case to case server error
        UI.USERNAME_CHANGE_MSG.innerText = result?.error
        UI.USERNAME_CHANGE_MSG.style.color = "red"
    }

    if (result?.status){
        // successfull
        UI.USERNAME_CHANGE_MSG.innerText = "Successful"
        UI.USERNAME_CHANGE_MSG.style.color = "green"
        UI.SAVE_USERNAME_BTN.disabled = true
    }

    if (result?.url){
        // If server needs the client to redirect
        return window.location.href = result?.url
    }

    // Hide the result message after 3 sec
    UI.USERNAME_CHANGE_MSG.classList.remove("hide")
    setTimeout(() => {
        UI.USERNAME_CHANGE_MSG.classList.add("hide")
    }, 3 * 1000)


})

// Show change email popup when the "Change email" button is clicked
UI.CHANGE_EMAIL_BTN.addEventListener("click", () => {
    UI.MAIN_EMAIL_POPUP_CONTAINER.classList.remove("hide")
})

// Show change password popup when the "Change password" button is clicked
UI.CHANGE_PASSWORD_BTN.addEventListener("click", () => {
    UI.MAIN_PASSWORD_POPUP_CONTAINER.classList.remove("hide")
})


async function SendUpdateUsernameReq(newUsername: string){

    let payload = {newUsername}
    let url = "/settings/update-username"
    let options = {
        method: "POST",
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }

    return fetch(url, options)
    .then(async (res) => {
        let payload = await res.json() as {status?: string, error?: string, url?: string}
        return payload
    })
    
    .catch((error) => {
        // server offline
        return null
    })

}

