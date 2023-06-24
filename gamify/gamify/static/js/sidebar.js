const sideBar = document.querySelector('.sidebar')
const sideBarBtn = document.querySelector('.sidebar-btn')
const xSideBar = document.querySelector('.xSidebar')
const sideContent = document.querySelector('.sidebar-content')
const sideSavedAreas = document.querySelector('.savedAreas')
const sideSavedSpots = document.querySelector('.savedSpots')

const spotStar = document.querySelector('#spotStar')
const saveSpot = document.querySelector('.save-spot')

let suggestions, sideViewBusiness
let sidePrevOpen = false
let spotSaved = false


const sideOpen = () => {
    sideBar.classList.add('active')
    sideBarBtn.classList.add('active')
}

const sideClose = () => {
    sideBar.classList.remove('active')
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
    if (sideBar.classList.contains('active')) {
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

    await fetch(`get-savedSpot/${business.address}`)
    .then(res => res.json())
    .then(data => {
        spotSaved = data.saved
        if (data.saved) {
            spotStar.innerHTML = '&#9733'
        } else {
            spotStar.innerHTML = '&#9734'
        }
    })

    const markerSide = document.querySelector('.sidebar-marker')
    //do something here to scale and center image before rendering on sidemarker
    markerSide.querySelector('#marker-image').src = business.img_url
    markerSide.querySelector('#marker-name').innerHTML = business.name
    markerSide.querySelector('#marker-address').innerHTML = business.address
    markerSide.querySelector('#marker-phone').innerHTML = business.phone
    markerSide.querySelector('#marker-rating').innerHTML = `${business.rating} Stars`
    markerSide.querySelector('#marker-review').innerHTML = `${business.reviewCount} Reviews`
    markerSide.querySelector('#marker-yelp').href = business.yelpLink
}

const loadSavedSide = (areas, spots) => {
    suggestions = document.querySelector('.suggestions-wrapper')
    //clear all saved first
    while (sideSavedAreas.firstChild) {
        sideSavedAreas.removeChild(sideSavedAreas.firstChild)
    }

    while (sideSavedSpots.firstChild) {
        sideSavedSpots.removeChild(sideSavedSpots.firstChild)
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

        sidebarSpot.addEventListener('click', () => {
            addMarkerToSide(spot.business)

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
            getSaved()
        })
    }
})