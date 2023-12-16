const CHANGE_PIC_UI = {
    MAIN_CONTAINER: document.querySelector(".main-change-profile-pic-container") as HTMLDivElement,
    POPUP_CONTAINER: document.querySelector(".change-profile-pic-container") as HTMLDivElement,

    BROWSE_IMG_BTN: document.querySelector(".browse-img-btn") as HTMLButtonElement,
    SET_IMG_BTN: document.querySelector(".set-img-btn") as HTMLButtonElement,
    UPLOAD_IMG_INPUT_FIELD: document.querySelector(".file-input-field") as HTMLInputElement,

    SHOW_IMG: document.querySelector(".show-profile-pic-image") as HTMLImageElement,
    SHOW_IMG_CONTAINER: document.querySelector(".image-container") as HTMLDivElement,

    INCREASE_IMG_SIZE_BTN: document.querySelector(".change-image-size-container .increase") as HTMLButtonElement,
    DECREASE_IMG_SIZE_BTN: document.querySelector(".change-image-size-container .decrease") as HTMLButtonElement,
    IMG_SIZE_INPUT_FIELD: document.querySelector(".change-image-size-input-field") as HTMLInputElement
}

type TFileSendStatus = "start" | "in-progress" | "end"

const SUPPORTED_FILE_TYPES = ["jpeg", "png", "jpg"]

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 2 // 2MB in Bytes (1MB --> 1024KB --> 1024 * 1024 Bytes)
const MAX_FILE_SIZE_MB_TEXT = (MAX_FILE_SIZE_BYTES / Math.pow(1024, 2)) + "MB" // for error message
const MAX_CHUNK_SIZE = 1000 // bytes

const CHANGE_IMG_SIZE_CONST = 10 // the image size will change in increments of this value


CHANGE_PIC_UI.POPUP_CONTAINER.addEventListener("mousedown", (event) => {
    event.stopPropagation()
})

CHANGE_PIC_UI.MAIN_CONTAINER.addEventListener("mousedown", () => {
    ResetPopup()
})

CHANGE_PIC_UI.BROWSE_IMG_BTN.addEventListener("click", () => {
    CHANGE_PIC_UI.UPLOAD_IMG_INPUT_FIELD.click()
})
CHANGE_PIC_UI.UPLOAD_IMG_INPUT_FIELD.addEventListener("change", LoadImage)

CHANGE_PIC_UI.SET_IMG_BTN.addEventListener("click", () => {
    CropImage()
})


function LoadImage(e: Event){
    let fileInputField = e.target as HTMLInputElement
    let file = fileInputField.files![0]

    // Check if a file is selected
    if ( file ){

        EnableButtons()

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

        DisplayImage(file)
    }

}

function DisplayImage(image: File){
    
    let imageReader = new FileReader()
    imageReader.onload = (e) => {
        let dataURL = e.target!.result as string
        CHANGE_PIC_UI.SHOW_IMG.src = dataURL
    }

    imageReader.readAsDataURL(image)

}

async function ReadImageData(image: Blob){
    let fileSendStatus:  TFileSendStatus

    let data = image as Blob
    let totalChunkSize = data.size

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

async function SendChunkToServer(chunk: Blob, fileStatus: TFileSendStatus){

    let formData = new FormData()
    formData.append("chunk", chunk)
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

async function ProcessServerRequest(slicedChunk: Blob, fileSendStatus: TFileSendStatus){

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
                window.location.reload()
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
    CHANGE_PIC_UI.MAIN_CONTAINER.classList.add("hide")
    CHANGE_PIC_UI.UPLOAD_IMG_INPUT_FIELD.files = null
    CHANGE_PIC_UI.SHOW_IMG.src = ""
    DisableButton()
}

function EnableButtons(){
    CHANGE_PIC_UI.INCREASE_IMG_SIZE_BTN.disabled = false
    CHANGE_PIC_UI.DECREASE_IMG_SIZE_BTN.disabled = false
    CHANGE_PIC_UI.IMG_SIZE_INPUT_FIELD.readOnly = false

    CHANGE_PIC_UI.SET_IMG_BTN.disabled = false
    CHANGE_PIC_UI.SET_IMG_BTN.classList.remove("disabled-btn")
}

function DisableButton(){
    CHANGE_PIC_UI.INCREASE_IMG_SIZE_BTN.disabled = true
    CHANGE_PIC_UI.DECREASE_IMG_SIZE_BTN.disabled = true
    CHANGE_PIC_UI.IMG_SIZE_INPUT_FIELD.readOnly = true

    CHANGE_PIC_UI.SET_IMG_BTN.disabled = true
    CHANGE_PIC_UI.SET_IMG_BTN.classList.add("disabled-btn")
}

// ======= IMAGE MANIPULATION =======


// ======= Changing Image Size =======

// currentImgSize is used to store the previous value in the img size input field. It will help us determine the change in img size to make
let currentImgSize = Number(CHANGE_PIC_UI.IMG_SIZE_INPUT_FIELD.value)

CHANGE_PIC_UI.INCREASE_IMG_SIZE_BTN.addEventListener("click", () => {
    UpdateImgSizeInInputField()
    IncreaseImgSize(CHANGE_IMG_SIZE_CONST)
})

CHANGE_PIC_UI.DECREASE_IMG_SIZE_BTN.addEventListener("click", () => {
    UpdateImgSizeInInputField()
    DecreaseImgSize(CHANGE_IMG_SIZE_CONST)
})

CHANGE_PIC_UI.IMG_SIZE_INPUT_FIELD.addEventListener("input", () => {
    let newImgSize =  Number(CHANGE_PIC_UI.IMG_SIZE_INPUT_FIELD.value)

    if (newImgSize > currentImgSize){
        IncreaseImgSize(newImgSize - currentImgSize)
    } 
    else if (newImgSize < currentImgSize){
        DecreaseImgSize(currentImgSize - newImgSize)
    }

    currentImgSize = newImgSize
})

function UpdateImgSizeInInputField(){
    let imgSizeInputField = CHANGE_PIC_UI.IMG_SIZE_INPUT_FIELD

    let currentImgSize = Number(imgSizeInputField.value)
    imgSizeInputField.value = (currentImgSize + CHANGE_IMG_SIZE_CONST).toString()
    currentImgSize = currentImgSize
}

function IncreaseImgSize(changeImgSizeBy: number){
    let imgWidth = CHANGE_PIC_UI.SHOW_IMG.width
    CHANGE_PIC_UI.SHOW_IMG.style.width = (imgWidth + changeImgSizeBy) + "px"
}

function DecreaseImgSize(changeImgSizeBy: number){
    let imgWidth = CHANGE_PIC_UI.SHOW_IMG.width
    CHANGE_PIC_UI.SHOW_IMG.style.width = (imgWidth - changeImgSizeBy) + "px"
}

// ======= Move Image With Cursor =======

let startMouseX: number
let endMouseX: number

let startMouseY: number
let endMouseY: number

let startImgLeftCoord: number
let startImgTopCoord: number
let imgInstance = CHANGE_PIC_UI.SHOW_IMG

let moveMouse = false

imgInstance.addEventListener("mousedown", (e: MouseEvent) => {

    startImgLeftCoord = (imgInstance.offsetLeft)
    startImgTopCoord = (imgInstance.offsetTop)

    startMouseX = e.clientX
    startMouseY = e.clientY

    moveMouse = true
    
})

imgInstance.addEventListener("mousemove", (e: MouseEvent) => {
    if (!moveMouse){
        return
    }
    
    endMouseX = e.clientX
    endMouseY = e.clientY

    let diffX = endMouseX - startMouseX
    let diffY = endMouseY - startMouseY

    imgInstance.style.left = (startImgLeftCoord + diffX) + "px"
    imgInstance.style.top = (startImgTopCoord + diffY) + "px"
})

imgInstance.addEventListener("mouseup", (e: MouseEvent) => {
    moveMouse = false
})


function CropImage(){

    let imgContainer = CHANGE_PIC_UI.SHOW_IMG_CONTAINER

    //@ts-ignore
    html2canvas(imgContainer)
    .then((canvas: HTMLCanvasElement) => {
        let context = canvas.getContext("2d")!
        context.drawImage(canvas, 0, 0)
        canvas.style.borderRadius = (canvas.width / 2) + "px"

        canvas.toBlob((blob) => {
            ReadImageData(blob!)
        })
    })

}


