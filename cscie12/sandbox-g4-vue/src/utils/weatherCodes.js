/**
 * Open-Meteo describes the weather with a number called a "WMO weather code"
 * (WMO = World Meteorological Organization). This lookup table turns
 * those numbers into something a human can read.
 *
 * Full list: https://open-meteo.com/en/docs (scroll to "WMO Weather interpretation codes")
 */
const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Freezing fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Freezing drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '🌨️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Rain showers', icon: '🌧️' },
  82: { label: 'Violent rain showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with hail', icon: '⛈️' },
}

// One picture per group, from the course Open-Meteo hints (Meteocons).
const ICON_FILE = {
  clear: 'clear-day',
  'partly-cloudy': 'partly-cloudy-day',
  cloudy: 'overcast',
  fog: 'fog',
  drizzle: 'drizzle',
  rain: 'rain',
  sleet: 'sleet',
  snow: 'snow',
  thunder: 'thunderstorms-rain',
  unknown: 'not-available',
}

/** Turn any WMO code into one of 9 simple groups. */
export function codeToGroup(code) {
  if (code <= 1) return 'clear'
  if (code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 55) return 'drizzle'
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'sleet'
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunder'
  return 'unknown'
}

/** Look up a code, with a safe fallback if we get one we don't know. */
export function describeWeather(code) {
  const found = WEATHER_CODES[code] ?? { label: 'Unknown', icon: '❔' }
  const file = ICON_FILE[codeToGroup(code)]
  return {
    ...found,
    image: `https://cdn.jsdelivr.net/gh/basmilius/weather-icons@v2.0.0/production/fill/all/${file}.svg`,
  }
}
