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
        geocoderControl.style.display = 'block'
        directionEnabled = false

        document.querySelectorAll('.mapboxgl-ctrl-geocoder').forEach(inputBlock => {
            inputBlock.querySelector('input').value = ''
        })
        direction.actions.clearOrigin()
        direction.actions.clearDestination()
    } catch {
        console.log('Direction control has already been removed.')
    }
    
    xDirection.style.display = 'none'
    directionControl.style.display = 'none'
}

xDirection.addEventListener('click', () => {
    closeDirection()
})

const directionSearch = (destination) => {
    closeSearch()
    sideClose()

    if (!directionEnabled) {
        directionEnabled = true
        directionControl.style.display = 'block'
    }

    direction.setDestination(destination)

    //revert this back when direction is closed
    sideBar.style.top = '140px'
    sideBar.style.height = 'calc(100% - 140px - 10px)'
    xDirection.style.display = 'block'
}

directionButton.addEventListener('click', () => {
    directionSearch(sideViewBusiness.address)
})