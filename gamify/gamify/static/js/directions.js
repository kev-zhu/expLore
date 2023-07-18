const sidebarDir = document.querySelector('.sidebar-direction')
const directionButton = document.querySelector('#marker-direction')

const direction = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    interactive: false,
    controls: {
        instructions: false
    }
})

let directionEnabled = false

closeSearch = () => {
    try {
        map.removeControl(geocoder)
    } catch {
        console.log('Search control has already been removed.')
    }
}

closeDirection = () => {
    sideClose()
    sideBar.style.top = '60px'
    sideBar.style.height = 'calc(100% - 60px - 10px)'

    try {
        map.removeControl(direction)
        map.addControl(geocoder, 'top-left')
        directionEnabled = false
    } catch {
        console.log('Direction control has already been removed.')
    }
    
}

directionButton.addEventListener('click', () => {
    closeSearch()
    sideClose()

    if (!directionEnabled) {
        directionEnabled = true
        map.addControl(direction, 'top-left')
    }

    console.log(sideViewBusiness.address)
    direction.setDestination(sideViewBusiness.address)

    //revert this back when direction is closed
    sideBar.style.top = '140px'
    sideBar.style.height = 'calc(100% - 140px - 10px)'
})



//close direction button
//fix problem wiht reopening directions -- destination cannot be set for some reason