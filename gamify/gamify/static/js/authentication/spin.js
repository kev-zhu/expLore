mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 2.5,
    interactive: false,
})

let spinning = true

const secondsPerRevolution = 120

const spinGlobe = () => {
    const distancePerSecond = 360 / secondsPerRevolution
    const center = map.getCenter()
    center.lng -= distancePerSecond
    map.easeTo({ center, duration: 1000, easing: (n) => n })

}

spinGlobe()
map.on('moveend', () => {
    if (spinning) {
        spinGlobe()
    }
})


map.on('mousedown', () => {
    spinning = false
})