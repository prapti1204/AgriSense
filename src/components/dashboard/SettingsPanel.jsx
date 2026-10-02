import { useState, useEffect } from "react"
import {
  User,
  Sprout,
  Bell,
  Palette,
  Plug,
  Save,
  CheckCircle,
} from "lucide-react"
import { usePalette } from "../ui/usePalette"
import { useAuth } from "../../context/AuthContext"
import { useFarm } from "../../context/FarmContext"
import { useTheme } from "../../context/ThemeContext"
import { useFeedback } from "../../context/FeedbackContext"
import { readStored, writeStored } from "../../data/browserStorage"
import Field from "../ui/Field"
import Toggle from "../ui/Toggle"
import PanelCard from "../ui/PanelCard"
const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "farm", label: "Farm Details", icon: Sprout },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Plug },
]
export default function SettingsPanel() {
  const p = usePalette()
  const { user, updateProfile } = useAuth()
  const { farm, updateFarm } = useFarm()
  const { toggleTheme } = useTheme()
  const { notify } = useFeedback()
  const [tab, setTab] = useState("profile")
  const [name, setName] = useState(user?.name || "Marcus Chen")
  const [email, setEmail] = useState(user?.email || "marcus@greenfield.farm")
  const [farmName, setFarmName] = useState(farm.name)
  const [location, setLocation] = useState(farm.location)
  const [area, setArea] = useState(String(farm.area))
  const [error, setError] = useState("")
  const [notifications, setNotifications] = useState(() =>
    readStored("notifications", {
      weather: true,
      pests: true,
      irrigation: true,
      reports: false,
    }),
  )
  const [integrations, setIntegrations] = useState(() =>
    readStored("integrations", {
      sensors: true,
      satellite: false,
      station: true,
    }),
  )
  useEffect(() => {
    writeStored("notifications", notifications)
  }, [notifications])
  useEffect(() => {
    writeStored("integrations", integrations)
  }, [integrations])
  const inputGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }
  const saveStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 20px",
    borderRadius: 10,
    background: "#2E7D32",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    marginTop: 24,
  }
  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: p.text,
          marginBottom: 4,
        }}
      >
        Settings
      </h1>
      <p style={{ color: p.muted, fontSize: 14, marginBottom: 28 }}>
        Manage your farm profile and preferences
      </p>
      <div
        role="tablist"
        aria-label="Settings sections"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            id={"tab-" + t.id}
            aria-controls={"panel-" + t.id}
            onClick={() => {
              setTab(t.id)
              setError("")
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              borderRadius: 10,
              background: tab === t.id ? "#2E7D32" : p.surface,
              color: tab === t.id ? "white" : p.muted,
              border: "1px solid " + p.border,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id={"panel-" + tab}
        aria-labelledby={"tab-" + tab}
      >
        {tab === "profile" && (
          <PanelCard>
            <h2
              style={{
                color: p.text,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 24,
              }}
            >
              Personal Information
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg,#2E7D32,#66BB6A)",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {user?.avatar || "MC"}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: p.text }}>
                  {user?.name || "Marcus Chen"}
                </p>
                <p style={{ color: p.muted, fontSize: 12 }}>
                  Farm Owner · Demo account
                </p>
              </div>
            </div>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (
                  name.trim().length < 2 ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                ) {
                  setError("Enter a full name and a valid email address.")
                  return
                }
                updateProfile(name.trim(), email.trim())
                setError("")
                notify("Profile saved in this browser.")
              }}
            >
              <div style={inputGrid}>
                <Field
                  label="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
                <Field
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {error && (
                <p
                  role="alert"
                  style={{ marginTop: 16, color: "#E53935", fontSize: 13 }}
                >
                  {error}
                </p>
              )}
              <button style={saveStyle}>
                <Save size={14} />
                Save Changes
              </button>
            </form>
          </PanelCard>
        )}
        {tab === "farm" && (
          <PanelCard>
            <h2
              style={{
                color: p.text,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 24,
              }}
            >
              Farm Details
            </h2>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                if (
                  !farmName.trim() ||
                  !location.trim() ||
                  !Number.isFinite(Number(area)) ||
                  Number(area) <= 0
                ) {
                  setError(
                    "Enter a farm name, location, and positive farm area.",
                  )
                  return
                }
                updateFarm({
                  name: farmName.trim(),
                  location: location.trim(),
                  area: Number(area),
                })
                setError("")
                notify("Farm details saved in this browser.")
              }}
            >
              <div style={inputGrid}>
                <Field
                  label="Farm name"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                />
                <Field
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Field
                  label="Farm area (acres)"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
                <Field label="Farm zones" value="4 monitored zones" readOnly />
              </div>
              {error && (
                <p
                  role="alert"
                  style={{ marginTop: 16, color: "#E53935", fontSize: 13 }}
                >
                  {error}
                </p>
              )}
              <button style={saveStyle}>
                <Save size={14} />
                Save Farm Details
              </button>
            </form>
          </PanelCard>
        )}
        {tab === "notifications" && (
          <PanelCard>
            <h2
              style={{
                color: p.text,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Alert Preferences
            </h2>
            <p style={{ color: p.muted, fontSize: 13, marginBottom: 20 }}>
              Choose which alerts are enabled in your demo preferences.
            </p>
            {[
              {
                key: "weather",
                label: "Weather warnings",
                desc: "Heavy rainfall, heat waves, and changing weather conditions",
              },
              {
                key: "pests",
                label: "Pest & disease alerts",
                desc: "High-risk detections and crop health updates",
              },
              {
                key: "irrigation",
                label: "Irrigation reminders",
                desc: "Scheduled watering and low soil moisture",
              },
              {
                key: "reports",
                label: "Weekly farm reports",
                desc: "Performance and harvest summaries",
              },
            ].map((row) => (
              <div
                key={row.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  padding: "20px 0",
                  borderBottom: "1px solid " + p.border,
                }}
              >
                <div>
                  <p style={{ color: p.text, fontSize: 14, fontWeight: 600 }}>
                    {row.label}
                  </p>
                  <p style={{ color: p.muted, fontSize: 12, marginTop: 4 }}>
                    {row.desc}
                  </p>
                </div>
                <Toggle
                  checked={notifications[row.key]}
                  label={row.label}
                  onChange={() => {
                    setNotifications((n) => ({ ...n, [row.key]: !n[row.key] }))
                    notify("Notification preference saved.")
                  }}
                  offColor={p.isDark ? "#2A3D2A" : "#E0E0E0"}
                />
              </div>
            ))}
          </PanelCard>
        )}
        {tab === "appearance" && (
          <PanelCard>
            <h2
              style={{
                color: p.text,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 20,
              }}
            >
              Theme
            </h2>
            <div
              data-grid="1fr1fr"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              {["Light", "Dark"].map((mode) => (
                <button
                  key={mode}
                  aria-pressed={(mode === "Dark") === p.isDark}
                  onClick={() => {
                    if ((mode === "Dark") !== p.isDark) toggleTheme()
                  }}
                  style={{
                    textAlign: "left",
                    borderRadius: 16,
                    padding: 20,
                    border:
                      "2px solid " +
                      ((mode === "Dark") === p.isDark ? "#43A047" : p.border),
                    cursor: "pointer",
                    background: mode === "Dark" ? "#142014" : "#F8FAF7",
                    color: mode === "Dark" ? "#E8F5E8" : "#1A2E1A",
                  }}
                >
                  <div
                    style={{
                      height: 90,
                      display: "flex",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        borderRadius: 6,
                        background: mode === "Dark" ? "#223022" : "#E8F5E9",
                      }}
                    />
                    <div style={{ flex: 1, display: "grid", gap: 8 }}>
                      <div
                        style={{
                          background: mode === "Dark" ? "#1A2A1A" : "white",
                          borderRadius: 6,
                        }}
                      />
                      <div style={{ background: "#2E7D32", borderRadius: 6 }} />
                    </div>
                  </div>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {mode}
                    {(mode === "Dark") === p.isDark && (
                      <CheckCircle size={16} color="#43A047" />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </PanelCard>
        )}
        {tab === "integrations" && (
          <PanelCard>
            <h2
              style={{
                color: p.text,
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Demo Integrations
            </h2>
            <p style={{ fontSize: 13, color: p.muted, marginBottom: 20 }}>
              Simulate connection status using mock data.
            </p>
            {[
              {
                key: "sensors",
                label: "IoT Soil Sensors",
                desc: "NPK, pH, and soil moisture readings",
              },
              {
                key: "station",
                label: "Farm Weather Station",
                desc: "Temperature, humidity, and wind data",
              },
              {
                key: "satellite",
                label: "Satellite Imagery",
                desc: "Field imagery and crop health overview",
              },
            ].map((row) => (
              <div
                key={row.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "18px 0",
                  borderBottom: "1px solid " + p.border,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#E8F5E9",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Plug size={18} color="#2E7D32" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: p.text, fontWeight: 600 }}>
                    {row.label}
                  </p>
                  <p style={{ fontSize: 12, color: p.muted }}>{row.desc}</p>
                </div>
                <button
                  onClick={() => {
                    setIntegrations((i) => ({ ...i, [row.key]: !i[row.key] }))
                    notify("Demo connection updated.")
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid " + p.border,
                    background: integrations[row.key] ? "#E8F5E9" : "#2E7D32",
                    color: integrations[row.key] ? "#2E7D32" : "white",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {integrations[row.key] ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </PanelCard>
        )}
      </section>
    </div>
  )
}
