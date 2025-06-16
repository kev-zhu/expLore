const report = document.querySelector('.report')

report.addEventListener('click', () => {
    if (confirm('Are you sure this is the business that you want to report?')) {
        let reason = window.prompt('What is the reason for your report?')
        try {
            while (reason.length === 0) {
                reason = window.prompt('Please enter a valid reason for your report.')
            }
        } catch {
            //reason null
        }

        if (reason != null) {
            fetch('/request/report-business', {
                body: JSON.stringify({
                    'businessID': sideViewBusiness.id,
                    'reason': reason
                }),
                method: 'POST'
            })
            .then(res => res.json())
            .then(result => {
                //message work on this later
                if (result.success) {
                    console.log(result.success)
                } else {
                    console.log(result.error)
                }
            })
        }
    }
})