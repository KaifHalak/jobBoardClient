const BTNS_UI = {
    ALL_MORE_INFO_BTNS: document.querySelectorAll(".more-info-btn") as NodeListOf<HTMLButtonElement>,
    ALL_SAVE_JOB_BTNS: document.querySelectorAll(".save-job-btn") as NodeListOf<HTMLButtonElement>,
    ALL_UNSAVE_JOB_BTNS: document.querySelectorAll(".unsave-job-btn") as NodeListOf<HTMLButtonElement>
}

BTNS_UI.ALL_MORE_INFO_BTNS.forEach((eachBtn) => {

    eachBtn.addEventListener("click", (event) => {
        let target = event.target as HTMLButtonElement
        let jobId = target?.id
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
    let jobId = target?.id
    let payload = await SendRequestToServer("save", jobId)

    if (!payload){
        // server offline
    }

    if (payload?.error){
        //server error
    }

    if (payload?.status){
        target.removeEventListener("click", SaveJob)
        target.addEventListener("click", UnSaveJob)
        target.textContent = "Unsave Job"
    }

    if (payload?.url){
        return window.location.href = payload.url
    }
}

async function UnSaveJob(event: MouseEvent){
    let target = event.target as HTMLButtonElement
    let jobId = target?.id
    let payload = await SendRequestToServer("unsave", jobId)

    if (!payload){
        // server offline
        return alert("Server error. Please try again later.")
    }

    if (payload?.error){
        //server error
        return alert("Server error. Please try again later.")
    }

    if (payload?.status){
        target.removeEventListener("click", UnSaveJob)
        target.addEventListener("click", SaveJob)
        target.textContent = "Save Job"
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
        return null
    })


}



