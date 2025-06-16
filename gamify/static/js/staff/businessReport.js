document.addEventListener('click', (e) =>{
    if (e.target.classList.contains('report-approve')) {
        //fetch request to approve request
        fetch('/staff/approve-report', {
            body: JSON.stringify({
                "id": e.target.dataset.id
            }),
            method: "POST"
        })

        document.querySelector(`.add-${e.target.dataset.id}`).remove()
        
    } else if (e.target.classList.contains('report-reject')) {
        //fetch request to reject request
        fetch('/staff/reject-report', {
            body: JSON.stringify({
                "id": e.target.dataset.id
            }),
            method: "POST"
        })

        document.querySelector(`.add-${e.target.dataset.id}`).remove()
    }
})