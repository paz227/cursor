# Open-Meteo Hints & Cheat Sheet

The [Open-Meteo docs](https://open-meteo.com/en/docs) list **hundreds** of options. You only need a handful. This sheet gives you the parts that matter so you can spend your time building, not reading.

- ✅ Free, no API key, no sign-up
- ✅ Works straight from the browser with `fetch()` (no CORS problems)
- ⚠️ Requires credit: put `Weather data by Open-Meteo.com` (linked to https://open-meteo.com/) somewhere on your page

---

## 1. The one URL you need

```
https://api.open-meteo.com/v1/forecast
  ?latitude=42.37
  &longitude=-71.12
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
  &temperature_unit=fahrenheit
  &timezone=auto
  &forecast_days=5
```

> 💡 **Paste the URL into your browser first.** Seeing the real JSON before you write any code saves a lot of guessing. (Firefox and Chrome both format JSON nicely.)

Build it in JavaScript with `URLSearchParams` so you don't have to hand-type `&` and `=`:

```js
const params = new URLSearchParams({
  latitude: 42.37,
  longitude: -71.12,
  daily: 'weather_code,temperature_2m_max,temperature_2m_min',
  temperature_unit: 'fahrenheit',
  timezone: 'auto',
  forecast_days: 5,
})
const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
const data = await response.json()
```

---

## 2. Parameters worth knowing

| Parameter | What it does | Values |
|---|---|---|
| `latitude`, `longitude` | Where | decimal degrees (required) |
| `daily` | One value **per day** | comma-separated list (see §3) |
| `hourly` | One value **per hour** | comma-separated list (see §3) |
| `current` | Conditions **right now** | comma-separated list (see §3) |
| `temperature_unit` | °F or °C | `fahrenheit` or `celsius` (**default is celsius!**) |
| `wind_speed_unit` | Wind units | `mph`, `kmh` (default), `ms`, `kn` |
| `precipitation_unit` | Rain/snow amounts | `inch` or `mm` (default) |
| `timezone` | Which clock times use | **always use `auto`** (see Gotcha #3) |
| `forecast_days` | How far ahead | `1`–`16` (default `7`) |

You can ask for `current`, `hourly`, and `daily` in the **same request**.

But for this work, you'll only need `daily`
---

## 3. Variables you'll actually use

Copy the names exactly. They're easy to typo (`temperature_2m`, not `temperature`).

### `daily=` (good for a multi-day forecast)

| Variable | Meaning | Example |
|---|---|---|
| `weather_code` | Overall conditions for the day (see §5) | `61` |
| `temperature_2m_max` / `temperature_2m_min` | High / low | `52.1` |
| `apparent_temperature_max` / `_min` | "Feels like" high / low | `47.0` |
| `precipitation_probability_max` | Highest chance of rain/snow that day, % | `80` |
| `precipitation_sum` | Total rain + snow | `0.42` |
| `sunrise` / `sunset` | Local time as a string | `"2026-11-13T06:33"` |
| `uv_index_max` | UV index | `3.5` |
| `wind_speed_10m_max` | Max wind speed | `14.2` |
| `wind_direction_10m_dominant` | Wind direction in degrees (0 = from North) | `270` |

### `current=` (good for a "right now" header)

| Variable | Meaning |
|---|---|
| `temperature_2m` | Temperature now |
| `apparent_temperature` | Feels like |
| `weather_code` | Conditions now |
| `is_day` | `1` = daytime, `0` = night (great for picking a sun vs. moon icon!) |
| `relative_humidity_2m` | Humidity % |
| `wind_speed_10m` | Wind speed |
| `precipitation` | Precipitation in the last 15 min |

### `hourly=` (good for a chart or an hour-by-hour strip)

Same names as `current`, plus `precipitation_probability`. You get **24 values per day**, so 5 days = 120 values.

> ℹ️ "`_2m`" means "measured 2 meters above the ground" and "`_10m`" means 10 meters. That's just where weather stations measure. You can ignore it; just remember to type it.

---

## 4. Understanding the response shape (the confusing part!)

`current` is a plain object, so it's easy:

```json
"current": { "time": "2026-11-13T17:30", "temperature_2m": 38.1, "weather_code": 3, "is_day": 0 }
```

```js
data.current.temperature_2m   // 38.1
```

But `daily` and `hourly` come back as **parallel arrays**: one array per variable, **not** one object per day:

```json
"daily": {
  "time":               ["2026-11-13", "2026-11-14", "2026-11-15"],
  "weather_code":       [75,           3,            0],
  "temperature_2m_max": [45.4,         42.9,         48.3],
  "temperature_2m_min": [33.1,         31.9,         32.4]
}
```

Read it **down a column**: index `0` of every array is the same day. So on Nov 13 the code was `75`, the high `45.4`, and the low `33.1`.

That's awkward to `v-for` over, so **restructure it into an array of objects first**:

```js
const days = data.daily.time.map((date, i) => ({
  date,
  code: data.daily.weather_code[i],
  high: Math.round(data.daily.temperature_2m_max[i]),
  low: Math.round(data.daily.temperature_2m_min[i]),
}))
// → [{ date: '2026-11-13', code: 75, high: 45, low: 33 }, ...]
```

Now `<Card v-for="day in days" :key="day.date" :day="day" />` just works.

The units come back too, in `daily_units` / `current_units`, if you want to show them:

```js
data.daily_units.temperature_2m_max   // "°F"
```

---

## 5. Weather codes → words and pictures

Open-Meteo **doesn't send icons or descriptions.** It sends a number called a **WMO weather code**, and it's up to you to turn that into something a person can understand.

### 5a. The full code table

| Code | Meaning | Emoji | Group |
|---|---|---|---|
| 0 | Clear sky | ☀️ | clear |
| 1 | Mainly clear | 🌤️ | clear |
| 2 | Partly cloudy | ⛅ | partly-cloudy |
| 3 | Overcast | ☁️ | cloudy |
| 45 | Fog | 🌫️ | fog |
| 48 | Freezing (rime) fog | 🌫️ | fog |
| 51 / 53 / 55 | Drizzle: light / moderate / dense | 🌦️ | drizzle |
| 56 / 57 | Freezing drizzle: light / dense | 🌧️ | sleet |
| 61 / 63 / 65 | Rain: slight / moderate / heavy | 🌧️ | rain |
| 66 / 67 | Freezing rain: light / heavy | 🌧️ | sleet |
| 71 / 73 / 75 | Snow: slight / moderate / heavy | 🌨️ | snow |
| 77 | Snow grains | 🌨️ | snow |
| 80 / 81 / 82 | Rain showers: slight / moderate / violent | 🌦️ | rain |
| 85 / 86 | Snow showers: slight / heavy | 🌨️ | snow |
| 95 | Thunderstorm | ⛈️ | thunder |
| 96 / 99 | Thunderstorm with slight / heavy hail | ⛈️ | thunder |

**There are no other codes.** Numbers like 4–44 are never returned.

### 5b. Tip: map codes to a *group* first, then to an image

There are 28 codes but only about 9 different *pictures* you'd want to draw. Turn a code into a group name first, and then each group gets one image. You'll have far fewer images to find.

```js
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
```

### 5c. Option A: emoji (zero setup)

```js
const EMOJI = {
  clear: '☀️', 'partly-cloudy': '⛅', cloudy: '☁️', fog: '🌫️',
  drizzle: '🌦️', rain: '🌧️', sleet: '🌧️', snow: '🌨️', thunder: '⛈️', unknown: '❔',
}
```

```vue
<span class="icon">{{ EMOJI[codeToGroup(day.code)] }}</span>
```

Make them big with CSS (`font-size: 3rem`). Emoji look slightly different on Mac, Windows, and phones.

### 5d. Option B: free SVG icons (looks more polished)

[**Meteocons**](https://github.com/basmilius/weather-icons) by Bas Milius are free (MIT license), animated, and load directly from a CDN with no install step. This map turns each group into a Meteocons file name:

```js
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

export function iconUrl(code) {
  const file = ICON_FILE[codeToGroup(code)]
  return `https://cdn.jsdelivr.net/gh/basmilius/weather-icons@v2.0.0/production/fill/all/${file}.svg`
}
```

```vue
<img :src="iconUrl(day.code)" :alt="label" width="64" height="64" />
```

**Night icons:** if you use `current=` or `hourly=` data, you also get `is_day`. When it's `0`, use `clear-night` instead of `clear-day`, and `partly-cloudy-night` instead of `partly-cloudy-day`. (Daily forecasts don't have `is_day`. Just use the day icons.)

---

## 6. Gotchas that trip everyone up

### Gotcha #1: The default units are metric
If your temperatures look way too cold, you forgot `temperature_unit=fahrenheit`. Wind defaults to km/h and rain to millimeters as well.

That's only a gotcha for people who prefer imperial units

### Gotcha #2: Dates come back one day early
```js
new Date('2026-11-13')   // ❌ Thu Nov 12, 7:00 PM (in Boston)!
```
JavaScript reads a date-only string as midnight **UTC**, which in the US is still the previous evening. So your "Friday" card says "Thursday." Fix:

```js
const [y, m, d] = '2026-11-13'.split('-').map(Number)
const date = new Date(y, m - 1, d)  // ✅ local midnight. Note: months are 0-based!
date.toLocaleDateString(undefined, { weekday: 'long' })  // "Friday"
```

### Gotcha #3: Forgetting `timezone=auto`
Without it, all times are in GMT. Days split at the wrong hour, and sunrise shows as something like 11:33 AM. With `timezone=auto` you get the **location's** local time, so San Francisco shows San Francisco time even if you're in Boston.

### Gotcha #4: `fetch()` doesn't throw on bad requests
A typo in a variable name returns **HTTP 400**, but `fetch` still "succeeds." Always check:

```js
if (!response.ok) {
  const body = await response.json()
  throw new Error(body.reason)  // e.g. "Latitude must be in range of -90 to 90°. Given: 999.0."
}
```
The `reason` message is usually very helpful. Show it or `console.log` it.

### Gotcha #5: Temperatures have decimals
`45.4°` looks odd in a UI. Use `Math.round()`.

### Gotcha #6: Values can be `null`
Some variables (especially `precipitation_probability_max` far into the future) can be `null`. Guard with `?? '–'` when displaying.

### Gotcha #7: The daily `weather_code` is the *worst* weather of the day
If it showers for one hour and is sunny for the rest, the daily code still says rain. That's expected, not a bug.

---

## 7. Bonus: let users search for a city

Open-Meteo has a free **geocoding** API that turns a city name into coordinates:

```
https://geocoding-api.open-meteo.com/v1/search?name=Boise&count=5&language=en&format=json
```

```json
{
  "results": [
    { "name": "Boise", "latitude": 43.6135, "longitude": -116.20345,
      "admin1": "Idaho", "country": "United States", "timezone": "America/Boise" }
  ]
}
```

⚠️ **If nothing matches, there is no `results` key at all.** It isn't an empty array. Guard it:

```js
const places = data.results ?? []
```

Show `` `${place.name}, ${place.admin1}` `` so users can tell Portland, OR from Portland, ME.

---

## 8. Bonus: getting the user's location

```js
navigator.geolocation.getCurrentPosition(
  (pos) => loadForecast(pos.coords.latitude, pos.coords.longitude), // success
  (err) => console.warn('Location denied or failed:', err.message),  // failure
  { timeout: 10000 },
)
```

- It uses **callbacks**, not a Promise, so you can't `await` it directly.
- The user can click **Block**. Always have a fallback (a default city or some buttons).
- It only works on `https://` or `localhost`. `npm run dev` is fine.

---

## 9. Quick debugging checklist

1. Paste your exact URL into the browser. Is the JSON what you expected?
2. Open DevTools → **Network** tab → click the request → **Response**.
3. `console.log(data)` right after `response.json()`.
4. Is the variable name spelled *exactly* like the docs (`temperature_2m_max`)?
5. Did you request it? Data only comes back for variables you list in `daily=` / `hourly=` / `current=`.
