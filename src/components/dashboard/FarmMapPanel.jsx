import { useState, useMemo } from "react"
import {
  Map,
  Plus,
  Minus,
  RotateCcw,
  Sprout,
  Droplets,
  Activity,
  ArrowRight,
  MapPin,
  Compass,
  Layers,
  AlertTriangle,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useFarm } from "../../context/FarmContext"
import { usePalette } from "../ui/usePalette"
import PanelCard from "../ui/PanelCard"
import Toggle from "../ui/Toggle"

export default function FarmMapPanel() {
  const p = usePalette()
  const { farm, zones, toggleZone, hasFarm } = useFarm()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [selected, setSelected] = useState(() => {
    const fromParam = params.get("zone")
    if (fromParam && zones.some((z) => z.id === fromParam)) return fromParam
    return zones[0]?.id || null
  })
  const [layer, setLayer] = useState("health")
  const [zoomLevel, setZoomLevel] = useState(1.5)

  const activeZoneId = zones.some((z) => z.id === selected) ? selected : zones[0]?.id || null
  const zone = zones.find((z) => z.id === activeZoneId) || null

  // Only use real GPS coordinates — never silently fall back to an invented location
  const hasCoordinates =
    farm.coordinates?.latitude != null &&
    farm.coordinates?.longitude != null &&
    !isNaN(Number(farm.coordinates.latitude)) &&
    !isNaN(Number(farm.coordinates.longitude))

  const lat = hasCoordinates ? Number(farm.coordinates.latitude) : null
  const lon = hasCoordinates ? Number(farm.coordinates.longitude) : null

  // Calculate dynamic bounding box based on zoom level (only when real coords exist)
  const osmEmbedUrl = useMemo(() => {
    if (!hasCoordinates) return null
    const delta = 0.025 / zoomLevel
    const minLon = lon - delta * 1.4
    const maxLon = lon + delta * 1.4
    const minLat = lat - delta
    const maxLat = lat + delta
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${lat},${lon}`
  }, [hasCoordinates, lat, lon, zoomLevel])

  const color = (z) => {
    if (layer === "irrigation") {
      return z.active ? "#1565C0" : "#9E9E9E"
    }
    if (layer === "moisture") {
      if (typeof z.moisture !== "number") return "#78909C"
      return z.moisture < 45 ? "#E53935" : z.moisture < 60 ? "#F9A825" : "#43A047"
    }
    if (!z.risk) return "#43A047"
    return z.risk === "High" ? "#E53935" : z.risk === "Medium" ? "#F9A825" : "#43A047"
  }

  const iconButton = {
    padding: 8,
    border: "1px solid " + p.border,
    background: p.surface,
    color: p.text,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: p.text,
              marginBottom: 4,
            }}
          >
            Interactive Farm Map
          </h1>
          <p style={{ fontSize: 14, color: p.muted }}>
            Real GIS mapping and spatial zone monitoring for {farm.name}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: p.muted, fontFamily: "JetBrains Mono, monospace" }}>
          <MapPin size={14} color={hasCoordinates ? "#2E7D32" : "#E53935"} />
          {hasCoordinates
            ? <span>GPS: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E</span>
            : <span style={{ color: "#E53935" }}>No GPS coordinates configured</span>
          }
        </div>
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
            label: "Farm Area",
            value: hasFarm && farm.area ? `${farm.area} ${farm.areaUnit || "ha"}` : "N/A",
            color: "#2E7D32",
          },
          {
            label: "Monitored Zones",
            value: String(zones.length),
            color: "#43A047",
          },
          {
            label: "Average Moisture",
            value: (() => {
              const withMoisture = zones.filter((z) => typeof z.moisture === "number")
              if (withMoisture.length === 0) return "N/A"
              return Math.round(withMoisture.reduce((sum, z) => sum + z.moisture, 0) / withMoisture.length) + "%"
            })(),
            color: "#1565C0",
          },
          {
            label: "Scheduled Irrigation",
            value: `${zones.filter((z) => z.active).length} zones`,
            color: "#7986CB",
          },
        ].map((metric) => (
          <PanelCard
            key={metric.label}
            style={{ padding: 20, borderRadius: 16 }}
          >
            <p
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 24,
                fontWeight: 700,
                color: metric.color,
                marginBottom: 4,
              }}
            >
              {metric.value}
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: p.text }}>
              {metric.label}
            </p>
          </PanelCard>
        ))}
      </div>

      <div
        data-grid="2fr1fr"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <PanelCard>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: p.text,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <Compass size={18} color="#2E7D32" />
              GIS Satellite / Topographic View
            </h2>

            {/* Layer Toggles */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "health", label: "Crop Health" },
                { id: "moisture", label: "Moisture" },
                { id: "irrigation", label: "Irrigation" },
              ].map((l) => (
                <button
                  key={l.id}
                  aria-pressed={layer === l.id}
                  onClick={() => setLayer(l.id)}
                  style={{
                    border: 0,
                    padding: "7px 11px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    background:
                      layer === l.id
                        ? "#2E7D32"
                        : p.isDark
                          ? "#223022"
                          : "#F0F5EF",
                    color: layer === l.id ? "white" : p.muted,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive GIS Map Container */}
          <div
            style={{
              height: 420,
              borderRadius: 14,
              overflow: "hidden",
              position: "relative",
              background: p.isDark ? "#142014" : "#E8EFE8",
              border: `1px solid ${p.border}`,
            }}
          >
            {hasCoordinates ? (
              <>
                {/* Live OpenStreetMap iframe */}
                <iframe
                  title="Interactive Farm GIS Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={osmEmbedUrl}
                />

                {/* Floating Farm GPS Center Tag */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: p.isDark ? "rgba(20, 32, 20, 0.92)" : "rgba(255, 255, 255, 0.92)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#2E7D32",
                      boxShadow: "0 0 0 4px rgba(46, 125, 50, 0.25)",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: p.text }}>
                      {farm.name}
                    </div>
                    <div style={{ fontSize: 10, color: p.muted, fontFamily: "JetBrains Mono, monospace" }}>
                      {lat.toFixed(4)}°N, {lon.toFixed(4)}°E (Zoom: {zoomLevel.toFixed(1)}x)
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No GPS — clear empty state, never show an invented location */
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: 32,
                  textAlign: "center",
                }}
              >
                <MapPin size={40} color={p.isDark ? "#7AAA7A" : "#5A7A5A"} />
                <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 16, fontWeight: 700, color: p.text }}>
                  Farm location not configured
                </div>
                <div style={{ fontSize: 13, color: p.muted, maxWidth: 320, lineHeight: 1.6 }}>
                  Add GPS coordinates (latitude and longitude) for{" "}
                  <strong>{farm.name}</strong> in{" "}
                  <span style={{ color: "#2E7D32", fontWeight: 600 }}>Settings → Farm Details</span>{" "}
                  to display the map.
                </div>
              </div>
            )}

            {/* Floating Map Zoom Controls — only shown when map is active */}
            {hasCoordinates && (
            <div
              style={{
                position: "absolute",
                right: 14,
                bottom: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                zIndex: 10,
              }}
            >
              <button
                aria-label="Zoom in"
                disabled={zoomLevel >= 3.0}
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.5))}
                style={iconButton}
              >
                <Plus size={16} />
              </button>
              <button
                aria-label="Zoom out"
                disabled={zoomLevel <= 0.8}
                onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.5))}
                style={iconButton}
              >
                <Minus size={16} />
              </button>
              <button
                aria-label="Reset map view"
                onClick={() => setZoomLevel(1.5)}
                style={iconButton}
              >
                <RotateCcw size={16} />
              </button>
            </div>
            )}
          </div>

          {/* Map Layer Legend */}
          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: 14,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {(layer === "irrigation"
              ? [
                { label: "Timer Scheduled", color: "#1565C0" },
                { label: "Manual Standby", color: "#9E9E9E" },
              ]
              : layer === "moisture"
                ? [
                  { label: "Deficit (<45%)", color: "#E53935" },
                  { label: "Moderate (45-60%)", color: "#F9A825" },
                  { label: "Optimal (60%+)", color: "#43A047" },
                ]
                : [
                  { label: "High Risk", color: "#E53935" },
                  { label: "Moderate Risk", color: "#F9A825" },
                  { label: "Healthy / Optimal", color: "#43A047" },
                ]
            ).map((item) => (
              <span
                key={item.label}
                style={{
                  fontSize: 12,
                  color: p.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: item.color,
                  }}
                />
                {item.label}
              </span>
            ))}

            <span style={{ marginLeft: "auto", fontSize: 11, color: p.muted, fontStyle: "italic" }}>
              Tiles © OpenStreetMap contributors
            </span>
          </div>
        </PanelCard>

        {/* Selected Zone Inspection Panel */}
        <PanelCard>
          {!zone ? (
            <div style={{ textAlign: "center", padding: "40px 10px" }}>
              <Sprout size={32} color={p.muted} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: p.text }}>No zones configured</p>
              <p style={{ fontSize: 12, color: p.muted, marginTop: 4 }}>Add zones in Settings → Farm Details.</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: p.isDark ? "#1E2E1E" : "#E8F5E9",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Sprout size={22} color="#2E7D32" />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: p.text }}>
                    {zone.name}
                  </h2>
                  <p style={{ fontSize: 12, color: p.muted }}>
                    {zone.crop || "No crop assigned"} {zone.area ? `· ${zone.area} ${zone.areaUnit || "ha"}` : ""}
                  </p>
                </div>
              </div>

              {/* Geometry notice */}
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: p.isDark ? "#222C22" : "#F4F7F4",
                  fontSize: 11,
                  color: p.muted,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MapPin size={13} color="#2E7D32" />
                <span>
                  Anchored to farm center. Detailed boundary polygon not configured.
                </span>
              </div>

              {[
                {
                  label: "Soil Moisture",
                  value: typeof zone.moisture === "number" ? zone.moisture + "%" : "Awaiting test",
                  icon: Droplets,
                  color: typeof zone.moisture === "number" ? "#1565C0" : p.muted,
                },
                {
                  label: "Pest / Disease Risk",
                  value: zone.risk || "None detected",
                  icon: Activity,
                  color:
                    zone.risk === "High"
                      ? "#E53935"
                      : zone.risk === "Medium"
                        ? "#F9A825"
                        : "#43A047",
                },
                {
                  label: "Water Target",
                  value: typeof zone.target === "number" && zone.target > 0 ? zone.target.toLocaleString() + " L" : "Not configured",
                  icon: Droplets,
                  color: typeof zone.target === "number" && zone.target > 0 ? "#1565C0" : p.muted,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <row.icon size={16} color={row.color} />
                  <span style={{ fontSize: 13, color: p.muted }}>{row.label}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 13,
                      fontWeight: 700,
                      color: row.color,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              <div
                style={{
                  borderTop: "1px solid " + p.border,
                  paddingTop: 18,
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, color: p.text, fontWeight: 700 }}>
                      Irrigation Schedule
                    </span>
                    <div style={{ fontSize: 11, color: p.muted }}>
                      {zone.active ? "Timer ON (Automated)" : "Timer OFF (Manual Standby)"}
                    </div>
                  </div>
                  <Toggle
                    checked={zone.active}
                    onChange={() => toggleZone(zone.id)}
                    label={"Map irrigation for Zone " + zone.id}
                    offColor={p.isDark ? "#2A3D2A" : "#E0E0E0"}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate("/dashboard/irrigation")}
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: 11,
                  marginTop: 24,
                  border: 0,
                  borderRadius: 10,
                  background: "#2E7D32",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Manage Irrigation
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </PanelCard>
      </div>

      {/* Field Zones Grid Selector */}
      <PanelCard>
        <h2
          style={{
            fontSize: 15,
            color: p.text,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Registered Field Zones ({zones.length})
        </h2>
        <div
          data-grid="repeat(4,1fr)"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {zones.length === 0 ? (
            <p style={{ color: p.muted, fontSize: 13, gridColumn: "1 / -1" }}>
              No zones registered yet. Add zones in Settings → Farm Details.
            </p>
          ) : (
            zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setSelected(z.id)}
                aria-pressed={selected === z.id}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: selected === z.id ? (p.isDark ? "#233823" : "#E8F5E9") : (p.isDark ? "#1E2E1E" : "#FAFCFA"),
                  border: "1.5px solid " + (selected === z.id ? "#2E7D32" : p.border),
                  color: p.text,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
                    {z.name}
                  </p>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color(z),
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: p.muted, margin: 0 }}>
                  {z.crop || "No crop"} · {z.area ? `${z.area} ${z.areaUnit || "ha"}` : "Area not set"}
                </p>
                <p style={{ fontSize: 11, color: typeof z.moisture === "number" ? "#1565C0" : p.muted, marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
                  {typeof z.moisture === "number" ? `${z.moisture}% moisture` : "No moisture test"}
                </p>
              </button>
            ))
          )}
        </div>
      </PanelCard>
    </div>
  )
}
