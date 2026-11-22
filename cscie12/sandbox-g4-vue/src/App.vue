<script setup>
import { onMounted, ref } from 'vue'
import ForecastCard from './components/ForecastCard.vue'
import { getForecast } from './lib/openMeteo.js'

// A named place, used when the browser cannot share a location.
// Same coordinates style as the class "near me" example.
const FALLBACK = {
  name: 'Harvard Yard',
  latitude: 42.3744665,
  longitude: -71.1172096,
}

const days = ref([])
const placeLabel = ref('')
const statusMessage = ref('Finding a location…')
const errorMessage = ref('')

let settled = false

onMounted(() => {
  // Our own timer. The timeout option on getCurrentPosition does not
  // count time spent waiting on the permission prompt.
  const timer = setTimeout(() => {
    showForecast(FALLBACK.latitude, FALLBACK.longitude, FALLBACK.name)
  }, 10000)

  if (!navigator.geolocation) {
    clearTimeout(timer)
    showForecast(FALLBACK.latitude, FALLBACK.longitude, FALLBACK.name)
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      clearTimeout(timer)
      const { latitude, longitude } = pos.coords
      const label = `Your location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
      showForecast(latitude, longitude, label)
    },
    () => {
      clearTimeout(timer)
      showForecast(FALLBACK.latitude, FALLBACK.longitude, FALLBACK.name)
    },
  )
})

function showForecast(latitude, longitude, label) {
  if (settled) return
  settled = true
  loadForecast(latitude, longitude, label)
}

async function loadForecast(latitude, longitude, label) {
  placeLabel.value = label
  statusMessage.value = 'Loading the forecast…'
  errorMessage.value = ''
  days.value = []

  try {
    days.value = await getForecast(latitude, longitude)
    statusMessage.value = ''
  } catch (err) {
    statusMessage.value = ''
    errorMessage.value = err.message
  }
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
      <div v-if="days.length" class="days">
        <ForecastCard v-for="day in days" :key="day.date" :day="day" />
      </div>
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
  font-family: system-ui, sans-serif;
  background: #eef2f6;
  color: #1c2834;
}
</style>

<style scoped>
.page {
  max-width: 980px;
  margin: 0 auto;
  padding: 3rem 1rem 2.5rem;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.place {
  margin: 0.5rem 0 0;
  font-size: 1.15rem;
}

.status,
.error {
  margin: 2rem 0 0;
}

.error {
  color: #9b2c2c;
}

.days {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

footer {
  margin-top: 2.5rem;
  color: #5c6b7a;
}

footer a {
  color: #1d4e89;
}
</style>
