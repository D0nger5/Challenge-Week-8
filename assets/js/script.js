// Declare a variable to store the searched city
let city = "";

// Variable declarations
const searchCity = $("#search-input");
const searchButton = $("#search-button");
const historyList = $("#history");
const currentCity = $("#current-city");
const currentTemperature = $("#temperature");
const currentHumidity = $("#humidity");
const currentWSpeed = $("#wind-speed");
const currentUvindex = $("#uv-index");
const forecastContainer = $("#future-weather");

// Searches the city to see if it exists in the entries from the storage
function find(c) {
    return sCity.some(city => c.toUpperCase() === city) ? -1 : 1;
}

// Set up the API key
const APIKey = "5ac1b3a156ecfea3fb7088951cd49b4b";

// Display the current and future weather to the user after grabbing the city from the input text box.
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

// Function for current weather
function currentWeather(city) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${APIKey}`;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        const weatherIcon = response.weather[0].icon;
        const iconURL = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
        const date = dayjs(response.dt * 1000).format('MM/DD/YYYY');
        $(currentCity).html(`${response.name} (${date}) <img src=${iconURL}>`);
        const tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html(`${tempF.toFixed(2)}&#8457`);
        $(currentHumidity).html(`${response.main.humidity}%`);
        const windSpeed = response.wind.speed;
        const windSpeedMPH = (windSpeed * 2.237).toFixed(1);
        $(currentWSpeed).html(`${windSpeedMPH}MPH`);
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod === 200) {
            sCity = JSON.parse(localStorage.getItem("cityname")) || [];
            console.log(sCity);
            if (!sCity.includes(city.toUpperCase())) {
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            }
        }
    });
}

// Function to get UVIndex
function UVIndex(ln, lt) {
    const uvqURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${APIKey}&lat=${lt}&lon=${ln}`;
    $.ajax({
        url: uvqURL,
        method: "GET",
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// Function to display 5 days forecast
function forecast(cityid) {
    const queryForecastURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityid}&appid=${APIKey}`;
    $.ajax({
        url: queryForecastURL,
        method: "GET",
    }).then(function (response) {
        forecastContainer.empty();
        for (let i = 0; i < 5; i++) {
            const date = dayjs(response.list[i * 8].dt * 1000).format('MM/DD/YYYY');
            const iconCode = response.list[i * 8].weather[0].icon;
            const iconURL = `https://openweathermap.org/img/wn/${iconCode}.png`;
            const tempK = response.list[i * 8].main.temp;
            const tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            const humidity = response.list[i * 8].main.humidity;
            const forecastCard = $("<div>").addClass("col-sm-2 bg-primary forecast text-white ml-2 mb-3 p-2 mt-2 rounded");
            forecastCard.html(`
                <p>${date}</p>
                <p><img src=${iconURL}></p>
                <p>Temp:<span>${tempF}&#8457</span></p>
                <p>Humidity:<span>${humidity}%</span></p>
            `);
            forecastContainer.append(forecastCard);
        }
    });
}

// Function to add the parsed city to the search history
function addToList(c) {
    const listEl = $("<li>").text(c.toUpperCase()).addClass("list-group-item").attr("data-value", c.toUpperCase());
    historyList.append(listEl);
}

// Function to display past search again when the list group item is clicked in search history
function invokePastSearch(event) {
    const liEl = event.target;
    if (liEl.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// Render function
function loadlastCity() {
    historyList.empty();
    const sCity = JSON.parse(localStorage.getItem("cityname")) || [];
    for (let i = 0; i < sCity.length; i++) {
        addToList(sCity[i]);
    }
    city = sCity[sCity.length - 1];
    if (city) {
        currentWeather(city);
    }
}

// Function to clear the search history
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    location.reload();
}

// Click Handlers
searchButton.on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click",clearHistory);
