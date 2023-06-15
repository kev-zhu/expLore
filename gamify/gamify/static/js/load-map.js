//change so accessToken is hidden from client-end?
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

const markerStartDiameter = 40
let currentLoc, exploringZip, exploringLoc
let spinEnabled = true
let savedAreas = {}
let exploringMarkers = {}
let activeFilters = []

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
        markerElement.style.width = `${markerStartDiameter * adjustedIconZoom}px`
        markerElement.style.height = `${markerStartDiameter * adjustedIconZoom}px`
    })
})

//search for place
const geocoder = map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
        .on('result', (res) => {
            //enable spin only important for first instance if no geolocation found -- else this does nothing really
            spinEnabled = false
            exploringLoc = res.result.geometry.coordinates
            clearExploringMarkers()
            reverseGeoSearch(res.result.geometry.coordinates)
        }),
    'top-left'
)

//use lng,lat to retrieve data from server of that area
const makeMarker = async (ln, lt, rName, zip) => {
    //change type= to read off window/selected buttons -- activity + food
    const currentMarkers = {}
    await fetch(`/get-poi?lng=${ln}&lat=${lt}&area=${rName}&zip=${exploringZip || zip}&type=food+activity+bar`)
        .then(res => res.json())
        .then(data => {
            data.businesses.forEach(business => {
                if (!(business.type in currentMarkers)) {
                    currentMarkers[business.type] = []
                }
                
                let color = null
                if (business.type === 'food') {
                    color = 'green'
                } else if (business.type === 'bar') {
                    color = 'red'
                } else if (business.type === 'activity') {
                    color = 'blue'
                }

                const popup = new mapboxgl.Popup({ offset: 100 }).setText(
                    business.name
                )

                const el = document.createElement('div')
                el.className = 'marker'
                el.style.backgroundImage = `url(${business.img_url})`
                el.style.width = `${markerStartDiameter}px`
                el.style.height = `${markerStartDiameter}px`
                el.style.backgroundSize = '100%'
                el.style.border = `2px solid ${color}`

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([business.lng, business.lat])

                manageMarkerEvents(marker, business)

                currentMarkers[business.type].push(marker)
            })
        }
    )
    return currentMarkers
}


//problem with moving mouse btw markers too fast -- something gets "stuck"
const manageMarkerEvents = (marker, business) => {
    const markerElement = marker.getElement()
    let prevMarkerSize, markerPos, popUp

    markerElement.addEventListener('mouseover', () => {
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
            popUp.remove()
        }
    })

    markerElement.addEventListener('click', () => {
        addMarkerToSide(business)
    })
}

const clearExploringMarkers = () => {
    if (!favorited) {
        Object.values(exploringMarkers).flat(1).forEach(marker => {
            marker.remove()
        })
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
                    //makeMarker get and save area based on area referred name, not display name
                    exploringMarkers = await makeMarker(lng, lat, area, exploringZip)
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

        //if there is a geolocation
        //fly over there
        map.flyTo({
            center: currentLoc,
            zoom: 13,
            essential: true,
        })
        spinEnabled = false

        //pin current location
        const marker1 = new mapboxgl.Marker({ color: 'red' })
            .setLngLat(currentLoc)
            .addTo(map);

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


const getSaved = async () => {
    await fetch('/get-all-saved')
        .then(res => res.json())
        .then(data => {
            const areas = data.areas
            areas.forEach(async (area) => {
                //load saved area markers onto the map
                const currentMarkers = await makeMarker(area.lng, area.lat, area.referredName, area.areaCode)
                savedAreas[area.areaCode] = {
                    "refName": area.referredName,
                    "markers": currentMarkers,
                    "location": [area.lng, area.lat]
                }
            })
        })
}



//start map --> load saved locations --> getgeoloc
const run = async () => {
    startMapApp()
    await getSaved()
    await getGeoLoc()
    //add a feature that lists the saved locations on side menu and feature to "quick hop" to that place
    //like a list -- and indented are saved restraunt/activites that person can quick hop to specifically
    //render all other saved locations -- "places wanted to travel"
}

run()