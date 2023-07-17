let passwordField = null
let showPasswordToggle = null

const passGroups = document.querySelectorAll('.showPasswordToggle')


const handleToggleInput = () => {
    if (showPasswordToggle.innerHTML === 'SHOW') {
        showPasswordToggle.innerHTML = 'HIDE' 
        passwordField.setAttribute('type', 'text')
    } else {
        showPasswordToggle.innerHTML = 'SHOW'
        passwordField.setAttribute('type', 'password')
    }
}

passGroups.forEach(toggle => {
    toggle.addEventListener('click', () => {
        passwordField = toggle.parentElement.querySelector('.passClass')
        showPasswordToggle = toggle.parentElement.querySelector('.showPasswordToggle')

        handleToggleInput()
    })
})