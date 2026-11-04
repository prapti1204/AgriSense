import { useFarm } from "../../context/FarmContext"
import { useFeedback } from "../../context/FeedbackContext"
import { useNavigate } from "react-router-dom"
import { usePalette } from "../ui/usePalette"
import { useState, useEffect, useCallback } from "react"
import { useTheme } from "../../context/ThemeContext"
import {
  CloudRain,
  Bug,
  Droplets,
  Thermometer,
  Bell,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react"

const iconMap = {
  "cloud-rain": CloudRain,
  bug: Bug,
  droplets: Droplets,
  "thermometer-sun": Thermometer,
}

export default function AlertsPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { farm, hasFarm, getFarmAlerts, dismissed, dismiss, dismissAll } = useFarm()
  const { showDetail } = useFeedback()
  const navigate = useNavigate()

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const loadAlerts = useCallback(async () => {
    if (!hasFarm) {
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await getFarmAlerts()
      setAlerts(res.alerts || [])
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [hasFarm, getFarmAlerts])

  useEffect(() => {
    void loadAlerts()
  }, [loadAlerts])

  const visible = alerts.filter(
    (a) => !dismissed.includes(a.id) && (filter === "all" || a.type === filter),
  )

  const filterTabs = [
    {
      id: "all",
      label: "All",
      count: alerts.filter((a) => !dismissed.includes(a.id)).length,
    },
    {
      id: "danger",
      label: "Critical",
      count: alerts.filter((a) => a.type === "danger" && !dismissed.includes(a.id)).length,
    },
    {
      id: "warning",
      label: "Warnings",
      count: alerts.filter((a) => a.type === "warning" && !dismissed.includes(a.id)).length,
    },
    {
      id: "info",
      label: "Info",
      count: alerts.filter((a) => a.type === "info" && !dismissed.includes(a.id)).length,
    },
  ]

  const handleDismissAll = () => {
    dismissAll(alerts.map((a) => a.id))
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
            Alerts & Notifications
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Dynamic agrological advisories generated from real soil samples & weather for {farm.name}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => void loadAlerts()}
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

          {visible.length > 0 && (
            <button
              onClick={handleDismissAll}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                background: "transparent",
                border: `1px solid ${border}`,
                cursor: "pointer",
                fontSize: 13,
                color: muted,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CheckCircle size={14} /> Dismiss All
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: `1px solid ${border}`,
          paddingBottom: 12,
        }}
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background:
                filter === tab.id
                  ? "#2E7D32"
                  : isDark
                    ? "#1E2E1E"
                    : "#F0F5EF",
              color: filter === tab.id ? "white" : muted,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tab.label}
            <span
              style={{
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 10,
                background:
                  filter === tab.id ? "rgba(255,255,255,0.25)" : isDark ? "#2A3D2A" : "#E0E8DE",
                color: filter === tab.id ? "white" : text,
                fontWeight: 700,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <p style={{ color: muted, fontSize: 13, textAlign: "center", padding: "40px 0" }}>
            Evaluating farm telemetry and weather conditions…
          </p>
        ) : visible.length === 0 ? (
          <div
            style={{
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: 48,
              textAlign: "center",
            }}
          >
            <Bell size={32} color="#43A047" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: text, marginBottom: 4 }}>
              All Clear
            </h3>
            <p style={{ fontSize: 13, color: muted, maxWidth: 360, margin: "0 auto" }}>
              No active warnings or threshold breaches detected across your fields and weather forecast.
            </p>
          </div>
        ) : (
          visible.map((a) => {
            const Icon = iconMap[a.icon] || Bell
            return (
              <div
                key={a.id}
                style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderLeft: `4px solid ${a.color}`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background:
                      a.type === "danger"
                        ? "#FFEBEE"
                        : a.type === "warning"
                          ? "#FFF8E1"
                          : "#E8F5E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={a.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: text }}>
                      {a.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background:
                          a.type === "danger"
                            ? "#FFEBEE"
                            : a.type === "warning"
                              ? "#FFF8E1"
                              : "#E8F5E9",
                        color: a.color,
                        textTransform: "uppercase",
                      }}
                    >
                      {a.type}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: muted }}>
                      {a.time}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.5, margin: 0 }}>
                    {a.message}
                  </p>
                </div>
                <button
                  onClick={() => dismiss(a.id)}
                  aria-label="Dismiss alert"
                  style={{
                    background: "none",
                    border: "none",
                    color: muted,
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
