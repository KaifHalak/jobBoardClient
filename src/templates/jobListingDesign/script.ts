const BTNS_UI = {
    ALL_MORE_INFO_BTNS: document.querySelectorAll(".more-info-btn") as NodeListOf<HTMLButtonElement>,
    ALL_SAVE_JOB_BTNS: document.querySelectorAll(".save-job-btn") as NodeListOf<HTMLButtonElement>,
    ALL_UNSAVE_JOB_BTNS: document.querySelectorAll(".unsave-job-btn") as NodeListOf<HTMLButtonElement>
}

// Listeners

BTNS_UI.ALL_MORE_INFO_BTNS.forEach((eachBtn) => {

    eachBtn.addEventListener("click", (event) => {
        let target = event.target as HTMLButtonElement
        let jobId = target.id
        window.location.href = `/jobs/${jobId}`
    })

})

BTNS_UI.ALL_SAVE_JOB_BTNS.forEach((eachBtn) => {
    eachBtn.addEventListener("click", SaveJob)
})

BTNS_UI.ALL_UNSAVE_JOB_BTNS.forEach((eachBtn) => {
    eachBtn.addEventListener("click", UnSaveJob)
})



async function SaveJob(event: MouseEvent){
    let target = event.target as HTMLButtonElement
    let jobId = target.id
    let result = await SendRequestToServer("save", jobId)

    if (!result){
        // server offline
        return alert("SERVER ERROR. Please try again later.")
    }

    if (result?.error){
        //case to case server error
        return alert(`SERVER ERROR: ${result.error}`)
    }
    if (result?.status){
        target.removeEventListener("click", SaveJob)
        target.addEventListener("click", UnSaveJob)
        target.textContent = "Unsave Job"
    }

    if (result?.url){
        return window.location.href = result.url
    }
}

async function UnSaveJob(event: MouseEvent){
    let target = event.target as HTMLButtonElement
    let jobId = target?.id
    let result = await SendRequestToServer("unsave", jobId)

    if (!result){
        // server offline
        return alert("SERVER ERROR. Please try again later.")
    }

    if (result?.error){
        //case to case server error
        return alert(`SERVER ERROR: ${result.error}`)
    }

    if (result?.status){
        // success
        target.removeEventListener("click", UnSaveJob)
        target.addEventListener("click", SaveJob)
        target.textContent = "Save Job"
    }

    if (result?.url){
        // if server needs to redirect client
        return window.location.href = result.url
    }
}




async function SendRequestToServer(action: string, jobId: string){

    let payload = {jobId}
    let url = `/jobs/${action}`
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



