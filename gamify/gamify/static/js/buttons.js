const collapsable = document.querySelector('#hide-btn')
const viewingLoc = document.querySelector('#viewingLocation')
const favLoc = document.querySelector('#location')
const star = document.querySelector('#star')
const saveLoc = document.querySelector('#saveLocation')

const modalRef = document.querySelector('#referName')
const modalDisplay = document.querySelector('#displayName')

//this should be a fetch call to see if currently@ is favorited or not
//onto the location's model of DB -- also need name of place
let favorited = false
//change this to displayname + refered name
let referName = null
let displayName = null

//enable/disable modal popup
const toggleModal = () => {
    if (favorited) {
        favLoc.removeAttribute('data-bs-toggle')
    } else {
        favLoc.setAttribute('data-bs-toggle', 'modal')
    }
}

//on load/search render area as saved or not
const setViewingLoc = async (newLoc) => {
    favorited = false
    referName = newLoc
    displayName = null
    
    await fetch(`get-savedArea/${referName}`)
        .then(res => res.json())
        .then(data => {
            displayName = data.displayName || referName

            if (data.displayName === '') {
                favorited = false
                star.innerHTML = '&#9734'
            } else {
                favorited = true
                star.innerHTML = '&#9733'
            }
        })

    favLoc.parentElement.hidden = false
    viewingLoc.innerHTML = displayName || referName
    toggleModal()
}

//toggle favorite/unfavorite area
favLoc.addEventListener('click', () => {
    if (favorited) {
        star.innerHTML = '&#9734'
        favorited = false
        toggleModal()
        //delete area from DB
        delArea()
    } else {
        modalRef.value = referName
        modalDisplay.placeholder = displayName || referName
    }
})


//save area from modal onto DB
saveLoc.addEventListener('click', () => {
    //fetch call to DB
    fetch('/save-area', {
        body: JSON.stringify({
            refName: referName,
            display: modalDisplay.value
        }),
        method: 'POST'
    })
    favorited = true
    star.innerHTML = '&#9733'
    //toggle modal only after it has been saved
    toggleModal()
})

//delete area from DB
const delArea = () => {
    fetch('/del-area', {
        body: JSON.stringify({
            refName: referName
        }),
        method: 'POST'
    })
}

//collapsable toggle
collapsable.onclick = () => {
    const collapseVal = collapsable.innerHTML.trim()
    if (collapseVal === "&lt;") {
        collapsable.innerHTML = "&gt;"
    } else {
        collapsable.innerHTML = "&lt;"
    }
}