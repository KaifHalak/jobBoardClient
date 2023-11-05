const CHANGE_PASSWORD_POPUP_UI = {
    MAIN_CONTAINER: document.querySelector(".main-password-popup-container") as HTMLDivElement,
    POPUP_CONTAINER: document.querySelector(".password-popup-container") as HTMLDivElement,

    CURRENT_PASSWORD_INPUT_FIELD: document.querySelector("#current-password-input-field") as HTMLInputElement,
    NEW_PASSWORD_INPUT_FIELD: document.querySelector("#new-password-input-field") as HTMLInputElement,

    CHANGE_PASSWORD_BTN: document.querySelector(".main-password-popup-container .change-password-btn")  as HTMLButtonElement,

    CHANGE_PASSWORD_STATUS_MSG: document.querySelector(".password-status-msg") as HTMLSpanElement
}

CHANGE_PASSWORD_POPUP_UI.POPUP_CONTAINER.addEventListener("mousedown",(event) => {
    event.stopPropagation()
})


CHANGE_PASSWORD_POPUP_UI.MAIN_CONTAINER.addEventListener("mousedown", () => {
    CHANGE_PASSWORD_POPUP_UI.CURRENT_PASSWORD_INPUT_FIELD.value = ""
    CHANGE_PASSWORD_POPUP_UI.NEW_PASSWORD_INPUT_FIELD.value = ""
    CHANGE_PASSWORD_POPUP_UI.MAIN_CONTAINER.classList.add("hide")
})

CHANGE_PASSWORD_POPUP_UI.CHANGE_PASSWORD_BTN.addEventListener("click", async () => {
    let currentPassword = CHANGE_PASSWORD_POPUP_UI.CURRENT_PASSWORD_INPUT_FIELD.value
    let newPassword = CHANGE_PASSWORD_POPUP_UI.NEW_PASSWORD_INPUT_FIELD.value

    let sendRequestFlag = true
    let changePasswordStatusMsg = CHANGE_PASSWORD_POPUP_UI.CHANGE_PASSWORD_STATUS_MSG

    if (!ValidatePassword(newPassword) || !ValidatePassword(currentPassword)){
        changePasswordStatusMsg.innerText = "Password must be atleast 6 characters long"
        changePasswordStatusMsg.style.color = "red"
        sendRequestFlag = false
    }

    if (sendRequestFlag){
        let results = await SendChangePasswordRequest(currentPassword, newPassword)

        if (!results){
            changePasswordStatusMsg.innerText = "Server error. Please try again later"
            changePasswordStatusMsg.style.color = "red"
        }
    
        if (results?.error){
            changePasswordStatusMsg.innerText = results.error
            changePasswordStatusMsg.style.color = "red"
        }
    
        if (results?.status){
            changePasswordStatusMsg.innerText = "Password changed successfully"
            changePasswordStatusMsg.style.color = "green"
        }
    }

    CHANGE_PASSWORD_POPUP_UI.CURRENT_PASSWORD_INPUT_FIELD.value = ""
    CHANGE_PASSWORD_POPUP_UI.NEW_PASSWORD_INPUT_FIELD.value = ""
    CHANGE_PASSWORD_POPUP_UI.MAIN_CONTAINER.classList.add("hide")

    changePasswordStatusMsg.classList.remove("hide")
    setTimeout(() => {
        changePasswordStatusMsg.classList.add("hide")
    }, 5 * 1000)


    

})


function ValidatePassword(password: string){
    return (password.length >= 6)
}


async function SendChangePasswordRequest(currentPassword: string, newPassword: string){
    let payload = {currentPassword, newPassword}
    let url = "/settings/update-password"
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




