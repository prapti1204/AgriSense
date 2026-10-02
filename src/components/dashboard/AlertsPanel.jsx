import { useFarm, allAlerts } from "../../context/FarmContext"
import { useFeedback } from "../../context/FeedbackContext"
import { useNavigate } from "react-router-dom"
import { usePalette } from "../ui/usePalette"
import { useState } from "react"
import { useTheme } from "../../context/ThemeContext"
import {
  CloudRain,
  Bug,
  Droplets,
  Thermometer,
  Bell,
  CheckCircle,
  X,
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
  const { dismissed, dismiss, dismissAll } = useFarm()
  const { showDetail } = useFeedback()
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const visible = allAlerts.filter(
    (a) => !dismissed.includes(a.id) && (filter === "all" || a.type === filter),
  )
  const filterTabs = [
    {
      id: "all",
      label: "All",
      count: allAlerts.filter((a) => !dismissed.includes(a.id)).length,
    },
    {
      id: "danger",
      label: "Critical",
      count: allAlerts.filter(
        (a) => a.type === "danger" && !dismissed.includes(a.id),
      ).length,
    },
    {
      id: "warning",
      label: "Warnings",
      count: allAlerts.filter(
        (a) => a.type === "warning" && !dismissed.includes(a.id),
      ).length,
    },
    {
      id: "info",
      label: "Info",
      count: allAlerts.filter(
        (a) => a.type === "info" && !dismissed.includes(a.id),
      ).length,
    },
  ]
  return (
    <div>
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
            Alerts & Notifications
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            {visible.length} active alerts requiring attention
          </p>
        </div>
        <button
          onClick={dismissAll}
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
          <CheckCircle size={14} /> Mark all read
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 10,
              background:
                filter === tab.id ? "#2E7D32" : isDark ? "#1E2E1E" : "#F0F5EF",
              color: filter === tab.id ? "white" : muted,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: filter === tab.id ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: 100,
                  background:
                    filter === tab.id
                      ? "rgba(255,255,255,0.25)"
                      : isDark
                        ? "#2A3D2A"
                        : "#E2EBE0",
                  color: filter === tab.id ? "white" : text,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.length === 0 && (
          <div
            style={{
              background: surface,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: 48,
              textAlign: "center",
            }}
          >
            <CheckCircle
              size={40}
              color="#43A047"
              style={{ margin: "0 auto 12px" }}
            />
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: text,
                marginBottom: 6,
              }}
            >
              All caught up!
            </h3>
            <p style={{ color: muted, fontSize: 14 }}>
              No active alerts in this category.
            </p>
          </div>
        )}

        {visible.map((alert) => {
          const Icon = iconMap[alert.icon] || Bell
          const isHigh = alert.type === "danger"
          const isWarn = alert.type === "warning"
          return (
            <div
              key={alert.id}
              style={{
                background: surface,
                border: `1px solid ${border}`,
                borderLeft: `4px solid ${alert.color}`,
                borderRadius: "0 16px 16px 0",
                padding: 20,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${alert.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={alert.color} />
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
                  <span
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: text,
                    }}
                  >
                    {alert.title}
                  </span>
                  {isHigh && (
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
                      CRITICAL
                    </span>
                  )}
                  {isWarn && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background: "#FFF8E1",
                        color: "#F57F17",
                      }}
                    >
                      WARNING
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: muted,
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {alert.message}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: isDark ? "#5A8A5A" : "#9AB89A",
                    }}
                  >
                    {alert.time}
                  </span>
                  <button
                    onClick={() =>
                      navigate(
                        alert.icon === "bug"
                          ? "/dashboard/pest"
                          : alert.icon === "droplets"
                            ? "/dashboard/irrigation"
                            : "/dashboard/weather",
                      )
                    }
                    style={{
                      fontSize: 12,
                      color: "#43A047",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Take Action
                  </button>
                  <button
                    onClick={() =>
                      showDetail(
                        alert.title,
                        <>
                          <p>{alert.message}</p>
                          <p style={{ marginTop: 12 }}>
                            {alert.time} · Demo alert
                          </p>
                        </>,
                      )
                    }
                    style={{
                      fontSize: 12,
                      color: muted,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              <button
                aria-label={"Dismiss " + alert.title}
                onClick={() => dismiss(alert.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: muted,
                  display: "flex",
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
