import { useState, useEffect, useCallback } from "react"
import { exportPdf, exportExcel } from "../../data/reportExports"
import { useFeedback } from "../../context/FeedbackContext"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import { useFarm } from "../../context/FarmContext"
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  RefreshCw,
  Droplets,
  Sprout,
  ShieldAlert,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function ReportsPanel() {
  const { isDark } = useTheme()
  const { notify } = useFeedback()
  const { surface, border, text, muted } = usePalette()
  const {
    farm,
    zones,
    hasFarm,
    getSoilReadings,
    getFarmWeather,
    getIrrigationAdvisory,
    getYieldEstimate,
    getFarmAlerts,
  } = useFarm()

  const [exporting, setExporting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [reportData, setReportData] = useState({
    farm: null,
    zones: [],
    soilReadings: [],
    weather: {},
    advisory: {},
    yieldEstimate: {},
    alerts: [],
  })

  const loadAllData = useCallback(async () => {
    if (!hasFarm) {
      setLoadingData(false)
      return
    }
    setLoadingData(true)
    try {
      const [soilRes, weatherRes, advRes, yieldRes, alertsRes] = await Promise.all([
        getSoilReadings().catch(() => ({ readings: [] })),
        getFarmWeather().catch(() => ({})),
        getIrrigationAdvisory().catch(() => ({})),
        getYieldEstimate().catch(() => ({})),
        getFarmAlerts().catch(() => ({ alerts: [] })),
      ])

      setReportData({
        farm,
        zones,
        soilReadings: soilRes.readings || [],
        weather: weatherRes || {},
        advisory: advRes || {},
        yieldEstimate: yieldRes || {},
        alerts: alertsRes.alerts || [],
      })
    } catch {
      // Fallback to current context
      setReportData({
        farm,
        zones,
        soilReadings: [],
        weather: {},
        advisory: {},
        yieldEstimate: {},
        alerts: [],
      })
    } finally {
      setLoadingData(false)
    }
  }, [hasFarm, farm, zones, getSoilReadings, getFarmWeather, getIrrigationAdvisory, getYieldEstimate, getFarmAlerts])

  useEffect(() => {
    void loadAllData()
  }, [loadAllData])

  const download = async (format, title) => {
    if (exporting) return
    setExporting(true)
    try {
      if (format === "PDF") {
        await exportPdf(title, reportData)
      } else {
        await exportExcel(title, reportData)
      }
      notify(`${title} (${format}) generated and downloaded successfully.`)
    } catch {
      notify("Export could not be completed. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"

  // Compute live summary numbers
  const withMoisture = zones.filter((z) => typeof z.moisture === "number")
  const avgMoisture = withMoisture.length > 0 ? Math.round(withMoisture.reduce((a, b) => a + b.moisture, 0) / withMoisture.length) : null
  const totalYieldExp = reportData.yieldEstimate?.totalFarmEstimatedYield?.expected
  const needWaterCount = reportData.advisory?.zones?.filter((z) => z.status === "recommended").length || 0

  // Chart data from real zones
  const chartData = zones.map((z) => ({
    name: z.name,
    crop: z.crop || "Unspecified",
    area: z.area || 0,
    moisture: typeof z.moisture === "number" ? z.moisture : 0,
  }))

  const currentDateStr = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })

  const availableReports = [
    {
      title: "Comprehensive Farm Intelligence Audit",
      date: currentDateStr,
      type: "PDF",
      desc: "Complete dossier of farm profile, soil health, weather, irrigation, and harvest yield.",
      icon: FileText,
      color: "#2E7D32",
    },
    {
      title: "Verified Soil Chemistry Analysis",
      date: currentDateStr,
      type: "PDF",
      desc: "Detailed report of lab NPK macronutrients, pH balance, moisture levels, and test history.",
      icon: BarChart3,
      color: "#43A047",
    },
    {
      title: "Smart Irrigation & Water Deficit Advisory",
      date: currentDateStr,
      type: "PDF",
      desc: "Zone-by-zone water requirements, upcoming rainfall delay notices, and timer schedules.",
      icon: Calendar,
      color: "#1565C0",
    },
    {
      title: "Complete Farm Agronomic Workbook",
      date: currentDateStr,
      type: "Excel",
      desc: "Multi-sheet spreadsheet with raw data across zones, soil tests, weather, and advisories.",
      icon: TrendingUp,
      color: "#F9A825",
    },
    {
      title: "Crop Harvest Yield Estimation Workbook",
      date: currentDateStr,
      type: "Excel",
      desc: "FAO/ICAR cultivar benchmark projections, itemized positive/negative factors, and assumptions.",
      icon: Sprout,
      color: "#7986CB",
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
            Reports & Analytics
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Generate and export genuine agricultural intelligence dossiers from stored field data
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            disabled={exporting || loadingData}
            onClick={() => void download("PDF", "Comprehensive Farm Intelligence Audit")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 10,
              background: "#2E7D32",
              color: "white",
              border: "none",
              cursor: exporting || loadingData ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Download size={14} className={exporting ? "animate-spin" : ""} /> Export Comprehensive PDF
          </button>
          <button
            disabled={exporting || loadingData}
            onClick={() => void download("Excel", "Complete Farm Agronomic Workbook")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 10,
              background: surface,
              border: `1px solid ${border}`,
              color: text,
              cursor: exporting || loadingData ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Download size={14} /> Export Excel Workbook
          </button>
        </div>
      </div>

      {/* Summary cards with real data */}
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
            label: "Monitored Zones",
            value: `${zones.length} Zones`,
            trend: farm.area ? `${farm.area} ${farm.areaUnit || "ha"} total area` : "Configured field area",
            color: "#2E7D32",
          },
          {
            label: "Projected Harvest",
            value: totalYieldExp ? `${totalYieldExp.toLocaleString()} kg` : "Awaiting crops",
            trend: totalYieldExp ? "FAO/ICAR benchmark estimate" : "Configure crop and area",
            color: "#43A047",
          },
          {
            label: "Average Moisture",
            value: avgMoisture != null ? `${avgMoisture}%` : "No tests",
            trend: avgMoisture != null ? "From recent soil tests" : "Record test in Soil Health",
            color: "#1565C0",
          },
          {
            label: "Irrigation Need",
            value: needWaterCount > 0 ? `${needWaterCount} Zones` : "Satisfied",
            trend: reportData.advisory?.weatherSummary?.rainForecast48hMm >= 8 ? "Delayed by forecast rain" : "Empirical deficit check",
            color: needWaterCount > 0 ? "#F9A825" : "#43A047",
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
                fontSize: 22,
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
            <div style={{ fontSize: 11, color: muted }}>{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Real Zone Performance Chart */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: text,
                marginBottom: 2,
              }}
            >
              Field Zone Inventory & Telemetry
            </h3>
            <p style={{ fontSize: 12, color: muted, margin: 0 }}>
              Live comparison of configured field zone area ({farm.areaUnit || "ha"}) and recorded soil moisture (%)
            </p>
          </div>

          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, background: "#2E7D32", borderRadius: 3 }} />
              <span style={{ color: text }}>Zone Area</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, background: "#1565C0", borderRadius: 3 }} />
              <span style={{ color: text }}>Soil Moisture (%)</span>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="area" name={`Area (${farm.areaUnit || "ha"})`} fill="#2E7D32" radius={[4, 4, 0, 0]} />
              <Bar dataKey="moisture" name="Soil Moisture (%)" fill="#1565C0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 10px", color: muted, fontSize: 13 }}>
            No field zones registered. Add zones in Settings → Farm Details.
          </div>
        )}
      </div>

      {/* Available Downloadable Reports */}
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
          Generate Dedicated Reports
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {availableReports.map((r) => {
            const Icon = r.icon
            return (
              <div
                key={r.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: isDark ? "#1E2E1E" : "#FAFCFA",
                  border: `1px solid ${border}`,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${r.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={r.color} />
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 2 }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: muted, lineHeight: 1.4 }}>
                    {r.desc}
                  </div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>
                    Verified data · {r.date} · Format: {r.type}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: isDark ? "#2A3D2A" : "#E8F5E9",
                      color: "#2E7D32",
                    }}
                  >
                    {r.type}
                  </span>

                  <button
                    disabled={exporting || loadingData}
                    aria-label={"Download " + r.title}
                    onClick={() => void download(r.type, r.title)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: "#2E7D32",
                      color: "white",
                      border: "none",
                      cursor: exporting || loadingData ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Download size={13} /> Download
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
