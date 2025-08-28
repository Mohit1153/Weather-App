const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

currentDateTxt.textContent = getCurrentDate();

const apiKey = '49845116eba878a12ab3140add6f7378';

searchBtn.addEventListener('click', () => {
    if (cityInput.inputValue.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
});

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric&lang=en`;
    const response = await fetch(apiUrl);
    return response.json();
}


function getWeatherIcon(id) {
    console.log(id)
    if (id <= 232) return 'thunderstorm.svg'
    if (id <= 321) return 'drizzle.svg'
    if (id <= 531) return 'rain.svg'
    if (id <= 622) return 'snow.svg'
    if (id <= 781) return 'atmosphere.svg'
    if (id == 800) return 'clear.svg'
    else return 'clouds.svg'
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
}


async function updateWeatherInfo(city) {
   try{
     const weatherData = await getFetchData('weather', city);
    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }
   

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country);

    cityTxt.textContent = name;
    countryTxt.textContent = country
    tempTxt.textContent = Math.round(temp) + ' °C'
    conditionTxt.textContent = main
    humidityValueTxt.textContent = humidity + '%'
    windValueTxt.textContent = Math.round(speed * 3.6) + ' Km/h'
     pressureValueTxt.textContent = pressure + ' hPa';

    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`

     await updateWeatherForecastInfo(city);
        showDisplaySection(weatherInfoSection);
    } catch (error) {
        console.error(error);
        showDisplaySection(notFoundSection);
    }
}

async function updateWeatherForecastInfo(city) {
    const forecastData = await getFetchData('forecast', city);
    forecastItemsContainer.innerHTML = '';

    const dailyForecasts = {};

    forecastData.list.forEach(forecast => {
        const date = forecast.dt_txt.split(' ')[0];
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(forecast);
    });

    const today = new Date().toISOString().split('T')[0];
    delete dailyForecasts[today];

    Object.keys(dailyForecasts).slice(0, 4).forEach(date => {
        const dayForecasts = dailyForecasts[date];
        
        let minTemp = dayForecasts[0].main.temp_min;
        let maxTemp = dayForecasts[0].main.temp_max;

        dayForecasts.forEach(forecast => {
            if (forecast.main.temp_min < minTemp) minTemp = forecast.main.temp_min;
            if (forecast.main.temp_max > maxTemp) maxTemp = forecast.main.temp_max;
        });
        
        const middayForecast = dayForecasts.find(f => f.dt_txt.includes("12:00:00")) || dayForecasts[0];

        forecastItemsContainer.innerHTML += createForecastItem(middayForecast, maxTemp, minTemp);
    });
}

function createForecastItem(weatherData, maxTemp, minTemp) {
    const {
        dt_txt: date,
        weather: [{ id }],
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOptions);

    return `
    <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
        <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" alt="Weather icon">
        <div class="forecast-item-temps">
            <span class="forecast-item-temp-high">${Math.round(maxTemp)}°C</span>
            <span class="forecast-item-temp-low">${Math.round(minTemp)}°C</span>
        </div>
    </div>
    `;
}
   
function showDisplaySection(section) {
    [weatherInfoSection, notFoundSection, searchCitySection].forEach(section => 
        section.style.display = 'none');

    section.style.display = 'flex';
}