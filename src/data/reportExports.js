import {
  soilHealth,
  temperatureData,
  rainfallData,
  yieldData,
  cropRecommendation,
} from "./mockData"
import { farmZones } from "../context/FarmContext"
import { createWorkbook } from "./xlsxWorkbook"
export async function exportPdf(title = "Monthly Farm Performance Report") {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()
  doc.setFillColor(46, 125, 50)
  doc.rect(0, 0, 210, 34, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(23)
  doc.text("AgriSense", 18, 16)
  doc.setFontSize(10)
  doc.text("Smart Agriculture Monitoring | Frontend Demo", 18, 25)
  doc.setTextColor(26, 46, 26)
  doc.setFontSize(17)
  doc.text(doc.splitTextToSize(title, 175), 18, 49)
  doc.setFontSize(11)
  doc.text("Greenfield Estate | September 2024 | Mock data", 18, 66)
  const rows = title.includes("Soil")
    ? [
        ["Nitrogen", `${soilHealth.nitrogen}%`],
        ["Phosphorus", `${soilHealth.phosphorus}%`],
        ["Potassium", `${soilHealth.potassium}%`],
        ["pH Level", String(soilHealth.ph)],
        ["Moisture", `${soilHealth.moisture}%`],
      ]
    : title.includes("Water")
      ? farmZones.map((z) => [
          z.name.replace(/–/g, "-"),
          `${z.usage} L used / ${z.target} L target`,
        ])
      : [
          ["Total Revenue", "Rs. 8,40,000"],
          ["Projected Yield", "4,110 kg"],
          ["Profit Margin", "34.2%"],
          ["Cost Efficiency", "91/100"],
          ["Recommended Crop", cropRecommendation.crop],
          ["AI Confidence (simulated)", "94%"],
        ]
  rows.forEach(([label, value], index) => {
    const y = 84 + index * 17
    if (index % 2 === 0) {
      doc.setFillColor(241, 245, 240)
      doc.rect(18, y - 7, 174, 14, "F")
    }
    doc.setTextColor(90, 122, 90)
    doc.text(label, 22, y + 2)
    doc.setTextColor(26, 46, 26)
    doc.text(value, 188, y + 2, { align: "right" })
  })
  doc.setFontSize(9)
  doc.setTextColor(90, 122, 90)
  doc.text(
    "Demonstration only. All readings and predictions are simulated.",
    18,
    278,
  )
  doc.save(title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".pdf")
}
export async function exportExcel(title = "Farm Analytics") {
  const sheets = []
  const addSheet = (name, headers, rows) => {
    sheets.push({ name, headers, rows })
  }
  addSheet("Summary", ["Metric", "Mock value"], [
    ["Revenue (INR)", 840000],
    ["Projected yield (kg)", 4110],
    ["Profit margin (%)", 34.2],
    ["AI confidence (%)", 94],
    ["Data source", "Static demo data"],
  ])
  addSheet(
    "Weather",
    ["Time", "Temperature (C)", "Humidity (%)"],
    temperatureData.map((d) => [d.time, d.temp, d.humidity]),
  )
  addSheet(
    "Rainfall",
    ["Month", "Rainfall (mm)"],
    rainfallData.map((d) => [d.month, d.rainfall]),
  )
  addSheet(
    "Yield",
    ["Month", "Actual (kg)", "Predicted (kg)"],
    yieldData.map((d) => [d.month, d.actual, d.predicted]),
  )
  addSheet("Soil", ["N (%)", "P (%)", "K (%)", "pH", "Moisture (%)"], [
    [
      soilHealth.nitrogen,
      soilHealth.phosphorus,
      soilHealth.potassium,
      soilHealth.ph,
      soilHealth.moisture,
    ],
  ])
  const blob = new Blob([createWorkbook(sheets)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".xlsx"
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
