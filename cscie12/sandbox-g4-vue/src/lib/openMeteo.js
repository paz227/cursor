// All Open-Meteo calls live here so the components stay simple.
// App.vue uses this one function for the browser location and the fallback.

export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    timezone: 'auto',
    forecast_days: 5,
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) {
    const body = await response.json()
    throw new Error(body.reason || `Open-Meteo error: ${response.status}`)
  }

  const data = await response.json()

  // daily comes back as parallel arrays, one per variable.
  // Index 0 of every array is the same day.
  return data.daily.time.map((date, i) => ({
    date,
    code: data.daily.weather_code[i],
    high: roundTemp(data.daily.temperature_2m_max[i]),
    low: roundTemp(data.daily.temperature_2m_min[i]),
    precip: data.daily.precipitation_probability_max[i],
  }))
}

function roundTemp(value) {
  return value == null ? null : Math.round(value)
}
