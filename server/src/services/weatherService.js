import { env } from "../config/env.js"
import { WeatherSnapshot } from "../models/WeatherSnapshot.js"

const provider = "open-meteo"

export async function getFarmWeather(farm) {
  const now = new Date()
  const cached = await WeatherSnapshot.findOne({
    farmId: farm._id,
    "coordinates.latitude": farm.coordinates.latitude,
    "coordinates.longitude": farm.coordinates.longitude,
    expiresAt: { $gt: now },
  }).sort({ fetchedAt: -1 })
  if (cached) return { ...cached.payload, cached: true }

  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.search = new URLSearchParams({
    latitude: String(farm.coordinates.latitude),
    longitude: String(farm.coordinates.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,precipitation,relative_humidity_2m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    timezone: farm.timezone || "auto",
    forecast_days: "7",
  }).toString()

  const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!response.ok) {
    const error = new Error(`Weather provider returned ${response.status}.`)
    error.status = 502
    error.code = "WEATHER_PROVIDER_ERROR"
    throw error
  }
  const raw = await response.json()
  const fetchedAt = new Date()
  const payload = {
    source: provider,
    coordinates: farm.coordinates,
    timezone: raw.timezone,
    current: raw.current,
    hourly: raw.hourly,
    daily: raw.daily,
    units: { current: raw.current_units, hourly: raw.hourly_units, daily: raw.daily_units },
    timestamps: {
      observedAt: raw.current?.time ? new Date(raw.current.time) : null,
      fetchedAt,
      validUntil: new Date(fetchedAt.getTime() + env.WEATHER_CACHE_MINUTES * 60_000),
    },
    cached: false,
  }
  await WeatherSnapshot.create({
    farmId: farm._id,
    provider,
    coordinates: farm.coordinates,
    payload,
    observedAt: payload.timestamps.observedAt,
    fetchedAt,
    expiresAt: payload.timestamps.validUntil,
  })
  return payload
}
