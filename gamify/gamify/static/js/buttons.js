const collapsable = document.querySelector('#hide-btn')
const viewingLoc = document.querySelector('#viewingLocation')
const favLoc = document.querySelector('#location')
const star = document.querySelector('#star')
const saveLoc = document.querySelector('#saveLocation')

const modalRef = document.querySelector('#referName')
const modalDisplay = document.querySelector('#displayName')

const barButton = document.querySelector('#barButton')
const foodButton = document.querySelector('#foodButton')
const activityButton = document.querySelector('#activityButton')

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
        modalDisplay.value = null
    } else {
        favLoc.setAttribute('data-bs-toggle', 'modal')
    }
}

//on load/search render area as saved or not
const setViewingLoc = async (newLoc) => {
    favorited = false
    referName = newLoc
    displayName = null
    
    await fetch(`get-savedArea/${referName}/${exploringZip}`)
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
        viewingLoc.innerHTML = referName
        delete savedAreas[exploringZip]
    } else {
        //occupy form but not save into DB until confirmation 
        modalRef.value = referName
        modalDisplay.placeholder = referName
    }
})


//save area from modal onto DB
saveLoc.addEventListener('click', () => {
    //fetch call to DB
    const locPos = exploringLoc
    fetch('/save-area', {
        body: JSON.stringify({
            refName: referName,
            display: modalDisplay.value,
            lng: locPos[0],
            lat: locPos[1],
            zipCode: exploringZip
        }),
        method: 'POST'
    })
    .then(() => {
        getSaved()
    })
    favorited = true
    star.innerHTML = '&#9733'
    displayName = modalDisplay.value || modalRef.value
    viewingLoc.innerHTML = displayName
    savedAreas[exploringZip] = {
        "refName": referName,
        "displayName": displayName,
        "markers": exploringMarkers,
        "location": exploringLoc
    }
    //toggle modal only after it has been saved
    toggleModal()
})

//delete area from DB
const delArea = () => {
    fetch('/del-area', {
        body: JSON.stringify({
            refName: referName,
            zipCode: exploringZip
        }),
        method: 'POST'
    })
    .then(() => {
        getSaved()
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


//generic filter types -- easier to modify in the future
const filterTypes = [
    {
        'btnElement': barButton,
        'type': 'bar',
        'color': 'rgb(252, 185, 185)',
        'defaultOn': false
    },
    {
        'btnElement': foodButton,
        'type': 'food',
        'color': 'rgb(168, 224, 150)',
        'defaultOn': true
    },
    {
        'btnElement': activityButton,
        'type': 'activity',
        'color': 'rgb(130, 199, 252)',
        'defaultOn': true
    }
]

filterTypes.forEach(generic => {
    generic.btnElement.addEventListener('click', () => {
        if (generic.btnElement.style.backgroundColor === generic.color) {
            generic.btnElement.style.backgroundColor = ''
            activeFilters.splice(activeFilters.indexOf(generic.type), 1)
            toggleFilterButtons(generic.type, false)
        } else {
            generic.btnElement.style.backgroundColor = generic.color
            activeFilters.push(generic.type)
            toggleFilterButtons(generic.type, true)
        }
    })
})


const toggleFilterButtons = (type, active) => {
    //toggle saved areas
    if (active) {
        try {
            Object.values(visitedSpots).forEach(spot => {
                if (spot['type'] === type) {
                    spot['marker'].addTo(map)
                }
            })

            Object.values(savedSpots).forEach(spot => {
                if (spot['type'] === type) {
                    spot['marker'].addTo(map)
                }
            })
            
            Object.keys(savedAreas).forEach(area => {
                if (Object.hasOwn(savedAreas[area]['markers'], type)) {
                    savedAreas[area]['markers'][type].forEach(marker => {
                        markerKey = Object.keys(marker)[0]
                        markerValue = Object.values(marker)[0]
                        if (!visitedSpots.hasOwnProperty(markerKey) && !savedSpots.hasOwnProperty(markerKey)) {
                            markerValue.addTo(map)
                        }
                    })
                }
            })

            if (Object.keys(exploringMarkers).length !== 0) {
                exploringMarkers[type].forEach(marker => {
                    markerKey = Object.keys(marker)[0]
                    markerValue = Object.values(marker)[0]
                    if (!visitedSpots.hasOwnProperty(markerKey) && !savedSpots.hasOwnProperty(markerKey)) {
                        markerValue.addTo(map)
                    }
                })
            }
        } catch {
            console.log(`This location currently has no ${type} saved`)
        }
    } else {
        try {
            Object.values(visitedSpots).forEach(spot => {
                if (spot['type'] === type) {
                    spot['marker'].remove(map)
                }
            })

            Object.values(savedSpots).forEach(spot => {
                if (spot['type'] === type) {
                    spot['marker'].remove(map)
                }
            })

            Object.keys(savedAreas).forEach(area => {
                if (Object.hasOwn(savedAreas[area]['markers'], type)) {
                    savedAreas[area]['markers'][type].forEach(marker => {
                        markerKey = Object.keys(marker)[0]
                        markerValue = Object.values(marker)[0]
                        if (!visitedSpots.hasOwnProperty(markerKey) && !savedSpots.hasOwnProperty(markerKey)) {
                            markerValue.remove(map)
                        }
                    })
                }
            })
            if (Object.keys(exploringMarkers).length !== 0) {
                exploringMarkers[type].forEach(marker => {
                    markerKey = Object.keys(marker)[0]
                    markerValue = Object.values(marker)[0]
                    if (!visitedSpots.hasOwnProperty(markerKey) && !savedSpots.hasOwnProperty(markerKey)) {
                        markerValue.remove(map)
                    }
                })
            }
        } catch {
            console.log(`This location currently has no ${type} saved`)
        }
    }
}

const setDefaultFilters = () => {
    filterTypes.forEach((generic) => {
        if (generic.defaultOn) {
            generic.btnElement.style.backgroundColor = generic.color
            activeFilters.push(generic.type)
            toggleFilterButtons(generic.type, true)
        }
    })
}    

window.addEventListener('load', () => {
    collapsable.click()
})