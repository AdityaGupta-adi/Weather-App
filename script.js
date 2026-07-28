const apiKey = "YOUR_API_KEY";

const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", getWeather);

async function getWeather() {

    const city = document.getElementById("city").value;

    if(city===""){
        alert("Please enter a city name");
        return;
    }

    const url =
`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try{

        const response = await fetch(url);
        const data = await response.json();

        if(data.cod != 200){
            alert("City not found");
            return;
        }

        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temp").innerText = Math.round(data.main.temp)+"°C";
        document.getElementById("condition").innerText = data.weather[0].main;
        document.getElementById("humidity").innerText = data.main.humidity+"%";
        document.getElementById("wind").innerText = data.wind.speed+" km/h";

        document.getElementById("icon").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    }catch(error){
        alert("Something went wrong!");
    }

}
