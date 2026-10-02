import WeatherIcon from "../ui/WeatherIcon"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import {
  temperatureData,
  rainfallData,
  weatherForecast,
} from "../../data/mockData"
import { Wind, Droplets, Eye } from "lucide-react"
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
export default function WeatherPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"
  return (
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
        Weather Monitoring
      </h1>
      <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
        Hyperlocal weather data for Greenfield Estate
      </p>

      {/* Current weather hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0D47A1, #1565C0)",
          borderRadius: 20,
          padding: 32,
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          data-grid="1fr1fr1fr1fr"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 24,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 8,
              }}
            >
              Current Weather
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 48 }}>⛅</span>
              <div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 48,
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  28°
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 4,
                  }}
                >
                  Partly Cloudy
                </div>
              </div>
            </div>
          </div>
          {[
            {
              label: "Humidity",
              value: "63%",
              icon: Droplets,
              color: "#90CAF9",
            },
            {
              label: "Wind Speed",
              value: "14 km/h",
              icon: Wind,
              color: "#80DEEA",
            },
            {
              label: "Visibility",
              value: "9.2 km",
              icon: Eye,
              color: "#A5D6A7",
            },
          ].map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.label}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 20,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Icon size={20} color={m.color} style={{ marginBottom: 10 }} />
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  {m.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  {m.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        data-grid="2fr1fr"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Temp area chart */}
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
            Temperature Trend
          </h3>
          <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
            Hourly readings · Today
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={temperatureData}
              margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E53935" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#E53935"
                strokeWidth={2.5}
                fill="url(#tempGrad)"
                name="Temp (°C)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast */}
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
              marginBottom: 16,
            }}
          >
            7-Day Forecast
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {weatherForecast.map((w) => (
              <div
                key={w.day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: muted,
                    width: 28,
                  }}
                >
                  {w.day}
                </span>
                <WeatherIcon icon={w.icon} size={18} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: isDark ? "#223022" : "#E3F2FD",
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
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#E53935",
                    }}
                  >
                    {w.high}°
                  </span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12,
                      color: muted,
                    }}
                  >
                    {w.low}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rainfall chart */}
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
          Monthly Rainfall Summary
        </h3>
        <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
          Millimeters · April – September 2024
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={rainfallData}
            margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
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
              radius={[6, 6, 0, 0]}
              name="Rainfall (mm)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
