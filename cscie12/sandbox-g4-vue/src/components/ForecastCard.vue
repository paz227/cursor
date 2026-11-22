<script setup>
import { computed } from 'vue'
import { describeWeather } from '../utils/weatherCodes.js'

const props = defineProps({
  day: {
    type: Object,
    required: true,
  },
})

const weather = computed(() => describeWeather(props.day.code))

const dayName = computed(() => {
  // A date-only string is midnight UTC, which is still the previous
  // evening in the US. Build a local date so the day name is right.
  const [year, month, day] = props.day.date.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
})

const precipText = computed(() => {
  if (props.day.precip == null) return '–'
  return `${Math.round(props.day.precip)}%`
})

function formatTemp(value) {
  return value == null ? '–' : `${value}°F`
}
</script>

<template>
  <article class="card">
    <h2>{{ dayName }}</h2>
    <img class="icon" :src="weather.image" :alt="weather.label" width="64" height="64" />
    <p class="label">{{ weather.label }}</p>
    <p class="temps">
      <span class="high">{{ formatTemp(day.high) }}</span>
      <span class="low">{{ formatTemp(day.low) }}</span>
    </p>
    <p class="precip"><span aria-hidden="true">💧</span> {{ precipText }}</p>
  </article>
</template>

<style scoped>
.card {
  width: 168px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(28, 45, 70, 0.08);
  padding: 1rem 0.75rem;
}

h2 {
  margin: 0;
  font-size: 1.05rem;
}

.icon {
  margin-top: 0.35rem;
}

.label {
  margin: 0.15rem 0 0.75rem;
  color: #5d6b7a;
}

.temps {
  margin: 0;
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  align-items: baseline;
}

.high {
  font-size: 1.25rem;
  font-weight: 700;
}

.low {
  color: #8b97a3;
  font-weight: 600;
}

.precip {
  margin: 0.65rem 0 0;
  color: #607084;
  font-size: 0.9rem;
}
</style>
