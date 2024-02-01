const ICON_MAP = new Map()

addMapping([0, 1], "sun")
addMapping([2], "cloud-sun")
addMapping([3], "cloud")
addMapping([45, 48], "smog")
addMapping(
  [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
  "cloud-showers-heavy"
)
addMapping([71, 73, 75, 77, 85, 86], "snowflake")
addMapping([95, 96, 99], "cloud-bolt")

function addMapping(values, icon) {
  values.forEach(value => {
    ICON_MAP.set(value, icon)
  })
}

navigator.geolocation.getCurrentPosition(positionSuccess, positionError);

function getWeather(lat, lon, timezone) {
  const apiUrl =
  "https://api.open-meteo.com/v1/forecast?daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime";

  const queryParams = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      timezone,
  });

  return fetch(`${apiUrl}&${queryParams.toString()}`)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => ({
          current: parseCurrentWeather(data),
      }));
}

function positionSuccess({ coords }) {
  getWeather(
      coords.latitude,
      coords.longitude,
      Intl.DateTimeFormat().resolvedOptions().timeZone
  )
      .then(renderWeather)
      .catch(e => {
          console.error(e);
          alert("Error getting weather.");
      });
}

function renderWeather({ current }) {
  renderCurrentWeather(current) 
}

const currentIcon = document.querySelector("[data-current-icon]")
function renderCurrentWeather(current) {
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

function positionError() {
  alert(
      "There was an error getting your location. Please allow us to use your location and refresh the page."
  );
}

function parseCurrentWeather({ current_weather, daily }) {
  const {
      temperature: currentTemp,
      windspeed: windSpeed,
      weathercode: iconCode,
  } = current_weather;
  const {
      temperature_2m_max: [maxTemp],
      temperature_2m_min: [minTemp],
      apparent_temperature_max: [maxFeelsLike],
      apparent_temperature_min: [minFeelsLike],
      precipitation_sum: [precip],
  } = daily;

  return {
      currentTemp: Math.round(currentTemp),
      highTemp: Math.round(maxTemp),
      lowTemp: Math.round(minTemp),
      highFeelsLike: Math.round(maxFeelsLike),
      lowFeelsLike: Math.round(minFeelsLike),
      windSpeed: Math.round(windSpeed),
      precip: Math.round(precip * 100) / 100,
      iconCode,
  };
}
