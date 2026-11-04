import { useCallback, useEffect, useState } from "react"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { useFarm } from "../../context/FarmContext"
import { useFeedback } from "../../context/FeedbackContext"
import {
  Sprout,
  Zap,
  Droplets,
  Sun,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react"

export default function CropPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { farm, zones, rawZones, hasFarm, requestCropRecommendation, getZonePredictions } = useFarm()
  const { notify } = useFeedback()

  const [selectedZoneId, setSelectedZoneId] = useState("")
  const [prediction, setPrediction] = useState(null)
  const [predictionHistory, setPredictionHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingHistory, setFetchingHistory] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id)
    }
  }, [zones, selectedZoneId])

  const loadHistory = useCallback(async (zoneId) => {
    if (!zoneId) return
    setFetchingHistory(true)
    try {
      const response = await getZonePredictions(zoneId, "crop")
      const list = response.predictions || []
      setPredictionHistory(list)
      const latestCompleted = list.find((p) => p.status === "completed")
      if (latestCompleted) {
        setPrediction(latestCompleted)
      } else {
        setPrediction(null)
      }
    } catch {
      // Failed to load prediction history
      setPredictionHistory([])
    } finally {
      setFetchingHistory(false)
    }
  }, [getZonePredictions])

  useEffect(() => {
    if (selectedZoneId) {
      void loadHistory(selectedZoneId)
    }
  }, [selectedZoneId, loadHistory])

  const handleGenerate = async () => {
    if (!selectedZoneId || loading) return
    setLoading(true)
    setError("")
    try {
      const result = await requestCropRecommendation(selectedZoneId)
      if (result.prediction) {
        setPrediction(result.prediction)
        setPredictionHistory((prev) => [result.prediction, ...prev.filter((p) => (p._id || p.id) !== (result.prediction._id || result.prediction.id))])
        notify("AI Crop recommendation generated.")
      }
    } catch (err) {
      setError(err.message || "Could not generate crop recommendation. Ensure Gemini API key is configured.")
    } finally {
      setLoading(false)
    }
  }

  const selectedZone = zones.find((z) => z.id === selectedZoneId)
  const result = prediction?.result
  const recommendations = result?.recommendations || []
  const topRec = recommendations[0] || null
  const alternatives = recommendations.slice(1)
  const missingInputs = result?.missingInputs || []

  return (
    <div>
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
            Crop Recommendations
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            AI-powered planting guidance evaluated from your live soil tests, location & weather
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {zones.length > 0 && (
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              aria-label="Select zone for recommendation"
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${border}`,
                background: isDark ? "#1E2E1E" : "#FFFFFF",
                color: text,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} {z.crop ? `(${z.crop})` : ""}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerate}
            disabled={!hasFarm || zones.length === 0 || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: 10,
              background: hasFarm && zones.length > 0 && !loading ? "#2E7D32" : "#9E9E9E",
              color: "white",
              border: "none",
              cursor: hasFarm && zones.length > 0 && !loading ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Analyzing Field Data…" : "Run Recommendation"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            background: "#FFEBEE",
            color: "#C62828",
            borderRadius: 12,
            marginBottom: 20,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRunPrediction}
            disabled={loading}
            style={{
              background: "#C62828",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Retrying…" : "Retry Prediction"}
          </button>
        </div>
      )}

      {/* Top recommendation & Explanation Card */}
      {!hasFarm || zones.length === 0 ? (
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <Sprout size={36} color={muted} style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 4 }}>
            No zones available for recommendation
          </h3>
          <p style={{ fontSize: 13, color: muted, maxWidth: 420, margin: "0 auto" }}>
            Set up your farm and field zones in Settings → Farm Details first to enable Gemini agricultural predictions.
          </p>
        </div>
      ) : !prediction ? (
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <Zap size={36} color="#43A047" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 6 }}>
            Ready for AI Crop Analysis
          </h3>
          <p style={{ fontSize: 13, color: muted, maxWidth: 480, margin: "0 auto 20px" }}>
            Click <strong>"Run Recommendation"</strong> to invoke Google Gemini against the latest soil samples and Open-Meteo forecasts for {selectedZone?.name || "the selected zone"}.
          </p>
        </div>
      ) : (
        <>
          <div
            data-grid="1fr1fr"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Top Recommendation Hero */}
            <div
              style={{
                background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
                borderRadius: 20,
                padding: 32,
                position: "relative",
                overflow: "hidden",
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
                    Top AI Recommendation
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
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
                    {topRec?.crop || "No direct crop recommended"}
                  </h2>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 48,
                      fontWeight: 800,
                      color: "#A5D6A7",
                      lineHeight: 1,
                    }}
                  >
                    {topRec ? Math.round(topRec.suitability * 100) : 0}%
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                    Suitability Index
                  </span>
                </div>

                {topRec?.reasons?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#C8E6C9", marginBottom: 6 }}>
                      Key Agrological Factors:
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, color: "white", fontSize: 12 }}>
                      {topRec.reasons.map((r, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 20,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Model: {prediction.modelVersion || "Gemini"} · Generated {new Date(prediction.createdAt).toLocaleString()}
              </div>
            </div>

            {/* AI Explanation & Missing Data Diagnostics */}
            <div
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Info size={18} color="#2E7D32" />
                  <h3
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: text,
                    }}
                  >
                    Agronomic Rationale
                  </h3>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: text,
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {result?.explanation || "Evaluation complete."}
                </p>

                {missingInputs.length > 0 && (
                  <div
                    style={{
                      background: isDark ? "#2A2415" : "#FFF8E1",
                      border: "1px solid #FFE082",
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#F57F17",
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      <AlertTriangle size={14} />
                      Unrecorded Measurements ({missingInputs.length})
                    </div>
                    <p style={{ fontSize: 11, color: isDark ? "#FFE082" : "#795548", margin: 0 }}>
                      For maximum accuracy, log these in the Soil Health panel:{" "}
                      <strong>{missingInputs.join(", ")}</strong>.
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: muted,
                  borderTop: `1px solid ${border}`,
                  paddingTop: 12,
                }}
              >
                <span>Input Status: <strong>{result?.status || "ready"}</strong></span>
                <span>Active Crop: <strong>{selectedZone?.crop || "None"}</strong></span>
              </div>
            </div>
          </div>

          {/* Alternative Crops */}
          {alternatives.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: text,
                  marginBottom: 14,
                }}
              >
                Alternative Viable Crops ({alternatives.length})
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(alternatives.length, 3)}, 1fr)`,
                  gap: 14,
                }}
              >
                {alternatives.map((alt, idx) => {
                  const colors = ["#F9A825", "#66BB6A", "#FF7043", "#7986CB"]
                  const col = colors[idx % colors.length]
                  return (
                    <div
                      key={idx}
                      style={{
                        background: surface,
                        border: `1px solid ${border}`,
                        borderRadius: 16,
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <h4 style={{ fontWeight: 700, fontSize: 14, color: text }}>
                          {alt.crop}
                        </h4>
                        <span
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 16,
                            fontWeight: 700,
                            color: col,
                          }}
                        >
                          {Math.round(alt.suitability * 100)}%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: muted, marginBottom: 10 }}>
                        Suitability Index
                      </div>
                      <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: text }}>
                        {alt.reasons.map((r, ri) => (
                          <li key={ri} style={{ marginBottom: 4 }}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Historical Recommendations Runs */}
          {predictionHistory.length > 1 && (
            <div
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 20,
              }}
            >
              <h3
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: text,
                  marginBottom: 12,
                }}
              >
                Prediction History for {selectedZone?.name} ({predictionHistory.length} runs)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {predictionHistory.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => setPrediction(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: p._id === prediction._id ? (isDark ? "#223522" : "#E8F5E9") : "transparent",
                      border: `1px solid ${p._id === prediction._id ? "#43A047" : border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Calendar size={14} color={muted} />
                      <span style={{ fontSize: 13, color: text, fontWeight: 600 }}>
                        {new Date(p.createdAt).toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 100,
                          background: p.status === "completed" ? "#E8F5E9" : "#FFEBEE",
                          color: p.status === "completed" ? "#2E7D32" : "#C62828",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: muted }}>
                      Top: {p.result?.recommendations?.[0]?.crop || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
