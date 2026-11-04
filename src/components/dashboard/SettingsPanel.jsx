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
import { apiRequest } from "../../data/api"
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
  const { farm, rawZones, saveFarm, createZone, updateZone, isLoading: farmLoading, hasFarm } = useFarm()
  const { toggleTheme } = useTheme()
  const { notify } = useFeedback()
  const [tab, setTab] = useState("profile")
  const [name, setName] = useState(user?.name || "Marcus Chen")
  const [email, setEmail] = useState(user?.email || "marcus@greenfield.farm")
  const [farmName, setFarmName] = useState(farm?.name || "")
  const [location, setLocation] = useState(farm?.location || "")
  const [area, setArea] = useState(farm?.area ? String(farm.area) : "")
  const [areaUnit, setAreaUnit] = useState(farm?.areaUnit || "acre")
  const [latitude, setLatitude] = useState(farm?.coordinates?.latitude ? String(farm.coordinates.latitude) : "")
  const [longitude, setLongitude] = useState(farm?.coordinates?.longitude ? String(farm.coordinates.longitude) : "")
  const backendFarmId = hasFarm && farm ? (farm._id || farm.id || null) : null
  const backendZones = rawZones || []
  const [savingFarm, setSavingFarm] = useState(false)
  const [farmError, setFarmError] = useState("")
  const [farmStatus, setFarmStatus] = useState("")
  const [zoneName, setZoneName] = useState("")
  const [zoneCrop, setZoneCrop] = useState("")
  const [zoneArea, setZoneArea] = useState("")
  const [zoneError, setZoneError] = useState("")
  const [savingZone, setSavingZone] = useState(false)
  const [editingZoneId, setEditingZoneId] = useState(null)
  const [editZoneCrop, setEditZoneCrop] = useState("")
  const [editZoneArea, setEditZoneArea] = useState("")
  const [savingEditZone, setSavingEditZone] = useState(false)
  const [error, setError] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (farm && farm.exists) {
      setFarmName(farm.name || "")
      setLocation(farm.location || "")
      setArea(farm.area ? String(farm.area) : "")
      setAreaUnit(farm.areaUnit || "acre")
      if (farm.coordinates) {
        setLatitude(farm.coordinates.latitude != null ? String(farm.coordinates.latitude) : "")
        setLongitude(farm.coordinates.longitude != null ? String(farm.coordinates.longitude) : "")
      } else {
        setLatitude("")
        setLongitude("")
      }
    } else {
      setFarmName("")
      setLocation("")
      setArea("")
      setAreaUnit("acre")
      setLatitude("")
      setLongitude("")
    }
  }, [farm])
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
              Farm Owner
                </p>
              </div>
            </div>
            <form
              noValidate
              onSubmit={async (e) => {
                e.preventDefault()
                if (
                  name.trim().length < 2 ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                ) {
                  setError("Enter a full name and a valid email address.")
                  return
                }
                setSavingProfile(true)
                try {
                  await updateProfile(name.trim(), email.trim())
                  setError("")
                  notify("Profile saved.")
                } catch (requestError) {
                  setError(requestError.message)
                } finally {
                  setSavingProfile(false)
                }
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
              <button style={saveStyle} disabled={savingProfile}>
                <Save size={14} />
                {savingProfile ? "Saving…" : "Save Changes"}
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
            <p style={{ color: p.muted, fontSize: 13, marginBottom: 20 }}>
              Save the farm coordinates used to request weather for this location. Enter latitude and longitude in decimal degrees.
            </p>
            {!farmLoading && !backendFarmId && (
              <div
                style={{
                  background: p.isDark ? "#1C2E1C" : "#E8F5E9",
                  border: `1px solid ${p.isDark ? "#2E5A2E" : "#C8E6C9"}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 20,
                  color: p.text,
                  fontSize: 13,
                }}
              >
                <strong>No farm registered yet.</strong> Enter your farm details and coordinates below to create your farm and enable live weather and field monitoring.
              </div>
            )}
            <form
              noValidate
              onSubmit={async (e) => {
                e.preventDefault()
                setFarmError("")
                setFarmStatus("")
                const lat = Number(latitude)
                const lng = Number(longitude)
                if (!farmName.trim() || !area.trim() || !Number.isFinite(Number(area)) || Number(area) <= 0) {
                  setFarmError("Enter a farm name and a positive farm area.")
                  return
                }
                if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
                  setFarmError("Enter valid coordinates: latitude from -90 to 90 and longitude from -180 to 180.")
                  return
                }
                const payload = {
                  ...(backendFarmId ? { id: backendFarmId } : {}),
                  name: farmName.trim(),
                  locationLabel: location.trim(),
                  coordinates: { latitude: lat, longitude: lng },
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                  area: Number(area),
                  areaUnit,
                }
                setSavingFarm(true)
                try {
                  await saveFarm(payload)
                  setFarmStatus(backendFarmId ? "Farm details updated." : "Farm created and saved to your AgriSense account.")
                  notify("Farm saved to your account.")
                } catch (requestError) {
                  setFarmError(requestError.message)
                } finally {
                  setSavingFarm(false)
                }
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
                <div>
                  <Field
                    label={`Farm area (${areaUnit})`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                  <label style={{ display: "block", color: p.text, fontSize: 12, marginTop: 10 }}>
                    Area unit
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value)}
                      style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1px solid ${p.border}`, background: p.isDark ? "#223022" : "#F8FAF7", color: p.text }}
                    >
                      <option value="acre">Acres</option>
                      <option value="ha">Hectares</option>
                    </select>
                  </label>
                </div>
                <Field
                  label="Latitude"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 19.0760"
                />
                <Field
                  label="Longitude"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 72.8777"
                />
              </div>
              {farmError && (
                <p
                  role="alert"
                  style={{ marginTop: 16, color: "#E53935", fontSize: 13 }}
                >
                  {farmError}
                </p>
              )}
              {farmStatus && (
                <p role="status" style={{ marginTop: 16, color: "#2E7D32", fontSize: 13 }}>
                  {farmStatus}
                </p>
              )}
              <button style={saveStyle} disabled={farmLoading || savingFarm}>
                <Save size={14} />
                {farmLoading ? "Loading farm…" : savingFarm ? "Saving…" : backendFarmId ? "Update Farm" : "Create Farm"}
              </button>
            </form>
            <div style={{ borderTop: `1px solid ${p.border}`, marginTop: 28, paddingTop: 24 }}>
              <h3 style={{ color: p.text, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                Farm zones ({backendZones.length})
              </h3>
              <p style={{ color: p.muted, fontSize: 13, marginBottom: 16 }}>
                Zones are saved under this farm. Field boundaries can be added later for satellite analysis.
              </p>
              {backendZones.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {backendZones.map((zone) => {
                    const zId = zone._id || zone.id
                    const isEditing = editingZoneId === zId

                    return (
                      <div
                        key={zId}
                        style={{
                          background: p.isDark ? "#1C2E1C" : "#F8FAF7",
                          border: `1px solid ${p.border}`,
                          borderRadius: 12,
                          padding: "12px 16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontWeight: 700, color: p.text, fontSize: 14 }}>{zone.name}</span>
                            <span style={{ color: p.muted, fontSize: 13, marginLeft: 8 }}>
                              {zone.crop ? `Crop: ${zone.crop}` : "No crop assigned"}
                              {zone.area ? ` · ${zone.area} ${zone.areaUnit || areaUnit}` : " · Area not set"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingZoneId(null)
                              } else {
                                setEditingZoneId(zId)
                                setEditZoneCrop(zone.crop || "")
                                setEditZoneArea(zone.area != null ? String(zone.area) : "")
                              }
                            }}
                            style={{
                              background: "transparent",
                              border: `1px solid ${p.border}`,
                              color: p.text,
                              borderRadius: 8,
                              padding: "4px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                        </div>

                        {isEditing && (
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", paddingTop: 8, borderTop: `1px dashed ${p.border}` }}>
                            <div style={{ flex: 1, minWidth: 140 }}>
                              <Field
                                label="Crop species"
                                value={editZoneCrop}
                                onChange={(e) => setEditZoneCrop(e.target.value)}
                                placeholder="Rice, Wheat, Tomato..."
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 140 }}>
                              <Field
                                label={`Area (${zone.areaUnit || areaUnit})`}
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={editZoneArea}
                                onChange={(e) => setEditZoneArea(e.target.value)}
                                placeholder="e.g. 2.5"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={savingEditZone}
                              onClick={async () => {
                                setZoneError("")
                                if (editZoneArea && (!Number.isFinite(Number(editZoneArea)) || Number(editZoneArea) <= 0)) {
                                  setZoneError("Zone area must be a positive number.")
                                  return
                                }
                                setSavingEditZone(true)
                                try {
                                  await updateZone(zId, {
                                    crop: editZoneCrop.trim(),
                                    ...(editZoneArea ? { area: Number(editZoneArea), areaUnit: zone.areaUnit || areaUnit } : {}),
                                  })
                                  setEditingZoneId(null)
                                  notify("Zone updated successfully.")
                                } catch (err) {
                                  setZoneError(err.message || "Failed to update zone.")
                                } finally {
                                  setSavingEditZone(false)
                                }
                              }}
                              style={{
                                background: "#2E7D32",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "9px 16px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: savingEditZone ? "not-allowed" : "pointer",
                                height: 38,
                              }}
                            >
                              {savingEditZone ? "Saving…" : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <form
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault()
                  setZoneError("")
                  if (!backendFarmId) {
                    setZoneError("Save the farm before adding zones.")
                    return
                  }
                  if (!zoneName.trim()) {
                    setZoneError("Enter a zone name.")
                    return
                  }
                  if (zoneArea && (!Number.isFinite(Number(zoneArea)) || Number(zoneArea) <= 0)) {
                    setZoneError("Zone area must be a positive number.")
                    return
                  }
                  setSavingZone(true)
                  try {
                    await createZone({
                      name: zoneName.trim(),
                      crop: zoneCrop.trim(),
                      ...(zoneArea ? { area: Number(zoneArea), areaUnit } : {}),
                    })
                    setZoneName("")
                    setZoneCrop("")
                    setZoneArea("")
                    notify("Zone saved to your account.")
                  } catch (requestError) {
                    setZoneError(requestError.message)
                  } finally {
                    setSavingZone(false)
                  }
                }}
              >
                <div style={inputGrid}>
                  <Field label="Zone name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="North field" />
                  <Field label="Crop (optional)" value={zoneCrop} onChange={(e) => setZoneCrop(e.target.value)} placeholder="Rice" />
                  <Field label={`Zone area in ${areaUnit} (optional)`} type="number" min="0.1" step="0.1" value={zoneArea} onChange={(e) => setZoneArea(e.target.value)} />
                </div>
                {zoneError && <p role="alert" style={{ marginTop: 16, color: "#E53935", fontSize: 13 }}>{zoneError}</p>}
                <button style={saveStyle} disabled={!backendFarmId || savingZone}>
                  <Sprout size={14} />
                  {savingZone ? "Saving zone…" : "Add Zone"}
                </button>
              </form>
            </div>
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
