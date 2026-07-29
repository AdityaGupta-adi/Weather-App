const apiKey = "462e6670cb58e21c2774f6990c3ab0ed";
let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
let favoriteCities = JSON.parse(localStorage.getItem("favoriteCities")) || [];
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("city");
const locationBtn = document.getElementById("locationBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
searchBtn.addEventListener("click", getWeather);
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

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temp").textContent = Math.round(data.main.temp) + "°C";
        document.getElementById("condition").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = data.main.humidity + "%";
        document.getElementById("wind").textContent = data.wind.speed + " km/h";
        document.getElementById("feelsLike").textContent =
Math.round(data.main.feels_like) + "°C";

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

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) {

    document.getElementById("loader").style.display = "none";
    document.getElementById("weather").style.display = "block";

    document.getElementById("errorBox").style.display = "block";

    return;
        }

        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById("condition").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
        document.getElementById("feelsLike").textContent =
Math.round(data.main.feels_like) + "°C";

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
