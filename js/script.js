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
var startingLatLon = [33.87820,-84.23729]; // plug in from user's IP address fetch
var endingLatLon = [28.54064,-81.36489 ]; // plug in from weather API search

/* ==========================================================================
 * FUNCTION DEFINITIONS
 * ========================================================================= */

// TESTING! :) 
// function enCity () {
//     var endingLocation = window.prompt('Please Enter the city you want to travel to');
//     fetchingUserLocation (endingLocation);
// }

// function to grab lat & long coordinates from user's current location
function fetchingUserLocation (str) {

    // grabs the raw data we need from API
    fetch(ipAddressURL)
        .then(function (response) {
            console.log(response)
            return response.json ();
        })
        // formats data to be used
        .then(function (data) {
            console.log(data)

            var userStartingLoc = data.loc.split(','); // grabs the lat & lon of user - spliting to use seperately
            var startLat = userStartingLoc[0]; // grabs the lat of user
            var startLon = userStartingLoc[1]; // grabs the lon of user 
            console.log(userStartingLoc, startLat, startLon);

             // putting all into an array to pass to next function
            var userLocationData = [str, startLat, startLon]
            console.log(userLocationData);

            useWeathertoGetcoords(userLocationData[0],userLocationData[1],userLocationData[2]);
        })

        
};

// grab lat lon coordinate data from OpenWeather by city name
function useWeathertoGetcoords(str,startLat,startLon) {
    // API url, the city is entered by the user
    var currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + // base API cll url
    str + // city by name
    '&appid=' + // string query for the key
    APIkeyCurrent;

    // grabs the raw data we need
    fetch(currentWeatherURL)
        .then(function (response){
            if (response.ok) {
                response.json() // format the data into a usable and mutable object
                    .then(function (data) {
                        var endLat = data.coord.lat; // Grab latitude coordinate
                        var endLon = data.coord.lon; // Grab longitude coordinate
                        var coordinates = [
                            startLat, startLon, endLat, endLon
                        ]; // just the 4 pieces of info we needed from the current Weather API call which uses a city name to search
                        grabRoute(coordinates[0],coordinates[1],coordinates[2],coordinates[3])
                    });
            } else {
                console.log('error with current weather fetch | likely invalid city name'); // just some feedback if the API doesn't recognize the city name
            };
        });
};

function grabRoute(startLat, startLon, endLat, endLon) {
    var travelType ='drive'; // also could be "walk" or "approximated_transit"
    fetch('https://api.geoapify.com/v1/routing?waypoints=' + 
            startLat + // starting location latitude
            commaInsertion + // a comma ,
            startLon + // starting location longitude
            pipeInsertion + // a pipe operator |
            endLat + // finishing location latitude
            commaInsertion + // a comma ,
            endLon + // finishing location longitude
            '&mode=' + // string query for method of transportation
            travelType +  // walking || flying || public transit || * driving
            '&&units=imperial&apiKey=' + // use miles instead of meters and query for the API key
            geoApifyAPIkey) // our unique free key
    .then(function (response){
      if (response.ok) { // if there is a response
          response.json() // format the data into a usable and mutable object
              .then(function (data) { // and do stuff
                  console.log(data); // in this case just log to console
                  driveDistance = data.features[0].properties.distance;
                  console.log(driveDistance);
              });
          } else {
              console.log('error with current fetch'); // just some feedback if the API doesn't recognize the city name
          };
      });
  };

/* ==========================================================================
 * ACTIVE EVENT LISTENERS
 * ========================================================================= */
// event listener for when user clicks button to save the lists 
var packingButton = document.querySelector('.packing-button');
var buyingButton = document.querySelector('.buying-button');
var todoButton = document.querySelector('.todo-button');
var packingInput = document.querySelector('.packing-input');
var buyingInput = document.querySelector('.buying-input');
var todoInput = document.querySelector('.todo-input');
var newList = document.createElement('li')


packingButton.addEventListener('click', function(event) {
    event.preventDefault();

    newList.textContent = packingInput.value;

    document.getElementById('packing-list').append(newList);

    localStorage.setItem("list", packingInput);

})

buyingButton.addEventListener('click', function(event) {
    event.preventDefault();

    newList.textContent = buyingInput.value;

    document.getElementById('buying-list').append(newList);

})

todoButton.addEventListener('click', function(event) {
    event.preventDefault();

    newList.textContent = todoInput.value;

    document.getElementById('todo-list').append(newList);

})




/* ==========================================================================
 * LOGIC EXECUTION ON PAGE LOAD
 * ========================================================================= */

// fetchingUserLocation ();
// enCity ();
