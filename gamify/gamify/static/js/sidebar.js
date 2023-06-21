const sideBar = document.querySelector('.sidebar')
const sideBarBtn = document.querySelector('.sidebar-btn')
const xSideBar = document.querySelector('.xSidebar')
const sideContent = document.querySelector('.sidebar-content')
const sideBarAreas = document.querySelectorAll('.savedArea')

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
    markerSide.querySelector('#marker-image').src = business.img_url
    markerSide.querySelector('#marker-name').innerHTML = business.name
    markerSide.querySelector('#marker-address').innerHTML = business.address
    markerSide.querySelector('#marker-phone').innerHTML = business.phone
    markerSide.querySelector('#marker-rating').innerHTML = `${business.rating} Stars`
    markerSide.querySelector('#marker-review').innerHTML = `${business.reviewCount} Reviews`
    markerSide.querySelector('#marker-yelp').href = business.yelpLink

}


sideBarAreas.forEach(area => {
    area.addEventListener('click', () => {        
        let goToLocation = savedAreas[area.dataset.zip]

        map.flyTo({
            center: goToLocation.location,
            zoom: 12,
            essential: true
        })
        spinEnabled = false

        exploringZip = area.dataset.zip
        exploringLoc = goToLocation.location
        exploringMarkers = goToLocation.markers

        setViewingLoc(goToLocation.refName)
    })
})