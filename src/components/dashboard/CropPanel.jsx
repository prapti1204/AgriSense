import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { cropRecommendation } from "../../data/mockData"
import {
  Sprout,
  Zap,
  Droplets,
  Sun,
  Calendar,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
const alternatives = [
  {
    crop: "Wheat (Triticum aestivum)",
    confidence: 78,
    profit: "₹1,80,000",
    water: "300-450mm",
    days: "110-130 days",
    color: "#F9A825",
  },
  {
    crop: "Soybean (Glycine max)",
    confidence: 71,
    profit: "₹1,50,000",
    water: "400-550mm",
    days: "90-110 days",
    color: "#66BB6A",
  },
  {
    crop: "Sunflower (Helianthus annuus)",
    confidence: 65,
    profit: "₹1,20,000",
    water: "250-400mm",
    days: "80-100 days",
    color: "#FF7043",
  },
]
const factors = [
  {
    label: "Soil pH Compatibility",
    value: 95,
    icon: CheckCircle,
    color: "#43A047",
  },
  { label: "Rainfall Alignment", value: 88, icon: Droplets, color: "#64B5F6" },
  { label: "Temperature Suitability", value: 92, icon: Sun, color: "#F9A825" },
  {
    label: "Market Demand Index",
    value: 87,
    icon: TrendingUp,
    color: "#7986CB",
  },
]
export default function CropPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
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
        Crop Recommendations
      </h1>
      <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
        AI-powered planting guidance based on your soil, weather, and market
        data
      </p>

      {/* Top recommendation */}
      <div
        data-grid="1fr1fr"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
            borderRadius: 20,
            padding: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
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
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={15} color="#A5D6A7" />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Top Recommendation
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <Sprout size={28} color="#A5D6A7" />
              <h2
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {cropRecommendation.crop}
              </h2>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 24,
              }}
            >
              {cropRecommendation.variety} · {cropRecommendation.season}
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 100,
                background: "#66BB6A",
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F2810" }}>
                AI Confidence: {cropRecommendation.confidence}%
              </span>
            </div>

            <div
              data-grid="1fr1fr"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                {
                  label: "Expected Profit",
                  value: cropRecommendation.profit,
                  icon: TrendingUp,
                },
                {
                  label: "Water Requirement",
                  value: cropRecommendation.water,
                  icon: Droplets,
                },
                {
                  label: "Growing Period",
                  value: cropRecommendation.days,
                  icon: Calendar,
                },
                {
                  label: "Soil Suitability",
                  value: cropRecommendation.soilSuitability,
                  icon: CheckCircle,
                },
              ].map((m) => {
                const Icon = m.icon
                return (
                  <div
                    key={m.label}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <Icon size={13} color="rgba(255,255,255,0.6)" />
                      <span
                        style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}
                      >
                        {m.label}
                      </span>
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
                )
              })}
            </div>
          </div>
        </div>

        {/* Farm photo + AI factors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 20, overflow: "hidden", flex: 1 }}>
            <img
              src="/assets/crop-field.jpg"
              alt="Maize crop field"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                minHeight: 160,
              }}
            />
          </div>
          <div
            style={{
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <h4
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: text,
                marginBottom: 14,
              }}
            >
              Decision Factors
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {factors.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Icon size={12} color={f.color} />
                        <span style={{ fontSize: 12, color: muted }}>
                          {f.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 600,
                          color: f.color,
                        }}
                      >
                        {f.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        borderRadius: 3,
                        background: isDark ? "#223022" : "#F0F5EF",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${f.value}%`,
                          background: f.color,
                          borderRadius: 3,
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative crops */}
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
          Alternative Options
        </h3>
        <div
          data-grid="repeat(3,1fr)"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {alternatives.map((alt) => (
            <div
              key={alt.crop}
              style={{
                border: `1px solid ${border}`,
                borderRadius: 16,
                padding: 20,
                background: isDark ? "#1E2E1E" : "#FAFCFA",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: alt.color,
                  }}
                />
                <h4
                  style={{
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    color: text,
                    lineHeight: 1.3,
                  }}
                >
                  {alt.crop}
                </h4>
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: alt.color,
                  marginBottom: 4,
                }}
              >
                {alt.confidence}%
              </div>
              <div style={{ fontSize: 11, color: muted, marginBottom: 14 }}>
                AI confidence
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Profit", value: alt.profit },
                  { label: "Water", value: alt.water },
                  { label: "Season", value: alt.days },
                ].map((d) => (
                  <div
                    key={d.label}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: 11, color: muted }}>
                      {d.label}
                    </span>
                    <span
                      style={{ fontSize: 11, fontWeight: 600, color: text }}
                    >
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
