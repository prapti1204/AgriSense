import { useFeedback } from "../../context/FeedbackContext"
import { useNavigate } from "react-router-dom"
import { usePalette } from "../ui/usePalette"
import { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "../../context/ThemeContext"
import { useFarm } from "../../context/FarmContext"
import { Upload, Camera, Scan, AlertTriangle, Bug, CheckCircle2, RefreshCw, X, ShieldAlert } from "lucide-react"

export default function PestPanel() {
  const { isDark } = useTheme()
  const { surface, border, text, muted } = usePalette()
  const { notify } = useFeedback()
  const navigate = useNavigate()
  const { farm, zones, rawZones, hasFarm, analyzePlantImage, getZonePredictions } = useFarm()

  const fileInput = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [selectedZoneId, setSelectedZoneId] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id)
    }
  }, [zones, selectedZoneId])

  useEffect(() => {
    if (!imageFile) {
      setPreview("")
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  // Stop camera if unmounting or switching
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const loadHistory = useCallback(async (zoneId) => {
    if (!zoneId) return
    setLoadingHistory(true)
    try {
      const res = await getZonePredictions(zoneId, "pest")
      const list = res.predictions || []
      setHistory(list)
      const latest = list.find((p) => p.status === "completed")
      if (latest && !result) {
        setResult(latest.result)
      }
    } catch {
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [getZonePredictions, result])

  useEffect(() => {
    if (selectedZoneId) {
      void loadHistory(selectedZoneId)
    }
  }, [selectedZoneId, loadHistory])

  const acceptFile = (file) => {
    if (!file || scanning) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      notify("Please choose a PNG, JPG or WebP image under 5 MB.")
      return
    }
    setImageFile(file)
    setResult(null)
    setError("")
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      notify("Camera access denied or device camera unavailable.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
        stopCamera()
        acceptFile(file)
      }
    }, "image/jpeg", 0.9)
  }

  const handleAnalyze = async () => {
    if (!imageFile || !selectedZoneId || scanning) return
    setScanning(true)
    setError("")

    try {
      const reader = new FileReader()
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
      })
      reader.readAsDataURL(imageFile)
      const dataUrl = await base64Promise

      const res = await analyzePlantImage(selectedZoneId, dataUrl, imageFile.type)
      if (res.prediction?.result) {
        setResult(res.prediction.result)
        setHistory((prev) => [
          res.prediction,
          ...prev.filter((p) => (p._id || p.id) !== (res.prediction._id || res.prediction.id)),
        ])
        void loadHistory(selectedZoneId)
        notify("AI Pest & Disease diagnosis complete.")
      }
    } catch (err) {
      setError(err.message || "Failed to analyze plant image. Ensure Gemini API key is configured.")
    } finally {
      setScanning(false)
    }
  }

  const riskColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
      case "high":
        return "#E53935"
      case "moderate":
        return "#F9A825"
      case "low":
        return "#43A047"
      default:
        return muted
    }
  }

  const riskBg = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
      case "high":
        return "#FFEBEE"
      case "moderate":
        return "#FFF8E1"
      case "low":
        return "#E8F5E9"
      default:
        return isDark ? "#223022" : "#F0F5EF"
    }
  }

  const selectedZone = zones.find((z) => z.id === selectedZoneId)

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
            Pest & Disease Detection
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Multimodal AI analysis of actual leaf/plant images with pathology guidance
          </p>
        </div>

        {zones.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: muted }}>Target Zone:</span>
            <select
              value={selectedZoneId}
              onChange={(e) => {
                setSelectedZoneId(e.target.value)
                setResult(null)
              }}
              aria-label="Select target zone"
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
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} {z.crop ? `(${z.crop})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Plant photo"
        style={{ display: "none" }}
        onChange={(e) => {
          acceptFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          {imageFile && (
            <button
              onClick={handleAnalyze}
              disabled={scanning}
              style={{
                background: "#C62828",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: scanning ? "not-allowed" : "pointer",
              }}
            >
              {scanning ? "Retrying…" : "Retry Analysis"}
            </button>
          )}
        </div>
      )}

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
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>
                Diagnostic Image Input
              </h3>
              <p style={{ fontSize: 12, color: muted }}>
                Upload or capture an affected leaf or pest sample
              </p>
            </div>
          </div>

          {cameraActive ? (
            <div style={{ marginBottom: 16, textAlign: "center" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  maxHeight: 260,
                  borderRadius: 12,
                  objectFit: "cover",
                  background: "#000",
                }}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
                <button
                  onClick={capturePhoto}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "#2E7D32",
                    color: "white",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "none",
                    border: `1px solid ${border}`,
                    color: text,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : !imageFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                acceptFile(e.dataTransfer.files?.[0])
              }}
              style={{
                border: `2px dashed ${dragging ? "#2E7D32" : border}`,
                borderRadius: 14,
                padding: "36px 20px",
                textAlign: "center",
                background: dragging ? (isDark ? "#1E2E1E" : "#F1F8F1") : "transparent",
                marginBottom: 16,
              }}
            >
              <Upload size={32} color={muted} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: text, marginBottom: 4 }}>
                Drag and drop plant image here
              </p>
              <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
                Supports JPG, PNG or WebP up to 5 MB
              </p>

              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button
                  onClick={() => fileInput.current?.click()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "#2E7D32",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Upload size={14} /> Upload Image
                </button>

                <button
                  onClick={startCamera}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "transparent",
                    border: `1px solid ${border}`,
                    color: text,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Camera size={14} /> Use Camera
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  position: "relative",
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 16,
                  maxHeight: 220,
                  background: "#000",
                }}
              >
                <img
                  src={preview}
                  alt="Plant preview"
                  style={{ width: "100%", maxHeight: 220, objectFit: "contain" }}
                />
                <button
                  onClick={() => {
                    setImageFile(null)
                    setResult(null)
                  }}
                  aria-label="Remove image"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    border: "none",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={scanning}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  background: scanning ? "#9E9E9E" : "#2E7D32",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: scanning ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Scan size={16} className={scanning ? "spin" : ""} />
                {scanning ? "Gemini Inspecting Pathology…" : "Run AI Diagnosis"}
              </button>
            </div>
          )}
        </div>

        {/* Diagnosis result card */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 20,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <ShieldAlert size={20} color="#2E7D32" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: text }}>
                Diagnostic Findings
              </h3>
            </div>

            {!result ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <Bug size={36} color={muted} style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: text, marginBottom: 4 }}>
                  No active image diagnosed
                </p>
                <p style={{ fontSize: 12, color: muted }}>
                  Upload a photo of a suspicious leaf or insect to inspect for pathogens, fungal infections, or nutrient stress.
                </p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: riskBg(result.severity),
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: riskColor(result.severity) }}>
                      {result.issueName}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        color: riskColor(result.severity),
                      }}
                    >
                      {Math.round(result.confidence * 100)}% AI-Estimated Confidence
                    </span>
                  </div>

                  {result.scientificName && (
                    <div style={{ fontSize: 12, fontStyle: "italic", color: muted, marginBottom: 6 }}>
                      {result.scientificName}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background: "rgba(0,0,0,0.06)",
                        color: riskColor(result.severity),
                        textTransform: "uppercase",
                      }}
                    >
                      {result.category}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 100,
                        background: "rgba(0,0,0,0.06)",
                        color: riskColor(result.severity),
                        textTransform: "uppercase",
                      }}
                    >
                      {result.severity} Severity
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: text, lineHeight: 1.5, marginBottom: 16 }}>
                  {result.diagnosisNotes}
                </p>

                {result.symptoms?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>
                      Observed Symptoms:
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: text }}>
                      {result.symptoms.map((s, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.treatments?.length > 0 && (
                  <div
                    style={{
                      background: isDark ? "#1E2E1E" : "#F1F8F1",
                      border: "1px solid #C8E6C9",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#2E7D32", textTransform: "uppercase", marginBottom: 4 }}>
                      Recommended Interventions
                    </div>
                    <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: text }}>
                      {result.treatments.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: 3 }}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ marginTop: 14, fontSize: 11, color: muted, fontStyle: "italic", lineHeight: 1.4 }}>
                  * Confidence is an AI-estimated heuristic, not a calibrated pathological probability. Always confirm severe crop symptoms with certified agronomists before spraying.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real Detection History Table */}
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
          Diagnosis History ({history.length})
        </h3>

        {loadingHistory ? (
          <p style={{ color: muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            Loading past detections…
          </p>
        ) : history.length === 0 ? (
          <p style={{ color: muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No past plant diagnoses logged for {selectedZone?.name || "this zone"}.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {history.map((item) => {
              const res = item.result || {}
              return (
                <div
                  key={item._id}
                  onClick={() => setResult(res)}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "16px",
                    borderRadius: 14,
                    background: isDark ? "#1E2E1E" : "#FAFCFA",
                    border: `1px solid ${border}`,
                    alignItems: "flex-start",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: riskBg(res.severity),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bug size={18} color={riskColor(res.severity)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: text }}>
                        {res.issueName || "Diagnosis Run"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 100,
                          background: riskBg(res.severity),
                          color: riskColor(res.severity),
                        }}
                      >
                        {res.severity || "Unknown"}
                      </span>
                      <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: muted }}>
                        {res.confidence != null ? `${Math.round(res.confidence * 100)}% AI-est. conf.` : "—"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: muted, marginBottom: 8 }}>
                      {item.inputSnapshot?.crop || "Crop"} · {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {res.treatments?.[0] && (
                      <div
                        style={{
                          fontSize: 12,
                          color: isDark ? "#A5D6A7" : "#2E4A2E",
                          background: isDark ? "#1A3A1A" : "#F1FBF1",
                          padding: "8px 12px",
                          borderRadius: 8,
                        }}
                      >
                        <strong>Treatment:</strong> {res.treatments[0]}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
