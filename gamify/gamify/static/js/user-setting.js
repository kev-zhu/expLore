const settingButton = document.querySelector('#setting-button')
const settings = document.querySelector('#user-settings')


const changeSettingButtonState = () => {
    if (settings.hasAttribute('hidden')) {
        settings.removeAttribute('hidden')
    } else {
        settings.setAttribute('hidden', '')
    }
}

window.addEventListener('click', (e) => {
    if (e.target === settingButton) {
        changeSettingButtonState()
    } else if (e.target !== settingButton && e.target != settings) {
        settings.setAttribute('hidden', '')
    }
})

window.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
        settings.setAttribute('hidden', '')
    }
})