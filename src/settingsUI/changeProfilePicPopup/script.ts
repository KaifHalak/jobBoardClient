const CHANGE_PROFILE_PIC_UI = {
    MAIN_CONTAINER: document.querySelector(".main-change-profile-pic-container") as HTMLDivElement,
    POPUP_CONTAINER: document.querySelector(".change-profile-pic-container") as HTMLDivElement,


    BROWSE_FILE_BTN: document.querySelector(".browse-file-btn") as HTMLButtonElement,
    FILE_INPUT_FIELD: document.querySelector(".file-input-field") as HTMLInputElement
}



CHANGE_PROFILE_PIC_UI.POPUP_CONTAINER.addEventListener("mousedown", (event) => {
    event.stopPropagation()
})

CHANGE_PROFILE_PIC_UI.MAIN_CONTAINER.addEventListener("mousedown", () => {
    ResetPopup()
})

const SUPPORTED_FILE_TYPES = ["jpeg", "png", "jpg"]

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 2 // 2MB in Bytes (1MB --> 1024KB --> 1024 * 1024 Bytes)
const MAX_FILE_SIZE_MB_TEXT = (MAX_FILE_SIZE_BYTES / Math.pow(1024, 2)) + "MB" // for error message
const MAX_CHUNK_SIZE = 1000 // bytes

type TFileSendStatus = "start" | "in-progress" | "end"

CHANGE_PROFILE_PIC_UI.FILE_INPUT_FIELD.addEventListener("change", LoadImage)

CHANGE_PROFILE_PIC_UI.BROWSE_FILE_BTN.addEventListener("click", () => {
    CHANGE_PROFILE_PIC_UI.FILE_INPUT_FIELD.click()
})


function LoadImage(e: Event){
    let fileInputFiled = e.target as HTMLInputElement
    let file = fileInputFiled.files![0]

    // Check if a file is selected
    if ( file ){

        // Check if file is of type image ( jpeg, png, jpg )
        let imageType = file.type.split("/")[1]
        if (!SUPPORTED_FILE_TYPES.includes(imageType)){
            return alert("Only " + SUPPORTED_FILE_TYPES.join(" and ") + " images are allowed")
        }

        // Check if file size is within limits ( < 2MB )
        let fileSize = file.size
        if (fileSize > MAX_FILE_SIZE_BYTES){
            return alert("Max file size: " + MAX_FILE_SIZE_MB_TEXT)
        }

        ReadImageData(file)
        
    }

}

function ReadImageData(image: File){
    let fileSendStatus:  TFileSendStatus

    let imageReader = new FileReader()


    // This function will fire when the contents of the file is read ( Event-based programming )
    imageReader.onload = async (fileBuffer) => {

        let data = fileBuffer.target!.result as ArrayBuffer
        let totalChunkSize = data.byteLength


        // We add 1 in order to take into account the remainder. ( Ex: 1040 / 1000 = 1.04; We need to loop twice in order to take into acct the 0.4 )
        let numOfLoops = Math.floor( totalChunkSize / MAX_CHUNK_SIZE) + 1

        for (let i = 0; i < numOfLoops; i++){

            switch (i) {
                case 0:
                    fileSendStatus = "start"
                    break;

                case numOfLoops - 1:
                    fileSendStatus = "end"
                    break;
                
                default:
                    fileSendStatus = "in-progress"
                    break;
            }

            let slicedChunk = data.slice(i * MAX_CHUNK_SIZE, i * MAX_CHUNK_SIZE + MAX_CHUNK_SIZE)
            let result = await ProcessServerRequest(slicedChunk, fileSendStatus)

            if (!result){
                break
            }

        }

    }

    // Read the contents of the file
    imageReader.readAsArrayBuffer(image)
}

async function SendChunkToServer(chunk: ArrayBuffer, fileStatus: TFileSendStatus){

    let formData = new FormData()
    formData.append("chunk", new Blob([chunk]))
    formData.append("fileStatus", fileStatus)

    // let paylaod = JSON.stringify({chunk, fileType, fileStatus})
    let url = "/settings/update-profile-pic"

    let options: RequestInit = {
        method: "POST",
        body: formData,
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

async function ProcessServerRequest(slicedChunk: ArrayBuffer, fileSendStatus: TFileSendStatus){

    let result = await SendChunkToServer(slicedChunk, fileSendStatus)
    if (!result){
        //server offline
        alert("SERVER ERROR. Please try again later")
        return false
    }

    if (result?.error){
        // Case to case server error

        if (result.error === "resend chunk"){
            ProcessServerRequest(slicedChunk, fileSendStatus)
            return false
        } 
        else {
            alert(result?.error)
            return false
        }

    }

    if (result?.status){
        // successfull
        if (result.status === "end"){
            alert("profile pic updated successfully")
            return false
        }

        return true
    }

    if (result?.url){
        // If server needs the client to redirect
        window.location.href = result?.url
        return false
    }
}


function ResetPopup(){
    CHANGE_PROFILE_PIC_UI.MAIN_CONTAINER.classList.add("hide")
    CHANGE_PROFILE_PIC_UI.FILE_INPUT_FIELD.files = null
}


