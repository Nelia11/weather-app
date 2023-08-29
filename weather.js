import { openWeatherKey, googleMapsKey } from "../secret.js";

const inputTag = document.getElementById("cityInput");
const locationBtn = document.getElementById("geolocation");
const formTag = document.getElementById("search-form");

const script = document.getElementById("weatherScript");
script.setAttribute("async", "");
script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&callback=initMap`;

let map;

const locationData = document.getElementById("location");
const temperatureData = document.getElementById("temperature");
const iconDiv = document.getElementById("image");
const iconData = document.createElement("img")
iconDiv.appendChild(iconData);
const windData = document.getElementById("wind-speed");
const cloudinessData = document.getElementById("cloudiness");
const sunriseData = document.getElementById("sunrise");
const sunsetData = document.getElementById("sunset");

window.initMap = function() {}

function initializeMap(lat, lng) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom: 10,
    language: "en",
  });
}

const getCoordinatesByCityName = async(cityName) => {
    try {
        const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${openWeatherKey}`);
        const data = await res.json();
        return {
            name: data[0].name,
            country: data[0].country,
            lat: data[0].lat,
            lon: data[0].lon,
        };
    } catch(e) {
        console.log(e);
    }
}

async function weather(coord) {
    try {
        const lat = coord.lat;
        const lon = coord.lon;
        const units = "metric";
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=${units}`);
        const data = await res.json();
        return {
            name: data.name,
            temp: data.main.temp,
            icon: data.weather[0].icon,
            wind: data.wind.speed,
            cloudiness: data.weather[0].description,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
        };
    } catch(e) {
        console.log(e);
    }
}

const getWeatherByInput = async(cityName) => {
    try {
        const coord = await getCoordinatesByCityName(cityName);
        const data = await weather(coord);
        return data;
    } catch(e) {
        console.log(e);
    }
}

formTag.addEventListener("submit", renderForecastByInput);

async function renderForecastByInput(event) {
    try{
        event.preventDefault();
        const geoData = await getCoordinatesByCityName(inputTag.value)
        const data = await getWeatherByInput(inputTag.value);
        locationData.innerText = geoData.name;
        initializeMap(geoData.lat, geoData.lon);
        renderData(data);
    } catch(err) {
        console.log(err);
    }
}

locationBtn.addEventListener("click", renderForecastMyLocation);

async function renderForecastMyLocation() {
    try {
        const position = await getCurrentPosition();
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const data = await weather({lat, lon});
        locationData.innerText = `My location: ${data.name}`;
        renderData(data);
        initializeMap(lat, lon);
    } catch (err) {
        console.log(err);
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

function renderData(data) {

    const central = document.getElementById("center");
    const noData = document.getElementById("no-data");
    (!!noData && noData.innerText === "No weather data") && central.removeChild(noData);

    temperatureData.innerText = data.temp.toFixed(0) + "°C";

    const iconId = data.icon;
    iconData.src = `./icons/${iconId}.png`;

    windData.innerText = `Wind: ${data.wind.toFixed(0)} m/s`;
    cloudinessData.innerText = data.cloudiness;

    const sunriseTimestamp = data.sunrise;
    const sunriseDate = new Date(sunriseTimestamp * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    sunriseData.innerText = `Sunrise: ${sunriseDate}`;

    const sunsetTimestamp = data.sunset;
    const sunsetDate = new Date(sunsetTimestamp * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });;
    sunsetData.innerText = `Sunset: ${sunsetDate}`;
}