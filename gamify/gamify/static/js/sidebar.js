const sideBar = document.querySelector('#sidebar')
const xSideBar = document.querySelector('#xSidebar')
const collapseSideBarBtn = document.querySelector('#sidebar-btn')
const defaultSidebarMenu = document.querySelector('.sidebar-contents').innerHTML
const sideBarAreas = document.querySelectorAll('.savedArea')

let sideCollapsed = true
let viewingMarker = false
let prevOpen = false

const openSideBar = () => {
    sideBar.style.display = 'block'
    collapseSideBarBtn.style.left = '250px'
    collapseSideBarBtn.innerHTML = '&lt;'
    sideCollapsed = false
}

const closeSideBar = () => {
    sideBar.style.display = 'none'
    collapseSideBarBtn.style.left = '0px'
    collapseSideBarBtn.innerHTML = '&gt;'
    sideCollapsed = true
}

collapseSideBarBtn.addEventListener('click', () => {
    if (sideCollapsed) {
        openSideBar()
        prevOpen = true
    } else {
        closeSideBar()
        prevOpen = false
    }
})

xSideBar.addEventListener('click', () => {
    closeSideBar() 
    
    if (viewingMarker) {
        document.querySelector('.sidebar-contents').innerHTML = defaultSidebarMenu
        if (prevOpen) {
            openSideBar()
        }
        viewingMarker = false
    }
    prevOpen = false
})


const addMarkerToSide = (business) => {
    viewingMarker = true
    let updatedSideBar = document.querySelector('.sidebar-contents')

    updatedSideBar.innerHTML = business.name
    openSideBar()


    console.log(business)
}

sideBarAreas.forEach(area => {
    area.addEventListener('click', () => {        
        let goToLocation = savedAreas[area.dataset.zip]

        map.flyTo({
            center: goToLocation.location,
            zoom: 13,
            essential: true
        })
        spinEnabled = false

        console.log(goToLocation)
        exploringZip = area.dataset.zip
        exploringLoc = goToLocation.location
        exploringMarkers = goToLocation.markers

        setViewingLoc(goToLocation.refName)
    })
})