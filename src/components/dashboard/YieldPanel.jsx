import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { yieldData } from "../../data/mockData"
import { TrendingUp, Zap } from "lucide-react"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
export default function YieldPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"
  const crops = [
    {
      name: "Rice",
      actual: "1,580 kg",
      projected: "2,050 kg",
      confidence: 91,
      pct: 77,
      color: "#2E7D32",
    },
    {
      name: "Maize",
      actual: "920 kg",
      projected: "1,380 kg",
      confidence: 87,
      pct: 67,
      color: "#F9A825",
    },
    {
      name: "Vegetables",
      actual: "460 kg",
      projected: "680 kg",
      confidence: 83,
      pct: 68,
      color: "#64B5F6",
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
        Yield Prediction
      </h1>
      <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
        AI-driven harvest forecasting with seasonal comparisons
      </p>

      {/* Hero yield number */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B5E20, #388E3C)",
          borderRadius: 20,
          padding: 32,
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          data-grid="auto1frautoauto"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto auto",
            gap: 40,
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 6,
              }}
            >
              Projected Total Yield
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 52,
                fontWeight: 800,
                color: "white",
                lineHeight: 1,
              }}
            >
              4,110
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
              kg · Kharif 2024
            </div>
          </div>
          <div />
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "18px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 6,
              }}
            >
              vs Last Season
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={20} color="#A5D6A7" />
              <span
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#A5D6A7",
                }}
              >
                +18%
              </span>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "18px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 6,
              }}
            >
              AI Confidence
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 24,
                fontWeight: 800,
                color: "#66BB6A",
              }}
            >
              91%
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 16,
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
              Seasonal Yield Progression
            </h3>
            <p style={{ fontSize: 12, color: muted }}>
              Actual vs AI-predicted yield (kg) · March – September 2024
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 10,
                  height: 3,
                  background: "#2E7D32",
                  borderRadius: 2,
                }}
              />
              <span style={{ color: muted }}>Actual</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div
                style={{
                  width: 10,
                  height: 3,
                  background: "#66BB6A",
                  borderRadius: 2,
                  borderTop: "2px dashed #66BB6A",
                }}
              />
              <span style={{ color: muted }}>Predicted</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
            data={yieldData}
            margin={{ top: 5, right: 5, bottom: 0, left: -15 }}
          >
            <defs>
              <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#2E7D32"
              strokeWidth={2.5}
              fill="url(#yieldGrad)"
              name="Actual (kg)"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#66BB6A"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              name="Predicted (kg)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Per-crop breakdown */}
      <div
        data-grid="repeat(3,1fr)"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {crops.map((crop) => (
          <div
            key={crop.name}
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
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: crop.color,
                  flexShrink: 0,
                }}
              />
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: text,
                }}
              >
                {crop.name}
              </h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 11, color: muted }}>
                  Current harvest
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600,
                    color: text,
                  }}
                >
                  {crop.actual}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 11, color: muted }}>
                  Projected yield
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600,
                    color: crop.color,
                  }}
                >
                  {crop.projected}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: isDark ? "#223022" : "#F0F5EF",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${crop.pct}%`,
                    background: crop.color,
                    borderRadius: 4,
                    transition: "width 0.8s ease",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 10, color: muted }}>
                  {crop.pct}% harvested
                </span>
                <span style={{ fontSize: 10, color: muted }}>
                  {100 - crop.pct}% remaining
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 10,
                background: isDark ? "#1E2E1E" : "#F8FAF7",
              }}
            >
              <Zap size={12} color="#66BB6A" />
              <span style={{ fontSize: 11, color: muted }}>AI confidence:</span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 700,
                  color: "#43A047",
                }}
              >
                {crop.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
