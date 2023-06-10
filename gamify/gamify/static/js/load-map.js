//change so accessToken is hidden from client-end?
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

let savedAreas = {}
let exploringMarkers = []
const markerStartDiameter = 40
let currentLoc = null
let spinEnabled = true

//separate function? --> let map = null + function to call at the beginning renderStartMap()?
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 2,
})

//eventlistener for enlarging marker size when map zoomed
map.on('zoom', () => {
    const markers = document.querySelectorAll('.marker')
    let adjustedIconZoom = 1 + (map.getZoom() - 13) / 2.5

    if (adjustedIconZoom < 1) {
        adjustedIconZoom = 1
    }

    markers.forEach(marker => {
        marker.style.width = `${markerStartDiameter * adjustedIconZoom}px`
        marker.style.height = `${markerStartDiameter * adjustedIconZoom}px`
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
            clearExploringMarkers()
            reverseGeoSearch(res.result.geometry.coordinates)

            //function to clear all pins
            //function to add all userly saved pins -- prob have to use a fetch to server api to get locations of where user saved

            //question: is this efficient? what if many pins -- then a lot of looping?
            //maybe have another set of id/class "exploring" where if marker has classname = exploring -- rmeove them if going to new area
            //this prevent the need to rerendering ALL of the markers (exploring + saved ones)
            //can cut down on runtime/memory bc no need to rerender saved ones
            //few ways to do this: global var of currentlyExploringMarkers[] -- add to these + remove from this list when searching/hopping around
            //when checking out new area, remove all old pins from prev area that are not saved to user's saved data
            //this prevents overcrowding of pins
        }),
    'top-left'
)

//use lng,lat to retrieve data from server of that area
const makeMarker = async (ln, lt, rName) => {
    //change type= to read off window/selected buttons -- activity + food
    const currentMarkers = []
    await fetch(`/get-poi?lng=${ln}&lat=${lt}&area=${rName}&type=activity+food`)
        .then(res => res.json())
        .then(data => {
            data.businesses.forEach(business => {
                const color = business.type === 'food' ? 'green' : 'blue'

                const popup = new mapboxgl.Popup({ offset: 25 }).setText(
                    business.name
                )

                const el = document.createElement('div')
                el.className = 'marker'
                el.style.backgroundImage = `url(${business.img_url})`
                el.style.width = `${markerStartDiameter}px`
                el.style.height = `${markerStartDiameter}px`
                el.style.backgroundSize = '100%'
                el.style.border = `2px solid ${color}`

                currentMarkers.push(new mapboxgl.Marker(el)
                    .setLngLat([business.lng, business.lat])
                    .setPopup(popup)
                    .addTo(map)
                )
            })
        }
    )
    return currentMarkers
}

const clearExploringMarkers = () => {
    if (!favorited) {
        exploringMarkers.forEach(marker => {
            marker.remove()
        })
    }
}

//fetch data on load -- put this into a function later for search changes
const reverseGeoSearch = ([lng, lat]) => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(async (data) => {
            const place = data.features.reduce((prevFeature, feature) => feature.place_type[0] === 'place' ? feature : null || prevFeature, null)       

            if (place !== null) {
                const area = place.place_name
                //value get passed in here depends on value of the fetch call, not the saved area name itself
                setViewingLoc(area)

                //prevention of rerendering pins alraedy loaded from saved list
                const alreadyOnSavedList = Object.keys(savedAreas).reduce((exists, checkArea) => exists || place.place_name === checkArea, false)
                if (alreadyOnSavedList) {
                    exploringMarkers = savedAreas[area]
                } else {    
                    //makeMarker get and save area based on area referred name, not display name
                    exploringMarkers = await makeMarker(lng, lat, area)
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
                const currentMarkers = await makeMarker(area.lng, area.lat, area.referredName)
                savedAreas[area.referredName] = currentMarkers
            })
        })
}



//if user does not have set geolocation -- they can still have pinned/saved locations
//ensure that pins are tehre + rotation even if no set geolocation
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