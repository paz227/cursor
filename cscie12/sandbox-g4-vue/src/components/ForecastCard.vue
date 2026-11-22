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

const precipText = computed(() => {
  if (props.day.precip == null) return '–'
  return `${Math.round(props.day.precip)}%`
})

// A date-only string is midnight UTC, which is still the previous evening
// in the US. Build a local date so "Friday" does not display as "Thursday".
function formatDay(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTemp(value) {
  return value == null ? '–' : `${value}°`
}
</script>

<template>
  <article class="card">
    <h2>{{ formatDay(day.date) }}</h2>
    <p class="icon" aria-hidden="true">{{ weather.icon }}</p>
    <p class="label">{{ weather.label }}</p>
    <p class="temps">
      <span class="high">{{ formatTemp(day.high) }}</span>
      <span class="low">{{ formatTemp(day.low) }}</span>
    </p>
    <p class="precip">
      <span aria-hidden="true">💧</span>
      {{ precipText }}
    </p>
  </article>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(28, 45, 70, 0.08);
  padding: 1.15rem 0.6rem 1rem;
}

h2 {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
}

.icon {
  margin: 0.35rem 0 0.15rem;
  font-size: 2.8rem;
  line-height: 1.1;
}

.label {
  margin: 0.15rem 0 0.85rem;
  color: #5d6b7a;
}

.temps {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.45rem;
}

.high {
  font-size: 1.35rem;
  font-weight: 700;
}

.low {
  color: #9aa3ad;
  font-size: 1.05rem;
  font-weight: 600;
}

.precip {
  margin: 0.7rem 0 0;
  color: #607084;
  font-size: 0.98rem;
}
</style>
