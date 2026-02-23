
const API_KEY = "YOUR_API_KEY";


const BASE = "https://api.openweathermap.org/data/2.5";

const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("icon");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const forecastEl = document.getElementById("forecast");
const dashboard = document.getElementById("dashboard");

function search(){
    const city = document.getElementById("cityInput").value.trim();
    if(city) loadWeather(city);
}

async function loadWeather(city){
    try{
        const w = await fetch(`${BASE}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if(!w.ok) throw new Error("City not found");
        const weather = await w.json();

        const f = await fetch(`${BASE}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecast = await f.json();

        updateCurrent(weather);
        updateForecast(forecast);
    }catch(e){
        dashboard.innerHTML = `<div class="error">${e.message}</div>`;
    }
}

function updateCurrent(d){
    locationEl.textContent = `${d.name}, ${d.sys.country}`;
    tempEl.textContent = `${Math.round(d.main.temp)}°C`;
    descEl.textContent = d.weather[0].description;
    iconEl.className = "fas " + mapIcon(d.weather[0].icon);
    feelsEl.textContent = `${Math.round(d.main.feels_like)}°C`;
    humidityEl.textContent = `${d.main.humidity}%`;
    windEl.textContent = `${Math.round(d.wind.speed * 3.6)} km/h`;
    pressureEl.textContent = `${d.main.pressure} hPa`;
}

function updateForecast(d){
    forecastEl.innerHTML = "";
    const days = {};

    d.list.forEach(i=>{
        const date = new Date(i.dt*1000).toDateString();
        if(!days[date]) days[date]=i;
    });

    Object.values(days).slice(1,6).forEach(i=>{
        const day = new Date(i.dt*1000).toLocaleDateString("en",{weekday:"short"});
        forecastEl.innerHTML += `
        <div class="forecast-card">
            <b>${day}</b><br>
            <i class="fas ${mapIcon(i.weather[0].icon)}"></i><br>
            ${Math.round(i.main.temp_max)}° / ${Math.round(i.main.temp_min)}°
        </div>`;
    });
}

function mapIcon(code){
    const m={
        "01d":"fa-sun","01n":"fa-moon",
        "02d":"fa-cloud-sun","02n":"fa-cloud-moon",
        "03d":"fa-cloud","03n":"fa-cloud",
        "04d":"fa-cloud","04n":"fa-cloud",
        "09d":"fa-cloud-showers-heavy","09n":"fa-cloud-showers-heavy",
        "10d":"fa-cloud-rain","10n":"fa-cloud-rain",
        "11d":"fa-bolt","11n":"fa-bolt",
        "13d":"fa-snowflake","13n":"fa-snowflake",
        "50d":"fa-smog","50n":"fa-smog"
    };
    return m[code] || "fa-question";
}

// default load
loadWeather("New York");