//change so accessToken is hidden from client-end?
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

const markerStartDiameter = 40

let currentLoc = null
let spinEnabled = true
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 2,
})

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

//search
const geocoder = map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
    .on('result', (res) => {
        //enable spin only important for first instance if no geolocation found -- else this does nothing really
        spinEnabled = false
        reverseGeoSearch(res.result.geometry.coordinates)

        //function to clear all pins
        //function to add all userly saved pins -- prob have to use a fetch to server api to get locations of where user saved

        //when checking out new area, remove all old pins from prev area that are not saved to user's saved data
        //this prevents overcrowding of pins
    }),
    'top-left'
)


const pinnedMarker = (ln, lt, area) => {
    //change type= to read off window/selected buttons -- activity + food
    fetch(`/get-poi?lng=${ln}&lat=${lt}&area=${area}&type=activity+food`)
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

                new mapboxgl.Marker(el)
                    .setLngLat([business.lng, business.lat])
                    .setPopup(popup)
                    .addTo(map)
            })
        })
}

//fetch data on load -- put this into a function later for search changes
const reverseGeoSearch = ([lng, lat]) => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
    .then(res => res.json())
    .then(data => {
        const area = data.features[3].place_name
        pinnedMarker(lng, lat, area)
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



//all of this so far is "start map app"
//but also have a call to geolocation running on the side before "start map app"
    //once geo location found, then "fly" over to that spot and pin + stop spin
    //if not found then just keeps spinning
    //also add event listener -- if any user interaction on maps, stop spin 
        //add feature -- double left/right click -- pop up wiht option to explore --> reverse geo serach clicked location

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


//if user does not have set geolocation -- they can still have pinned/saved locations
    //ensure that pins are tehre + rotation even if no set geolocation
    //start map --> load saved locations --> getgeoloc
const run = async () => {
    startMapApp()
    await getGeoLoc()
    //add a feature that lists the saved locations on side menu and feature to "quick hop" to that place
    //like a list -- and indented are saved restraunt/activites that person can quick hop to specifically
    //render all other saved locations -- "places wanted to travel"
}

run()



// // // https://docs.mapbox.com/mapbox-gl-js/api/map/#map.event:styleimagemissing
// // // map.on('style.load', () => {
// // //     document.querySelector('#map').removeAttribute('hidden')
// // // })

// // // map.on('data', (e) => {
// // //     console.log('asd')
// // //     console.log(e.lngLat)
// // // })