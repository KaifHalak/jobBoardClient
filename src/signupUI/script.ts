const UI = {
    USERNAME_INPUT_FIELD: document.querySelector("#signin-username-input-field") as HTMLInputElement,
    EMAIL_INPUT_FIELD: document.querySelector("#signin-email-input-field") as HTMLInputElement,
    PASSWORD_INPUT_FIELD: document.querySelector("#signin-password-input-field") as HTMLInputElement,

    SIGN_IN_BTN: document.querySelector(".signin-btn") as HTMLButtonElement,

    USERNAME_ERROR_MSG: document.querySelector(".username-error-msg") as HTMLSpanElement,
    EMAIL_ERROR_MSG: document.querySelector(".email-error-msg") as HTMLSpanElement,
    PASSWORD_ERROR_MSG: document.querySelector(".password-error-msg") as HTMLSpanElement,

    SERVER_ERROR_MSG: document.querySelector(".server-error-msg") as HTMLSpanElement,
    CUSTOM_SERVER_ERROR_MESSAGE: document.querySelector(".custom-server-error-msg") as HTMLSpanElement

}

UI.SIGN_IN_BTN.addEventListener("click", async () => {
    let username = UI.USERNAME_INPUT_FIELD.value
    let email = UI.EMAIL_INPUT_FIELD.value
    let password = UI.PASSWORD_INPUT_FIELD.value

    // Validation

    let sendRequestFlag = true

    let validateUsername = ValidateUsername(username)
    if (validateUsername?.error){
        UI.USERNAME_ERROR_MSG.textContent = validateUsername.error
        UI.USERNAME_ERROR_MSG.classList.remove("hide")
        sendRequestFlag = false
    }

    if (!ValidateEmail(email)){
        UI.EMAIL_ERROR_MSG.classList.remove("hide")
        sendRequestFlag = false
    }

    if (!ValidatePassword(password)){
        UI.PASSWORD_ERROR_MSG.classList.remove("hide")
        sendRequestFlag = false
    }

    if (!sendRequestFlag){
        return
    }


    let payload = await SendSignupRequest(username, email, password)

    // Server offline
    if (!payload){
        UI.SERVER_ERROR_MSG.classList.remove("hide")
        return
    }

    // Case to case server error
    if (payload?.error){
        UI.CUSTOM_SERVER_ERROR_MESSAGE.innerText = payload.error
        UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.remove("hide")
        return
    }

    // Redirect client
    if (payload?.url){
        return window.location.href = payload?.url
    }


})


// Hide the respective error messages when there is a change in the input fields

UI.USERNAME_INPUT_FIELD.addEventListener("input", () => {
    UI.USERNAME_ERROR_MSG.classList.add("hide")
    UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.add("hide")
})

UI.EMAIL_INPUT_FIELD.addEventListener("input", () => {
    UI.EMAIL_ERROR_MSG.classList.add("hide")
    UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.add("hide")
})

UI.PASSWORD_INPUT_FIELD.addEventListener("input", () => {
    UI.PASSWORD_ERROR_MSG.classList.add("hide")
    UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.add("hide")
})



function ValidateEmail(email: string){
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
}

function ValidatePassword(password: string){
    return password.length >= 6
}

function ValidateUsername(username: string){

    let allowedPatterns = /^[a-zA-Z0-9_]+$/

    if ( !(username.length >= 3 && username.length <= 20) ){
        return {error : "Username must be between 3 and 20 characters"}
    }

    if ( !(allowedPatterns.test(username)) ){
        return {error: "Only characters from A-Z, a-z, numbers, and underscores are allowed."}
    }

    return

}


async function SendSignupRequest(username: string, email: string, password: string){

    let payload = {username, email, password}
    let url = "/user/signup"
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

