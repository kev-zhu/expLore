document.addEventListener('click', (e) =>{
    if (e.target.classList.contains('request-approve')) {
        //fetch request to approve request
        fetch('/staff/approve-request', {
            body: JSON.stringify({
                "id": e.target.dataset.id
            }),
            method: "POST",
        })

        document.querySelector(`.add-${e.target.dataset.id}`).remove()
        
    } else if (e.target.classList.contains('request-reject')) {
        //fetch request to reject request
        fetch('/staff/reject-request', {
            body: JSON.stringify({
                "id": e.target.dataset.id
            }),
            method: "POST",
        })

        document.querySelector(`.add-${e.target.dataset.id}`).remove()
    }
})