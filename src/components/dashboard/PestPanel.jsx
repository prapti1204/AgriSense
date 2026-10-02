import { useFeedback } from "../../context/FeedbackContext"
import { useNavigate } from "react-router-dom"
import { usePalette } from "../ui/usePalette"
import { useState, useRef, useEffect } from "react"
import { useTheme } from "../../context/ThemeContext"
import { Upload, Camera, Scan, AlertTriangle, Bug } from "lucide-react"
const recentDetections = [
  {
    crop: "Rice – Zone A",
    issue: "Brown Planthopper",
    risk: "High",
    confidence: 89,
    treatment: "Apply Imidacloprid 17.8% SL at 250ml/ha",
    date: "Today, 09:42 AM",
  },
  {
    crop: "Maize – Zone B",
    issue: "Stem Borer",
    risk: "Medium",
    confidence: 76,
    treatment: "Use Chlorpyrifos 20% EC, spray at 2ml/L water",
    date: "Yesterday, 2:15 PM",
  },
  {
    crop: "Vegetables – Zone C",
    issue: "Powdery Mildew",
    risk: "Low",
    confidence: 91,
    treatment: "Apply Sulfur 80% WP at 2.5kg/ha. Improve air circulation.",
    date: "2 days ago",
  },
]
export default function PestPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { notify } = useFeedback()
  const navigate = useNavigate()
  const fileInput = useRef(null)
  const timer = useRef(undefined)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")
  useEffect(() => {
    if (!imageFile) {
      setPreview("")
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const acceptFile = (file) => {
    if (!file || scanning) return
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      notify("Choose a PNG or JPG image smaller than 10 MB.")
      return
    }
    setImageFile(file)
    handleScan()
  }
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [dragging, setDragging] = useState(false)
  const handleScan = () => {
    if (scanning) return
    setScanned(false)
    setScanning(true)
    timer.current = window.setTimeout(() => {
      setScanning(false)
      setScanned(true)
      notify("Demo analysis complete. The result is simulated.")
    }, 2500)
  }
  const riskColor = (risk) =>
    risk === "High" ? "#E53935" : risk === "Medium" ? "#F9A825" : "#43A047"
  const riskBg = (risk) =>
    risk === "High" ? "#FFEBEE" : risk === "Medium" ? "#FFF8E1" : "#E8F5E9"
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
        Pest & Disease Detection
      </h1>
      <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
        AI-powered image analysis for early detection and treatment
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg"
        aria-label="Plant photo"
        style={{ display: "none" }}
        onChange={(e) => {
          acceptFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      <div
        data-grid="1fr1fr"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Upload / scan card */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#FFEBEE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bug size={18} color="#E53935" />
            </div>
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: text,
              }}
            >
              Scan Plant Image
            </h3>
          </div>

          {/* Drop zone */}
          {!scanned && (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                acceptFile(e.dataTransfer.files[0])
              }}
              style={{
                border: `2px dashed ${dragging ? "#43A047" : border}`,
                borderRadius: 16,
                padding: 40,
                textAlign: "center",
                background: dragging
                  ? isDark
                    ? "#1E3A1E"
                    : "#F1FBF1"
                  : isDark
                    ? "#1E2E1E"
                    : "#FAFAFA",
                marginBottom: 16,
                transition: "all 0.2s",
              }}
            >
              {scanning ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ position: "relative", width: 64, height: 64 }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "3px solid #43A047",
                        opacity: 0.3,
                      }}
                      className="pulse-ring"
                    />
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "#E8F5E9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Scan size={28} color="#2E7D32" />
                    </div>
                  </div>
                  <p
                    style={{ fontSize: 14, fontWeight: 600, color: "#2E7D32" }}
                  >
                    AI Scanning in progress...
                  </p>
                  <p style={{ fontSize: 12, color: muted }}>
                    Analyzing plant tissue and symptoms
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: isDark ? "#2A3D2A" : "#F0F5EF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Upload size={22} color={muted} />
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: text,
                      marginBottom: 4,
                    }}
                  >
                    Drop plant photo here
                  </p>
                  <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
                    PNG, JPG up to 10MB · or
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => fileInput.current?.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 10,
                        background: "#2E7D32",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <Upload size={14} /> Upload Photo
                    </button>
                    <button
                      onClick={() => {
                        setImageFile(null)
                        notify("Using a sample photo for this camera demo.")
                        handleScan()
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 18px",
                        borderRadius: 10,
                        background: "transparent",
                        color: text,
                        border: `1px solid ${border}`,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      <Camera size={14} /> Use Camera
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Result */}
          {scanned && (
            <div>
              <div
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 14,
                  position: "relative",
                }}
              >
                <img
                  src={preview || "/assets/plant-sample.jpg"}
                  alt="Scanned plant"
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "#FFEBEE",
                    border: "1.5px solid #E53935",
                    borderRadius: 8,
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <AlertTriangle size={12} color="#E53935" />
                  <span
                    style={{ fontSize: 11, fontWeight: 700, color: "#E53935" }}
                  >
                    High Risk
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: isDark ? "#2A1515" : "#FFEBEE",
                  border: "1.5px solid #E53935",
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <AlertTriangle size={16} color="#E53935" />
                  <span
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#B71C1C",
                    }}
                  >
                    Brown Planthopper Detected
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#E53935",
                    }}
                  >
                    89% confidence
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: isDark ? "#FFCDD2" : "#C62828",
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  Early-stage infestation detected in leaf base region.
                  Immediate treatment recommended.
                </p>
                <div
                  style={{
                    background: isDark ? "#1A1010" : "rgba(255,255,255,0.7)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: muted,
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Recommended Treatment
                  </div>
                  <p style={{ fontSize: 13, color: text }}>
                    Apply Imidacloprid 17.8% SL at 250ml/ha. Repeat after 10
                    days if infestation persists.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setScanned(false)
                  setImageFile(null)
                }}
                style={{
                  width: "100%",
                  padding: "9px",
                  borderRadius: 10,
                  background: "transparent",
                  border: `1px solid ${border}`,
                  cursor: "pointer",
                  fontSize: 13,
                  color: muted,
                }}
              >
                Scan another image
              </button>
            </div>
          )}
        </div>

        {/* Risk map */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h3
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: text,
              marginBottom: 16,
            }}
          >
            Field Risk Overview
          </h3>
          <div
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <img
              src="/assets/farm-map.jpg"
              alt="Farm aerial view"
              style={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
              }}
            />
            {[
              { x: "20%", y: "35%", label: "A", risk: "high" },
              { x: "55%", y: "25%", label: "B", risk: "medium" },
              { x: "70%", y: "55%", label: "C", risk: "low" },
            ].map((z) => (
              <button
                type="button"
                aria-label={"Open farm map for Zone " + z.label}
                onClick={() => navigate("/dashboard/map?zone=" + z.label)}
                key={z.label}
                style={{
                  border: 0,
                  padding: 0,
                  background: "none",
                  cursor: "pointer",
                  position: "absolute",
                  left: z.x,
                  top: z.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background:
                      z.risk === "high"
                        ? "#E53935"
                        : z.risk === "medium"
                          ? "#F9A825"
                          : "#43A047",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <span
                    style={{ fontSize: 11, fontWeight: 700, color: "white" }}
                  >
                    {z.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                label: "High Risk",
                color: "#E53935",
                bg: "#FFEBEE",
                count: 1,
                zone: "Zone A",
              },
              {
                label: "Medium Risk",
                color: "#F9A825",
                bg: "#FFF8E1",
                count: 1,
                zone: "Zone B",
              },
              {
                label: "Low Risk",
                color: "#43A047",
                bg: "#E8F5E9",
                count: 1,
                zone: "Zone C",
              },
            ].map((r) => (
              <div
                key={r.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isDark ? "#1E2E1E" : r.bg,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: r.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: r.color }}>
                  {r.label}
                </span>
                <span
                  style={{ fontSize: 12, color: muted, marginLeft: "auto" }}
                >
                  {r.zone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detection history */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: text,
            marginBottom: 16,
          }}
        >
          Recent Detections
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recentDetections.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                padding: "16px",
                borderRadius: 14,
                background: isDark ? "#1E2E1E" : "#FAFCFA",
                border: `1px solid ${border}`,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: riskBg(d.risk),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Bug size={18} color={riskColor(d.risk)} />
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
                  <span style={{ fontSize: 14, fontWeight: 600, color: text }}>
                    {d.issue}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 100,
                      background: riskBg(d.risk),
                      color: riskColor(d.risk),
                    }}
                  >
                    {d.risk} Risk
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 11,
                      fontFamily: "JetBrains Mono, monospace",
                      color: muted,
                    }}
                  >
                    {d.confidence}%
                  </span>
                </div>
                <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>
                  {d.crop} · {d.date}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: isDark ? "#A5D6A7" : "#2E4A2E",
                    background: isDark ? "#1A3A1A" : "#F1FBF1",
                    padding: "8px 12px",
                    borderRadius: 8,
                  }}
                >
                  <strong>Treatment:</strong> {d.treatment}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
