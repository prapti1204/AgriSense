import { createWorkbook } from "./xlsxWorkbook"

/**
 * Exports a comprehensive agricultural PDF report containing actual stored farm data.
 */
export async function exportPdf(title = "Comprehensive Farm Intelligence Report", farmData = {}) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()

  const farm = farmData.farm || {}
  const zones = farmData.zones || []
  const soilReadings = farmData.soilReadings || []
  const weather = farmData.weather || {}
  const advisory = farmData.advisory || {}
  const yieldEstimate = farmData.yieldEstimate || {}
  const alerts = farmData.alerts || []

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Header Banner
  doc.setFillColor(46, 125, 50)
  doc.rect(0, 0, 210, 36, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text("AgriSense", 18, 18)
  doc.setFontSize(10)
  doc.text("Agricultural Intelligence & Decision Support Platform", 18, 28)

  // Document Title & Metadata
  doc.setTextColor(26, 46, 26)
  doc.setFontSize(16)
  doc.text(title, 18, 50)
  doc.setFontSize(10)
  doc.setTextColor(90, 110, 90)
  const farmSub = `${farm.name || "My Farm"} · ${farm.location || "Coordinates: " + (farm.coordinates?.latitude || "N/A") + ", " + (farm.coordinates?.longitude || "N/A")} · Generated on ${dateStr}`
  doc.text(doc.splitTextToSize(farmSub, 175), 18, 58)

  let currentY = 70

  const drawSection = (heading, rows) => {
    if (currentY > 260) {
      doc.addPage()
      currentY = 24
    }
    doc.setFontSize(12)
    doc.setTextColor(46, 125, 50)
    doc.text(heading, 18, currentY)
    currentY += 4

    rows.forEach(([label, value, tag], index) => {
      if (currentY > 275) {
        doc.addPage()
        currentY = 20
      }
      if (index % 2 === 0) {
        doc.setFillColor(244, 248, 244)
        doc.rect(18, currentY - 5, 174, 10, "F")
      }
      doc.setFontSize(9)
      doc.setTextColor(80, 95, 80)
      doc.text(label, 22, currentY + 1)

      if (tag) {
        doc.setFontSize(7)
        doc.setTextColor(110, 130, 110)
        doc.text(`[${tag}]`, 110, currentY + 1)
      }

      doc.setFontSize(9)
      doc.setTextColor(26, 46, 26)
      doc.text(String(value ?? "N/A"), 188, currentY + 1, { align: "right" })
      currentY += 10
    })
    currentY += 6
  }

  // 1. Farm & Zone Overview
  drawSection("1. Farm & Zone Overview", [
    ["Farm Name", farm.name || "Unnamed Farm", "Registered"],
    ["Total Field Area", farm.area ? `${farm.area} ${farm.areaUnit || "ha"}` : "N/A", "Measured"],
    ["Soil Classification", farm.soilType || "Not configured", "Profile"],
    ["Configured Zones", `${zones.length} Field Zone(s)`, "Inventory"],
    ["Active Irrigation Schedules", `${zones.filter((z) => z.active).length} Zone(s)`, "Schedule Intent"],
  ])

  // 2. Verified Soil Chemistry
  const latestSoilReading = soilReadings[0]
  const latestSoil = latestSoilReading?.readings
  const soilOriginTag = latestSoilReading?.method === "lab"
    ? "Laboratory Verified"
    : latestSoilReading?.method === "sensor"
    ? "IoT Telemetry"
    : latestSoilReading
    ? "User-Entered Manual"
    : "No Data"

  drawSection("2. Verified Soil Health (Latest Field Test)", [
    ["Test Timestamp", latestSoilReading?.observedAt ? new Date(latestSoilReading.observedAt).toLocaleString() : "No test recorded", "Recorded"],
    ["Data Collection Method", latestSoilReading?.method ? (latestSoilReading.method === "lab" ? "Laboratory Assay" : latestSoilReading.method === "sensor" ? "IoT Telemetry" : "Manual Field Test") : "N/A", "Classification"],
    ["Soil pH", latestSoil?.ph?.value != null ? latestSoil.ph.value.toFixed(1) : "N/A", soilOriginTag],
    ["Available Nitrogen (N)", latestSoil?.nitrogen?.value != null ? `${latestSoil.nitrogen.value} mg/kg` : "N/A", soilOriginTag],
    ["Available Phosphorus (P)", latestSoil?.phosphorus?.value != null ? `${latestSoil.phosphorus.value} mg/kg` : "N/A", soilOriginTag],
    ["Available Potassium (K)", latestSoil?.potassium?.value != null ? `${latestSoil.potassium.value} mg/kg` : "N/A", soilOriginTag],
    ["Soil Moisture", latestSoil?.moisture?.value != null ? `${latestSoil.moisture.value}%` : "N/A", soilOriginTag],
  ])

  // 3. Local Climate & Weather
  const curWeather = weather.current || {}
  const dailyWeather = weather.daily || {}
  const rainNext48h = (dailyWeather.precipitation_sum?.[0] || 0) + (dailyWeather.precipitation_sum?.[1] || 0)
  drawSection("3. Climate Conditions (Open-Meteo)", [
    ["Ambient Temperature", curWeather.temperature_2m != null ? `${Math.round(curWeather.temperature_2m)}°C` : "N/A", "Live Weather"],
    ["Relative Humidity", curWeather.relative_humidity_2m != null ? `${Math.round(curWeather.relative_humidity_2m)}%` : "N/A", "Live Weather"],
    ["48-Hour Rain Forecast", `${Math.round(rainNext48h * 10) / 10} mm`, "Open-Meteo Forecast"],
    ["Max Rain Probability", `${dailyWeather.precipitation_probability_max?.[0] || 0}%`, "Open-Meteo Forecast"],
  ])

  // 4. Smart Irrigation & Harvest Yield
  const totalYield = yieldEstimate.totalFarmEstimatedYield
  const hasWaterDeficit = advisory.zones?.some((z) => z.status === "recommended")
  const isRainDelayed = advisory.zones?.some((z) => z.status === "delayed")
  drawSection("4. Irrigation Advisory & Harvest Yield Estimates", [
    ["Pump Hardware Telemetry", advisory.pumpHardwareStatus || "Standby (No IoT link)", "Telemetry Status"],
    ["Irrigation Advisory", hasWaterDeficit ? "Deficit detected - Supplemental watering advised" : isRainDelayed ? "Delayed due to forecast rainfall" : "Hold / Optimal", "Agronomic Advisory (Modelled)"],
    ["Harvest Yield Projection", totalYield ? `${totalYield.expected.toLocaleString()} kg` : "Awaiting crop/area setup", "Agronomic Heuristic Estimate"],
    ["Estimated Yield Range", totalYield ? `${totalYield.min.toLocaleString()} – ${totalYield.max.toLocaleString()} kg` : "N/A", "Agronomic Heuristic Range"],
  ])

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(120, 135, 120)
  doc.text(
    "AgriSense Agricultural Intelligence Platform · Official Data Export · Confidential",
    18,
    285,
  )

  doc.save(`${(farm.name || "agrisense").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.pdf`)
}

/**
 * Exports a multi-sheet Excel workbook containing real application telemetry and records.
 */
export async function exportExcel(title = "Farm Analytics Workbook", farmData = {}) {
  const farm = farmData.farm || {}
  const zones = farmData.zones || []
  const soilReadings = farmData.soilReadings || []
  const weather = farmData.weather || {}
  const advisory = farmData.advisory || {}
  const yieldEstimate = farmData.yieldEstimate || {}
  const alerts = farmData.alerts || []

  const sheets = []
  const addSheet = (name, headers, rows) => {
    sheets.push({ name, headers, rows })
  }

  // 1. Farm Summary
  addSheet(
    "Farm Summary",
    ["Property", "Value", "Classification"],
    [
      ["Farm Name", farm.name || "My Farm", "Metadata"],
      ["Location / Description", farm.location || "N/A", "Metadata"],
      ["Latitude", farm.coordinates?.latitude ?? "N/A", "GPS"],
      ["Longitude", farm.coordinates?.longitude ?? "N/A", "GPS"],
      ["Total Area", farm.area ? `${farm.area} ${farm.areaUnit || "ha"}` : "N/A", "Measured"],
      ["Soil Profile Type", farm.soilType || "Unspecified", "Agronomic"],
      ["Configured Field Zones", zones.length, "Count"],
      ["Report Generated", new Date().toISOString(), "Timestamp"],
    ],
  )

  // 2. Field Zones
  addSheet(
    "Field Zones",
    ["Zone Name", "Crop Species", "Area", "Area Unit", "Schedule Mode", "Latest Moisture (%)"],
    zones.length > 0
      ? zones.map((z) => [
          z.name,
          z.crop || "Unspecified",
          z.area ?? "N/A",
          z.areaUnit || "ha",
          z.active ? "Timer ON" : "Timer OFF",
          typeof z.moisture === "number" ? z.moisture : "N/A",
        ])
      : [["No zones configured", "-", "-", "-", "-", "-"]],
  )

  // 3. Soil Health Tests
  addSheet(
    "Soil Tests",
    ["Observed At", "Zone ID", "Nitrogen (mg/kg)", "Phosphorus (mg/kg)", "Potassium (mg/kg)", "pH Level", "Moisture (%)", "Test Method", "Data Origin / Classification"],
    soilReadings.length > 0
      ? soilReadings.map((r) => [
          r.observedAt ? new Date(r.observedAt).toISOString() : "N/A",
          String(r.zoneId || "Farm-wide"),
          r.readings?.nitrogen?.value ?? "N/A",
          r.readings?.phosphorus?.value ?? "N/A",
          r.readings?.potassium?.value ?? "N/A",
          r.readings?.ph?.value ?? "N/A",
          r.readings?.moisture?.value ?? "N/A",
          r.method || "manual",
          r.method === "lab" ? "Laboratory Verified" : r.method === "sensor" ? "IoT Telemetry" : "User-Entered Manual",
        ])
      : [["No soil readings recorded", "-", "-", "-", "-", "-", "-", "-", "-"]],
  )

  // 4. Irrigation Advisory
  addSheet(
    "Irrigation Advisory",
    ["Zone Name", "Advisory Status", "Recommended Volume (L)", "Depth Equivalent (mm)", "Est. Run Time (mins)", "Reason / Rationale", "Data Classification"],
    advisory.zones?.length > 0
      ? advisory.zones.map((az) => [
          az.zoneName,
          az.statusLabel || az.status,
          az.recommendedLitres ?? "None",
          az.recommendedMm ?? "None",
          az.recommendedDurationMinutes ?? 0,
          az.reason,
          "Agronomic Advisory (Modelled)",
        ])
      : [["No advisory data", "-", "-", "-", "-", "-", "-"]],
  )

  // 5. Yield Projections
  addSheet(
    "Yield Projections",
    ["Zone Name", "Crop", "Area (ha)", "Baseline Potential (kg)", "Expected Yield (kg)", "Min Range (kg)", "Max Range (kg)", "Factor vs Baseline", "Data Classification"],
    yieldEstimate.zones?.length > 0
      ? yieldEstimate.zones.map((zy) => [
          zy.zoneName,
          zy.crop,
          zy.areaHa ?? "N/A",
          zy.potentialKg ?? "N/A",
          zy.estimatedKg?.expected ?? "N/A",
          zy.estimatedKg?.min ?? "N/A",
          zy.estimatedKg?.max ?? "N/A",
          zy.hasSufficientData ? `${Math.round(zy.combinedFactor * 100)}%` : "Inputs Required",
          "Agronomic Heuristic (FAO/ICAR)",
        ])
      : [["No yield data available", "-", "-", "-", "-", "-", "-", "-", "-"]],
  )

  // 6. Dynamic Alerts
  addSheet(
    "Field Alerts",
    ["Alert ID", "Severity", "Title", "Message", "Time", "Source / Trigger"],
    alerts.length > 0
      ? alerts.map((a) => [a.id, a.type, a.title, a.message, a.time, "Dynamic Sensor/Weather Threshold"])
      : [["No active alerts", "-", "-", "-", "-", "-"]],
  )

  const workbookBytes = createWorkbook(sheets)
  const blob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${(farm.name || "agrisense").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-analytics.xlsx`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
