/* ==========================================================================
 * DOM TARGETTING
 * ========================================================================= */

/* ==========================================================================
 * GLOBAL VARIABLE DECLARATIONS
 * ========================================================================= */

var geoApifyAPIkey = 'ea553f8b84ca463ebd4f9b51790b865e';
var commaInsertion = '%2C';
var pipeInsertion = '%7C';
var ipAddressURL ='https://ipinfo.io/json?token=fc2c5059a0b866';
var travelType ='drive';
var startingLatLon = [33.87820,-84.23729]; // plug in from user's IP addess fetch
var endingLatLon = [28.54064,-81.36489 ]; // plug in from weather PI search

/* ==========================================================================
 * FUNCTION DEFINITIONS
 * ========================================================================= */

function grabRoute() {
    fetch('https://api.geoapify.com/v1/routing?waypoints=' + 
            startingLatLon[0] +
            commaInsertion +
            startingLatLon[1] +
            pipeInsertion +
            endingLatLon[0] +
            commaInsertion +
            endingLatLon[1] +
            '&mode=' +
            travelType + 
            '&&units=imperial&apiKey=' +
            geoApifyAPIkey)
    .then(function (response){
      if (response.ok) {
          response.json() // format the data into a usable and mutable object
              .then(function (data) {
                  console.log(data);
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

grabRoute();