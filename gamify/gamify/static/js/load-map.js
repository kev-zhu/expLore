//change so accessToken is hidden from client-end?
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

const unvisitedMarkerStr = 'linear-gradient(rgba(255,255,255,.7), rgba(255,255,255,.7)), '
const markerStartDiameter = 40
let currMarkerDiameter = markerStartDiameter
let currentLoc, exploringZip, exploringLoc, hoveringMarker, selectedMarker
let spinEnabled = true
let savedAreas = {}
let savedSpots = {}
let visitedSpots = {}
let exploringMarkers = {}
let activeFilters = []
let removeSpots = {}
let removeVisits = {}

//separate function? --> let map = null + function to call at the beginning renderStartMap()?
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 2,
})

//eventlistener for enlarging marker size when map zoomed
map.on('zoom', () => {
    let adjustedIconZoom = 1 + (map.getZoom() - 13) / 2.5

    if (adjustedIconZoom < 1) {
        adjustedIconZoom = 1
    }

    map._markers.forEach(marker => {
        const markerElement = marker.getElement()
        if (marker._popup) {
            marker._popup.remove()
        }
        markerElement.style.zIndex = ''
        currMarkerDiameter = markerStartDiameter * adjustedIconZoom
        markerElement.style.width = `${currMarkerDiameter}px`
        markerElement.style.height = `${currMarkerDiameter}px`
    })
})


//when out of focus of window, revert marker back to original size
window.addEventListener('blur', () => {
    if (hoveringMarker != null) { 
        const markerElement = hoveringMarker.getElement()
        markerElement.style.width = markerElement.style.height = `${currMarkerDiameter}px`
        markerElement.style.zIndex = ''
        hoveringMarker._popup.remove()
        hoveringMarker = null
    }
})


//search for place
const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
    })

map.addControl(geocoder, 'top-left')

const searchInput = document.querySelector('.mapboxgl-ctrl-geocoder--input')
const searchEvents = ['click', 'keypress']

searchEvents.forEach(event => {
    searchInput.addEventListener(event, () => {
        suggestions.classList.remove('hide')
        geocoder.setFlyTo(true)
    })
})

geocoder.on('result', (res) => {
    //enable spin only important for first instance if no geolocation found -- else this does nothing really
    spinEnabled = false
    exploringLoc = res.result.geometry.coordinates
    clearExploringMarkers()
    reverseGeoSearch(res.result.geometry.coordinates)
})

//use lng,lat to retrieve data from server of that area
const makeMarkerArea = async (ln, lt, rName, zip) => {
    //change type= to read off window/selected buttons -- activity + food
    const currentMarkers = {}
    await fetch(`/get-poi?lng=${ln}&lat=${lt}&area=${rName}&zip=${zip || exploringZip}&type=food+activity+bar`)
        .then(res => res.json())
        .then((data) => {
            data.businesses.forEach(business => {
                let marker = {}
                if (!(business.type in currentMarkers)) {
                    currentMarkers[business.type] = []
                }
                
                if (visitedSpots.hasOwnProperty(business.id)) {
                    marker[business.id] = visitedSpots[business.id]['marker']
                } else if (savedSpots.hasOwnProperty(business.id)) {
                    marker[business.id] = savedSpots[business.id]['marker']
                } else {
                    marker[business.id] = makeMarker(business, false)
                }
                currentMarkers[business.type].push(marker)
            })
        }
    )
    return currentMarkers
}

const makeMarker = (business, explored) => {
    let color = null
    if (business.type === 'food') {
        color = 'green'
    } else if (business.type === 'bar') {
        color = 'red'
    } else if (business.type === 'activity') {
        color = 'blue'
    }

    const el = document.createElement('div')
    el.className = 'marker'
    el.style.background = `url(${business.img_url})`
    if (!explored) {
        el.style.background = unvisitedMarkerStr + el.style.background
    }
    el.style.backgroundSize = 'cover'
    el.style.backgroundRepeat = 'no-repeat'
    el.style.width = `${markerStartDiameter}px`
    el.style.height = `${markerStartDiameter}px`
    el.style.border = `2px solid ${color}`

    const marker = new mapboxgl.Marker(el)
        .setLngLat([business.lng, business.lat])

    manageMarkerEvents(marker, business)
    return marker
}

//problem with moving mouse btw markers too fast -- something gets "stuck"
const manageMarkerEvents = (marker, business) => {
    const markerElement = marker.getElement()
    let prevMarkerSize, markerPos, popUp

    markerElement.addEventListener('mouseover', () => {
        hoveringMarker = marker
        prevMarkerSize = Number(markerElement.style.width.substring(0, markerElement.style.width.length - 2))    
        markerPos = markerElement.getBoundingClientRect()

        //zoomin pic
        markerElement.style.width = markerElement.style.height = '200px'
        markerElement.style.zIndex = '1'

        //load a popup on the side with some info too
        //function to consturct popup?

        popUp = new mapboxgl.Popup({
            anchor: 'left',
            offset: 105,
            closeButton: false,
            closeOnClick: false,    
        })
        .setHTML(`${business.name}<br>${business.address}<br>Rating: ${business.rating}<br>Reviews: ${business.reviewCount}`)

        marker.setPopup(popUp)
        marker.togglePopup()
    })

    markerElement.addEventListener('mousemove', (e) => {
        if (e.clientX < markerPos.x - 5 || e.clientX > markerPos.x + prevMarkerSize + 5 || e.clientY < markerPos.y - 5 || e.clientY > markerPos.y + prevMarkerSize + 5) {
            markerElement.style.width = markerElement.style.height = `${prevMarkerSize}px`
            markerElement.style.zIndex = ''
            hoveringMarker = null
            popUp.remove()
        }
    })

    markerElement.addEventListener('click', () => {
        addMarkerToSide(business)
        selectedMarker = marker
    })
}

const clearExploringMarkers = () => {
    //clear unsaved Area
    if (!savedAreas.hasOwnProperty(exploringZip)) {
        Object.values(exploringMarkers).flat(1).forEach(marker => {
            markerKey = Object.keys(marker)[0]
            markerValue = Object.values(marker)[0]

            if (!visitedSpots.hasOwnProperty(markerKey)) {
                markerValue.remove()
            }
        })
    }

    //clear unsaved Spots
    Object.keys(removeSpots).forEach(spotId => {
        const inVisits = visitedSpots.hasOwnProperty(spotId)
        const inSavedAreas = checkInSavedArea(spotId, removeSpots[spotId]['type'], removeSpots[spotId]['zipSearch'])

        if (!(inVisits || inSavedAreas)) {
            removeSpots[spotId]['marker'].remove()
            delete removeSpots[spotId]
        }
    })

    //clear unvisited Spots
    Object.keys(removeVisits).forEach(spotId => {
        const inSavedSpots = savedSpots.hasOwnProperty(spotId)
        const inSavedAreas = checkInSavedArea(spotId, removeVisits[spotId].type, removeVisits[spotId].zipSearch)

        if (!(inSavedSpots || inSavedAreas)) {
            removeVisits[spotId]['marker'].remove()
            delete removeVisits[spotId]
        }
    })
}

const checkInSavedArea = (id, type, zipSearch) => {
    try {
        const selectedMarkers = savedAreas[zipSearch]['markers'][type]
        return selectedMarkers.reduce((status, currMarker) => status || Object.keys(currMarker)[0] === String(id), false)
    } catch {
        return false
    }
}

//fetch data on load -- put this into a function later for search changes
const reverseGeoSearch = async ([lng, lat]) => {
    await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(async (data) => {
            const place = data.features.reduce((prevFeature, feature) => feature.place_type[0] === 'place' ? feature : null || prevFeature, null)       

            if (place !== null) {
                const area = place.place_name
                exploringZip = data.features.reduce((prevFeature, feature) => feature.place_type[0] === 'postcode' ? feature : null || prevFeature, null).text
                
                setViewingLoc(area)

                //prevention of rerendering pins alraedy loaded from saved list
                const alreadyOnSavedList = Object.keys(savedAreas).reduce((exists, checkArea) => exists || exploringZip === checkArea, false)
                if (alreadyOnSavedList) {
                    exploringMarkers = savedAreas[exploringZip].markers
                } else {    
                    exploringMarkers = await makeMarkerArea(lng, lat, area, exploringZip)
                    activeFilters.forEach(filter => {
                        toggleFilterButtons(filter, true)
                    })
                }
            }
        })
}


//get curr location if geolocation turned on
const getGeoLoc = async () => {
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        currentLoc = [pos.coords.longitude, pos.coords.latitude]

        await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${pos.coords.longitude},${pos.coords.latitude}.json?access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(async (data) => {
            const address = data.features.reduce((prevFeature, feature) => feature.place_type[0] === 'address' ? feature : null || prevFeature, null)
            geocoder.query(address.place_name)
            suggestions.classList.add('hide')            
        })
        spinEnabled = false
        
        //call stuff to add pinned locations
        exploringLoc = currentLoc
        reverseGeoSearch(currentLoc)
    } catch {
        console.log('Your geolocation is currently off.')
    }
}

const startMapApp = () => {
    const secondsPerRevolution = 120

    const spinGlobe = () => {
        const distancePerSecond = 360 / secondsPerRevolution
        if (spinEnabled) {
            const center = map.getCenter()
            center.lng -= distancePerSecond
            map.easeTo({ center, duration: 1000, easing: (n) => n })
        }
    }

    //start spin and continue spin
    spinGlobe()
    map.on('moveend', () => {
        if (spinEnabled) {
            spinGlobe()
        }
    })

    //event listeners to stop spin on any user interactions
    const disableSpinEvents = ['wheel', 'mousedown']

    disableSpinEvents.forEach(event => {
        map.on(event, () => {
            spinEnabled = false
        })
    })
}


const getVisited = async () => {
    await fetch('get-all-visit')
    .then(res => res.json())
    .then(data => {
        const visitedBusinesses = data.businesses
        //business ID, marker OBJ
        for (const business of visitedBusinesses) {
            visitedSpots[business.id] = {
                "type": business.type,
                "marker": makeMarker(business, true),
                "business": business
            } 
        }
    })
}


const getSaved = async () => {
    await fetch('/get-all-saved')
        .then(res => res.json())
        .then(async data => {
            const areas = data.areas
            const spots = data.spots

            loadSavedSide(areas, spots)

            for (const area of areas) {
                const currentMarkers = await makeMarkerArea(area.lng, area.lat, area.referredName, area.areaCode)
                savedAreas[area.areaCode] = {
                    "refName": area.referredName,
                    "displayName": area.displayName,
                    "markers": currentMarkers,
                    "location": [area.lng, area.lat]
                }
            }            
        })
}


//start map --> load saved locations --> getgeoloc
const run = async () => {
    startMapApp()
    await getVisited()
    await getSaved()
    await getGeoLoc()
    setDefaultFilters()
}

run()