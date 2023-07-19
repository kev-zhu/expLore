const sidebarDir = document.querySelector('.sidebar-direction')
const directionButton = document.querySelector('#marker-direction')
const xDirection = document.querySelector('.close-direction')

const direction = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    interactive: false,
    controls: {
        instructions: false
    }
})
map.addControl(direction, 'top-left')

const directionControl = document.querySelector('.directions-control')
const geocoderControl = document.querySelector('.mapboxgl-ctrl-geocoder ')

let directionEnabled = false

closeSearch = () => {
    try {
        // map.removeControl(geocoder)
        geocoderControl.style.display = 'none'
    } catch {
        console.log('Search control has already been removed.')
    }
}

closeDirection = () => {
    sideClose()
    sideBar.style.top = '60px'
    sideBar.style.height = 'calc(100% - 60px - 10px)'

    try {
        // map.addControl(geocoder, 'top-left')
        geocoderControl.style.display = 'block'
        directionEnabled = false
    } catch {
        console.log('Direction control has already been removed.')
    }
    
    xDirection.style.display = 'none'
    directionControl.style.display = 'none'
}

xDirection.addEventListener('click', () => {
    closeDirection()
})

directionButton.addEventListener('click', () => {
    closeSearch()
    sideClose()

    if (!directionEnabled) {
        directionEnabled = true
        directionControl.style.display = 'block'
    }

    console.log(sideViewBusiness.address)
    direction.setDestination(sideViewBusiness.address)

    //revert this back when direction is closed
    sideBar.style.top = '140px'
    sideBar.style.height = 'calc(100% - 140px - 10px)'
    xDirection.style.display = 'block'
})