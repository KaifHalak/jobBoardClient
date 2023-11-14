const UI = {
    JOB_TYPE_DROPDOWN: document.querySelector("#type-dropdown") as HTMLSelectElement,
    JOB_EXPERIENCE_DROPDOWN: document.querySelector("#experience-dropdown") as HTMLSelectElement,
    COUNTRY_DROPDOWN: document.querySelector("#country-dropdown") as HTMLSelectElement,
    CITY_DROPDOWN: document.querySelector("#city-dropdown") as HTMLSelectElement,

    JOB_SEARCH_INPUT_FIELD: document.querySelector(".job-search-input-field") as HTMLInputElement,

    SHOW_MORE_BTN: document.querySelector(".show-more-btn") as HTMLButtonElement
}

// Filters

UI.JOB_TYPE_DROPDOWN.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    let selectedOption = target.options[target.selectedIndex]

    let currentUrl = new URL(window.location.href)  
    currentUrl.searchParams.set("type",selectedOption.value)
    window.location.href = currentUrl.toString()

})

UI.JOB_EXPERIENCE_DROPDOWN.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    let selectedOption = target.options[target.selectedIndex]

    let currentUrl = new URL(window.location.href)  
    currentUrl.searchParams.set("experience",selectedOption.value)
    window.location.href = currentUrl.toString()
})

UI.COUNTRY_DROPDOWN.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    let selectedOption = target.options[target.selectedIndex]
    console.log(selectedOption)

    if(selectedOption.value){
        let cities = selectedOption.getAttribute("cities")?.split(",")

        let cityDropdownUI = UI.CITY_DROPDOWN
        cityDropdownUI.innerHTML = ""

        cities?.forEach((city) => {
            let option = document.createElement('option');
            option.value = city;
            option.text = city;
            option.classList.add("drop-down-option-design")
            cityDropdownUI.appendChild(option);
        })

    }

    let currentUrl = new URL(window.location.href)  
    currentUrl.searchParams.set("country",selectedOption.value)
    window.location.href = currentUrl.toString()
})

UI.CITY_DROPDOWN.addEventListener("change", (event) => {
    let target = event.target as HTMLSelectElement
    let selectedOption = target.options[target.selectedIndex]

    let currentUrl = new URL(window.location.href)  
    currentUrl.searchParams.set("city",selectedOption.value)
    window.location.href = currentUrl.toString()
})



// Search bar

// Debouncing

let timeout: any
let delay = 1 * 1000

UI.JOB_SEARCH_INPUT_FIELD.addEventListener("input", (event) => {

    if (timeout){
        clearTimeout(timeout)
    }

    timeout = setTimeout(() => {

        let target = event.target! as HTMLInputElement
        
        let currentUrl = new URL(window.location.href)  
        currentUrl.searchParams.set("search",target.value)
        window.location.href = currentUrl.toString()

    }, delay)

})


// Show more button

UI.SHOW_MORE_BTN.addEventListener("click", async () => {

    let numOfJobListings = document.querySelectorAll(".job-listing").length

    let result = await GetMoreJobPostsRequest(numOfJobListings)
    
    if (!result){
        // server offline
        alert("SERVER ERROR! Please try again later")
    }

    if (result?.error){
        // case to case server error
        alert(`SERVER ERROR! ${ result?.error}`)
    }   

    if (result?.status){
        let { allJobs, allSavedJobIds } = result.status
        allJobs.forEach((jobInfo) => {
            AddJobsToUI(jobInfo, allSavedJobIds)
        })
    }

    if (result?.url){
        // if server needs client to redirect
        return window.location.href = result.url
    }
    

})

function AddJobsToUI(jobInfo: any, allSavedJobIds: string[]){

    let jobListing = document.createElement("div")
    jobListing.classList.add("job-listing")

    let save_unsave_btn_class, save_unsave_btn_text
    if (allSavedJobIds.includes(jobInfo.jobId)){
        save_unsave_btn_class = "unsave-job-btn"
        save_unsave_btn_text = "Unsave"
    } else {
        save_unsave_btn_class = "save-job-btn"
        save_unsave_btn_text = "Save"
    }

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
                <button class="${save_unsave_btn_class}" id=" ${jobInfo.jobId}">${save_unsave_btn_text}</button>
            </div>
    `
    
    let moreInfoBtn = jobListing.querySelector(".more-info-btn") as HTMLButtonElement
    moreInfoBtn.addEventListener("click", () => {
        let jobId = moreInfoBtn.id
        window.location.href = `/jobs/${jobId}`
    })

    let save_unsave_btn = jobListing.querySelector(`.${save_unsave_btn_class}`)  as HTMLButtonElement
    if (save_unsave_btn_class === "save-job-btn"){
        save_unsave_btn.addEventListener("click", SaveJob)
    } else {
        save_unsave_btn.addEventListener("click", UnSaveJob)
    }

    let allJobsContainer = document.querySelector(".all-jobs-container") as HTMLDivElement
   allJobsContainer.append(jobListing)

}

async function GetMoreJobPostsRequest(offset: number){
    // let payload = {offset}
    let url = `/?offset=${offset}`
    let options = {
        method: "POST",
        headers: {'Content-Type': 'application/json' }
        // body: JSON.stringify(payload)
    }

    return fetch(url, options)
    .then(async (res) => {

        let payload = await res.json() as {status?: {allJobs: string[], allSavedJobIds: string[]}, error?: string, url?: string}
        return payload
    })
    
    .catch((error) => {
        // server offline
        return null
    })

}




async function SaveJob(event: MouseEvent){
    let target = event.target as HTMLButtonElement
    let jobId = target.id
    let result = await SendSaveUnsaveRequestToServer("save", jobId)

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
    let result = await SendSaveUnsaveRequestToServer("unsave", jobId)

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

async function SendSaveUnsaveRequestToServer(action: string, jobId: string){

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
