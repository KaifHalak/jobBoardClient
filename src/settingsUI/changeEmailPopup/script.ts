const CHANGE_EMAIL_POPUP_UI = {
    MAIN_CONTAINER: document.querySelector(".main-email-popup-container") as HTMLDivElement,
    POPUP_CONTAINER: document.querySelector(".email-popup-container") as HTMLDivElement,

    NEW_EMAIL_INPUT_FIELD: document.querySelector("#new-email-input-field") as HTMLInputElement,
    PASSWORD_INPUT_FIELD: document.querySelector("#password-input-field") as HTMLInputElement,

    CHANGE_EMAIL_BTN: document.querySelector(".main-email-popup-container .change-email-btn") as HTMLButtonElement,

    EMAIL_VALUE: document.querySelector(".email-container .value") as HTMLSpanElement,
    CHANGE_EMAIL_STATUS_MSG: document.querySelector(".email-status-msg") as HTMLSpanElement
}

// Prevent the popup from closing when the user clicks ON the popup
CHANGE_EMAIL_POPUP_UI.POPUP_CONTAINER.addEventListener("mousedown",(event) => {
    event.stopPropagation()
})

// Close the popup when the user clicks out of it
CHANGE_EMAIL_POPUP_UI.MAIN_CONTAINER.addEventListener("mousedown", () => {
    ResetPopup()
})


CHANGE_EMAIL_POPUP_UI.CHANGE_EMAIL_BTN.addEventListener("click", async () => {
    let currentEmail = CHANGE_EMAIL_POPUP_UI.EMAIL_VALUE.innerText
    let newEmail = CHANGE_EMAIL_POPUP_UI.NEW_EMAIL_INPUT_FIELD.value
    let password = CHANGE_EMAIL_POPUP_UI.PASSWORD_INPUT_FIELD.value

    // Validation

    let sendRequestFlag = true
    let changeEmailStatusMsg = CHANGE_EMAIL_POPUP_UI.CHANGE_EMAIL_STATUS_MSG

    if (currentEmail === newEmail){
        changeEmailStatusMsg.innerText = "Email unchanged"
        changeEmailStatusMsg.style.color = "red"
        sendRequestFlag = false
    }

    if (!ValidateEmail(newEmail)){
        changeEmailStatusMsg.innerText = "Incorrect email format"
        changeEmailStatusMsg.style.color = "red"
        sendRequestFlag = false
    }

    if (sendRequestFlag){
        let result = await SendChangeEmailRequest(newEmail, password)

        if (!result){
            //server offline
            changeEmailStatusMsg.innerText = "Server error. Please try again later"
            changeEmailStatusMsg.style.color = "red"
        }
    
        if (result?.error){
            // Case to case server error
            changeEmailStatusMsg.innerText = result?.error
            changeEmailStatusMsg.style.color = "red"
        }
    
        if (result?.status){
            // successfull
            changeEmailStatusMsg.innerText = "Email changed successfully."
            changeEmailStatusMsg.style.color = "green"
            CHANGE_EMAIL_POPUP_UI.EMAIL_VALUE.innerText = newEmail
        }

        if (result?.url){
            // If server needs the client to redirect
            return window.location.href = result?.url
        }
    }

    ResetPopup()

    changeEmailStatusMsg.classList.remove("hide")
    setTimeout(() => {
        changeEmailStatusMsg.classList.add("hide")
    },5 * 1000)

    

})



async function SendChangeEmailRequest(newEmail: string, password: string){
    let payload = {newEmail, password}
    let url = "/settings/update-email"
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


function ValidateEmail(email: string){
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
}

function ResetPopup(){
    CHANGE_EMAIL_POPUP_UI.NEW_EMAIL_INPUT_FIELD.value = ""
    CHANGE_EMAIL_POPUP_UI.PASSWORD_INPUT_FIELD.value = ""
    CHANGE_EMAIL_POPUP_UI.MAIN_CONTAINER.classList.add("hide")
}