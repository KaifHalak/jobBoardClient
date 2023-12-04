const UI = {
    SHOW_MORE_BTN: document.querySelector(".show-more-btn") as HTMLButtonElement
}

UI.SHOW_MORE_BTN.addEventListener("click", async () => {
    let numOfJobListings = document.querySelectorAll(".job-listing").length
    let currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set("offset", numOfJobListings.toString())

    let result = await GetMoreJobPostsRequest(currentUrl)

    if (!result){
        // server offline
        alert("SERVER ERROR! Please try again later")
    }

    if (result?.error){
        // case to case server error
        alert(`SERVER ERROR! ${ result?.error}`)
    }   

    if (result?.status){

        let { moreJobs } = result.status
        if (moreJobs.length === 0){
            return UI.SHOW_MORE_BTN.classList.add("hide")
        }

        moreJobs.forEach((jobInfo) => {
            AddJobsToUI(jobInfo)
        })
    }

    if (result?.url){
        // if server needs client to redirect
        return window.location.href = result.url
    }
    

})

function AddJobsToUI(jobInfo: any){

    let jobListing = document.createElement("div")
    jobListing.classList.add("job-listing")

    jobListing.innerHTML = `
    <div class="heading">
                <span>${jobInfo.jobTitle.slice(0,20)} (  ${jobInfo.type.toUpperCase() } )</span>

                <div class="location-and-type job-listing-design">
                    <span>${jobInfo.country}, ${jobInfo.city} </span>
                </div>

            </div>

            <div class="company-name job-listing-design">
                <span class="title">Company</span>
                <p>${jobInfo.companyName.slice(0,40)}</p>
            </div>

            <div class="job-description job-listing-design">
                <span class="title">Job Description</span>
                <p>${jobInfo.jobDescription.slice(0,210)}</p>
            </div>

            <div class="job-requirements job-listing-design">
                <span class="title">Job Requirements</span>
                <p>${jobInfo.jobRequirements.slice(0,210)}</p>
            </div>

            
            <div class="experience job-listing-design">
                <span class="title">Minimum Experience</span>
                <p>${jobInfo.experience}</p>
            </div>

            <div class="footer">            
                <button class="more-info-btn" id="${jobInfo.jobId}">More info</button>
                <button class="delete-job-btn" id=" ${jobInfo.jobId}">Delete job</button>
            </div>
    `
    
    let moreInfoBtn = jobListing.querySelector(".more-info-btn") as HTMLButtonElement
    moreInfoBtn.addEventListener("click", () => {
        let jobId = moreInfoBtn.id
        window.location.href = `/jobs/${jobId}`
    })

    let deleteJobBtn = jobListing.querySelector(".delete-job-btn")  as HTMLButtonElement
    deleteJobBtn.addEventListener("click", () => {
        DeleteJob(jobInfo.jobId, deleteJobBtn)
    })

    let allJobsContainer = document.querySelector(".all-jobs-container") as HTMLDivElement
   allJobsContainer.append(jobListing)

}

async function GetMoreJobPostsRequest(url: URL){
    let options = {
        method: "POST",
        headers: {'Content-Type': 'application/json' }
        // body: JSON.stringify(payload)
    }

    return fetch(url, options)
    .then(async (res) => {

        let payload = await res.json() as {status?: {moreJobs: string[]}, error?: string, url?: string}
        return payload
    })
    
    .catch((error) => {
        // server offline
        return null
    })

}

async function SendRequestToServer(jobId: string){

    let payload = {jobId}
    let url = `/jobs/delete`
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

async function DeleteJob(jobId: string, target: HTMLButtonElement){
    let result = await SendRequestToServer(jobId)

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
        let parentMostElement = target.parentNode!.parentNode as HTMLDivElement
        parentMostElement.remove()
        return
    }

    if (result?.url){
        // if server needs to redirect client
        return window.location.href = result.url
    }
}

