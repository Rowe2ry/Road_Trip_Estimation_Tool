
function fetchingUserLocation () {

    fetch("https://ipinfo.io/json?token=fc2c5059a0b866")
        .then(function (response) {
            console.log(response)
            return response.json ();
        })
        .then(function (data) {
            console.log(data)

            var userCity = data.city;
            var userPostal = data.postal;
            var userLocation = data.loc.split(',');
            var userLat = userLocation[0];
            var userLon = userLocation[1];

            console.log(userCity, userPostal, userLocation, userLat, userLon);
        })
}

fetchingUserLocation ();

