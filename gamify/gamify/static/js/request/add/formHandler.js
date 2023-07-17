const fetchButton = document.querySelector('.fetch-data')
const manualButton = document.querySelector('.manual-entry')

const yelpConfirm = document.querySelector('.yelp-confirm')
const yelpYes = document.querySelector('.yelp-yes')
const yelpNo = document.querySelector('.yelp-no')

const fillOption = document.querySelector('.fill-option')
const formView = document.querySelector('.form-view')

const formName = document.querySelector('.form-name')
const formCategory = document.querySelector('.form-category')
const formAddress = document.querySelector('.form-address')
const formCity = document.querySelector('.form-city')
const formState = document.querySelector('.form-state')
const formCountry = document.querySelector('.form-country')
const formZip = document.querySelector('.form-zip')
const formPhone = document.querySelector('.form-phone')
const formEntries = [formName, formCategory, formAddress, formCity, formState, formCountry, formZip, formPhone]

const submitRequest = document.querySelector('.submit-request')
const cancelRequest = document.querySelector('.cancel-request')

//send out any additional business information before submitting/creating business model OBJ
let business


fetchButton.addEventListener('click', () => {
    //fetch api call with coords (coordinates of the current place)
    fetch(`/request/yelp-fill/${lng}/${lat}`)
        .then(res => res.json())
        .then(data => {
            business = data.businessData
            document.querySelector('.yelp-location').innerHTML = business.name
            fillOption.hidden = true
            yelpConfirm.hidden = false
        })
})

//get data and fill the form before changing view of formView to false
yelpYes.addEventListener('click', () => {
    yelpConfirm.hidden = true
    formView.hidden = false

    const addresses = [business.location.address1, business.location.address2, business.location.address3]

    //fill data
    formName.value = business.name
    formAddress.value = addresses.reduce((prev, address) => address !== null && address !== '' ? prev + address + " ": prev,"").trim()
    formCity.value = business.location.city
    formState.value = business.location.state
    formCountry.value = business.location.country
    formZip.value = business.location.zip_code
    formPhone.value = business.display_phone
})

yelpNo.addEventListener('click', () => {
    yelpConfirm.hidden = true
    formView.hidden = false
})

manualButton.addEventListener('click', () => {
    fillOption.hidden = true
    formView.hidden = false
})

const hasValue = (input) => {
    return input.value !== ''
}

formEntries.forEach(entry => {
    entry.addEventListener('change', () => {
        if (formEntries.every(hasValue)) {
            submitRequest.disabled = false
        } else {
            submitRequest.disabled = true
        }
    })
})

//get map searchLocation -- general area/place before submitting form
submitRequest.addEventListener('click', () => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(data => {
            const place = data.features.reduce((prevFeature, feature) => feature.place_type[0] === 'place' ? feature : null || prevFeature, null)

            if (place != null) {
                sendSubmitRequest(place.place_name)
            }
        })
})

cancelRequest.addEventListener('click', () => {
    window.location.href = window.location.origin
})

const sendSubmitRequest = (area) => {
    //change form up to only include the essnetial for yelp search?
    fetch('/request/send-request', {
        body: JSON.stringify({
            'userId': JSON.parse(document.getElementById('user_id').textContent),
            'name': formName.value,
            'category': formCategory.value.toLowerCase(),
            'address': formAddress.value,
            'city': formCity.value,
            'state': formState.value,
            'country': formCountry.value,
            'zip': formZip.value,
            'phone': formPhone.value,
            'area': area,
            'lng': lng,
            'lat': lat
        }),
        method: 'post'
    })
        .then(res => res.json())
        .then(data => {
            //display as a message?
            console.log(data)
            window.location.href = window.location.origin
        })
}