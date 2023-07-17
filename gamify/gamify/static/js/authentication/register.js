const userField = document.querySelector('#usernameField')
const emailField = document.querySelector('#emailField')
const passField = document.querySelector('#passwordField')
const confirmField = document.querySelector('#confirmField')

const userFeedback = document.querySelector('#username-feedback')
const emailFeedback = document.querySelector('#email-feedback')
const passFeedback = document.querySelector('#password-feedback')
const confirmFeedback = document.querySelector('#confirm-feedback')


userField.addEventListener('keyup', (e) => {
    const userVal = e.target.value

    userField.classList.remove('is-invalid')
    userFeedback.style.display = 'none'

    if (userVal.length > 0) {
        fetch('/authentication/validate-username', {
            body: JSON.stringify({
                'username': userVal
            }),
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.username_error) {
                userField.classList.add('is-invalid')
                userFeedback.style.display = 'block'
                userFeedback.innerHTML = `<p>${data.username_error}</p>`
            }
        })
    }
})

emailField.addEventListener('keyup', (e) => {
    const emailVal = e.target.value

    emailField.classList.remove('is-invalid')
    emailFeedback.style.display = 'none'

    if (emailVal.length > 0) {
        fetch('/authentication/validate-email', {
            body: JSON.stringify({
                'email': emailVal
            }),
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.email_error) {
                emailField.classList.add('is-invalid')
                emailFeedback.style.display = 'block'
                emailFeedback.innerHTML = `<p>${data.email_error}</p>`
            }
        })
    }
})

passField.addEventListener('keyup', (e) => {
    const passVal = e.target.value

    passField.classList.remove('is-invalid')
    passFeedback.style.display = 'none'

    confirmField.classList.remove('is-invalid')
    confirmFeedback.style.display = 'none'

    if (passVal.length > 0) {
        fetch('/authentication/validate-password', {
            body: JSON.stringify({
                'password': passVal
            }),
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.password_error) {
                passField.classList.add('is-invalid')
                passFeedback.style.display = 'block'
                passFeedback.innerHTML = `<p>${data.password_error}</p>`
            }
        })

        //do both validate pass + confirm here: if pass change, then validate should check again
        fetchConfirmValidation(confirmField.value, passVal)
    }
})

confirmField.addEventListener('keyup', (e) => {
    const confirmVal = e.target.value

    confirmField.classList.remove('is-invalid')
    confirmFeedback.style.display = 'none'

    fetchConfirmValidation(confirmVal, passField.value)
})

const fetchConfirmValidation = (confirmVal, passVal) => {
    if (confirmVal.length > 0) {
        fetch('/authentication/validate-confirm', {
            body: JSON.stringify({
                'password': passVal,
                'confirm': confirmVal
            }),
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.confirm_error) {
                confirmField.classList.add('is-invalid')
                confirmFeedback.style.display = 'block'
                confirmFeedback.innerHTML = `<p>${data.confirm_error}</p>`
            }
            else if (data.confirm_valid) {
                confirmField.classList.remove('is-invalid')
                confirmFeedback.style.display = 'none'
            }
        })
    }
}