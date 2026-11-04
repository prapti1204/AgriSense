import { useCallback, useEffect, useState } from "react"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { useFarm } from "../../context/FarmContext"
import { useFeedback } from "../../context/FeedbackContext"
import Field from "../ui/Field"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts"
import { Plus, X, Sprout, Calendar, Filter, RefreshCw } from "lucide-react"

function RadialGauge({ value, label, unit = "%", color, max = 100 }) {
  const { isDark } = useTheme()
  const muted = isDark ? "#7AAA7A" : "#5A7A5A"
  const hasValue = typeof value === "number" && !isNaN(value)
  const pct = hasValue ? (max === 14 ? (value / max) * 100 : value) : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="100%"
            startAngle={225}
            endAngle={-45}
            data={[{ value: pct, fill: hasValue ? color : (isDark ? "#2A3D2A" : "#D0D7CE") }]}
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
              fontSize: hasValue ? 18 : 15,
              color: hasValue ? color : muted,
            }}
          >
            {hasValue ? (max === 14 ? value.toFixed(1) : `${Math.round(value)}${unit}`) : "N/A"}
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
  const { farm, zones, rawZones, hasFarm, getSoilReadings, addSoilReading } = useFarm()
  const { notify } = useFeedback()

  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all")

  // Modal / Form state for recording new soil reading
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [targetZoneId, setTargetZoneId] = useState("")
  const [nitrogen, setNitrogen] = useState("")
  const [phosphorus, setPhosphorus] = useState("")
  const [potassium, setPotassium] = useState("")
  const [ph, setPh] = useState("")
  const [moisture, setMoisture] = useState("")
  const [method, setMethod] = useState("manual")
  const [observedAt, setObservedAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [notes, setNotes] = useState("")

  const loadReadings = useCallback(async () => {
    if (!hasFarm) {
      setReadings([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    try {
      const zoneId = selectedZoneFilter === "all" ? null : selectedZoneFilter
      const response = await getSoilReadings(zoneId, 50)
      setReadings(response.readings || [])
    } catch (err) {
      setError(err.message || "Failed to load soil test readings.")
    } finally {
      setLoading(false)
    }
  }, [hasFarm, selectedZoneFilter, getSoilReadings])

  useEffect(() => {
    void loadReadings()
  }, [loadReadings])

  // Derive latest readings for current scope
  const latestReading = readings.length > 0 ? readings[0] : null
  const latestN = latestReading?.readings?.nitrogen?.value
  const latestP = latestReading?.readings?.phosphorus?.value
  const latestK = latestReading?.readings?.potassium?.value
  const latestPh = latestReading?.readings?.ph?.value
  const latestMoisture = latestReading?.readings?.moisture?.value

  const handleOpenModal = () => {
    setFormError("")
    setTargetZoneId(zones[0]?.id || rawZones[0]?._id || "")
    setNitrogen("")
    setPhosphorus("")
    setPotassium("")
    setPh("")
    setMoisture("")
    setMethod("manual")
    setObservedAt(new Date().toISOString().slice(0, 16))
    setNotes("")
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!targetZoneId) {
      setFormError("Please select a target farm zone.")
      return
    }

    const payloadReadings = {}
    if (nitrogen.trim() !== "") {
      const nVal = Number(nitrogen)
      if (isNaN(nVal) || nVal < 0) {
        setFormError("Nitrogen must be a positive number.")
        return
      }
      payloadReadings.nitrogen = { value: nVal, unit: "mg/kg" }
    }

    if (phosphorus.trim() !== "") {
      const pVal = Number(phosphorus)
      if (isNaN(pVal) || pVal < 0) {
        setFormError("Phosphorus must be a positive number.")
        return
      }
      payloadReadings.phosphorus = { value: pVal, unit: "mg/kg" }
    }

    if (potassium.trim() !== "") {
      const kVal = Number(potassium)
      if (isNaN(kVal) || kVal < 0) {
        setFormError("Potassium must be a positive number.")
        return
      }
      payloadReadings.potassium = { value: kVal, unit: "mg/kg" }
    }

    if (ph.trim() !== "") {
      const phVal = Number(ph)
      if (isNaN(phVal) || phVal < 0 || phVal > 14) {
        setFormError("pH must be between 0.0 and 14.0.")
        return
      }
      payloadReadings.ph = { value: phVal, unit: "pH" }
    }

    if (moisture.trim() !== "") {
      const mVal = Number(moisture)
      if (isNaN(mVal) || mVal < 0 || mVal > 100) {
        setFormError("Moisture must be between 0% and 100%.")
        return
      }
      payloadReadings.moisture = { value: mVal, unit: "%" }
    }

    if (Object.keys(payloadReadings).length === 0) {
      setFormError("Enter at least one measurement (NPK, pH, or Moisture).")
      return
    }

    setSaving(true)
    try {
      await addSoilReading(targetZoneId, {
        readings: payloadReadings,
        method,
        source: "user-entered",
        observedAt: new Date(observedAt).toISOString(),
        notes: notes.trim(),
      })
      notify("Soil reading recorded successfully.")
      setShowModal(false)
      void loadReadings()
    } catch (err) {
      setFormError(err.message || "Failed to save soil reading.")
    } finally {
      setSaving(false)
    }
  }

  const getZoneName = (zoneId) => {
    const found = zones.find((z) => (z.id === zoneId || z._id === zoneId))
    return found ? found.name : "Zone"
  }

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
            Soil Health
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Nutrient and moisture measurements recorded for {farm.name}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {zones.length > 0 && (
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              aria-label="Filter by zone"
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
              <option value="all">All Farm Zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => void loadReadings()}
            aria-label="Refresh readings"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: surface,
              color: muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleOpenModal}
            disabled={!hasFarm || zones.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              background: hasFarm && zones.length > 0 ? "#2E7D32" : "#9E9E9E",
              color: "white",
              border: "none",
              cursor: hasFarm && zones.length > 0 ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            Record Soil Test
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
          }}
        >
          {error}
        </div>
      )}

      {/* Radial gauges for Latest Profile */}
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
            flexWrap: "wrap",
            gap: 12,
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
              Latest Soil Analysis
            </h3>
            <p style={{ fontSize: 12, color: muted }}>
              {latestReading
                ? `Observed: ${new Date(latestReading.observedAt).toLocaleString()} · Method: ${latestReading.method} · Zone: ${getZoneName(latestReading.zoneId)}`
                : "No soil samples logged yet for this selection."}
            </p>
          </div>
          {latestReading && (
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 100,
                background: "#E8F5E9",
                border: "1px solid #C8E6C9",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2E7D32" }}>
                Sample: {latestReading.method.toUpperCase()}
              </span>
            </div>
          )}
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
            value={latestN}
            label="Nitrogen (N)"
            unit=" mg/kg"
            color="#2E7D32"
          />
          <RadialGauge
            value={latestP}
            label="Phosphorus (P)"
            unit=" mg/kg"
            color="#F9A825"
          />
          <RadialGauge
            value={latestK}
            label="Potassium (K)"
            unit=" mg/kg"
            color="#7986CB"
          />
          <RadialGauge
            value={latestPh}
            label="pH Level"
            color="#26A69A"
            max={14}
          />
          <RadialGauge
            value={latestMoisture}
            label="Moisture"
            unit="%"
            color="#64B5F6"
          />
        </div>
      </div>

      {/* Historical Test Logs Table */}
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
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: text,
            }}
          >
            Soil Test History ({readings.length})
          </h3>
        </div>

        {loading ? (
          <p style={{ color: muted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>
            Loading soil readings…
          </p>
        ) : readings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 16px" }}>
            <Sprout size={32} color={muted} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: text, marginBottom: 4 }}>
              No soil readings recorded yet
            </p>
            <p style={{ fontSize: 12, color: muted, maxWidth: 380, margin: "0 auto 16px" }}>
              {zones.length === 0
                ? "First add zones under Settings → Farm Details, then record laboratory or field tests here."
                : "Submit test results using the 'Record Soil Test' button above to track your soil health over time."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
            >
              <thead>
                <tr>
                  {[
                    "Date & Time",
                    "Zone",
                    "Method",
                    "Nitrogen",
                    "Phosphorus",
                    "Potassium",
                    "pH",
                    "Moisture",
                    "Notes",
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
                {readings.map((r, i) => {
                  const n = r.readings?.nitrogen?.value
                  const p = r.readings?.phosphorus?.value
                  const k = r.readings?.potassium?.value
                  const phVal = r.readings?.ph?.value
                  const mVal = r.readings?.moisture?.value

                  return (
                    <tr
                      key={r._id || i}
                      style={{
                        background:
                          i % 2 === 0
                            ? "transparent"
                            : isDark
                              ? "#1E2E1E"
                              : "#FAFCFA",
                      }}
                    >
                      <td style={{ padding: "12px 14px", color: text, whiteSpace: "nowrap" }}>
                        {new Date(r.observedAt).toLocaleDateString()}{" "}
                        <span style={{ color: muted, fontSize: 11 }}>
                          {new Date(r.observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: text }}>
                        {getZoneName(r.zoneId)}
                      </td>
                      <td style={{ padding: "12px 14px", textTransform: "capitalize", color: muted }}>
                        {r.method}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", color: n != null ? "#2E7D32" : muted }}>
                        {n != null ? `${n} mg/kg` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", color: p != null ? "#F9A825" : muted }}>
                        {p != null ? `${p} mg/kg` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", color: k != null ? "#7986CB" : muted }}>
                        {k != null ? `${k} mg/kg` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", color: phVal != null ? "#26A69A" : muted }}>
                        {phVal != null ? phVal.toFixed(1) : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", color: mVal != null ? "#64B5F6" : muted }}>
                        {mVal != null ? `${mVal}%` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", color: muted, fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.notes || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Soil Test Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            style={{
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: 20,
              maxWidth: 540,
              width: "100%",
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
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
                <h2 style={{ fontSize: 18, fontWeight: 700, color: text }}>
                  Record Soil Measurement
                </h2>
                <p style={{ fontSize: 12, color: muted }}>
                  Enter chemical or moisture measurements from laboratory or sensor tests
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
                style={{
                  background: "none",
                  border: "none",
                  color: muted,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", color: text, fontSize: 12, marginBottom: 6 }}>
                    Farm Zone *
                  </label>
                  <select
                    value={targetZoneId}
                    onChange={(e) => setTargetZoneId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: isDark ? "#223022" : "#F8FAF7",
                      color: text,
                      fontSize: 13,
                    }}
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} {z.crop ? `(${z.crop})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Nitrogen (mg/kg)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 75"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                />
                <Field
                  label="Phosphorus (mg/kg)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 50"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                />
                <Field
                  label="Potassium (mg/kg)"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 80"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                />
                <Field
                  label="pH Level (0 - 14)"
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  placeholder="e.g. 6.8"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />
                <Field
                  label="Moisture (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 55"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value)}
                />

                <div>
                  <label style={{ display: "block", color: text, fontSize: 12, marginBottom: 6 }}>
                    Testing Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: isDark ? "#223022" : "#F8FAF7",
                      color: text,
                      fontSize: 13,
                    }}
                  >
                    <option value="manual">Manual Field Test</option>
                    <option value="lab">Laboratory Analysis</option>
                    <option value="sensor">In-situ Sensor Probe</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="Observation Date & Time"
                    type="datetime-local"
                    value={observedAt}
                    onChange={(e) => setObservedAt(e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="Notes / Laboratory Reference (optional)"
                    placeholder="e.g. Pre-monsoon soil sample #24"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" style={{ marginTop: 16, color: "#E53935", fontSize: 13 }}>
                  {formError}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "none",
                    color: text,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#2E7D32",
                    color: "white",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: 13,
                  }}
                >
                  {saving ? "Saving…" : "Save Measurement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
