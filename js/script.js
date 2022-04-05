/* ==========================================================================
 * DOM TARGETTING
 * ========================================================================= */

/* ==========================================================================
 * GLOBAL VARIABLE DECLARATIONS
 * ========================================================================= */

var APIkeyCurrent = '00d31542c0f530cb4f115dab6831ce15'; // to call the current Weather API from Open Weather
var geoApifyAPIkey = 'ea553f8b84ca463ebd4f9b51790b865e';
var commaInsertion = '%2C';
var pipeInsertion = '%7C';
var ipAddressURL ='https://ipinfo.io/json?token=fc2c5059a0b866';
var travelType ='drive';
var startingLatLon = [33.87820,-84.23729]; // plug in from user's IP address fetch
var endingLatLon = [28.54064,-81.36489 ]; // plug in from weather PI search

/* ==========================================================================
 * FUNCTION DEFINITIONS
 * ========================================================================= */

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
};

// grab lat lon coordinate data from OpenWeather by city name
function useWeathertoGetcoords(location) {
    // API url, the city is entered by the user
    var currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + 
    location + 
    '&appid=' +
    APIkeyCurrent;

    // grabs the raw data we need
    fetch(currentWeatherURL)
        .then(function (response){
            if (response.ok) {
                response.json() // format the data into a usable and mutable object
                    .then(function (data) {
                        var nowName = data.name; //  Grab the city name --- string --- index 0
                        var latitude = data.coord.lat; // Grab latitude coordinate
                        var longitude = data.coord.lon; // Grab longitude coordinate
                        var nowDataRelevant = [
                            nowName, latitude, longitude
                        ]; // just the 3 pieces of info we needed from the current Weather API call which uses a city name to search
                    });
            } else {
                console.log('error with current weather fetch | likely invalid city name'); // just some feedback if the API doesn't recognize the city name
            };
        });
};

function grabRoute() {
    fetch('https://api.geoapify.com/v1/routing?waypoints=' + 
            startingLatLon[0] + // starting location latitude
            commaInsertion + // a comma ,
            startingLatLon[1] + // starting location longitude
            pipeInsertion + // a pipe operator |
            endingLatLon[0] + // finishing location latitude
            commaInsertion + // a comma ,
            endingLatLon[1] + // finishing location longitude
            '&mode=' + // string query for method of transportation
            travelType +  // walking || flying || public transit || * driving
            '&&units=imperial&apiKey=' + // use miles instead of meters and query for the API key
            geoApifyAPIkey) // our unique free key
    .then(function (response){
      if (response.ok) { // if there is a response
          response.json() // format the data into a usable and mutable object
              .then(function (data) { // and do stuff
                  console.log(data); // in this case just log to console
              });
          } else {
              console.log('error with current fetch'); // just some feedback if the API doesn't recognize the city name
          };
      });
  };

/* ==========================================================================
 * ACTIVE EVENT LISTENERS
 * ========================================================================= */

/* ==========================================================================
 * LOGIC EXECUTION ON PAGE LOAD
 * ========================================================================= */

fetchingUserLocation ();
grabRoute();

