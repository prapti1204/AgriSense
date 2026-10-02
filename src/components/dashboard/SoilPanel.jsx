import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { soilHealth } from "../../data/mockData"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts"
function RadialGauge({ value, label, color, max = 100 }) {
  const { isDark } = useTheme()
  const text = isDark ? "#E8F5E8" : "#1A2E1A"
  const muted = isDark ? "#7AAA7A" : "#5A7A5A"
  const pct = max === 14 ? (value / max) * 100 : value
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="100%"
            startAngle={225}
            endAngle={-45}
            data={[{ value: pct, fill: color }]}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              background={{ fill: isDark ? "#223022" : "#F0F5EF" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 700,
              fontSize: 18,
              color,
            }}
          >
            {max === 14 ? value : `${value}%`}
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: muted,
          marginTop: 6,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  )
}
export default function SoilPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const zones = [
    {
      name: "Zone A – Rice",
      n: 78,
      p: 52,
      k: 88,
      ph: 6.5,
      moisture: 68,
      status: "Excellent",
    },
    {
      name: "Zone B – Maize",
      n: 65,
      p: 60,
      k: 80,
      ph: 7.0,
      moisture: 55,
      status: "Good",
    },
    {
      name: "Zone C – Vegetables",
      n: 58,
      p: 72,
      k: 76,
      ph: 6.8,
      moisture: 45,
      status: "Fair",
    },
  ]
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
        Soil Health
      </h1>
      <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
        Real-time soil nutrient and moisture analysis
      </p>

      {/* Radial gauges */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 32,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
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
              Overall Soil Profile
            </h3>
            <p style={{ fontSize: 12, color: muted }}>
              Field average · Sensor readings from today
            </p>
          </div>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 100,
              background: "#E8F5E9",
              border: "1px solid #C8E6C9",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32" }}>
              Score: 78/100
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <RadialGauge
            value={soilHealth.nitrogen}
            label="Nitrogen (N)"
            color="#2E7D32"
          />
          <RadialGauge
            value={soilHealth.phosphorus}
            label="Phosphorus (P)"
            color="#F9A825"
          />
          <RadialGauge
            value={soilHealth.potassium}
            label="Potassium (K)"
            color="#7986CB"
          />
          <RadialGauge
            value={soilHealth.ph}
            label="pH Level"
            color="#26A69A"
            max={14}
          />
          <RadialGauge
            value={soilHealth.moisture}
            label="Moisture"
            color="#64B5F6"
          />
        </div>
      </div>

      {/* Zone comparison */}
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
            marginBottom: 20,
          }}
        >
          Zone Comparison
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr>
                {[
                  "Zone",
                  "Nitrogen",
                  "Phosphorus",
                  "Potassium",
                  "pH",
                  "Moisture",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 14px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: muted,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: `1px solid ${border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr
                  key={z.name}
                  style={{
                    background:
                      i % 2 === 0
                        ? "transparent"
                        : isDark
                          ? "#1E2E1E"
                          : "#FAFCFA",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      fontWeight: 600,
                      color: text,
                    }}
                  >
                    {z.name}
                  </td>
                  {[z.n, z.p, z.k].map((val, j) => (
                    <td key={j} style={{ padding: "12px 14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 50,
                            height: 6,
                            borderRadius: 3,
                            background: isDark ? "#223022" : "#F0F5EF",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${val}%`,
                              background: ["#2E7D32", "#F9A825", "#7986CB"][j],
                              borderRadius: 3,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 12,
                            color: text,
                          }}
                        >
                          {val}%
                        </span>
                      </div>
                    </td>
                  ))}
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#26A69A",
                    }}
                  >
                    {z.ph}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#64B5F6",
                    }}
                  >
                    {z.moisture}%
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 100,
                        background:
                          z.status === "Excellent"
                            ? "#E8F5E9"
                            : z.status === "Good"
                              ? "#FFF8E1"
                              : "#FFF3E0",
                        color:
                          z.status === "Excellent"
                            ? "#2E7D32"
                            : z.status === "Good"
                              ? "#F57F17"
                              : "#E65100",
                      }}
                    >
                      {z.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
