const apiKey = "462e6670cb58e21c2774f6990c3ab0ed";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("city");
const locationBtn = document.getElementById("locationBtn");
searchBtn.addEventListener("click", getWeather);
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
        document.getElementById("icon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    });

});

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) {
            alert(data.message || "City not found.");
            return;
        }

        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById("condition").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("wind").textContent = `${data.wind.speed} km/h`;

        document.getElementById("icon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        document.getElementById("icon").alt = data.weather[0].description;

    } catch (error) {
        alert("Unable to fetch weather data. Please check your internet connection.");
        console.error(error);
    }
}
