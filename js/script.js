/* ==========================================================================
 * DOM TARGETING
 * ========================================================================= */

const outPutArea = document.getElementById('outputArea'); // where the time calculation will go
const packingButton = document.querySelector('.packing-button'); // targeting for event listeners
const buyingButton = document.querySelector('.buying-button'); // targeting for event listeners
const todoButton = document.querySelector('.todo-button'); // targeting for event listeners
const packingInput = document.querySelector('#packing-input'); // input field to pass in or read value attribute
const buyingInput = document.querySelector('#buying-input'); // input field to pass in or read value attribute
const todoInput = document.querySelector('#todo-input'); // input field to pass in or read value attribute
const Ending_Point = document.querySelector(".Ending_Point");
const driveButton = document.querySelector('.driveButton');

/* ==========================================================================
 * GLOBAL VARIABLE DECLARATIONS
 * ========================================================================= */

const APIkeyCurrent = '00d31542c0f530cb4f115dab6831ce15'; // to call the current Weather API from Open Weather
const geoApifyAPIkey = 'ea553f8b84ca463ebd4f9b51790b865e'; // key to call the geoapify API
const commaInsertion = '%2C'; // just to better reference a comma in a URL
const pipeInsertion = '%7C'; // just to better reference a pipe character in a URL
const ipAddressURL ='https://ipinfo.io/json?token=fc2c5059a0b866'; // URL for getting information from an IP address

// localStorage git items
let packing = localStorage.getItem('packing');
// console.log(packing);  // <- was used for debugging
let buying = localStorage.getItem('buying');
// console.log(buying); // <- was used for debugging
let todo = localStorage.getItem('todo');
// console.log(todo); // <- was used for debugging

/* ==========================================================================
 * FUNCTION DEFINITIONS
 * ========================================================================= */

// function to grab lat & lon coordinates from user's current location
function fetchingUserLocation (str) {
    fetch(ipAddressURL) // grabs the raw data we need from API
        .then(function (response) {
            // console.log(response) // <- was used for debugging
            return response.json (); // formats data to be used
        })
        .then(function (data) {
            // console.log(data) // <- was used for debugging
            const userStartingLoc = data.loc.split(','); // grabs the lat & lon of user - splitting to use separately
            const startLat = userStartingLoc[0]; // grabs the lat of user
            const startLon = userStartingLoc[1]; // grabs the lon of user 
            // console.log(userStartingLoc, startLat, startLon); // <- was used for debugging
            const userLocationData = [str, startLat, startLon]; // putting all into an array to pass to next function
            // console.log(userLocationData); // <- was used for debugging
            useWeatherToGetCoords(userLocationData[0],userLocationData[1],userLocationData[2]);
        });
};

// grab lat lon coordinate data from OpenWeather by city name
function useWeatherToGetCoords(str,startLat,startLon) {
    // API url, the city is entered by the user
    const currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + // base API cll url
    str + // city by name
    '&appid=' + // string query for the key
    APIkeyCurrent; 
    // grabs the raw data we need
    fetch(currentWeatherURL)
        .then(function (response){
            if (response.ok) {
                response.json() // format the data into a usable and mutable object
                    .then(function (data) {
                        const endLat = data.coord.lat; // Grab latitude coordinate
                        const endLon = data.coord.lon; // Grab longitude coordinate
                        const coordinates = [
                            startLat, startLon, endLat, endLon
                        ]; // just the 4 pieces of info we needed from the current Weather API call which uses a city name to search
                        grabRoute(coordinates[0],coordinates[1],coordinates[2],coordinates[3])
                    });
            } else {
                 throw new Error('error with current weather fetch | likely invalid city name'); // just some feedback if the API doesn't recognize the city name
            };
        });
};

function grabRoute(startLat, startLon, endLat, endLon) {
    let travelType ='drive'; // also could be "walk" or "approximated_transit"
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
                  // console.log(data); // in this case just log to console <- was used for debugging
                  let driveDistance = data.features[0].properties.distance;
                  // console.log(driveDistance); // <- was used for debugging
                  // console.log('total drive time in minutes =' + travelTimeCalculation (driveDistance)); // <- was used for debugging
                  travelTimeCalculation (driveDistance);
              });
          } else {
              throw new Error('error with current fetch'); // just some feedback if the API doesn't recognize the city name
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
    // calculation assumes if the user hits their max time of driving per day, they will find
    // a hotel, sleep, and start the next day on the usual schedule
    let distanceToGo = Math.ceil(totalDistance); // baseline it takes as many miles as it does minutes round up to nearest min
    let totalTravelTime = 0;
    let distanceTraveled = 0;
    // var timeForDriving = 849; // number of minutes someone has to drive after sleeping eating and refueling
    const breakfastToLunch = 240; // time between breakfast and lunch
    const lunch = 30; // time for a quick lunch on road trip
    const lunchToDinner = 390; // mins between lunch and dinner
    const dinner = 60; // 1 hour for a dinner
    let refuelCount = 0;
    let hotelStays = 0;
    let hotelTime = 0;

// user will supply this value, we will cap it later
    const maxOneDayDrive = 600; // 10 hours of driving per day in this case

// user will supply this value    
    const bathroomEvery = 120; // 2 hours expressed as minutes

// user will supply this value
    const bathroomBreak = 15; // minutes assumed to find a bathroom stop the car, stretch legs, use bathroom
    let bathBreakCount = 0;

    const maxTimeDrivingAfterBathroom = 849 - (bathBreakCount * bathroomBreak); // take the bathroom breaks out of the day's productivity

    // maxTimeDrivingAfterBathroom = 669

    if (maxOneDayDrive > maxTimeDrivingAfterBathroom){ // if the user is willing to drive more time than they will have in a day to drive
        maxOneDayDrive = maxTimeDrivingAfterBathroom; // limit their expectations to what is possible
    };

    while (distanceToGo > 0) {
        if (distanceToGo > maxOneDayDrive || distanceToGo > maxTimeDrivingAfterBathroom) { // if its going to take more than a day to do this
            totalTravelTime += 1440 // then just add 24 hours to the estimate and... 
            distanceTraveled = Math.min(maxTimeDrivingAfterBathroom, maxOneDayDrive); // assume the user went as far as they could go
            distanceToGo -= distanceTraveled; // reduce the remaining trip distance
            refuelCount += 3; // 3 tanks of gas needed for one day of driving
            bathBreakCount += (Math.floor((distanceToGo / bathroomEvery))) ; // not idea but assumes 
            bathroomTime = bathBreakCount * bathroomBreak;
            hotelStays++; // add a hotel stay
            hotelTime+= 480; // add 8 hours in the hotel
        } else if (distanceToGo < maxOneDayDrive) { // if they can go as far as they need to in their time allowance
            let bathroomTime = (distanceToGo / bathroomEvery) * bathroomBreak; // add their bathroom breaks
            let refuelCountToday = Math.floor((distanceToGo/300));
            bathBreakCount += (Math.floor((distanceToGo / bathroomEvery)));
            bathroomTime = bathBreakCount * bathroomBreak;
            if (distanceToGo > breakfastToLunch) { // if thy have to drive thru lunch
                totalTravelTime +=lunch; // add the lunch stop to total time
            } else if (distanceToGo > breakfastToLunch + lunch + lunchToDinner) { // if they are driving thru dinner time
                totalTravelTime += lunch + dinner; // add the dinner stop to the time
            };
            totalTravelTime += distanceToGo; // take the distance form today and add to the total
            distanceToGo = 0; // reduce the distance down
            refuelCount += refuelCountToday; // add the fuel stops for today
            refuelTime = refuelCount * 7;
            totalTravelTime = totalTravelTime + distanceToGo + bathroomTime + refuelTime; // add up travel bathroom and fuel
            const data = [totalTravelTime, refuelCount, bathBreakCount, hotelStays, hotelTime]; // collect the data
            console.log('Total Travel Time: ' + data[0] + '\n Times you refueled: ' + data[1] + '\n Times you stopped for the bathroom: ' + data[2] + '\n Times you have to stay in a hotel: ' + data[3]);
            var formattedData = convertToHour(data);
            populatePage(formattedData);
        };
    };
};
    
function convertToHour(arr) {
        const totalMins = arr[0];
        const hours = Math.floor(totalMins/60);
        const mins = totalMins - (hours * 60);
        const totalTime = hours + ' hours and ' + mins + " minutes.";
        arr[0] = totalTime;
        return arr;
}

function populatePage( arr) {
    const totalTravelTime = arr[0];
    const numRefuel = arr[1];
    const numBathroom = arr[2];
    const hotelStays = arr[3];

    const outStringSect1 = "Your road trip will total: " + totalTravelTime;
    const outStringSect2 = "This includes: "

    const outPutData1 = document.createElement('p');
    outPutData1.textContent = outStringSect1;
    outPutArea.append(outPutData1);
    const outPutData2 = document.createElement('p');
    outPutData2.textContent = outStringSect2;
    outPutArea.append(outPutData2);
    const driveDataList = document.createElement('ul');
    outPutArea.append(driveDataList);
    const fuelLiEl = document.createElement('li'); 
    fuelLiEl.textContent = 'the ' + numRefuel + ' times you will have to refuel';
    const bathLiEl = document.createElement('li'); 
    bathLiEl.textContent = 'the ' + numBathroom + ' times you will stop to use the bathroom';
    const hotelLiEl = document.createElement('li'); 
    hotelLiEl.textContent = 'and the ' + hotelStays + ' times you will sleep in a hotel';
    const asWell = document.createElement('li'); 
    asWell.textContent = 'as well as a 30 minute lunch and 1 hour dinner every day';
    driveDataList.append(fuelLiEl);
    driveDataList.append(bathLiEl);
    driveDataList.append(hotelLiEl);
    driveDataList.append(asWell);
};

/* ==========================================================================
 * ACTIVE EVENT LISTENERS
 * ========================================================================= */

// functions for displaying the list onto the page
packingButton.addEventListener('click', function(event) {
    event.preventDefault(); // keep the form from deleting
    localStorage.setItem('packing',packingInput.value); // save the user input into local storage
    // console.log(packingInput.value);  // <- was used for debugging
});

buyingButton.addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.setItem('buying',buyingInput.value);
    // console.log(buyingInput.value); // <- was used for debugging
});

todoButton.addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.setItem('todo',todoInput.value);
    // console.log(todoInput.value); // <- was used for debugging
});

driveButton.addEventListener("click", function(event) {
    event.preventDefault();
    const SP = Ending_Point.value;
    // console.log (SP);  // <- was used for debugging
    fetchingUserLocation (SP);
});

/* ==========================================================================
 * LOGIC EXECUTION ON PAGE LOAD
 * ========================================================================= */

if (packing != null) { // if the "packing" input value is empty, bring in the local storage info
    packingInput.value = packing;
};
if (buying != null) { // if the "buying" input value is empty, bring in the local storage info
    buyingInput.value = buying;
};
if (todo != null) { // if the "to do" input value is empty, bring in the local storage info
    todoInput.value = todo;
};

// fetchingUserLocation ();

//     event.console.log(starting_point);
    // document.getElement("demo") = console.log(starting_point);
    
