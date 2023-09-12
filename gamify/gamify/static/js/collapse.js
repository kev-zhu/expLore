const collapseSearchBtn = document.querySelector('.search-collapse')

let mapboxSearch
let clientWidth
let smallMode

//funct that deals with min sizing collapsable btns

//2 event listenrs - one on load -- get teh size of current client width
//antoher on resize -- get the new client width and see if its < 700px -- if it is the run the stuff

const collapseSearch = () => {
    if (mapboxSearch == null) {
        mapboxSearch = document.querySelector('.mapboxgl-ctrl-top-left')
    }

    mapboxSearch.style.display = 'none'
    collapseSearchBtn.style.display = 'block'
}

const expandSearch = () => {
    if (mapboxSearch == null) {
        mapboxSearch = document.querySelector('.mapboxgl-ctrl-top-left')
    }

    mapboxSearch.style.display = 'block'
    collapseSearchBtn.style.display = 'none'
}


collapseSearchBtn.addEventListener('click', () => {
    if (!collapsable.classList.contains('collapsed')) {
        collapsable.click()
        console.log(mapboxSearch.style.display)
        expandSearch()
    } else {
        if (mapboxSearch.style.display === 'none' || mapboxSearch.style.display === '') {
            expandSearch()
        }
    }
})

collapsable.addEventListener('click', () => {
    if (smallMode && !collapsable.classList.contains('collapsed')) {
        collapseSearch()
    }
})


const handleCollapsables = () => {
    clientWidth = document.documentElement.clientWidth

    if (clientWidth <= 700) {
        smallMode = true
        if (collapsable.classList.contains('collapsed')) {
            expandSearch()
        } else {
            collapseSearch()
        }
    } else {
        smallMode = false
        expandSearch()
    }
}

window.addEventListener('load', () => {
    handleCollapsables()
})

window.addEventListener('resize', () => {
    handleCollapsables()
})