import { useState, useEffect, useCallback } from "react"
import { useFarm } from "../../context/FarmContext"
import Toggle from "../ui/Toggle"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { Droplets, Clock, Zap, CloudRain, AlertCircle, RefreshCw, Info } from "lucide-react"

export default function IrrigationPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { autoMode, toggleAuto, zones, toggleZone, isLoading, hasFarm, getIrrigationAdvisory } = useFarm()

  const [advisory, setAdvisory] = useState(null)
  const [loadingAdvisory, setLoadingAdvisory] = useState(true)
  const [advisoryError, setAdvisoryError] = useState(false)

  const loadAdvisory = useCallback(async () => {
    if (!hasFarm) {
      setAdvisory(null)
      setLoadingAdvisory(false)
      return
    }
    setLoadingAdvisory(true)
    setAdvisoryError(false)
    try {
      const res = await getIrrigationAdvisory()
      setAdvisory(res)
    } catch {
      setAdvisoryError(true)
    } finally {
      setLoadingAdvisory(false)
    }
  }, [hasFarm, getIrrigationAdvisory])

  useEffect(() => {
    void loadAdvisory()
  }, [loadAdvisory])

  // Merge backend advisory zone details with farm context zones
  const advisoryZoneMap = new Map()
  if (advisory?.zones) {
    for (const az of advisory.zones) {
      advisoryZoneMap.set(String(az.zoneId), az)
    }
  }

  const rainForecast48h = advisory?.weatherSummary?.rainForecast48hMm || 0
  const rainProb = advisory?.weatherSummary?.rainProbabilityMax || 0
  const rainExpected = rainForecast48h >= 8 || rainProb >= 65

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
            Smart Irrigation
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Agronomic watering recommendations based on verified soil moisture and weather forecasts
          </p>
        </div>

        <button
          onClick={loadAdvisory}
          disabled={loadingAdvisory}
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
            cursor: loadingAdvisory ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw size={14} className={loadingAdvisory ? "animate-spin" : ""} />
          Refresh Advisory
        </button>
      </div>

      {/* Top metrics */}
      <div
        data-grid="repeat(4,1fr)"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Irrigation Need",
            value: advisory?.zones?.filter((z) => z.status === "recommended").length ? `${advisory.zones.filter((z) => z.status === "recommended").length} Zone(s)` : "None Active",
            sub: rainExpected ? "Delayed by forecast rain" : "Based on soil deficit",
            color: rainExpected ? "#F9A825" : advisory?.zones?.some((z) => z.status === "recommended") ? "#2E7D32" : "#43A047",
          },
          {
            label: "Scheduled Zones",
            value: `${zones.filter((z) => z.active).length} / ${zones.length}`,
            sub: "Schedule timer intent",
            color: "#2E7D32",
          },
          {
            label: "Pump Hardware",
            value: "Standby",
            sub: "Manual / Advisory mode",
            color: "#7986CB",
          },
          {
            label: "Auto-Advisory",
            value: autoMode ? "Enabled" : "Manual",
            sub: autoMode ? "Climate & moisture sync" : "User inspection",
            color: autoMode ? "#43A047" : "#F9A825",
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 22,
                fontWeight: 700,
                color: m.color,
                marginBottom: 4,
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: text,
                marginBottom: 2,
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 11, color: muted }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Weather Rain Consideration Alert Banner */}
      {rainExpected && (
        <div
          style={{
            background: isDark ? "#2A2510" : "#FFF9E6",
            border: "1px solid #FFE082",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#FFECB3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CloudRain size={20} color="#F57F17" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#FFE082" : "#E65100", marginBottom: 2 }}>
              Upcoming Precipitation Detected ({rainForecast48h} mm forecast)
            </div>
            <p style={{ fontSize: 12, color: isDark ? "#D7CCC8" : "#5D4037", margin: 0 }}>
              Open-Meteo forecasts a {rainProb}% probability of rainfall in the next 48 hours. Scheduled watering is advised to hold to conserve water and prevent waterlogging.
            </p>
          </div>
        </div>
      )}

      {/* Auto mode toggle */}
      <div
        style={{
          background: "linear-gradient(135deg, #0D47A1, #1565C0)",
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={22} color="#90CAF9" />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "white",
                marginBottom: 2,
              }}
            >
              AI Auto-Irrigation Advisory Mode
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              {autoMode
                ? "Active: Automatically recalculates water requirements based on real soil moisture and forecast precipitation."
                : "Manual mode: Recommendations are calculated for reference; automatic schedule adjustments paused."}
            </p>
          </div>
        </div>
        <Toggle
          checked={autoMode}
          onChange={toggleAuto}
          label="AI auto-irrigation mode"
          large
          onColor="#66BB6A"
          offColor="rgba(255,255,255,0.25)"
        />
      </div>

      {/* Hardware Disclaimer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: isDark ? "#1B241B" : "#F1F8F1",
          border: `1px solid ${isDark ? "#2E4A2E" : "#C8E6C9"}`,
          borderRadius: 12,
          marginBottom: 20,
          fontSize: 12,
          color: isDark ? "#A5D6A7" : "#2E7D32",
        }}
      >
        <Info size={16} flexShrink={0} />
        <span>
          <strong>Agronomic Advisory Notice:</strong> Recommended water volumes are computed from empirical soil moisture deficit and weather data. Toggle switches set timer schedule mode; physical pump activation requires an IoT telemetry gateway.
        </span>
      </div>

      {/* Zone cards */}
      {zones.length === 0 ? (
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 32,
            textAlign: "center",
          }}
        >
          <Droplets size={32} color={muted} style={{ margin: "0 auto 12px" }} />
          <h3 style={{ color: text, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            No zones created yet
          </h3>
          <p style={{ color: muted, fontSize: 13, maxWidth: 420, margin: "0 auto" }}>
            {hasFarm
              ? "Create your field zones in Settings → Farm Details to manage watering schedules."
              : "Set up your farm in Settings → Farm Details first to configure irrigation zones."}
          </p>
        </div>
      ) : (
        <div
          data-grid="repeat(2,1fr)"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {zones.map((zone) => {
            const adv = advisoryZoneMap.get(String(zone.id))
            const hasMoisture = typeof adv?.currentMoisture === "number" || typeof zone.moisture === "number"
            const moistureVal = adv?.currentMoisture != null ? adv.currentMoisture : zone.moisture

            // Status color and label
            let statusColor = muted
            let statusBg = isDark ? "#223022" : "#F0F5EF"
            let badgeText = "Awaiting Telemetry"

            if (adv?.status === "recommended") {
              statusColor = "#1565C0"
              statusBg = isDark ? "#102A45" : "#E3F2FD"
              badgeText = adv.recommendedLitres
                ? `Need: ~${adv.recommendedLitres.toLocaleString()} L`
                : `Need: ~${adv.recommendedMm} mm depth`
            } else if (adv?.status === "delayed") {
              statusColor = "#F57F17"
              statusBg = isDark ? "#2A2510" : "#FFF9C4"
              badgeText = "Hold (Rain Forecast)"
            } else if (adv?.status === "optimal") {
              statusColor = "#2E7D32"
              statusBg = isDark ? "#162E16" : "#E8F5E9"
              badgeText = "Moisture Optimal"
            }

            return (
              <div
                key={zone.id}
                style={{
                  background: surface,
                  border: `1.5px solid ${zone.active ? "#43A047" : border}`,
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
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: zone.active
                            ? "#E3F2FD"
                            : isDark
                              ? "#223022"
                              : "#F0F5EF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Droplets size={18} color={zone.active ? "#1565C0" : muted} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: text }}>
                          {zone.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: muted,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 2,
                          }}
                        >
                          <span>{zone.crop || "No crop assigned"}</span>
                          {zone.area ? <span>· {zone.area} {zone.areaUnit || "ha"}</span> : null}
                          <span>·</span>
                          <Clock size={10} /> {zone.active ? "Schedule active" : "Schedule paused"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <Toggle
                        checked={zone.active}
                        onChange={() => toggleZone(zone.id)}
                        label={zone.name + " schedule mode"}
                        offColor={isDark ? "#2A3D2A" : "#E0E0E0"}
                      />
                      <span style={{ fontSize: 10, color: muted }}>
                        {zone.active ? "Timer ON" : "Timer OFF"}
                      </span>
                    </div>
                  </div>

                  {/* Recommendation badge & reasoning */}
                  <div
                    style={{
                      background: statusBg,
                      border: `1px solid ${statusColor}33`,
                      borderRadius: 12,
                      padding: "12px 14px",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: "uppercase" }}>
                        Advisory Status
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 700,
                          color: statusColor,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "rgba(0,0,0,0.05)",
                        }}
                      >
                        {badgeText}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: text, margin: 0, lineHeight: 1.45 }}>
                      {adv?.reason || "Awaiting soil telemetry or test recording to generate moisture-calibrated recommendations."}
                    </p>
                    {adv?.recommendedDurationMinutes ? (
                      <div style={{ fontSize: 11, color: statusColor, marginTop: 6, fontWeight: 600 }}>
                        Estimated run time: ~{adv.recommendedDurationMinutes} mins at standard drip/emitter rates
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  {/* Moisture Status bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: isDark ? "#1E2E1E" : "#F8FAF7",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: hasMoisture
                          ? moistureVal < 45
                            ? "#E53935"
                            : moistureVal < 60
                              ? "#F9A825"
                              : "#43A047"
                          : muted,
                      }}
                    />
                    <span style={{ fontSize: 12, color: muted }}>Soil moisture:</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 600,
                        color: hasMoisture
                          ? moistureVal < 45
                            ? "#E53935"
                            : moistureVal < 60
                              ? "#F9A825"
                              : "#43A047"
                          : muted,
                      }}
                    >
                      {hasMoisture ? `${moistureVal}%` : "No test on record"}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: muted }}>
                      {hasMoisture
                        ? moistureVal < 45
                          ? "Deficit"
                          : moistureVal < 60
                            ? "Moderate"
                            : "Optimal"
                        : "Awaiting test"}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
