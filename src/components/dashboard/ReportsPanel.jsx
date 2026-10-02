import { useState } from "react"
import { exportPdf, exportExcel } from "../../data/reportExports"
import { useFeedback } from "../../context/FeedbackContext"
import { usePalette } from "../ui/usePalette"
import { useTheme } from "../../context/ThemeContext"
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
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
const reports = [
  {
    title: "Monthly Farm Performance Report",
    date: "September 2024",
    size: "2.4 MB",
    type: "PDF",
    icon: FileText,
    color: "#E53935",
  },
  {
    title: "Soil Health Analysis Report",
    date: "Q3 2024",
    size: "1.8 MB",
    type: "PDF",
    icon: BarChart3,
    color: "#2E7D32",
  },
  {
    title: "Yield Prediction Summary",
    date: "Kharif 2024",
    size: "3.1 MB",
    type: "Excel",
    icon: TrendingUp,
    color: "#F9A825",
  },
  {
    title: "Water Usage Optimization Report",
    date: "September 2024",
    size: "1.2 MB",
    type: "PDF",
    icon: Calendar,
    color: "#64B5F6",
  },
]
const performanceData = [
  { month: "Apr", yield: 78, revenue: 82, costs: 65 },
  { month: "May", yield: 82, revenue: 86, costs: 68 },
  { month: "Jun", yield: 88, revenue: 91, costs: 70 },
  { month: "Jul", yield: 85, revenue: 89, costs: 72 },
  { month: "Aug", yield: 91, revenue: 95, costs: 69 },
  { month: "Sep", yield: 87, revenue: 92, costs: 71 },
]
export default function ReportsPanel() {
  const { isDark } = useTheme()
  const { notify } = useFeedback()
  const [exporting, setExporting] = useState(false)
  const download = async (format, title) => {
    if (exporting) return
    setExporting(true)
    try {
      if (format === "PDF") await exportPdf(title)
      else await exportExcel(title)
      notify("Demo " + format + " report downloaded.")
    } catch {
      notify("Export could not be completed. Please try again.")
    } finally {
      setExporting(false)
    }
  }
  const { surface, border, text, muted } = usePalette()
  const gridLine = isDark ? "#223022" : "#F0F5EF"
  const tooltipBg = isDark ? "#1A2A1A" : "#FFFFFF"
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
            Reports & Analytics
          </h1>
          <p style={{ color: muted, fontSize: 14 }}>
            Download detailed farm performance reports and insights
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            disabled={exporting}
            onClick={() => void download("PDF")}
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
            <Download size={14} /> Export PDF
          </button>
          <button
            disabled={exporting}
            onClick={() => void download("Excel")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 10,
              background: "transparent",
              border: `1px solid ${border}`,
              color: text,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
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
            label: "Total Revenue",
            value: "₹8,40,000",
            trend: "+18% vs last season",
            color: "#2E7D32",
          },
          {
            label: "Total Yield",
            value: "4,110 kg",
            trend: "Across all crops",
            color: "#43A047",
          },
          {
            label: "Profit Margin",
            value: "34.2%",
            trend: "+6.8 pts improvement",
            color: "#F9A825",
          },
          {
            label: "Cost Efficiency",
            value: "91/100",
            trend: "AI optimization score",
            color: "#64B5F6",
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

      {/* Performance chart */}
      <div
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: text,
            marginBottom: 4,
          }}
        >
          Farm Performance Index
        </h3>
        <p style={{ fontSize: 12, color: muted, marginBottom: 20 }}>
          Normalized score (0-100) · Yield, Revenue, and Cost metrics
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={performanceData}
            margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: muted }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: muted }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${border}`,
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="yield"
              name="Yield Score"
              fill="#2E7D32"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="revenue"
              name="Revenue Score"
              fill="#66BB6A"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="costs"
              name="Cost Score"
              fill="#64B5F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 12,
            justifyContent: "center",
          }}
        >
          {[
            { c: "#2E7D32", l: "Yield" },
            { c: "#66BB6A", l: "Revenue" },
            { c: "#64B5F6", l: "Cost Efficiency" },
          ].map(({ c, l }) => (
            <div
              key={l}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: c,
                }}
              />
              <span style={{ fontSize: 12, color: muted }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Downloadable reports */}
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
          Available Reports
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reports.map((r) => {
            const Icon = r.icon
            return (
              <div
                key={r.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: isDark ? "#1E2E1E" : "#FAFCFA",
                  border: `1px solid ${border}`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${r.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={r.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: text }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 12, color: muted }}>
                    {r.date} · {r.size} · {r.type}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: isDark ? "#2A3D2A" : "#E8F5E9",
                      color: "#2E7D32",
                    }}
                  >
                    {r.type}
                  </span>
                  <button
                    disabled={exporting}
                    aria-label={"Download " + r.title}
                    onClick={() => void download(r.type, r.title)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 12px",
                      borderRadius: 8,
                      background: "#2E7D32",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Download size={12} /> Download
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
