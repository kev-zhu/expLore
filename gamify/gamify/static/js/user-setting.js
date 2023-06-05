const settingButton = document.querySelector('#setting-button')
const settings = document.querySelector('#user-settings')

settingButton.addEventListener('click', () => {
    if (settings.hasAttribute('hidden')) {
        settings.removeAttribute('hidden')
    } else {
        settings.setAttribute('hidden', '')
    }
})