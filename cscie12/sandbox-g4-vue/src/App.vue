<script setup>
import { onMounted, ref } from 'vue'
import ForecastCard from './components/ForecastCard.vue'

// Boston, the location in the course Open-Meteo example.
// Used when the browser cannot share a location.
const FALLBACK = {
  label: 'Boston (42.37, -71.12)',
  latitude: 42.37,
  longitude: -71.12,
}

const days = ref([])
const placeLabel = ref('')
const statusMessage = ref('Finding a location…')
const errorMessage = ref('')

onMounted(() => {
  if (!navigator.geolocation) {
    loadForecast(FALLBACK.latitude, FALLBACK.longitude, FALLBACK.label)
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords
      const label = `Your location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
      loadForecast(latitude, longitude, label)
    },
    () => {
      loadForecast(FALLBACK.latitude, FALLBACK.longitude, FALLBACK.label)
    },
    { timeout: 10000 },
  )
})

async function loadForecast(latitude, longitude, label) {
  placeLabel.value = label
  statusMessage.value = 'Loading the forecast…'
  errorMessage.value = ''
  days.value = []

  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    timezone: 'auto',
    forecast_days: 5,
  })

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!response.ok) {
      const body = await response.json()
      throw new Error(body.reason || 'Weather request failed')
    }
    const data = await response.json()
    // daily comes back as parallel arrays, one per variable.
    // Index 0 of every array is the same day.
    days.value = data.daily.time.map((date, i) => ({
      date,
      code: data.daily.weather_code[i],
      high: roundTemp(data.daily.temperature_2m_max[i]),
      low: roundTemp(data.daily.temperature_2m_min[i]),
      precip: data.daily.precipitation_probability_max[i],
    }))
    statusMessage.value = ''
  } catch (err) {
    statusMessage.value = ''
    errorMessage.value = err.message
  }
}

function roundTemp(value) {
  return value == null ? null : Math.round(value)
}
</script>

<template>
  <div class="page">
    <header>
      <h1>5-Day Forecast</h1>
      <p v-if="placeLabel" class="place">{{ placeLabel }}</p>
    </header>

    <main>
      <p v-if="statusMessage" class="status">{{ statusMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <ul v-if="days.length" class="cards">
        <li v-for="day in days" :key="day.date">
          <ForecastCard :day="day" />
        </li>
      </ul>
    </main>

    <footer>
      <p>
        CSCI E-12 | Weather data by
        <a href="https://open-meteo.com/">Open-Meteo.com</a>
      </p>
    </footer>
  </div>
</template>

<style>
/* put global styles here */
body {
  margin: 0;
  font-family: helvetica, sans-serif;
  background: #eef2f6;
  color: #1c2834;
}
</style>

<style scoped>
.page {
  max-width: 980px;
  margin: 0 auto;
  padding: 3.25rem 1rem 2.5rem;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 2.15rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.place {
  margin: 0.55rem 0 0;
  font-size: 1.2rem;
  color: #3e4c5c;
}

.status,
.error {
  margin: 2rem 0 0;
}

.error {
  color: #9b2c2c;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  list-style: none;
  margin: 2.25rem 0 0;
  padding: 0;
}

.cards li {
  width: 168px;
}

footer {
  margin-top: 2.75rem;
  color: #5c6b7a;
  font-size: 0.98rem;
}

footer a {
  color: #1d4e89;
}
</style>
