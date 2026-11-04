import { useState, useEffect, useCallback } from "react"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { useFarm } from "../../context/FarmContext"
import { useNavigate } from "react-router-dom"
import { TrendingUp, TrendingDown, Zap, Sprout, AlertCircle, RefreshCw, Info, ChevronRight } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function YieldPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { farm, hasFarm, getYieldEstimate } = useFarm()
  const navigate = useNavigate()

  const [estimateData, setEstimateData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadEstimate = useCallback(async () => {
    if (!hasFarm) {
      setEstimateData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const res = await getYieldEstimate()
      setEstimateData(res)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [hasFarm, getYieldEstimate])

  useEffect(() => {
    void loadEstimate()
  }, [loadEstimate])

  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"

  const totalYield = estimateData?.totalFarmEstimatedYield
  const validZones = estimateData?.zones?.filter((z) => z.hasSufficientData) || []

  // Chart data comparing Baseline Potential vs Climate/Soil-Adjusted Projection
  const chartData = validZones.map((z) => ({
    name: z.zoneName,
    crop: z.crop,
    baseline: z.potentialKg,
    projected: z.estimatedKg?.expected || 0,
    min: z.estimatedKg?.min || 0,
    max: z.estimatedKg?.max || 0,
  }))

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
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
          <p style={{ color: muted, fontSize: 14 }}>
            Explainable harvest estimation modeled from cultivar baselines, verified soil chemistry, and local weather forecasts
          </p>
        </div>

        <button
          onClick={loadEstimate}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: surface,
            color: text,
            fontSize: 12,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Recalculate Estimates
        </button>
      </div>

      {/* Hero yield number */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
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
                color: "rgba(255,255,255,0.75)",
                marginBottom: 6,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Projected Total Farm Harvest
            </div>

            {totalYield ? (
              <>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 48,
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1.1,
                  }}
                >
                  {totalYield.expected.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                  kg expected · Estimated range: {totalYield.min.toLocaleString()} – {totalYield.max.toLocaleString()} kg
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "white", marginBottom: 4 }}>
                  Awaiting Crop Setup
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                  Assign crops and field area in Settings → Farm Details to estimate yield.
                </div>
              </div>
            )}
          </div>

          <div />

          {totalYield && (
            <>
              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Zones Modeled
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {estimateData.zonesEstimated} / {estimateData.zonesCount}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                  Active field zones
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Model Type
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#A5D6A7",
                  }}
                >
                  Agronomic Heuristic
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                  FAO/ICAR Baselines
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comparative Chart */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
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
              Zone Harvest Potential vs Adjusted Projection
            </h3>
            <p style={{ fontSize: 12, color: muted }}>
              Comparing regional baseline cultivar potential against soil chemistry and weather adjustments (kg)
            </p>
          </div>

          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, background: "#78909C", borderRadius: 3 }} />
              <span style={{ color: muted }}>Baseline Potential</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, background: "#2E7D32", borderRadius: 3 }} />
              <span style={{ color: text, fontWeight: 600 }}>Adjusted Projection</span>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(val, name) => [`${Number(val).toLocaleString()} kg`, name === "baseline" ? "Baseline Potential" : "Adjusted Estimate"]}
              />
              <Bar dataKey="baseline" fill="#78909C" radius={[4, 4, 0, 0]} name="Baseline Potential" />
              <Bar dataKey="projected" fill="#2E7D32" radius={[4, 4, 0, 0]} name="Adjusted Projection" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <Sprout size={36} color={muted} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: text, marginBottom: 4 }}>
              No zone harvest projections yet
            </p>
            <p style={{ fontSize: 12, color: muted, maxWidth: 440, margin: "0 auto 16px" }}>
              Specify crop species and area for your zones in Settings → Farm Details to visualize harvest projections.
            </p>
            <button
              onClick={() => navigate("/dashboard/settings")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: "#2E7D32",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Configure Zones <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Per-crop breakdown cards */}
      <div
        data-grid="repeat(3,1fr)"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {estimateData?.zones?.map((zone) => {
          const hasData = zone.hasSufficientData
          const factorPct = hasData ? Math.round(zone.combinedFactor * 100) : 0
          const isAboveBaseline = factorPct >= 100

          return (
            <div
              key={zone.zoneId}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: hasData ? "#2E7D32" : muted,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <h3
                        style={{
                          fontFamily: "Plus Jakarta Sans, sans-serif",
                          fontWeight: 700,
                          fontSize: 15,
                          color: text,
                        }}
                      >
                        {zone.zoneName}
                      </h3>
                      <div style={{ fontSize: 11, color: muted }}>
                        {zone.crop} {zone.area ? `· ${zone.area} ${zone.areaUnit || "ha"}` : ""}
                      </div>
                    </div>
                  </div>

                  {hasData && (
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        color: isAboveBaseline ? "#2E7D32" : "#F57F17",
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: isAboveBaseline ? (isDark ? "#162E16" : "#E8F5E9") : (isDark ? "#2A2510" : "#FFF9C4"),
                      }}
                    >
                      {factorPct}% potential
                    </span>
                  )}
                </div>

                {hasData ? (
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: muted }}>Baseline potential</span>
                        <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: text }}>
                          {zone.potentialKg?.toLocaleString()} kg
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: muted }}>Estimated harvest</span>
                        <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "#2E7D32" }}>
                          {zone.estimatedKg.expected.toLocaleString()} kg
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: muted, marginBottom: 10 }}>
                        Estimated range: {zone.estimatedKg.min.toLocaleString()} – {zone.estimatedKg.max.toLocaleString()} kg
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
                            width: `${Math.min(100, factorPct)}%`,
                            background: isAboveBaseline ? "#2E7D32" : "#F57F17",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>

                    {/* Factors affecting this estimate */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: "uppercase" }}>
                        Influencing Factors:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {zone.factors?.map((f, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: 11,
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                              color: text,
                              lineHeight: 1.35,
                            }}
                          >
                            <span
                              style={{
                                color: f.impact === "positive" ? "#2E7D32" : f.impact === "negative" ? "#E53935" : muted,
                                fontWeight: 700,
                              }}
                            >
                              {f.impact === "positive" ? "✓" : f.impact === "negative" ? "⚠" : "•"}
                            </span>
                            <span>
                              <strong>{f.name}:</strong> {f.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "16px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#F57F17", marginBottom: 8 }}>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Awaiting Complete Configuration</span>
                    </div>
                    <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>
                      <span>Configured: </span>
                      <strong>Crop ({zone.crop || "None"})</strong>
                      {zone.area ? <span> · Area ({zone.area} {zone.areaUnit})</span> : null}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: text, marginBottom: 4 }}>
                      Required to calculate harvest projection:
                    </div>
                    <ul style={{ margin: "0 0 12px 18px", padding: 0, fontSize: 11, color: "#C62828" }}>
                      {zone.missingInputs?.map((m, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>{m}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate("/dashboard/settings")}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                        background: surface,
                        fontSize: 11,
                        fontWeight: 600,
                        color: text,
                        cursor: "pointer",
                      }}
                    >
                      Configure Zone in Settings
                    </button>
                  </div>
                )}
              </div>

              {hasData && (
                <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${border}`, fontSize: 10, color: muted, fontStyle: "italic" }}>
                  Assumes {zone.baselineYieldKgPerHa.toLocaleString()} kg/ha cultivar baseline (FAO/ICAR)
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Methodology & Disclaimer Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 16,
          background: isDark ? "#1E261E" : "#F4F8F4",
          border: `1px solid ${isDark ? "#2A3A2A" : "#D7E8D7"}`,
          borderRadius: 14,
          fontSize: 12,
          color: text,
          lineHeight: 1.5,
        }}
      >
        <Info size={18} color="#2E7D32" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, color: "#2E7D32", marginBottom: 2 }}>
            Methodology & Agricultural Disclaimer
          </div>
          <p style={{ margin: 0, color: muted }}>
            AgriSense estimates yield using transparent agronomic heuristics combining regional cultivar baseline potentials (FAO and Indian Council of Agricultural Research benchmarks), field soil chemistry (pH, NPK levels from your Soil Health tests), and local Open-Meteo climate conditions. <strong>All projections are estimates and not guaranteed harvest results</strong>; actual field yield will vary with seed quality, pest outbreaks, weed management, and microclimatic events.
          </p>
        </div>
      </div>
    </div>
  )
}
