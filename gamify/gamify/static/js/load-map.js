//change so accessToken is hidden from client-end?
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

const markerStartDiameter = 40
let currentLoc = null
let map = null

const getGeoLoc = async () => {
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        currentLoc = [pos.coords.longitude, pos.coords.latitude]
    } catch {
        console.log('geolocation off')
    }

}

const pinnedMarker = (ln, lt, area) => {
    //change type to read off window/selected buttons -- activity + food
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



getGeoLoc()

//getGeoLoc if available before rendering map
window.addEventListener('load', () => {
    console.log(currentLoc)
    if (currentLoc) {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: currentLoc,
            zoom: 13
        })
        userInteracting = true
        spinEnabled = false
    } else {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            zoom: 2
        })
        // map.scrollZoom.disable()
    }

    const geocoder = map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        })
        .on('result', (res) => {
            reverseGeoSearch(res.result.geometry.coordinates)

            // do something to remove old markers? maybe? or display all the ones that are "Saved" 
            //      this means create some saved info from the user where you can call back later
        }),
        'top-left'
    )
    
    //marker1 is user's current location or where their search is to
    // if currentLoc is not null -- geoLocation found at beginning
    if (currentLoc !== null) {
        const marker1 = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(currentLoc)
        .addTo(map);
    
        reverseGeoSearch(currentLoc)
    }


    //map add eventlistener on scroll - get scrollzoom and scale the width/height of icons
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
    });
})


// const secondsPerRevolution = 120
// const maxSpinZoom = 5
// const slowSpinZoom = 3
 
// let spinEnabled = true

//spinglobe demanding -- probably bc of rerendering?
// const spinGlobe = () => {
//     const distancePerSecond = 360 / secondsPerRevolution
//     if (spinEnabled && !userInteracting) {
//         const center = map.getCenter()
//         center.lng -= distancePerSecond
//         map.easeTo({ center, duration: 1000, easing: (n) => n })
//     }
// }

// map.on('moveend', () => {
//     if (spinEnabled) {
//         spinGlobe()
//     }
// })

// map.on('load', () => {
//     console.log('A load event occurred.');
//     });
    
// spinGlobe()




// // https://docs.mapbox.com/mapbox-gl-js/api/map/#map.event:styleimagemissing
// // map.on('style.load', () => {
// //     document.querySelector('#map').removeAttribute('hidden')
// // })

// // map.on('data', (e) => {
// //     console.log('asd')
// //     console.log(e.lngLat)
// // })