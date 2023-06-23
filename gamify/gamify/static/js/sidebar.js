let suggestions

const sideBar = document.querySelector('.sidebar')
const sideBarBtn = document.querySelector('.sidebar-btn')
const xSideBar = document.querySelector('.xSidebar')
const sideContent = document.querySelector('.sidebar-content')
const sideSaved = document.querySelector('.savedAreas')
let sidePrevOpen = false


const sideOpen = () => {
    sideBar.classList.add('active')
    sideBarBtn.innerHTML = '&lt;'
    sideBarBtn.classList.add('active')
}

const sideClose = () => {
    sideBar.classList.remove('active')
    sideBarBtn.innerHTML = '&gt;'
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

const addMarkerToSide = (business) => {
    sideOpen()
    sideContent.classList.add('active')

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
    while (sideSaved.firstChild) {
        sideSaved.removeChild(sideSaved.firstChild)
    }

    //then load saved from call -- get most up to date of user's all saved
    areas.forEach(area => {
        const sidebarArea = document.createElement('div')
        sidebarArea.className = 'savedArea'
        sidebarArea.setAttribute('data-zip', area.areaCode)
        sidebarArea.innerHTML = area.displayName
        sideSaved.append(sidebarArea)

        //even though savedAreas not accessible on "load" instantaneously, this is an eventlistener for later use
        sidebarArea.addEventListener('click', () => {
            clearExploringMarkers()
            let goToLocation = savedAreas[area.areaCode]

            geocoder.query(goToLocation.refName)


            suggestions.classList.add('hide')
            // map.flyTo({
            //     center: goToLocation.location,
            //     zoom: 12,
            //     essential: true
            // })

            spinEnabled = false
            exploringZip = area.areaCode
            exploringLoc = goToLocation.location
            exploringMarkers = goToLocation.markers
    
            setViewingLoc(goToLocation.refName)
        })
    })

}