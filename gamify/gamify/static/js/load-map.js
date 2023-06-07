//change so accessToken is hidden from client-end?
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

//change currLoc to use geolocation of user OR based on their search
//change the navigation to a search thing
const currLoc = [-122.264674, 37.771947]
const [lng, lat] = currLoc
const markerStartDiameter = 40

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: currLoc, // starting position [lng, lat]
    zoom: 13 // starting zoom
});


const geocoder = map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
    .on('result', (res) => {
        console.log(res.result.geometry.coordinates)
        // set these coords as new currLoc and update markers in the area
        // do something to remove old markers? maybe? or display all the ones that are "Saved" 
        //      this means create some saved info from the user where you can call back later
    }),
    'top-left'
)


//marker1 is user's current location or where their search is to
const marker1 = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(currLoc)
    .addTo(map);


//fetch data on load -- put this into a function later for search changes
fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
    .then(res => res.json())
    .then(data => {
        const area = data.features[3].place_name
        pinnedMarker(lng, lat, area)
    })


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

// https://docs.mapbox.com/mapbox-gl-js/api/map/#map.event:styleimagemissing
// map.on('style.load', () => {
//     document.querySelector('#map').removeAttribute('hidden')
// })

// map.on('data', (e) => {
//     console.log('asd')
//     console.log(e.lngLat)
// })