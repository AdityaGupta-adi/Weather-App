const apiKey = "462e6670cb58e21c2774f6990c3ab0ed";
let map;
let marker;
let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("city");
const locationBtn = document.getElementById("locationBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

let currentUnit = localStorage.getItem("unit") || "metric";
searchBtn.addEventListener("click", getWeather);
celsiusBtn.addEventListener("click", () => {

    currentUnit = "metric";
    localStorage.setItem("unit", currentUnit);

    if (cityInput.value.trim() !== "") {
        getWeather();
    }

    updateUnitButtons();

});

fahrenheitBtn.addEventListener("click", () => {

    currentUnit = "imperial";
    localStorage.setItem("unit", currentUnit);

    if (cityInput.value.trim() !== "") {
        getWeather();
    }

    updateUnitButtons();

});

favoriteBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") return;

    if (!favoriteCities.includes(city)) {

        favoriteCities.unshift(city);

        localStorage.setItem(
            "favoriteCities",
            JSON.stringify(favoriteCities)
        );

        showFavoriteCities();
    }

});

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temp").textContent =Math.round(data.main.temp) +(currentUnit === "metric" ? "°C" : "°F");
        document.getElementById("condition").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = data.main.humidity + "%";
        document.getElementById("wind").textContent = data.wind.speed + " km/h";
        document.getElementById("feelsLike").textContent =
    Math.round(data.main.feels_like) +
    (currentUnit === "metric" ? "°C" : "°F");

document.getElementById("visibility").textContent =
(data.visibility / 1000) + " km";

document.getElementById("pressure").textContent =
data.main.pressure + " hPa";

document.getElementById("sunrise").textContent =
new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});

document.getElementById("sunset").textContent =
new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});
        document.getElementById("icon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
document.body.className = "";

document.body.className = "";

const weatherMain = data.weather[0].main.toLowerCase();

document.body.classList.add(weatherMain);
    });

});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {

    const city = cityInput.value.trim();
    document.getElementById("loader").style.display="block";
    document.getElementById("weather").style.display="none";

    if (city === "") {
        alert("Please enter a city name.");
        document.getElementById("loader").style.display = "none";
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${apiKey}`;
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${apiKey}`;
    try {

        const response = await fetch(url);
        const data = await response.json();
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

if (geoData.length > 0) {

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    const aqiResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    const aqiData = await aqiResponse.json();

    showAQI(aqiData);

}

        if (response.status !== 200) {

    document.getElementById("loader").style.display = "none";
    document.getElementById("weather").style.display = "block";
    document.getElementById("errorBox").style.display = "block";

    return;
        }

        document.getElementById("cityName").textContent = data.name;
        
        updateMap(data.coord.lat, data.coord.lon, data.name);
        console.log("Map Updated");
        document.getElementById("temp").textContent =`${Math.round(data.main.temp)}${currentUnit === "metric" ? "°C" : "°F"}`;
        document.getElementById("condition").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
        document.getElementById("tempProgress").style.width = Math.min(Math.round(data.main.temp), 50) * 2 + "%";

        document.getElementById("humidityProgress").style.width = data.main.humidity + "%";
        document.getElementById("windProgress").style.width = Math.min(Math.round(data.wind.speed), 50) * 2 + "%";
        document.getElementById("feelsLike").textContent = Math.round(data.main.feels_like) + (currentUnit === "metric" ? "°C" : "°F");
        

document.getElementById("visibility").textContent =
(data.visibility / 1000) + " km";

document.getElementById("pressure").textContent =
data.main.pressure + " hPa";

document.getElementById("sunrise").textContent =
new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});

document.getElementById("sunset").textContent =
new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});

document.getElementById("icon").src =`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

document.getElementById("icon").alt = data.weather[0].description;
document.body.className = "";

const weatherMain = data.weather[0].main.toLowerCase();

document.body.classList.add(weatherMain);
document.getElementById("loader").style.display = "none";
document.getElementById("weather").style.display = "block";
document.getElementById("errorBox").style.display = "none";
        if (!recentCities.includes(city)) {
    recentCities.unshift(city);

    if (recentCities.length > 5) {
        recentCities.pop();
    }

    localStorage.setItem("recentCities", JSON.stringify(recentCities));
}

showRecentSearches(); 
localStorage.setItem("lastCity", city);

showForecast(forecastData);

showHourlyForecast(forecastData);
        
    } catch (error) {
        document.getElementById("loader").style.display = "none";
        document.getElementById("weather").style.display = "block";
        alert("Unable to fetch weather data. Please check your internet connection.");
        console.error(error);
    }
}

function showRecentSearches() {

    const box = document.getElementById("recentSearches");

    box.innerHTML = "";

    recentCities.forEach(city => {

        box.innerHTML += `
        <button class="recent-btn"
        onclick="cityInput.value='${city}';getWeather();">
        ${city}
        </button>
        `;

    });

}

showRecentSearches();

function showFavoriteCities() {

    const box = document.getElementById("favoriteCities");

    box.innerHTML = "";

    favoriteCities.forEach(city => {

        box.innerHTML += `
        <div class="favorite-item">
            <button class="favorite-btn"
            onclick="cityInput.value='${city}';getWeather();">
                ⭐ ${city}
            </button>

            <button class="delete-btn"
            onclick="deleteFavorite('${city}')">
                ❌
            </button>
        </div>
        `;

    });

}

showFavoriteCities();

function deleteFavorite(city){

    favoriteCities = favoriteCities.filter(c => c !== city);

    localStorage.setItem(
        "favoriteCities",
        JSON.stringify(favoriteCities)
    );

    showFavoriteCities();
}

const lastCity = localStorage.getItem("lastCity");

if(lastCity){

    cityInput.value = lastCity;

    getWeather();

}

function showForecast(forecastData) {

    const forecastBox = document.getElementById("forecast");

    forecastBox.innerHTML = "";

    const dailyForecast = forecastData.list.filter(item =>
    item.dt_txt.includes("12:00:00")
    );

    dailyForecast.slice(0, 5).forEach(day => {

        const date = new Date(day.dt_txt);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        forecastBox.innerHTML += `
        <div class="forecast-card">
            <h3>${dayName}</h3>

            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

            <p>
${Math.round(day.main.temp)}
${currentUnit === "metric" ? "°C" : "°F"}
</p>

            <p>${day.weather[0].main}</p>
        </div>
        `;

    });

}

function showHourlyForecast(forecastData) {

    const hourlyBox = document.getElementById("hourlyForecast");

    hourlyBox.innerHTML = "";

    forecastData.list.slice(0, 8).forEach(item => {

        const time = new Date(item.dt_txt)
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        hourlyBox.innerHTML += `
        <div class="hourly-card">
            <h4>${time}</h4>

            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png">

            <p>
                ${Math.round(item.main.temp)}
                ${currentUnit === "metric" ? "°C" : "°F"}
            </p>

            <small>${item.weather[0].main}</small>
        </div>
        `;
    });

}

function showAQI(aqiData){

    if(!aqiData || !aqiData.list || aqiData.list.length === 0){
        document.getElementById("aqi").textContent = "--";
        document.getElementById("aqiStatus").textContent = "--";
        return;
    }

    const aqi = aqiData.list[0].main.aqi;

    const status = {
        1:"🟢 Good",
        2:"🟡 Fair",
        3:"🟠 Moderate",
        4:"🔴 Poor",
        5:"🟣 Very Poor"
    };

    document.getElementById("aqi").textContent = aqi;
    document.getElementById("aqiStatus").textContent = status[aqi] || "--";
}

function updateUnitButtons() {

    celsiusBtn.style.opacity =
        currentUnit === "metric" ? "1" : "0.6";

    fahrenheitBtn.style.opacity =
        currentUnit === "imperial" ? "1" : "0.6";

}

updateUnitButtons();

const themeBtn = document.getElementById("themeBtn");
document.body.classList.remove("dark-mode");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        themeBtn.textContent = "☀️ Light Mode";
    }else{
        themeBtn.textContent = "🌙 Dark Mode";
    }
});

const voiceBtn = document.getElementById("voiceBtn");

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        cityInput.value = event.results[0][0].transcript;
        getWeather();
    };

    voiceBtn.addEventListener("click", () => {
        alert("Voice button clicked");

        try {
            recognition.start();
        } catch (e) {
            alert(e.message);
        }
    });

} else {

    alert("Voice Search is not supported on this browser.");
    voiceBtn.style.display = "none";

}
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.log(err));
    });
}

function updateMap(lat, lon, city) {

    const mapDiv = document.getElementById("weatherMap");

    if (!mapDiv) return;

    if (!map) {

        map = L.map("weatherMap").setView([lat, lon], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }).addTo(map);

    } else {

        map.setView([lat, lon], 10);

        if (marker) {
            map.removeLayer(marker);
        }
    }

    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(city)
        .openPopup();

    // Mobile rendering fix
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

console.log("Leaflet:", typeof L);

window.onload = () => {
    const mapDiv = document.getElementById("weatherMap");
    console.log(mapDiv);
};
