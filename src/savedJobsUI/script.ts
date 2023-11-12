const UI = {
    ALL_MORE_INFO_BTNS: document.querySelectorAll(".more-info-btn") as NodeListOf<HTMLButtonElement>
}

UI.ALL_MORE_INFO_BTNS.forEach((eachBtn) => {

    eachBtn.addEventListener("click", (event) => {
        let target = event.target as customEventTarget
        let jobId = target?.id
        window.location.href = `/jobs/${jobId}`
    })

})


interface customEventTarget extends EventTarget{
    id: string
}

