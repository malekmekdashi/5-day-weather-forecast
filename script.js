var APIkey = '4c0c196cabeee893cb2a0b914c0850a5';
var currentCity = '';
var searchHistory = '';

var errorHandler = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// get the current weather conditions
var getCurrentConditions = (event) => {
    // retrieved from the search
    let city = $('#search').val();
    currentCity= $('#search').val();
    // Set the weatherURL to fetch from API using weather search
    let weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + APIkey;
    fetch(weatherURL)
    .then(errorHandler)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        // Save city to local storage
        saveCity(city);
        $('#search-error').text("");
        // Create icon for the current weather using Open Weather Maps
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        // have to adjust for the timezone
        let currentDate = response.dt;
        let currentTimeZoneadj = response.timezone;
        let currentTimeZoneHours = currentTimeZoneadj / 60 / 60;
        let currentMoment = moment.unix(currentDate).utc().utcOffset(currentTimeZoneHours);
        // Render cities list
        renderCities();
        // Obtain the 5day forecast for the searched city
        getFiveDayForecast(event);
        // Set the header text to the found city name
        $('#header-text').text(response.name);
        // HTML for the results of search
        let currentWeatherHTML = `
            <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temperature: ${response.main.temp}&#8457;</li>
                <li>Humidity: ${response.main.humidity}%</li>
                <li>Wind Speed: ${response.wind.speed} mph</li>
            </ul>`;
        // Append the results to the DOM
        $('#current-weather').html(currentWeatherHTML);
    })
}

// Function to obtain the five day forecast and display to HTML
var getFiveDayForecast = (event) => {
    let city = $('#search').val();
    // Set up URL for API search using forecast search
    let weatherURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + APIkey;
    // Fetch from API
    fetch(weatherURL)
        .then (errorHandler)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        // HTML template
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div class="d-inline-flex flex-wrap ">`;
        // using UTC offset to loop over the 5 days and build the HTML template
        for (let i = 0; i < response.list.length; i++) {
            let dayInfo = response.list[i];
            let dayTimeUTC = dayInfo.dt;
            let timeZoneAdj = response.city.timezone;
            let timeZoneHours = timeZoneAdj / 60 / 60;
            let timeNow = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayInfo.weather[0].icon + ".png";
            // Only displaying mid-day forecasts
            if (timeNow.format("HH:mm:ss") === "11:00:00" || timeNow.format("HH:mm:ss") === "12:00:00" || timeNow.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${timeNow.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayInfo.main.temp}&#8457;</li>
                        <li>Humidity: ${dayInfo.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        // Build the HTML template
        fiveDayForecastHTML += `</div>`;
        // Append the five-day forecast
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

//save the city to localStorage
var saveCity = (newCity) => {
    let cityExists = false;

    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    // Save to localStorage
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

// Render searched cities
var renderCities = () => {
    $('#search-results').empty();
    // when localStorage is empty
    if (localStorage.length===0){
        if (searchHistory){
            $('#search').attr("value", searchHistory);
        } else {
            $('#search').attr("value", "Los Angeles");
        }
    } else {
        // search history in localstorage
        let searchHistoryKey="cities"+(localStorage.length-1);
        searchHistory=localStorage.getItem(searchHistoryKey);
        // Set search input to last city searched
        $('#search').attr("value", searchHistory);
        // Append items to page
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            // if currentCity is not set
            if (currentCity===""){
                currentCity=searchHistory;
            }
            // Set button class to active for currentCity
            if (city === currentCity) {
                cityEl = `<button class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            // Append city to page
            $('#search-results').prepend(cityEl);
        }
    }
    
}



// event listener
$('#searchButton').on("click", (event) => {
event.preventDefault();
currentCity = $('#search').val();
getCurrentConditions(event);
});

// event listener
$('#search-results').on("click", (event) => {
    event.preventDefault();
    $('#search').val(event.target.textContent);
    currentCity=$('#search').val();
    getCurrentConditions(event);
});


// Render the searched cities
renderCities();

// Get the current conditions
getCurrentConditions();