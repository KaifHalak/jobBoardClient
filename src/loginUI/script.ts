const UI = {
    EMAIL_INPUT_FIELD: document.querySelector("#login-email-input-field") as HTMLInputElement,
    PASSWORD_INPUT_FIELD: document.querySelector("#password-input-field") as HTMLInputElement,

    LOGIN_BTN: document.querySelector(".login-btn") as HTMLButtonElement,

    EMAIL_ERROR_MESSAGE: document.querySelector(".email-error-msg") as HTMLSpanElement,
    PASSWORD_ERROR_MESSAGE: document.querySelector(".password-error-msg") as HTMLSpanElement,

    SERVER_ERROR_MESSAGE: document.querySelector(".server-error-msg") as HTMLSpanElement,
    CUSTOM_SERVER_ERROR_MESSAGE: document.querySelector(".custom-server-error-msg") as HTMLSpanElement


}

UI.LOGIN_BTN.addEventListener("click", async () => {

    let email = UI.EMAIL_INPUT_FIELD.value
    let password = UI.PASSWORD_INPUT_FIELD.value

    // Validation

    let sendRequestFlag = true

    if (!email || !ValidateEmail(email)){
        sendRequestFlag = false
        UI.EMAIL_ERROR_MESSAGE.classList.remove("hide")
    }

    if (!password || !ValidatePassword(password)){
        sendRequestFlag = false
        UI.PASSWORD_ERROR_MESSAGE.classList.remove("hide")
    }

    if (!sendRequestFlag){
        return
    }
    

    let payload = await SendLoginRequest(email, password)
    if (!payload){
        // Server offline
        return UI.SERVER_ERROR_MESSAGE.classList.add("hide")
    }

    // Case to case server error   
    if (payload?.error){
        UI.CUSTOM_SERVER_ERROR_MESSAGE.innerHTML = payload.error
        UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.remove("hide")
    }

    if (payload?.url){
        // redirect user
        return window.location.href = payload?.url
    }

})


// Hide the respective error messages when there is a change in the input fields

UI.EMAIL_INPUT_FIELD.addEventListener("input", () => {
    UI.EMAIL_ERROR_MESSAGE.classList.add("hide")
    UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.add("hide")
})

UI.PASSWORD_INPUT_FIELD.addEventListener("input", () => {
    UI.PASSWORD_ERROR_MESSAGE.classList.add("hide")
    UI.CUSTOM_SERVER_ERROR_MESSAGE.classList.add("hide")
})



function ValidateEmail(email: string){
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
}

function ValidatePassword(password: string){
    return password.length >= 6
}

async function SendLoginRequest(email:string, password: string){

    let payload = {email,password}
    let url = "/user/login"
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
