mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW56aHUzNSIsImEiOiJjbGlqZDlucXYwNjZuM3Fxdmd6eTNhMDlrIn0.ULZWndcTJElOGpeFuBAXEw';

const urlParams = new URLSearchParams(window.location.search)
const coord = [urlParams.get('lng'), urlParams.get('lat')]
const [lng, lat] = coord

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coord,
    zoom: 14
});

const locMarker = new mapboxgl.Marker({
    color: 'black'
})
.setLngLat(coord)
.addTo(map)