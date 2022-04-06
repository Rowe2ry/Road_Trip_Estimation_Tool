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
/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }



// TESTING! :) 
function enCity () {
    var endingLocation = window.prompt('Please Enter the city you want to travel to');
    fetchingUserLocation (endingLocation);
}

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
                  console.log('total drive time in minutes =' + travelTimeCalculation (driveDistance))
              });
          } else {
              console.log('error with current fetch'); // just some feedback if the API doesn't recognize the city name
          };
      });
  };

 function travelTimeCalculation (totalDistance) {

    // calculation assumes 60mph to make each mile a minute of time and its a reasonable road trip speed
    // calculation assumes the user has breakfast at 7:00am and begins their road trip at 8:00am with a full tank of gas
    // calculation assumes the user will take 30 min lunch at noon
    // calculation assumes the user will take a 1 hour dinner at 7pm
    // calculation assumes this day schedule is repeated every day
    // calculation assumes user has a range limit of 300 miles due to fuel consumption
    // calculation assumes if the user hits their mad time of driving per day, they will find
    //                      a hotel, sleep, and start the next day on the usual schedule

    var distanceToGo = Math.ceil(totalDistance); // baseline it takes as many miles as it does minutes round up to nearest min
    var totalTravelTime = 0;
    var distanceTraveled = 0;
    var timeForDriving = 759; // number of minutes someone has to drive after sleeping eating and refueling
    var breakfastToLunch = 240; // time between breakfast and lunch
    var lunch = 30; // time for a quick lunch on road trip
    var lunchToDinner = 390; // mins between lunch and dinner

// user will supply this value, we will cap it later
    var maxOneDayDrive = 600; // 10 hours of driving per day in this case

// user will supply this value    
    var bathroomEvery = 120; // 2 hours expressed as minutes

// user will supply this value
    var bathroomBreak = 15; // minutes assumed to find a bathroom stop the car, stretch legs, use bathroom

    var maxTimeDrivingAfterBathroom = 759 - (Math.floor((759 / bathroomEvery)) * bathroomBreak); // take the bathroom breaks out of the day's productivity

    // maxTimeDrivingAfterBathroom = 669

    if (maxOneDayDrive > maxTimeDrivingAfterBathroom){ // if the user is willing to drive more time than they will have in a day to drive
        maxOneDayDrive = maxTimeDrivingAfterBathroom; // limit their expectations to what is possible
    };

    while (distanceToGo > 0) {
        if (distanceToGo > maxOneDayDrive || distanceToGo > maxTimeDrivingAfterBathroom) { // if its going to take more than a day to do this
            totalTravelTime += 1440 // then just add 24 hours to the estimate and... 
            distanceTraveled = Math.min(maxTimeDrivingAfterBathroom, maxOneDayDrive); // assume the user went as far as they could go
            distanceToGo -= distanceTraveled; // reduce the remaining trip distance
        } else if (distanceToGo < maxOneDayDrive) { // if they can go as far as they need to in their time allowance
            var bathroomTime = (distanceToGo / bathroomEvery) * bathroomBreak; // add their bathroom breaks
            var refuelTime = (distanceToGo / 300) * 7; // 7 mins refueling every 300 miles
            if (distanceToGo > breakfastToLunch) {
                totalTravelTime +=lunch;
            } else if (distanceToGo > breakfastToLunch + lunch + lunchToDinner) {
                totalTravelTime += lunch + lunchToDinner;
            }
            totalTravelTime = totalTravelTime + distanceToGo + bathroomTime + refuelTime; // add up travel bathroom and fuel
            return totalTravelTime;
        };
    };
};
    

/* ==========================================================================
 * ACTIVE EVENT LISTENERS
 * ========================================================================= */

/* ==========================================================================
 * LOGIC EXECUTION ON PAGE LOAD
 * ========================================================================= */

// fetchingUserLocation ();
enCity ();
