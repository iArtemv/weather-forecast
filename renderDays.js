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
  "https://api.open-meteo.com/v1/forecast?daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime";

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
          daily: parseDailyWeather(data),
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

function renderWeather({ daily }) {
  renderDailyWeather(daily)
}

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily) {
  dailySection.innerHTML = ""
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)
    setValue("temp", day.maxTemp, { parent: element })
    setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
    dailySection.append(element)
  })
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

function parseDailyWeather({ daily }) {
  return daily.time.map((time, index) => ({
      timestamp: time * 1000,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index]),
  }));
}
