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
            document.getElementById('cityHeader').innerText = `Weather Forecast - ${city}`;
        })
        .catch(error => {
            throw new Error(`Error Nominatim API: ${error}`);
        });
}

function positionError(error) {
    console.error('Ошибка при получении координат:', error);
}

function getCityFromNominatimResponse(nominatimResponse) {
    if (nominatimResponse.address) {
        return nominatimResponse.address.city || nominatimResponse.address.town || nominatimResponse.address.village || 'Город не найден';
    } else {
        return '';
    }
}

getPosition();
