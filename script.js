/* =========================
   API KEY
========================= */

const apiKey = "462e6670cb58e21c2774f6990c3ab0ed";

/* =========================
   VARIABLES
========================= */

let map = null;
let marker = null;

let currentUnit = localStorage.getItem("unit") || "metric";

let recentCities =
JSON.parse(localStorage.getItem("recentCities")) || [];

let favoriteCities =
JSON.parse(localStorage.getItem("favoriteCities")) || [];

/* =========================
   ELEMENTS
========================= */

const cityInput = document.getElementById("city");

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

const voiceBtn = document.getElementById("voiceBtn");

const favoriteBtn = document.getElementById("favoriteBtn");

const themeBtn = document.getElementById("themeBtn");

const celsiusBtn = document.getElementById("celsiusBtn");

const fahrenheitBtn = document.getElementById("fahrenheitBtn");

/* =========================
   EVENTS
========================= */

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        getWeather();

    }

});

locationBtn.addEventListener("click", getLocationWeather);

favoriteBtn.addEventListener("click", addFavorite);

themeBtn.addEventListener("click", toggleTheme);

celsiusBtn.addEventListener("click",()=>{

    currentUnit="metric";

    localStorage.setItem("unit",currentUnit);

    if(cityInput.value.trim()!==""){

        getWeather();

    }

    updateUnitButtons();

});

fahrenheitBtn.addEventListener("click",()=>{

    currentUnit="imperial";

    localStorage.setItem("unit",currentUnit);

    if(cityInput.value.trim()!==""){

        getWeather();

    }

    updateUnitButtons();

});

/* =========================
   INITIAL LOAD
========================= */

updateUnitButtons();

showRecentSearches();

showFavoriteCities();

const lastCity = localStorage.getItem("lastCity");

if(lastCity){

    cityInput.value = lastCity;

    getWeather();

}

/* =========================
   GET WEATHER
========================= */

async function getWeather(){

    const city = cityInput.value.trim();

    if(city===""){

        alert("Please enter a city name.");

        return;

    }

    document.getElementById("loader").style.display="block";

    document.getElementById("weather").style.display="none";

    document.getElementById("errorBox").style.display="none";

    try{

        const weatherURL =
`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${apiKey}`;

        const forecastURL =
`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${currentUnit}&appid=${apiKey}`;

        const geoURL =
`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;

        const weatherResponse = await fetch(weatherURL);

        const weatherData = await weatherResponse.json();

        if(weatherResponse.status!==200){

            throw new Error("City not found");

        }

        const forecastResponse = await fetch(forecastURL);

        const forecastData = await forecastResponse.json();

        const geoResponse = await fetch(geoURL);

        const geoData = await geoResponse.json();

        if(geoData.length>0){

            const lat = geoData[0].lat;

            const lon = geoData[0].lon;

            const aqiResponse = await fetch(

`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

            );

            const aqiData = await aqiResponse.json();

            showAQI(aqiData);

        }

        updateWeather(weatherData);

        showForecast(forecastData);

        showHourlyForecast(forecastData);

        updateMap(

            weatherData.coord.lat,

            weatherData.coord.lon,

            weatherData.name

        );

        saveRecentCity(city);

        localStorage.setItem("lastCity",city);

    }

    catch(error){

        document.getElementById("errorBox").style.display="block";

        console.error(error);

    }

    finally{

        document.getElementById("loader").style.display="none";

        document.getElementById("weather").style.display="block";

    }

}

/* =========================
   UPDATE WEATHER UI
========================= */

function updateWeather(data){

    document.getElementById("cityName").textContent = data.name;

    document.getElementById("temp").textContent =
        `${Math.round(data.main.temp)}${currentUnit==="metric"?"°C":"°F"}`;

    document.getElementById("condition").textContent =
        data.weather[0].description;

    document.getElementById("humidity").textContent =
        data.main.humidity + "%";

    document.getElementById("wind").textContent =
        data.wind.speed + (currentUnit==="metric"?" km/h":" mph");

    document.getElementById("feelsLike").textContent =
        Math.round(data.main.feels_like) +
        (currentUnit==="metric"?"°C":"°F");

    document.getElementById("visibility").textContent =
        (data.visibility/1000).toFixed(1) + " km";

    document.getElementById("pressure").textContent =
        data.main.pressure + " hPa";

    document.getElementById("sunrise").textContent =
        new Date(data.sys.sunrise*1000).toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });

    document.getElementById("sunset").textContent =
        new Date(data.sys.sunset*1000).toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });

    document.getElementById("icon").src =
`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    document.getElementById("icon").alt =
        data.weather[0].description;
   
   document.getElementById("feelsLike").textContent =
    Math.round(data.main.feels_like) +
    (currentUnit === "metric" ? "°C" : "°F");

    /* Progress Bars */

    document.getElementById("tempProgress").style.width =
        Math.min(Math.abs(data.main.temp),50)*2 + "%";

    document.getElementById("humidityProgress").style.width =
        data.main.humidity + "%";

    document.getElementById("windProgress").style.width =
        Math.min(data.wind.speed,50)*2 + "%";

    /* Background */

    document.body.className="";

    document.body.classList.add(
        data.weather[0].main.toLowerCase()
    );

}

/* =========================
   WEATHER MAP
========================= */

function updateMap(lat, lon, city){

    console.log("updateMap called", lat, lon, city);

    const mapDiv = document.getElementById("weatherMap");

    if(!mapDiv) return;

    if(map === null){

        console.log("Leaflet =", typeof L);

        map = L.map("weatherMap").setView([lat, lon], 10);

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:"© OpenStreetMap",
                maxZoom:19
            }
        ).addTo(map);

    }else{

        map.setView([lat, lon], 10);

        if(marker){

            map.removeLayer(marker);

        }

    }

    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(city)
        .openPopup();

    setTimeout(() => {

        map.invalidateSize();

    },300);

}

/* =========================
   CURRENT LOCATION
========================= */

async function getLocationWeather(){

    if(!navigator.geolocation){

        alert("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async(position)=>{

            const lat = position.coords.latitude;

            const lon = position.coords.longitude;

            try{

                const weatherURL =
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;

                const forecastURL =
`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;

                const weatherResponse =
                    await fetch(weatherURL);

                const weatherData =
                    await weatherResponse.json();

                const forecastResponse =
                    await fetch(forecastURL);

                const forecastData =
                    await forecastResponse.json();

                const aqiResponse =
                    await fetch(
`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
                    );

                const aqiData =
                    await aqiResponse.json();

                updateWeather(weatherData);

                showForecast(forecastData);

                showHourlyForecast(forecastData);

                showAQI(aqiData);

                updateMap(lat, lon, weatherData.name);

            }

            catch(error){

                console.error(error);

                alert("Unable to fetch location weather.");

            }

        },

        ()=>{
            alert("Location permission denied.");

        }

    );
   console.log(data.main.feels_like);
}

/* =========================
   RECENT SEARCHES
========================= */

function saveRecentCity(city){

    if(!recentCities.includes(city)){

        recentCities.unshift(city);

        if(recentCities.length>5){

            recentCities.pop();

        }

        localStorage.setItem(
            "recentCities",
            JSON.stringify(recentCities)
        );

    }

    showRecentSearches();

}

function showRecentSearches(){

    const box=document.getElementById("recentSearches");

    box.innerHTML="";

    recentCities.forEach(city=>{

        box.innerHTML+=`
        <button class="recent-btn"
        onclick="cityInput.value='${city}';getWeather();">
        ${city}
        </button>
        `;

    });

}

/* =========================
   FAVORITES
========================= */

function addFavorite(){

    const city=cityInput.value.trim();

    if(city==="") return;

    if(!favoriteCities.includes(city)){

        favoriteCities.unshift(city);

        localStorage.setItem(
            "favoriteCities",
            JSON.stringify(favoriteCities)
        );

    }

    showFavoriteCities();

}

function showFavoriteCities(){

    const box=document.getElementById("favoriteCities");

    box.innerHTML="";

    favoriteCities.forEach(city=>{

        box.innerHTML+=`
        <button class="favorite-btn"
        onclick="cityInput.value='${city}';getWeather();">
        ⭐ ${city}
        </button>
        `;

    });

}

/* =========================
   AQI
========================= */

function showAQI(data){

    if(!data.list) return;

    const aqi=data.list[0].main.aqi;

    const status={
        1:"🟢 Good",
        2:"🟡 Fair",
        3:"🟠 Moderate",
        4:"🔴 Poor",
        5:"🟣 Very Poor"
    };

    document.getElementById("aqi").textContent=aqi;
    document.getElementById("aqiStatus").textContent=status[aqi];

}

/* =========================
   DARK MODE
========================= */

function toggleTheme(){

    document.body.classList.toggle("dark-mode");

    themeBtn.textContent=
    document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";

}

/* =========================
   VOICE SEARCH
========================= */

const SpeechRecognition=
window.SpeechRecognition||
window.webkitSpeechRecognition;

if(SpeechRecognition){

    const recognition=new SpeechRecognition();

    recognition.lang="en-US";

    recognition.onresult=(event)=>{

        cityInput.value=
        event.results[0][0].transcript;

        getWeather();

    };

    voiceBtn.addEventListener("click",()=>{

        recognition.start();

    });

}else{

    voiceBtn.style.display="none";

}

/* =========================
   AUTO REFRESH
========================= */

setInterval(()=>{

    if(cityInput.value.trim()!==""){

        getWeather();

    }

},300000);
