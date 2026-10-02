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
import {
  temperatureData,
  rainfallData,
  weatherForecast,
  soilHealth,
  alerts,
  cropRecommendation,
} from "../../data/mockData"
import { useNavigate } from "react-router-dom"
const statCards = [
  {
    label: "Temperature",
    value: "28°C",
    trend: "+2°",
    up: true,
    icon: Thermometer,
    color: "#E53935",
    bg: "#FFEBEE",
    sub: "Feels like 31°C",
  },
  {
    label: "Humidity",
    value: "63%",
    trend: "+5%",
    up: true,
    icon: Droplets,
    color: "#64B5F6",
    bg: "#E3F2FD",
    sub: "Optimal range",
  },
  {
    label: "Soil Moisture",
    value: "42%",
    trend: "-3%",
    up: false,
    icon: Activity,
    color: "#43A047",
    bg: "#E8F5E9",
    sub: "Zone A average",
  },
  {
    label: "Rain Probability",
    value: "75%",
    trend: "+30%",
    up: true,
    icon: CloudRain,
    color: "#7986CB",
    bg: "#E8EAF6",
    sub: "Next 24 hours",
  },
  {
    label: "Crop Health Score",
    value: "87/100",
    trend: "+12",
    up: true,
    icon: Sprout,
    color: "#2E7D32",
    bg: "#E8F5E9",
    sub: "Excellent condition",
  },
]
export default function MainDashboard() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const { autoMode, toggleAuto, dismissed, farm } = useFarm()
  const { user } = useAuth()
  const activeAlerts = alerts.filter((a) => !dismissed.includes(a.id))
  const { surface, border, text, muted } = usePalette()
  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
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
            Good morning, {user?.name.split(" ")[0] || "Marcus"} 👋
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Tuesday, 24 September 2024 · {farm.name}, {farm.location}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 10,
            background: "#E8F5E9",
            border: "1px solid #C8E6C9",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#43A047",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2E7D32" }}>
            AI Monitor Active
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
                    fontSize: 12,
                    fontWeight: 600,
                    color: card.up ? "#43A047" : "#E53935",
                  }}
                >
                  {card.up ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
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
              <div
                style={{ fontSize: 11, color: isDark ? "#5A8A5A" : "#9AB89A" }}
              >
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
          marginBottom: 16,
        }}
      >
        {/* Temperature chart */}
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
              marginBottom: 20,
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
                Temperature & Humidity
              </h3>
              <p style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                Today's readings every 3 hours
              </p>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 10,
                    height: 2,
                    background: "#E53935",
                    borderRadius: 1,
                  }}
                />
                <span style={{ color: muted }}>Temperature</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 10,
                    height: 2,
                    background: "#64B5F6",
                    borderRadius: 1,
                  }}
                />
                <span style={{ color: muted }}>Humidity</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={temperatureData}
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: muted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#E53935"
                strokeWidth={2.5}
                dot={false}
                name="Temp (°C)"
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#64B5F6"
                strokeWidth={2.5}
                dot={false}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 7-day weather */}
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
            7-Day Forecast
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weatherForecast.map((w, i) => (
              <div
                key={w.day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background:
                    i === 0 ? (isDark ? "#1E3A1E" : "#E8F5E9") : "transparent",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: muted,
                    width: 28,
                  }}
                >
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
                <span
                  style={{
                    fontSize: 11,
                    color: "#64B5F6",
                    width: 28,
                    textAlign: "right",
                  }}
                >
                  {w.rain}%
                </span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#E53935",
                    width: 30,
                    textAlign: "right",
                  }}
                >
                  {w.high}°
                </span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    color: muted,
                    width: 24,
                  }}
                >
                  {w.low}°
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        data-grid="1fr1fr1fr"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        {/* Rainfall bar chart */}
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
            Monthly Rainfall
          </h3>
          <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
            mm · April – September
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={rainfallData}
              margin={{ top: 0, right: 0, bottom: 0, left: -25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: muted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="rainfall"
                fill="#64B5F6"
                radius={[4, 4, 0, 0]}
                name="Rainfall (mm)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Soil health mini */}
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
              Soil Health
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                label: "Nitrogen (N)",
                value: soilHealth.nitrogen,
                color: "#2E7D32",
              },
              {
                label: "Phosphorus (P)",
                value: soilHealth.phosphorus,
                color: "#F9A825",
              },
              {
                label: "Potassium (K)",
                value: soilHealth.potassium,
                color: "#7986CB",
              },
              {
                label: "Moisture",
                value: soilHealth.moisture,
                color: "#64B5F6",
              },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: muted }}>{s.label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      color: text,
                    }}
                  >
                    {s.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: isDark ? "#223022" : "#F0F5EF",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.value}%`,
                      background: s.color,
                      borderRadius: 3,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts mini */}
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
              Recent Alerts
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 100,
                background: "#FFEBEE",
                color: "#E53935",
              }}
            >
              {activeAlerts.length} new
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeAlerts.slice(0, 3).map((a) => (
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
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: text,
                      marginBottom: 2,
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>
                    {a.message.slice(0, 55)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/dashboard/alerts")}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "8px",
              borderRadius: 8,
              background: "transparent",
              border: `1px solid ${border}`,
              cursor: "pointer",
              fontSize: 12,
              color: muted,
              fontWeight: 500,
            }}
          >
            View all alerts
          </button>
        </div>
      </div>

      {/* AI Crop Card */}
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
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              right: 60,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
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
                AI RECOMMENDATION
              </span>
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
                94% confidence
              </span>
            </div>

            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "white",
                marginBottom: 6,
              }}
            >
              {cropRecommendation.crop}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 24,
              }}
            >
              Variety: {cropRecommendation.variety} ·{" "}
              {cropRecommendation.season}
            </p>

            <div
              data-grid="repeat(4,1fr)"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
              {[
                { label: "Expected Profit", value: cropRecommendation.profit },
                { label: "Water Req.", value: cropRecommendation.water },
                { label: "Growing Period", value: cropRecommendation.days },
                {
                  label: "Soil Suitability",
                  value: cropRecommendation.soilSuitability,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick irrigation */}
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
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#E3F2FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Droplets size={16} color="#1565C0" />
            </div>
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: text,
              }}
            >
              Smart Irrigation
            </h3>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>
              Next watering
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 22,
                fontWeight: 700,
                color: "#64B5F6",
              }}
            >
              Today, 6:00 AM
            </div>
            <div style={{ fontSize: 12, color: muted }}>
              Zone A – Rice Field · 45 min
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, color: muted }}>
                Weekly water usage
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                  color: text,
                }}
              >
                4,200L / 6,000L
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: isDark ? "#223022" : "#E3F2FD",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "70%",
                  background: "linear-gradient(90deg, #1565C0, #64B5F6)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: isDark ? "#1E2E1E" : "#E3F2FD",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: text }}>
              Auto Irrigation
            </span>
            <Toggle
              checked={autoMode}
              onChange={toggleAuto}
              label="Auto irrigation"
              offColor={isDark ? "#2A3D2A" : "#E0E0E0"}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
