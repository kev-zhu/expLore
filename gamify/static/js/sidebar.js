const sideBar = document.querySelector('.sidebar')
const sideBarBtn = document.querySelector('.sidebar-btn')
const xSideBar = document.querySelector('.xSidebar')
const sideContent = document.querySelector('.sidebar-content')
const sideSavedAreas = document.querySelector('.savedAreas')
const sideSavedSpots = document.querySelector('.savedSpots')
const sideExploredSpots = document.querySelector('.exploredSpots')

const saveSpot = document.querySelector('.save-spot')
const spotStar = document.querySelector('#spotStar')
const visitSpot = document.querySelector('.visit-Spot')
const visitSymbol = document.querySelector('.spotVisit')

let suggestions, sideViewBusiness
let sidePrevOpen = false
let spotSaved = false
let visited = false


const sideOpen = () => {
    if (directionEnabled) {
        sideBar.classList.add('diractive')
    } else {
        sideBar.classList.add('active')
    }
    sideBarBtn.classList.add('active')
}

const sideClose = () => {
    if (directionEnabled) {
        sideBar.classList.remove('diractive')
    } else {
        sideBar.classList.remove('active')
    }
    sideBarBtn.classList.remove('active')
}

xSideBar.addEventListener('click', () => {
    if (sideContent.classList.contains('active')) {
        sideContent.classList.remove('active')
        if (!sidePrevOpen) {
            sideClose()
        }
    } else {
        sideClose()
        sidePrevOpen = false
    }
})

sideBarBtn.addEventListener("click", () => {
    if (sideBar.classList.contains('active') || sideBar.classList.contains('diractive')) {
        sideClose()
        sidePrevOpen = false
    } else {
        sideOpen()
        sidePrevOpen = true
    }
})

const addMarkerToSide = async (business) => {
    sideOpen()
    sideContent.classList.add('active')
    sideViewBusiness = business
    //selectedMarker -- marker will either be at exploring, saved area or saved spot

    await fetch(`get-savedSpot/${business.id}`)
    .then(res => res.json())
    .then(data => {
        spotSaved = data.saved
        if (data.saved) {
            spotStar.innerHTML = '&#9733'
        } else {
            spotStar.innerHTML = '&#9734'
        }
    })

    await fetch(`get-business-visit/${business.id}`)
    .then(res => res.json())
    .then(data => {
        visited = data.visited
        if (data.visited) {
            visitSymbol.innerHTML = '&#9989'
        } else {
            visitSymbol.innerHTML = '&#10060'
        }
    })

    const markerSide = document.querySelector('.sidebar-marker')
    //do something here to scale and center image before rendering on sidemarker
    markerSide.querySelector('#marker-image').src = business.img_url
    markerSide.querySelector('#marker-name').innerHTML = business.name
    markerSide.querySelector('#marker-source').innerHTML = business.sourced_by
    markerSide.querySelector('#marker-address').innerHTML = business.address
    markerSide.querySelector('#marker-phone').innerHTML = business.phone
    markerSide.querySelector('#marker-rating').innerHTML = `${business.rating} Stars`
    markerSide.querySelector('#marker-review').innerHTML = `${business.reviewCount} Reviews`
    markerSide.querySelector('#marker-yelp').href = business.yelpLink
}


const loadSavedSide = (areas, spots) => {
    suggestions = document.querySelector('.suggestions-wrapper')
    document.querySelector('.areaCount').innerHTML = `${areas.length}`
    document.querySelector('.spotCount').innerHTML = `${spots.length}`
    document.querySelector('.exploreCount').innerHTML = `${Object.keys(visitedSpots).length}`

    //clear all saved first
    while (sideSavedAreas.firstChild) {
        sideSavedAreas.removeChild(sideSavedAreas.firstChild)
    }

    while (sideSavedSpots.firstChild) {
        sideSavedSpots.removeChild(sideSavedSpots.firstChild)
    }

    while (sideExploredSpots.firstChild) {
        sideExploredSpots.removeChild(sideExploredSpots.firstChild)
    }

    //then load saved from call -- get most up to date of user's all saved
    areas.forEach(area => {
        const sidebarArea = document.createElement('div')
        sidebarArea.className = 'savedArea'
        sidebarArea.setAttribute('data-zip', area.areaCode)
        sidebarArea.innerHTML = area.displayName
        sideSavedAreas.append(sidebarArea)

        //even though savedAreas not accessible on "load" instantaneously, this is an eventlistener for later use
        sidebarArea.addEventListener('click', () => {
            clearExploringMarkers()
            let goToLocation = savedAreas[area.areaCode]

            geocoder.setFlyTo(true)
            geocoder.query(goToLocation.refName)

            suggestions.classList.add('hide')

            spinEnabled = false
            exploringZip = area.areaCode
            exploringLoc = goToLocation.location
            exploringMarkers = goToLocation.markers
    
            setViewingLoc(goToLocation.refName)
        })
    })

    spots.forEach(spot => {
        const sidebarSpot = document.createElement('div')
        sidebarSpot.className = 'savedSpot'
        sidebarSpot.innerHTML = spot.displayName
        sideSavedSpots.append(sidebarSpot)

        if (visitedSpots.hasOwnProperty(spot.business.id)) {
            savedSpots[spot.business.id] = visitedSpots[spot.business.id]
        } else {
            savedSpots[spot.business.id] = {
                "type": spot.business.type,
                "marker": makeMarker(spot.business, false),
                "business": spot.business
            }
        }

        sidebarSpot.addEventListener('click', () => {
            addMarkerToSide(spot.business)
            selectedMarker = savedSpots[spot.business.id]['marker']
            
            geocoder.setFlyTo(false)
            geocoder.query(spot.areaOrigin)

            map.flyTo({
                center: [spot.lng, spot.lat],
                zoom: 14,
                essential: true
            })
            suggestions.classList.add('hide')
            spinEnabled = false
        })
    })

    //sort visited business first because was in unorganized obj/dict format
    const visitedBusinesses = []
    Object.values(visitedSpots).forEach(spot => {
        visitedBusinesses.push(spot.business)
    })
    visitedBusinesses.sort((x, y) => x.name > y.name ? 1 : x.name < y.name ? -1 : 0)

    visitedBusinesses.forEach(visitedBusiness => {
        const vSpot = document.createElement('div')
        vSpot.className = 'exploredSpot'
        vSpot.innerHTML = visitedBusiness.name
        sideExploredSpots.append(vSpot)

        vSpot.addEventListener('click', () => {
            addMarkerToSide(visitedBusiness)
            selectedMarker = visitedSpots[visitedBusiness.id]['marker']

            geocoder.setFlyTo(false)
            geocoder.query(visitedBusiness.area)

            map.flyTo({
                center: [visitedBusiness.lng, visitedBusiness.lat],
                zoom: 14,
                essential: true
            })
            suggestions.classList.add('hide')
            spinEnabled = false
        })
    })
}

saveSpot.addEventListener('click', () => {
    if (spotSaved) {
        //unsave Spot
        fetch('del-spot', {
            body: JSON.stringify({
                address: sideViewBusiness.address
            }),
            method: 'POST'
        })
        .then(() => {
            spotStar.innerHTML = '&#9734'
            spotSaved = false
            delete savedSpots[sideViewBusiness.id]
            removeSpots[sideViewBusiness.id] = {
                "marker": selectedMarker,
                "type": sideViewBusiness.type,
                "zipSearch": sideViewBusiness.zipSearch
            }
            getSaved()
        })
    } else {
        //save Spot
        fetch('save-spot', {
            body: JSON.stringify({
                display: sideViewBusiness.name,
                lat: sideViewBusiness.lat,
                lng: sideViewBusiness.lng,
                address: sideViewBusiness.address,
            }),
            method: 'POST'
        })
        .then(() => {
            spotStar.innerHTML = '&#9733'
            spotSaved = true
            savedSpots[sideViewBusiness.id] = selectedMarker
            if (removeSpots.hasOwnProperty(sideViewBusiness.id)) {
                delete removeSpots[sideViewBusiness.id]
            }
            getSaved()
        })
    }
})


visitSpot.addEventListener('click', () => {
    if (visited) {
        visited = false
        visitSymbol.innerHTML = '&#10060'
        //delete visit
        fetch('del-visit', {
            body: JSON.stringify({
                id: sideViewBusiness.id
            }),
            method: 'POST'
        })
        .then(() => {
            visitFalse()
            getSaved()
        })
    } else {
        visited = true
        visitSymbol.innerHTML = '&#9989'
        //save visit
        fetch('save-visit', {
            body: JSON.stringify({
                id: sideViewBusiness.id
            }),
            method: 'POST'
        })
        .then(() => {
            visitTrue()
            getSaved()
        })
    }
}) 


const visitTrue = () => {
    //markerVisual
    markerElement = selectedMarker.getElement()
    markerElement.style.background = `url(${sideViewBusiness.img_url})`
    markerElement.style.backgroundSize = 'cover'
    visitedSpots[sideViewBusiness.id] = {
        "type": sideViewBusiness.type,
        "marker": selectedMarker,
        "business": sideViewBusiness
    }
    if (removeVisits.hasOwnProperty(sideViewBusiness.id)) {
        delete removeVisits[sideViewBusiness.id]
    }
}


const visitFalse = () => {
    markerElement = selectedMarker.getElement()
    markerElement.style.background = unvisitedMarkerStr + `url(${sideViewBusiness.img_url})`
    markerElement.style.backgroundSize = 'cover'

    removeVisits[sideViewBusiness.id] = {
        "marker": selectedMarker,
        "type": sideViewBusiness.type,
        "zipSearch": sideViewBusiness.zipSearch
    }

    delete visitedSpots[sideViewBusiness.id]
}