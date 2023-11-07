const UI = {
    COMPANY_NAME_INPUT_FIELD: document.querySelector(".company-name-input-field") as HTMLInputElement,
    ABOUT_COMPANY_TEXT_AREA: document.querySelector(".about-company-text-area") as HTMLTextAreaElement,

    JOB_TITLE_INPUT_FIELD: document.querySelector(".job-title-input-field") as HTMLInputElement,
    JOB_DESC_TEXT_AREA: document.querySelector(".job-description-text-area") as HTMLTextAreaElement,
    JOB_REQ_TEXT_AREA: document.querySelector(".job-requirements-text-area") as HTMLTextAreaElement,
    EXPERIENCE_NEEDED_INPUT_FIELD: document.querySelector(".experience-needed-input-field") as HTMLInputElement,
    EMPLOYMENT_TYPE_DROPDOWN: document.querySelector("#employment-type-dropdown") as HTMLSelectElement,

    COUNTRY_DROPDOWN: document.querySelector("#country-dropdown") as HTMLSelectElement,
    CITY_DROPDOWN: document.querySelector("#city-dropdown") as HTMLSelectElement,

    MIN_MONTHLY_COMPEN_INPUT_FIELD: document.querySelector(".min-monthly-compensation-input-field") as HTMLInputElement,
    MAX_MONTHLY_COMPEN_INPUT_FIELD: document.querySelector(".max-monthly-compensation-input-field") as HTMLInputElement,

    PHONE_INPUT_FIELD: document.querySelector(".phone-input-field") as HTMLInputElement,
    EMAIL_INPUT_FIELD: document.querySelector(".email-input-field") as HTMLInputElement,
    LINKEDIN_INPUT_FIELD: document.querySelector(".linkedin-input-field") as HTMLInputElement,
    WEBSITE_INPUT_FIELD: document.querySelector(".website-input-field") as HTMLInputElement,
    
    APPLICATION_DEADLINE_INPUT_FIELD: document.querySelector(".application-deadline-input-field") as HTMLInputElement,

    JOB_POST_BTN: document.querySelector(".create-job-post-btn") as HTMLButtonElement
}

const JOB_POST_ERROR_MSG = {
    JOB_TITLE: document.querySelector(".job-title-error") as HTMLSpanElement,

    COUNTRY_DROPDOWN: document.querySelector(".country-error") as HTMLSpanElement,
    CITY_DROPDOWN: document.querySelector(".city-error") as HTMLSpanElement,

    COMPANY_NAME: document.querySelector(".company-name-error") as HTMLSpanElement,
    ABOUT_COMPANY: document.querySelector(".about-company-error") as HTMLSpanElement,

    JOB_DESC: document.querySelector(".job-description-error") as HTMLSpanElement,
    JOB_REQ: document.querySelector(".job-requirements-error") as HTMLSpanElement,
    EXPERIENCE_NEEDED: document.querySelector(".experience-needed-error") as HTMLSpanElement,
    EMPLOYMENT_TYPE: document.querySelector(".employment-type-error") as HTMLSpanElement,

    MIN_MONTHLY_COMPEN: document.querySelector(".min-monthly-error") as HTMLSpanElement,
    MAX_MONTHLY_COMPEN: document.querySelector(".max-monthly-error") as HTMLSpanElement,

    APPLICATION_DEADLINE: document.querySelector(".application-deadline-error") as HTMLSpanElement,

    PHONE_NUM: document.querySelector(".phone-num-error") as HTMLSpanElement,
    EMAIL: document.querySelector(".email-error") as HTMLSpanElement,
    LINKEDIN: document.querySelector(".linkedin-error") as HTMLSpanElement,
    WEBSITE: document.querySelector(".website-error") as HTMLSpanElement,

    OVERALL_ERROR_MSG: document.querySelector(".overall-error") as HTMLSpanElement

}


let countryDropdownUI = UI.COUNTRY_DROPDOWN
countryDropdownUI.addEventListener("change", () => {
    let country = countryDropdownUI.value

    if (country === "default"){
        return
    }
    
    let cities = countryDropdownUI.options[countryDropdownUI.selectedIndex].getAttribute("cities")?.split(",")

    let cityDropdownUI = UI.CITY_DROPDOWN
    cityDropdownUI.innerHTML = ""

    cities?.forEach((city) => {
        let option = document.createElement('option');
        option.value = city;
        option.text = city;
        option.classList.add("drop-down-option-design")
        cityDropdownUI.appendChild(option);
    })
})


let jobPostBtn = UI.JOB_POST_BTN
jobPostBtn.addEventListener("click", () => {
    CheckForAllValues()
})

function CheckForAllValues(){
    // Values
    let overallErrorMsg = JOB_POST_ERROR_MSG.OVERALL_ERROR_MSG
    overallErrorMsg.classList.add("hide")

    // Just check if not empty
    let country = UI.COUNTRY_DROPDOWN.value
    let city = UI.CITY_DROPDOWN.value
    let employmentType = UI.EMPLOYMENT_TYPE_DROPDOWN.value

    let jobTitle = UI.JOB_TITLE_INPUT_FIELD.value
    let companyName = UI.COMPANY_NAME_INPUT_FIELD.value
    let aboutCompany = UI.ABOUT_COMPANY_TEXT_AREA.value
    let jobDesc = UI.JOB_DESC_TEXT_AREA.value
    let jobReq = UI.JOB_REQ_TEXT_AREA.value
    let experienceNeeded = UI.EXPERIENCE_NEEDED_INPUT_FIELD.value

    let minMonthlyCompen = UI.MIN_MONTHLY_COMPEN_INPUT_FIELD.value
    let maxMonthlyCompen = UI.MAX_MONTHLY_COMPEN_INPUT_FIELD.value

    let applicationDeadline = UI.APPLICATION_DEADLINE_INPUT_FIELD.value
    let linkedin = UI.LINKEDIN_INPUT_FIELD.value

    if (
        !country ||
        !city ||
        !employmentType ||
        !jobTitle ||
        !companyName ||
        !aboutCompany ||
        !jobDesc ||
        !jobReq ||
        !minMonthlyCompen ||
        !maxMonthlyCompen ||
        !applicationDeadline ||
        !linkedin ||
        !experienceNeeded
    ){
        overallErrorMsg.innerText = "Please fill in the required fields"
        overallErrorMsg.classList.remove("hide")
        return 
    }

    //Validation checks needed

    let phoneNum = UI.PHONE_INPUT_FIELD.value
    if (!ValidatePhoneNum(phoneNum)){
        overallErrorMsg.innerText = "Incorrect phone number format. Please follow the example given"
        overallErrorMsg.classList.remove("hide")
        return 
    }

    let email = UI.EMAIL_INPUT_FIELD.value

    if (!ValidateEmail(email)){
        overallErrorMsg.innerText = "Incorrect email format. Please follow the example given"
        overallErrorMsg.classList.remove("hide")
        return 
    }


    // Optional
    let website = UI.WEBSITE_INPUT_FIELD.value

    // console.log({
    //     country,
    //     city,
    //     employmentType,
    //     jobTitle,
    //     companyName,
    //     aboutCompany,
    //     jobDesc,
    //     jobReq,
    //     experienceNeeded,
    //     minMonthlyCompen,
    //     maxMonthlyCompen,
    //     phoneNum,
    //     email,
    //     linkedin,
    //     website,
    //     applicationDeadline
    // })
}




function ValidatePhoneNum(num: string){
    const regexPattern = /^\+\d{1,4}\s?\d+$/;
    return regexPattern.test(num)
}

function ValidateEmail(email: string){
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return pattern.test(email);
}



