const UI = {
    JOB_TYPE_DROPDOWN: document.querySelector("#type-dropdown") as HTMLSelectElement,
    JOB_EXPERIENCE_DROPDOWN: document.querySelector("#experience-dropdown") as HTMLSelectElement,
    COUNTRY_DROPDOWN: document.querySelector("#country-dropdown") as HTMLSelectElement,
    CITY_DROPDOWN: document.querySelector("#city-dropdown") as HTMLSelectElement,

    JOB_SEARCH_INPUT_FIELD: document.querySelector(".job-search-input-field") as HTMLInputElement
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


