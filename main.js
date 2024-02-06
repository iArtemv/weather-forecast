function getPosition() {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
}

function positionSuccess(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    var nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    fetch(nominatimUrl)
        .then(response => response.json())
        .then(data => {
            var city = getCityFromNominatimResponse(data);
            var currentDate = getCurrentDate();
            document.getElementById('cityHeader').innerHTML = `Weather<br>${city}<br>${currentDate}`;
        })
        .catch(error => {
            throw new Error(`Error Nominatim API: ${error}`);
        });
}

function positionError(error) {
    console.error('Error getting coordinates:', error);
}

function getCityFromNominatimResponse(nominatimResponse) {
    if (nominatimResponse.address) {
        return nominatimResponse.address.city || nominatimResponse.address.town || nominatimResponse.address.village || 'Город не найден';
    } else {
        return '';
    }
}

function getCurrentDate() {
    var currentDate = new Date();
    var formatter = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' });
    return formatter.format(currentDate);
}

getPosition();
