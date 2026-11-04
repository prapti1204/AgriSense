import { useCallback, useEffect, useState } from "react"
import { Droplets, Wind, Thermometer, RefreshCw } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { useFarm } from "../../context/FarmContext"
import WeatherIcon from "../ui/WeatherIcon"

function describeWeather(code) {
  if (code === 0) return { label: "Clear sky", icon: "sun" }
  if (code === 1) return { label: "Mainly clear", icon: "partly" }
  if (code === 2) return { label: "Partly cloudy", icon: "partly" }
  if (code === 3) return { label: "Overcast", icon: "cloud" }
  if (code === 45 || code === 48) return { label: "Fog", icon: "cloud" }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 85, 86].includes(code)) {
    return { label: "Rain", icon: "rain" }
  }
  if (code === 95 || code === 96 || code === 99) return { label: "Thunderstorm", icon: "storm" }
  if ([71, 73, 75, 77].includes(code)) return { label: "Snow", icon: "cloud" }
  return { label: "Weather unavailable", icon: "cloud" }
}

function dayLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })
}

function hourLabel(dateTime) {
  return dateTime.slice(11, 16)
}

export default function WeatherPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { farm, hasFarm, getFarmWeather, isLoading: farmLoading } = useFarm()
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const loadWeather = useCallback(async () => {
    if (farmLoading) return
    setLoading(true)
    setError("")
    setWeather(null)
    if (!hasFarm) {
      setError("Add a farm with its location in Settings → Farm Details to view weather.")
      setLoading(false)
      return
    }
    const lat = farm?.coordinates?.latitude
    const lon = farm?.coordinates?.longitude
    if (lat == null || lon == null) {
      setError("Please configure valid coordinates in Settings → Farm Details to view weather.")
      setLoading(false)
      return
    }
    try {
      const result = await getFarmWeather()
      if (!result?.weather) {
        setError("Weather data could not be retrieved for this farm.")
        return
      }
      setWeather(result.weather)
    } catch (requestError) {
      setError(requestError.message || "Could not load weather for this farm.")
    } finally {
      setLoading(false)
    }
  }, [hasFarm, farm, farmLoading, getFarmWeather])

  useEffect(() => {
    void loadWeather()
  }, [loadWeather, reloadKey])

  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"
  const cardStyle = {
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 20,
    padding: 24,
  }
  const current = weather?.current
  const units = weather?.units?.current || {}
  const condition = describeWeather(current?.weather_code)
  const today = current?.time?.slice(0, 10)
  const hourlyData = weather?.hourly?.time
    ?.map((time, index) => ({
      time: hourLabel(time),
      temp: weather.hourly.temperature_2m[index],
      precipitationProbability: weather.hourly.precipitation_probability?.[index],
    }))
    .filter((point, index) => weather.hourly.time[index].startsWith(today || ""))
  const forecast = weather?.daily?.time?.map((date, index) => ({
    date,
    day: dayLabel(date),
    high: weather.daily.temperature_2m_max[index],
    low: weather.daily.temperature_2m_min[index],
    rain: weather.daily.precipitation_probability_max?.[index] ?? 0,
    precipitation: weather.daily.precipitation_sum[index],
    icon: describeWeather(weather.daily.weather_code[index]).icon,
  }))
  const rainfallData = forecast?.map((day) => ({ day: day.day, rainfall: day.precipitation }))

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 24, fontWeight: 800, color: text, marginBottom: 4 }}>
            Weather Monitoring
          </h1>
          <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
            {hasFarm ? `Weather for ${farm.name}${farm.location ? ` · ${farm.location}` : ""}` : "Weather for your saved farm"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
          aria-label="Refresh weather"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid ${border}`, borderRadius: 10, background: surface, color: text, padding: "9px 12px", cursor: loading ? "wait" : "pointer" }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading && <p role="status" style={{ color: muted, ...cardStyle }}>Loading weather from Open-Meteo…</p>}
      {!loading && error && (
        <div role="alert" style={{ ...cardStyle, color: text }}>
          <p style={{ color: error.includes("Add a farm") ? muted : "#E53935", marginBottom: 12 }}>{error}</p>
          {hasFarm && <p style={{ color: muted, fontSize: 12 }}>Check that the API is running and your saved farm has valid coordinates.</p>}
        </div>
      )}

      {!loading && weather && current && (
        <>
          <div style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)", borderRadius: 20, padding: 32, marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div data-grid="1fr1fr1fr1fr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24, position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>Current Weather</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <WeatherIcon icon={condition.icon} size={44} />
                  <div>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 48, fontWeight: 700, color: "white", lineHeight: 1 }}>
                      {Math.round(current.temperature_2m)}°
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{condition.label}</div>
                  </div>
                </div>
              </div>
              {[
                { label: "Humidity", value: `${current.relative_humidity_2m}%`, icon: Droplets, color: "#90CAF9" },
                { label: "Wind Speed", value: `${current.wind_speed_10m} ${units.wind_speed_10m || "km/h"}`, icon: Wind, color: "#80DEEA" },
                { label: "Feels Like", value: `${Math.round(current.apparent_temperature)}°`, icon: Thermometer, color: "#A5D6A7" },
              ].map((metric) => {
                const Icon = metric.icon
                return (
                  <div key={metric.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, backdropFilter: "blur(8px)" }}>
                    <Icon size={20} color={metric.color} style={{ marginBottom: 10 }} />
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 700, color: "white", marginBottom: 4 }}>{metric.value}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{metric.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div data-grid="2fr1fr" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={cardStyle}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: text, marginBottom: 4 }}>Temperature Trend</h3>
              <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>Hourly forecast · Today ({units.temperature_2m || "°C"})</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs><linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E53935" stopOpacity={0.3} /><stop offset="95%" stopColor="#E53935" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${border}`, borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="temp" stroke="#E53935" strokeWidth={2.5} fill="url(#tempGrad)" name={`Temperature (${units.temperature_2m || "°C"})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: text, marginBottom: 16 }}>7-Day Forecast</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {forecast?.map((day) => (
                  <div key={day.date} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: muted, width: 28 }}>{day.day}</span>
                    <WeatherIcon icon={day.icon} size={18} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 4, borderRadius: 2, background: isDark ? "#223022" : "#E3F2FD", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, day.rain))}%`, background: "#64B5F6", borderRadius: 2 }} />
                      </div>
                      <span style={{ color: muted, fontSize: 10 }}>{day.rain}% rain</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600, color: "#E53935" }}>{Math.round(day.high)}°</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: muted }}>{Math.round(day.low)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: text, marginBottom: 4 }}>7-Day Precipitation Forecast</h3>
            <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>Expected precipitation · {weather.units?.daily?.precipitation_sum || "mm"}</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rainfallData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${border}`, borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="rainfall" fill="#64B5F6" radius={[6, 6, 0, 0]} name={`Precipitation (${weather.units?.daily?.precipitation_sum || "mm"})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p style={{ color: muted, fontSize: 11, marginTop: 12 }}>
            Source: {weather.source} · Updated {weather.timestamps?.fetchedAt ? new Date(weather.timestamps.fetchedAt).toLocaleString() : "recently"}{weather.cached ? " · cached" : ""}
          </p>
        </>
      )}
    </div>
  )
}
