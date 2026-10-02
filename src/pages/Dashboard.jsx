import { Navigate } from "react-router-dom"
import { useFarm } from "../context/FarmContext"
import SettingsPanel from "../components/dashboard/SettingsPanel"
import FarmMapPanel from "../components/dashboard/FarmMapPanel"
import { useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import {
  LayoutDashboard,
  Sprout,
  CloudRain,
  Activity,
  Droplets,
  Bug,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Search,
  Moon,
  Sun,
  LogOut,
  Thermometer,
  Map,
  Menu,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import MainDashboard from "../components/dashboard/MainDashboard"
import WeatherPanel from "../components/dashboard/WeatherPanel"
import SoilPanel from "../components/dashboard/SoilPanel"
import IrrigationPanel from "../components/dashboard/IrrigationPanel"
import PestPanel from "../components/dashboard/PestPanel"
import YieldPanel from "../components/dashboard/YieldPanel"
import AlertsPanel from "../components/dashboard/AlertsPanel"
import ReportsPanel from "../components/dashboard/ReportsPanel"
import CropPanel from "../components/dashboard/CropPanel"
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "" },
  { id: "crop", label: "Crop Recommendations", icon: Sprout, path: "crop" },
  { id: "weather", label: "Weather", icon: CloudRain, path: "weather" },
  { id: "soil", label: "Soil Health", icon: Activity, path: "soil" },
  { id: "irrigation", label: "Irrigation", icon: Droplets, path: "irrigation" },
  { id: "pest", label: "Pest Detection", icon: Bug, path: "pest" },
  { id: "yield", label: "Yield Prediction", icon: BarChart3, path: "yield" },
  { id: "alerts", label: "Alerts", icon: Bell, path: "alerts", badge: 4 },
  { id: "reports", label: "Reports", icon: FileText, path: "reports" },
  { id: "map", label: "Farm Map", icon: Map, path: "map" },
  { id: "settings", label: "Settings", icon: Settings, path: "settings" },
]
export default function Dashboard() {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768)
  const { dismissed, farm } = useFarm()
  const alertCount = Math.max(0, 4 - dismissed.filter((id) => id <= 4).length)
  const [searchQuery, setSearchQuery] = useState("")
  const searchResults = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const bg = isDark ? "#0F1A0F" : "#F1F5F0"
  const surface = isDark ? "#1A2A1A" : "#FFFFFF"
  const border = isDark ? "#2A3D2A" : "#E2EBE0"
  const text = isDark ? "#E8F5E8" : "#1A2E1A"
  const muted = isDark ? "#7AAA7A" : "#5A7A5A"
  const sidebarBg = isDark ? "#142014" : "#FFFFFF"
  const currentPath =
    location.pathname.replace("/dashboard", "").replace("/", "") || ""
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: bg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className="dashboard-sidebar"
        aria-label="Dashboard navigation"
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
        style={{
          width: sidebarOpen ? 240 : 0,
          minWidth: sidebarOpen ? 240 : 0,
          background: sidebarBg,
          borderRight: `1px solid ${border}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease, min-width 0.25s ease",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 8px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "linear-gradient(135deg,#2E7D32,#66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sprout size={18} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#2E7D32",
                  whiteSpace: "nowrap",
                }}
              >
                AgriSense
              </div>
              <div style={{ fontSize: 10, color: muted, whiteSpace: "nowrap" }}>
                {farm.name}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: muted,
              padding: "0 10px",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            MAIN
          </div>
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon
            const active = currentPath === item.path
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/dashboard/${item.path}`)
                  setSearchQuery("")
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
                aria-current={active ? "page" : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  background: active
                    ? isDark
                      ? "#1E3A1E"
                      : "#E8F5E9"
                    : "transparent",
                  color: active ? "#2E7D32" : muted,
                  fontWeight: active ? 600 : 400,
                  fontSize: 13.5,
                  textAlign: "left",
                  transition: "background 0.15s",
                  marginBottom: 2,
                }}
              >
                <Icon size={16} />
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                {item.badge && alertCount > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#E53935",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 100,
                    }}
                  >
                    {alertCount}
                  </span>
                )}
              </button>
            )
          })}

          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: muted,
              padding: "12px 10px 6px",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            MANAGE
          </div>
          {navItems.slice(7).map((item) => {
            const Icon = item.icon
            const active = currentPath === item.path
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/dashboard/${item.path}`)
                  setSearchQuery("")
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
                aria-current={active ? "page" : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  background: active
                    ? isDark
                      ? "#1E3A1E"
                      : "#E8F5E9"
                    : "transparent",
                  color: active ? "#2E7D32" : muted,
                  fontWeight: active ? 600 : 400,
                  fontSize: 13.5,
                  textAlign: "left",
                  transition: "background 0.15s",
                  marginBottom: 2,
                }}
              >
                <Icon size={16} />
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                {item.badge && alertCount > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#E53935",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 100,
                    }}
                  >
                    {alertCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User profile */}
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#2E7D32,#66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {user?.avatar || "MC"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "Marcus Chen"}
              </div>
              <div style={{ fontSize: 11, color: muted, whiteSpace: "nowrap" }}>
                Farm Owner
              </div>
            </div>
            <button
              aria-label="Sign out"
              onClick={() => {
                logout()
                navigate("/")
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: muted,
                display: "flex",
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={
          sidebarOpen
            ? "dashboard-content sidebar-visible"
            : "dashboard-content"
        }
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 0,
          transition: "margin-left 0.25s ease",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top nav */}
        <header
          className="dashboard-header"
          style={{
            height: 60,
            background: surface,
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((s) => !s)}
            style={{
              background: "none",
              border: `1px solid ${border}`,
              borderRadius: 8,
              cursor: "pointer",
              color: muted,
              padding: "6px",
              display: "flex",
            }}
          >
            <Menu size={16} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
            <Search
              size={14}
              color={muted}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              aria-label="Search fields, crops, alerts"
              placeholder="Search fields, crops, alerts..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchResults.length) {
                  navigate(`/dashboard/${searchResults[0].path}`)
                  setSearchQuery("")
                }
                if (e.key === "Escape") setSearchQuery("")
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: isDark ? "#1E2E1E" : "#F8FAF7",
                color: text,
                fontSize: 13,
                outline: "none",
                fontFamily: "Inter, sans-serif",
                boxSizing: "border-box",
              }}
            />
            {searchQuery.trim() && (
              <div
                role="region"
                aria-label="Search results"
                style={{
                  position: "absolute",
                  top: 40,
                  width: "100%",
                  background: surface,
                  border: "1px solid " + border,
                  borderRadius: 10,
                  padding: 8,
                  boxShadow: "0 8px 24px #0001",
                }}
              >
                {searchResults.length ? (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate("/dashboard/" + item.path)
                        setSearchQuery("")
                      }}
                      style={{
                        display: "block",
                        textAlign: "left",
                        width: "100%",
                        padding: 10,
                        border: 0,
                        background: "none",
                        color: text,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {item.label}
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: 13, padding: 10, color: muted }}>
                    No matching pages
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Weather mini */}
            <div
              className="weather-mini"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: isDark ? "#1E2E1E" : "#EBF5E9",
                border: `1px solid ${border}`,
              }}
            >
              <Thermometer size={13} color="#E53935" />
              <span style={{ fontSize: 13, fontWeight: 600, color: text }}>
                28°C
              </span>
              <span style={{ fontSize: 11, color: muted }}>Partly Cloudy</span>
            </div>

            {/* Alerts bell */}
            <button
              aria-label="Open alerts"
              style={{
                position: "relative",
                background: "none",
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "7px",
                cursor: "pointer",
                color: muted,
                display: "flex",
              }}
              onClick={() => navigate("/dashboard/alerts")}
            >
              <Bell size={16} />
              {alertCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#E53935",
                    border: `2px solid ${surface}`,
                  }}
                />
              )}
            </button>

            {/* Theme toggle */}
            <button
              aria-label={isDark ? "Use light theme" : "Use dark theme"}
              onClick={toggleTheme}
              style={{
                background: "none",
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "7px",
                cursor: "pointer",
                color: muted,
                display: "flex",
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Avatar */}
            <button
              aria-label="Open profile settings"
              onClick={() => navigate("/dashboard/settings")}
              style={{
                border: 0,
                padding: 0,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#2E7D32,#66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
              }}
            >
              {user?.avatar || "MC"}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          className="dashboard-main"
          style={{ flex: 1, padding: 24, overflow: "auto" }}
        >
          <Routes>
            <Route path="/" element={<MainDashboard />} />
            <Route path="/crop" element={<CropPanel />} />
            <Route path="/weather" element={<WeatherPanel />} />
            <Route path="/soil" element={<SoilPanel />} />
            <Route path="/irrigation" element={<IrrigationPanel />} />
            <Route path="/pest" element={<PestPanel />} />
            <Route path="/yield" element={<YieldPanel />} />
            <Route path="/alerts" element={<AlertsPanel />} />
            <Route path="/reports" element={<ReportsPanel />} />
            <Route path="/settings" element={<SettingsPanel />} />
            <Route path="/map" element={<FarmMapPanel />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
