import { useCallback, useEffect, useState } from "react"
import { useFarm } from "../../context/FarmContext"
import { useAuth } from "../../context/AuthContext"
import Toggle from "../ui/Toggle"
import WeatherIcon from "../ui/WeatherIcon"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import {
  Thermometer,
  Droplets,
  CloudRain,
  Activity,
  Sprout,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRight,
  Info,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useNavigate } from "react-router-dom"

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
  return { label: "Forecast unavailable", icon: "cloud" }
}

function dayLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })
}

function hourLabel(dateTime) {
  return dateTime.slice(11, 16)
}

export default function MainDashboard() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { autoMode, toggleAuto, dismissed, farm, zones, hasFarm, getFarmWeather, getSoilReadings, getZonePredictions, isLoading: farmLoading } = useFarm()
  const { user } = useAuth()
  const { surface, border, text, muted } = usePalette()

  const [weather, setWeather] = useState(null)
  const [latestSoil, setLatestSoil] = useState(null)
  const [latestRecommendation, setLatestRecommendation] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)

  useEffect(() => {
    let active = true
    async function loadRealData() {
      if (farmLoading) return
      if (!hasFarm) {
        setWeather(null)
        setLatestSoil(null)
        setLatestRecommendation(null)
        setLoadingDashboard(false)
        return
      }

      setLoadingDashboard(true)
      try {
        const [weatherRes, soilRes] = await Promise.all([
          getFarmWeather().catch(() => null),
          getSoilReadings(null, 1).catch(() => ({ readings: [] })),
        ])

        if (!active) return

        if (weatherRes?.weather) {
          setWeather(weatherRes.weather)
        } else {
          setWeather(null)
        }

        const reading = soilRes?.readings?.[0] || null
        setLatestSoil(reading)

        // If there's an active zone, fetch latest AI prediction
        if (zones.length > 0) {
          const firstZoneId = zones[0].id
          const predRes = await getZonePredictions(firstZoneId, "crop").catch(() => ({ predictions: [] }))
          if (active) {
            const completed = predRes.predictions?.find((p) => p.status === "completed")
            setLatestRecommendation(completed || null)
          }
        }
      } finally {
        if (active) setLoadingDashboard(false)
      }
    }

    void loadRealData()
    return () => {
      active = false
    }
  }, [hasFarm, farmLoading, farm?.id, zones, getFarmWeather, getSoilReadings, getZonePredictions])

  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"

  // Live weather computations
  const currentTemp = weather?.current?.temperature_2m
  const currentHumidity = weather?.current?.relative_humidity_2m
  const feelsLike = weather?.current?.apparent_temperature
  const precipProb = weather?.daily?.precipitation_probability_max?.[0]
  const today = weather?.current?.time?.slice(0, 10)

  // Hourly curve from Open-Meteo for today
  const hourlyData = weather?.hourly?.time
    ?.map((time, idx) => ({
      time: hourLabel(time),
      temp: weather.hourly.temperature_2m[idx],
      humidity: weather.hourly.relative_humidity_2m[idx],
    }))
    .filter((_, idx) => weather.hourly.time[idx].startsWith(today || ""))
    .slice(0, 12) || []

  // 7-day forecast from Open-Meteo
  const forecast = weather?.daily?.time?.map((date, idx) => {
    const code = weather.daily.weather_code[idx]
    const info = describeWeather(code)
    return {
      day: dayLabel(date),
      high: Math.round(weather.daily.temperature_2m_max[idx]),
      low: Math.round(weather.daily.temperature_2m_min[idx]),
      rain: weather.daily.precipitation_probability_max?.[idx] ?? 0,
      icon: info.icon,
    }
  }) || []

  // Real soil measurements
  const soilN = latestSoil?.readings?.nitrogen?.value
  const soilP = latestSoil?.readings?.phosphorus?.value
  const soilK = latestSoil?.readings?.potassium?.value
  const soilMoisture = latestSoil?.readings?.moisture?.value

  // Average zone moisture from telemetry
  const monitoredWithMoisture = zones.filter((z) => typeof z.moisture === "number")
  const avgZoneMoisture = monitoredWithMoisture.length > 0
    ? Math.round(monitoredWithMoisture.reduce((sum, z) => sum + z.moisture, 0) / monitoredWithMoisture.length)
    : (soilMoisture != null ? Math.round(soilMoisture) : null)

  const activeAlerts = [
    ...(precipProb != null && precipProb > 60
      ? [
          {
            id: "rain-alert",
            title: "High Precipitation Expected",
            message: `Open-Meteo forecasts a ${precipProb}% chance of rain in the next 24 hours.`,
            color: "#64B5F6",
          },
        ]
      : []),
    ...(avgZoneMoisture != null && avgZoneMoisture < 40
      ? [
          {
            id: "moisture-alert",
            title: "Low Soil Moisture Detected",
            message: `Average soil moisture is currently ${avgZoneMoisture}%. Consider scheduling irrigation.`,
            color: "#F9A825",
          },
        ]
      : []),
    ...(zones.filter((z) => z.active).length > 0
      ? [
          {
            id: "irrigation-info",
            title: "Irrigation Schedules Active",
            message: `${zones.filter((z) => z.active).length} zones configured for automated scheduling.`,
            color: "#43A047",
          },
        ]
      : []),
  ]

  const topCrop = latestRecommendation?.result?.recommendations?.[0]

  const statCards = [
    {
      label: "Temperature",
      value: currentTemp != null ? `${Math.round(currentTemp)}°C` : "N/A",
      trend: "Live",
      up: true,
      icon: Thermometer,
      color: "#E53935",
      bg: "#FFEBEE",
      sub: feelsLike != null ? `Feels like ${Math.round(feelsLike)}°C` : "Open-Meteo",
    },
    {
      label: "Humidity",
      value: currentHumidity != null ? `${Math.round(currentHumidity)}%` : "N/A",
      trend: "Live",
      up: true,
      icon: Droplets,
      color: "#64B5F6",
      bg: "#E3F2FD",
      sub: "Atmospheric",
    },
    {
      label: "Soil Moisture",
      value: avgZoneMoisture != null ? `${avgZoneMoisture}%` : "N/A",
      trend: monitoredWithMoisture.length > 0 ? `${monitoredWithMoisture.length} zones` : "No probe",
      up: avgZoneMoisture != null && avgZoneMoisture >= 50,
      icon: Activity,
      color: "#43A047",
      bg: "#E8F5E9",
      sub: latestSoil ? `Sample: ${latestSoil.method}` : "Awaiting telemetry",
    },
    {
      label: "Rain Probability",
      value: precipProb != null ? `${precipProb}%` : "N/A",
      trend: "24h Max",
      up: precipProb != null && precipProb > 40,
      icon: CloudRain,
      color: "#7986CB",
      bg: "#E8EAF6",
      sub: "Open-Meteo model",
    },
    {
      label: "Monitored Zones",
      value: String(zones.length),
      trend: `${zones.filter((z) => z.active).length} sched`,
      up: zones.length > 0,
      icon: Sprout,
      color: "#2E7D32",
      bg: "#E8F5E9",
      sub: hasFarm ? `${farm.name}` : "No farm configured",
    },
  ]

  const rainfallHistory = weather?.daily?.time?.slice(0, 6).map((d, i) => ({
    date: dayLabel(d),
    precipitation: weather.daily.precipitation_sum?.[i] ?? 0,
  })) || []

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: text,
              marginBottom: 4,
            }}
          >
            Good morning, {user?.name?.split(" ")[0] || "Farmer"} 👋
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {hasFarm ? `${farm.name}, ${farm.location || "Coordinates logged"}` : "No farm configured"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 10,
            background: hasFarm ? "#E8F5E9" : (isDark ? "#2A2A1A" : "#FFF8E1"),
            border: `1px solid ${hasFarm ? "#C8E6C9" : "#FFE082"}`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: hasFarm ? "#43A047" : "#F57F17",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: hasFarm ? "#2E7D32" : "#F57F17" }}>
            {hasFarm ? "Database Live Connected" : "Farm Setup Pending"}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        data-grid="repeat(5,1fr)"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="card-hover"
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={card.color} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 11,
                    fontWeight: 700,
                    color: card.up ? "#2E7D32" : muted,
                  }}
                >
                  {card.trend}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: text,
                  marginBottom: 4,
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: muted,
                  marginBottom: 2,
                }}
              >
                {card.label}
              </div>
              <div style={{ fontSize: 11, color: isDark ? "#7AAA7A" : "#6B8E6B" }}>
                {card.sub}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div
        data-grid="2fr1fr"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Hourly Temperature & Humidity from Live Open-Meteo */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: text,
                }}
              >
                Today's Temperature & Humidity
              </h3>
              <p style={{ fontSize: 12, color: muted }}>
                Hourly trajectory from live Open-Meteo observation
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 2, background: "#E53935", borderRadius: 1 }} />
                <span style={{ color: muted }}>Temperature</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 2, background: "#64B5F6", borderRadius: 1 }} />
                <span style={{ color: muted }}>Humidity</span>
              </div>
            </div>
          </div>

          {hourlyData.length === 0 ? (
            <div style={{ height: 200, display: "grid", placeItems: "center", color: muted, fontSize: 13 }}>
              {hasFarm ? "Loading weather forecast…" : "Set coordinates in Settings → Farm Details to view live weather."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="temp" stroke="#E53935" strokeWidth={2.5} dot={false} name="Temp (°C)" />
                <Line type="monotone" dataKey="humidity" stroke="#64B5F6" strokeWidth={2.5} dot={false} name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 7-day live weather */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: text,
              marginBottom: 16,
            }}
          >
            7-Day Forecast (Open-Meteo)
          </h3>
          {forecast.length === 0 ? (
            <p style={{ color: muted, fontSize: 13, textAlign: "center", padding: "40px 0" }}>
              No weather forecast available.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {forecast.map((w, i) => (
                <div
                  key={w.day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: i === 0 ? (isDark ? "#1E3A1E" : "#E8F5E9") : "transparent",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: muted, width: 28 }}>
                    {w.day}
                  </span>
                  <WeatherIcon icon={w.icon} />
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: isDark ? "#223022" : "#F0F5EF",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${w.rain}%`,
                        background: "#64B5F6",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#64B5F6", width: 28, textAlign: "right" }}>
                    {w.rain}%
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600, color: "#E53935", width: 30, textAlign: "right" }}>
                    {w.high}°
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: muted, width: 24 }}>
                    {w.low}°
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div
        data-grid="1fr1fr1fr"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        {/* Rainfall bar chart from 7-day model */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: text,
              marginBottom: 4,
            }}
          >
            Precipitation Forecast
          </h3>
          <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
            mm rainfall · Next 6 days
          </p>
          {rainfallHistory.length === 0 ? (
            <p style={{ color: muted, fontSize: 13, textAlign: "center", padding: "30px 0" }}>No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={rainfallHistory} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="precipitation" fill="#64B5F6" radius={[4, 4, 0, 0]} name="Precip (mm)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Real Soil Health Summary */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: text,
              }}
            >
              Latest Soil Health
            </h3>
            <button
              onClick={() => navigate("/dashboard/soil")}
              style={{
                fontSize: 12,
                color: "#43A047",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          {!latestSoil ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 13, color: muted }}>No soil readings logged yet.</p>
              <button
                onClick={() => navigate("/dashboard/soil")}
                style={{
                  marginTop: 10,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "#2E7D32",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Record Soil Sample
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Nitrogen (N)", value: soilN != null ? `${soilN} mg/kg` : "N/A", pct: soilN != null ? Math.min(100, (soilN / 150) * 100) : 0, color: "#2E7D32" },
                { label: "Phosphorus (P)", value: soilP != null ? `${soilP} mg/kg` : "N/A", pct: soilP != null ? Math.min(100, (soilP / 100) * 100) : 0, color: "#F9A825" },
                { label: "Potassium (K)", value: soilK != null ? `${soilK} mg/kg` : "N/A", pct: soilK != null ? Math.min(100, (soilK / 200) * 100) : 0, color: "#7986CB" },
                { label: "Moisture", value: soilMoisture != null ? `${soilMoisture}%` : "N/A", pct: soilMoisture != null ? soilMoisture : 0, color: "#64B5F6" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: muted }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: text }}>
                      {s.value}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: isDark ? "#223022" : "#F0F5EF", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live System Alerts */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: text,
              }}
            >
              System Advisories
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 100,
                background: activeAlerts.length > 0 ? "#E8F5E9" : (isDark ? "#2A3D2A" : "#F0F5EF"),
                color: activeAlerts.length > 0 ? "#2E7D32" : muted,
              }}
            >
              {activeAlerts.length} active
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeAlerts.length === 0 ? (
              <p style={{ color: muted, fontSize: 12, padding: "20px 0", textAlign: "center" }}>
                No active threshold alerts. Field conditions within regular range.
              </p>
            ) : (
              activeAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px",
                    borderRadius: 10,
                    background: isDark ? "#1E2E1E" : "#F8FAF7",
                    borderLeft: `3px solid ${a.color}`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: text, marginBottom: 2 }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>
                      {a.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Crop Recommendation Live Banner */}
      <div
        data-grid="2fr1fr"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
            borderRadius: 20,
            padding: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={16} color="#66BB6A" />
              </div>
              <span
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                GEMINI CROP RECOMMENDATION
              </span>
              {topCrop && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 100,
                    background: "#66BB6A",
                    color: "#0F2810",
                    fontWeight: 700,
                  }}
                >
                  {Math.round(topCrop.suitability * 100)}% suitability
                </span>
              )}
            </div>

            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "white",
                marginBottom: 6,
              }}
            >
              {topCrop?.crop || "No active recommendation generated yet"}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 20,
              }}
            >
              {latestRecommendation
                ? latestRecommendation.result?.explanation
                : "Run Google Gemini on your field zones in the Crop Recommendations panel to compute planting advice."}
            </p>

            <button
              onClick={() => navigate("/dashboard/crop")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.2)",
                color: "white",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Open Crop Recommendations <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Irrigation Mode */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Droplets size={20} color="#1565C0" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>
                Smart Irrigation Mode
              </h3>
            </div>
            <p style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>
              {autoMode
                ? "AI automated schedule active across field valves based on weather and moisture levels."
                : "Manual mode active. Schedules require manual activation."}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
            <span style={{ fontSize: 13, color: text, fontWeight: 600 }}>
              AI Automated Mode
            </span>
            <Toggle checked={autoMode} onChange={toggleAuto} label="Toggle auto irrigation" />
          </div>
        </div>
      </div>
    </div>
  )
}
