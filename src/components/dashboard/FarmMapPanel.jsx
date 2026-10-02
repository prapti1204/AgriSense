import { useState } from "react"
import {
  Map,
  Plus,
  Minus,
  RotateCcw,
  Sprout,
  Droplets,
  Activity,
  ArrowRight,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useFarm } from "../../context/FarmContext"
import { usePalette } from "../ui/usePalette"
import PanelCard from "../ui/PanelCard"
import Toggle from "../ui/Toggle"
export default function FarmMapPanel() {
  const p = usePalette()
  const { farm, zones, toggleZone } = useFarm()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [selected, setSelected] = useState(() =>
    zones.some((z) => z.id === params.get("zone")) ? params.get("zone") : "A",
  )
  const [layer, setLayer] = useState("health")
  const [zoom, setZoom] = useState(1)
  const zone = zones.find((z) => z.id === selected)
  const color = (z) =>
    layer === "irrigation"
      ? z.active
        ? "#1565C0"
        : "#9E9E9E"
      : layer === "moisture"
        ? z.moisture < 45
          ? "#E53935"
          : z.moisture < 60
            ? "#F9A825"
            : "#43A047"
        : z.risk === "High"
          ? "#E53935"
          : z.risk === "Medium"
            ? "#F9A825"
            : "#43A047"
  const iconButton = {
    padding: 8,
    border: "1px solid " + p.border,
    background: p.surface,
    color: p.muted,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
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
        Interactive Farm Map
      </h1>
      <p style={{ fontSize: 14, color: p.muted, marginBottom: 24 }}>
        Explore field health, soil moisture, and irrigation across {farm.name}
      </p>
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
          { label: "Farm Area", value: farm.area + " acres", color: "#2E7D32" },
          {
            label: "Monitored Zones",
            value: String(zones.length),
            color: "#43A047",
          },
          {
            label: "Average Moisture",
            value:
              Math.round(
                zones.reduce((sum, z) => sum + z.moisture, 0) / zones.length,
              ) + "%",
            color: "#64B5F6",
          },
          {
            label: "Active Irrigation",
            value: zones.filter((z) => z.active).length + " zones",
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
              marginBottom: 20,
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
              <Map size={18} color="#2E7D32" />
              {farm.name}
            </h2>
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
                    padding: "7px 10px",
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
          <div
            style={{
              height: 400,
              borderRadius: 14,
              overflow: "hidden",
              position: "relative",
              background: "#243D24",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${zoom})`,
                transformOrigin: `${zone.x}% ${zone.y}%`,
                transition: "transform .25s",
              }}
            >
              <img
                src="/assets/farm-map.jpg"
                alt="Farm aerial view"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,.3)",
                }}
              />
              {zones.map((z) => (
                <button
                  key={z.id}
                  aria-label={"Select " + z.name}
                  aria-pressed={selected === z.id}
                  onClick={() => setSelected(z.id)}
                  style={{
                    position: "absolute",
                    left: `${z.x}%`,
                    top: `${z.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "2px solid white",
                    background: color(z),
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow:
                      selected === z.id
                        ? "0 0 0 6px #ffffff55, 0 3px 10px #0005"
                        : "0 3px 10px #0005",
                  }}
                >
                  {z.id}
                </button>
              ))}
            </div>
            <span
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                padding: "5px 10px",
                borderRadius: 6,
                background: "#142014dd",
                color: "white",
                fontSize: 11,
              }}
            >
              Demo farm imagery
            </span>
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <button
                aria-label="Zoom in"
                disabled={zoom >= 2.5}
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                style={iconButton}
              >
                <Plus size={16} />
              </button>
              <button
                aria-label="Zoom out"
                disabled={zoom <= 1}
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                style={iconButton}
              >
                <Minus size={16} />
              </button>
              <button
                aria-label="Reset map view"
                onClick={() => setZoom(1)}
                style={iconButton}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {(layer === "irrigation"
              ? [
                  { label: "Running", color: "#1565C0" },
                  { label: "Inactive", color: "#9E9E9E" },
                ]
              : layer === "moisture"
                ? [
                    { label: "Needs water", color: "#E53935" },
                    { label: "Monitor", color: "#F9A825" },
                    { label: "Optimal", color: "#43A047" },
                  ]
                : [
                    { label: "High Risk", color: "#E53935" },
                    { label: "Medium Risk", color: "#F9A825" },
                    { label: "Low Risk", color: "#43A047" },
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
          </div>
        </PanelCard>
        <PanelCard>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
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
              <Sprout size={20} color="#2E7D32" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: p.text }}>
                {zone.name}
              </h2>
              <p style={{ fontSize: 12, color: p.muted }}>
                {zone.crop} · {zone.area} acres
              </p>
            </div>
          </div>
          {[
            {
              label: "Soil Moisture",
              value: zone.moisture + "%",
              icon: Droplets,
              color: "#64B5F6",
            },
            {
              label: "Pest Risk",
              value: zone.risk,
              icon: Activity,
              color:
                zone.risk === "High"
                  ? "#E53935"
                  : zone.risk === "Medium"
                    ? "#F9A825"
                    : "#43A047",
            },
            {
              label: "Water Usage",
              value: zone.usage + " L",
              icon: Droplets,
              color: "#1565C0",
            },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <row.icon size={16} color={row.color} />
              <span style={{ fontSize: 13, color: p.muted }}>{row.label}</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  fontWeight: 700,
                  color: row.color,
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div
            style={{
              borderTop: "1px solid " + p.border,
              paddingTop: 20,
              marginTop: 20,
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
              <span style={{ fontSize: 13, color: p.text, fontWeight: 600 }}>
                Irrigation {zone.active ? "Running" : "Inactive"}
              </span>
              <Toggle
                checked={zone.active}
                onChange={() => toggleZone(zone.id)}
                label={"Map irrigation for Zone " + zone.id}
                offColor={p.isDark ? "#2A3D2A" : "#E0E0E0"}
              />
            </div>
            <p style={{ fontSize: 12, color: p.muted, marginTop: 14 }}>
              Next schedule: {zone.next}
            </p>
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
              marginTop: 28,
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
        </PanelCard>
      </div>
      <PanelCard>
        <h2
          style={{
            fontSize: 15,
            color: p.text,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Field Zones
        </h2>
        <div
          data-grid="repeat(4,1fr)"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelected(z.id)}
              aria-pressed={selected === z.id}
              style={{
                textAlign: "left",
                padding: 18,
                borderRadius: 12,
                cursor: "pointer",
                background: p.isDark ? "#1E2E1E" : "#FAFCFA",
                border:
                  "1px solid " + (selected === z.id ? "#43A047" : p.border),
                color: p.text,
              }}
            >
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                {z.name}
              </p>
              <p style={{ fontSize: 12, color: p.muted }}>
                {z.moisture}% moisture · {z.risk} risk
              </p>
            </button>
          ))}
        </div>
      </PanelCard>
    </div>
  )
}
