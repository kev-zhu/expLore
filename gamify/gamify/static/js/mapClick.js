const mapPopup = new mapboxgl.Popup({
    closeOnMove: true
})

map.on('click', (position) => {
    if (hoveringMarker == null) {
        coord = position.lngLat

        geocoder.setFlyTo(true)

        mapPopup.setLngLat([coord.lng, coord.lat])
            .setHTML(
                `
                <div class='query-search btn btn-light' style='width: 100%' onclick='geocoder.query("${coord.lat}, ${coord.lng}")'>Search location</div>
                <a class="btn btn-light" href="/request/request-spot?lng=${coord.lng}&lat=${coord.lat}">Register this spot as a business?</a>
                <br>
                <div class='get-map-dir btn btn-light' style='width: 100%'>Get directions here</div>`)
            .addTo(map)

        const mapDir = document.querySelector('.get-map-dir')

        mapDir.addEventListener('click', () => {
            directionSearch([coord.lng, coord.lat])
        })
    }
})


