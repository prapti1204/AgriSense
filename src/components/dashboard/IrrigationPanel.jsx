import { useFarm } from "../../context/FarmContext"
import Toggle from "../ui/Toggle"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { Droplets, Clock, Zap } from "lucide-react"
export default function IrrigationPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { autoMode, toggleAuto, zones, toggleZone } = useFarm()
  const totalUsage = zones.reduce((s, z) => s + z.usage, 0)
  const totalTarget = zones.reduce((s, z) => s + z.target, 0)
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
        Smart Irrigation
      </h1>
      <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
        Automated watering schedule and usage monitoring
      </p>

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
            label: "Weekly Usage",
            value: `${(totalUsage / 1000).toFixed(1)}K L`,
            sub: `of ${(totalTarget / 1000).toFixed(1)}K L target`,
            color: "#64B5F6",
          },
          {
            label: "Savings vs Manual",
            value: "38%",
            sub: "vs. last season",
            color: "#43A047",
          },
          {
            label: "Active Zones",
            value: `${zones.filter((z) => z.active).length} / ${zones.length}`,
            sub: "Running now",
            color: "#2E7D32",
          },
          {
            label: "Next Schedule",
            value: "6:00 AM",
            sub: "Zone A · Today",
            color: "#7986CB",
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
                fontSize: 24,
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
              AI Auto-Irrigation Mode
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              {autoMode
                ? "AI is managing watering schedules based on soil moisture and weather forecasts."
                : "Manual mode — irrigation schedules require manual activation."}
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

      {/* Zone cards */}
      <div
        data-grid="repeat(2,1fr)"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {zones.map((zone) => (
          <div
            key={zone.id}
            style={{
              background: surface,
              border: `1.5px solid ${zone.active ? "#43A047" : border}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
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
                  <div style={{ fontWeight: 600, fontSize: 14, color: text }}>
                    {zone.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: muted,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Clock size={10} /> {zone.next}
                  </div>
                </div>
              </div>
              <Toggle
                checked={zone.active}
                onChange={() => toggleZone(zone.id)}
                label={zone.name + " irrigation"}
                offColor={isDark ? "#2A3D2A" : "#E0E0E0"}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, color: muted }}>
                  Water usage this week
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600,
                    color: text,
                  }}
                >
                  {zone.usage}L / {zone.target}L
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: isDark ? "#223022" : "#E3F2FD",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(zone.usage / zone.target) * 100}%`,
                    background: zone.active
                      ? "linear-gradient(90deg, #1565C0, #64B5F6)"
                      : "#9E9E9E",
                    borderRadius: 4,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>

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
                  background:
                    zone.moisture < 45
                      ? "#E53935"
                      : zone.moisture < 60
                        ? "#F9A825"
                        : "#43A047",
                }}
              />
              <span style={{ fontSize: 12, color: muted }}>Soil moisture:</span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                  color:
                    zone.moisture < 45
                      ? "#E53935"
                      : zone.moisture < 60
                        ? "#F9A825"
                        : "#43A047",
                }}
              >
                {zone.moisture}%
              </span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: muted }}>
                {zone.moisture < 45
                  ? "Needs water"
                  : zone.moisture < 60
                    ? "Monitor"
                    : "Optimal"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
