/**
 * Agronomic Engine for AgriSense
 * Provides transparent, explainable calculations for:
 * 1. Smart Irrigation Advisories (soil moisture deficit + Open-Meteo rainfall forecasting)
 * 2. Crop Yield Estimations (FAO/ICAR baseline crop potentials + soil chemical adjustments + climate factors)
 */

const CROP_BASELINES = {
  rice: { name: "Rice (Paddy)", baselineKgPerHa: 3800, optimalPh: [5.5, 7.0], optimalMoisture: [60, 80] },
  paddy: { name: "Rice (Paddy)", baselineKgPerHa: 3800, optimalPh: [5.5, 7.0], optimalMoisture: [60, 80] },
  wheat: { name: "Wheat", baselineKgPerHa: 3600, optimalPh: [6.0, 7.5], optimalMoisture: [50, 70] },
  maize: { name: "Maize (Corn)", baselineKgPerHa: 5200, optimalPh: [5.8, 7.2], optimalMoisture: [55, 75] },
  corn: { name: "Maize (Corn)", baselineKgPerHa: 5200, optimalPh: [5.8, 7.2], optimalMoisture: [55, 75] },
  tomato: { name: "Tomato", baselineKgPerHa: 22000, optimalPh: [6.0, 6.8], optimalMoisture: [60, 75] },
  potato: { name: "Potato", baselineKgPerHa: 19000, optimalPh: [5.0, 6.5], optimalMoisture: [65, 80] },
  soybean: { name: "Soybean", baselineKgPerHa: 2600, optimalPh: [6.0, 7.0], optimalMoisture: [50, 70] },
  cotton: { name: "Cotton", baselineKgPerHa: 2100, optimalPh: [6.0, 7.5], optimalMoisture: [45, 65] },
  sugarcane: { name: "Sugarcane", baselineKgPerHa: 75000, optimalPh: [6.0, 7.5], optimalMoisture: [65, 85] },
  onion: { name: "Onion", baselineKgPerHa: 17000, optimalPh: [6.0, 7.0], optimalMoisture: [55, 70] },
  vegetables: { name: "Vegetables (Mixed)", baselineKgPerHa: 15000, optimalPh: [6.0, 7.0], optimalMoisture: [60, 75] },
}

function matchCropBaseline(cropName = "") {
  const normalized = cropName.toLowerCase().trim()
  if (!normalized) return { name: "Unknown Crop", baselineKgPerHa: 3000, optimalPh: [6.0, 7.0], optimalMoisture: [50, 70] }
  for (const [key, val] of Object.entries(CROP_BASELINES)) {
    if (normalized.includes(key)) return val
  }
  return { name: cropName, baselineKgPerHa: 3200, optimalPh: [6.0, 7.0], optimalMoisture: [50, 70] }
}

/**
 * Generates transparent irrigation advisory for a farm and its zones.
 */
export function calculateIrrigationAdvisory(farm, zones, soilReadings = [], weather = null) {
  // Map latest reading with verified moisture per zone
  const latestMoistureByZone = new Map()
  for (const r of soilReadings) {
    const zId = String(r.zoneId)
    if (!latestMoistureByZone.has(zId) && typeof r.readings?.moisture?.value === "number") {
      latestMoistureByZone.set(zId, r)
    }
  }

  // Weather rainfall forecast in next 24-48 hours
  const rainTodayMm = weather?.daily?.precipitation_sum?.[0] || 0
  const rainTomorrowMm = weather?.daily?.precipitation_sum?.[1] || 0
  const rainForecast48hMm = Math.round((rainTodayMm + rainTomorrowMm) * 10) / 10
  const rainProbabilityMax = Math.max(
    weather?.daily?.precipitation_probability_max?.[0] || 0,
    weather?.daily?.precipitation_probability_max?.[1] || 0
  )
  const currentTemp = weather?.current?.temperature_2m != null ? Math.round(weather.current.temperature_2m) : null

  const zoneAdvisories = zones.map((zone) => {
    const reading = latestMoistureByZone.get(String(zone._id))
    const moisture = reading?.readings?.moisture?.value
    const hasMoisture = typeof moisture === "number"
    const cropInfo = matchCropBaseline(zone.crop)

    // Calculate area in square meters for volume estimation
    let areaSqM = null
    if (typeof zone.area === "number" && zone.area > 0) {
      areaSqM = zone.areaUnit === "acre" ? zone.area * 4046.86 : zone.area * 10000
    }

    let status = "insufficient_data"
    let statusLabel = "Awaiting Soil Telemetry"
    let reason = "No soil moisture reading recorded for this zone. Record a field or lab test in Soil Health to calculate water requirement."
    let recommendedMm = null
    let recommendedLitres = null
    let recommendedDurationMinutes = null

    if (!hasMoisture) {
      status = "insufficient_data"
      statusLabel = "Awaiting Soil Telemetry"
      reason = "No soil moisture reading recorded for this zone. Record a field or lab test in Soil Health to calculate water requirement."
    } else if (rainForecast48hMm >= 8 || rainProbabilityMax >= 65) {
      status = "delayed"
      statusLabel = "Delayed (Rain Expected)"
      reason = `Significant precipitation is forecast (${rainForecast48hMm} mm, ${rainProbabilityMax}% chance). Irrigation is delayed to conserve water and prevent root waterlogging.`
      recommendedMm = 0
      recommendedLitres = 0
      recommendedDurationMinutes = 0
    } else if (moisture >= (cropInfo.optimalMoisture[0] || 60)) {
      status = "optimal"
      statusLabel = "Moisture Optimal"
      reason = `Soil moisture is at a healthy ${moisture}% (target: ${cropInfo.optimalMoisture[0]}–${cropInfo.optimalMoisture[1]}%). No irrigation required.`
      recommendedMm = 0
      recommendedLitres = 0
      recommendedDurationMinutes = 0
    } else {
      status = "recommended"
      statusLabel = "Irrigation Recommended"
      const targetMoisture = cropInfo.optimalMoisture[0] || 60
      const deficitPct = targetMoisture - moisture

      // 1% moisture deficit across 300mm root zone requires ~3mm water depth
      recommendedMm = Math.min(30, Math.max(5, Math.round(deficitPct * 0.45)))

      if (areaSqM) {
        // 1 mm depth on 1 m2 equals exactly 1 litre
        recommendedLitres = Math.round(recommendedMm * areaSqM)
        // Standard drip/sprinkler delivery ~5 mm depth per hour
        recommendedDurationMinutes = Math.round((recommendedMm / 5) * 60)
      }

      reason = `Soil moisture is low at ${moisture}% (deficit: ${deficitPct}%). With ${rainForecast48hMm} mm rain forecast in 48h, supplemental watering is recommended.`
    }

    return {
      zoneId: zone._id,
      zoneName: zone.name,
      crop: zone.crop || "Unspecified Crop",
      area: zone.area || null,
      areaUnit: zone.areaUnit || "ha",
      activeSchedule: Boolean(zone.irrigation?.desiredMode === "scheduled"),
      currentMoisture: hasMoisture ? moisture : null,
      lastTested: reading?.observedAt || null,
      status,
      statusLabel,
      reason,
      recommendedMm,
      recommendedLitres,
      recommendedDurationMinutes,
      cropOptimalMoisture: cropInfo.optimalMoisture,
    }
  })

  return {
    farmId: farm._id,
    generatedAt: new Date(),
    weatherSummary: {
      currentTemp,
      rainForecast48hMm,
      rainProbabilityMax,
      weatherCode: weather?.current?.weather_code || 0,
    },
    pumpHardwareStatus: "Standby",
    pumpHardwareNote: "Physical pump telemetry not linked. AgriSense provides agronomic irrigation advisory.",
    zones: zoneAdvisories,
  }
}

/**
 * Generates transparent, explainable yield estimates based on crop benchmarks,
 * soil chemistry adjustments, and climatic conditions.
 */
export function calculateYieldEstimate(farm, zones, soilReadings = [], weather = null) {
  const currentTemp = weather?.current?.temperature_2m
  const rainForecast7d = weather?.daily?.precipitation_sum?.reduce((a, b) => a + b, 0) || 0

  let totalFarmMinKg = 0
  let totalFarmMaxKg = 0
  let totalFarmExpectedKg = 0
  let zonesWithEstimate = 0

  const zoneEstimates = zones.map((zone) => {
    const cropBaseline = matchCropBaseline(zone.crop)
    const missingInputs = []

    if (!zone.crop) missingInputs.push("Crop type not configured. Please assign crop species in Settings → Farm Details.")
    if (typeof zone.area !== "number" || zone.area <= 0) {
      missingInputs.push("Zone area not configured. Please assign field area in Settings → Farm Details.")
    }

    if (missingInputs.length > 0) {
      return {
        zoneId: zone._id,
        zoneName: zone.name,
        crop: zone.crop || "Not configured",
        area: zone.area || null,
        areaUnit: zone.areaUnit || "ha",
        hasSufficientData: false,
        missingInputs,
        estimatedKg: null,
        factors: [],
        assumptions: ["Requires crop selection and non-zero area to compute harvest projection."],
      }
    }

    // Convert area to Hectares
    const areaHa = zone.areaUnit === "acre" ? zone.area * 0.404686 : zone.area

    let soilFactor = 1.0
    const factors = []

    // 1. Soil Chemical Adjustments (synthesize across recent readings for this zone)
    const zoneReadings = soilReadings.filter((r) => String(r.zoneId) === String(zone._id))
    let ph = null
    let n = null
    let p = null
    let k = null
    for (const r of zoneReadings) {
      if (ph === null && typeof r.readings?.ph?.value === "number") ph = r.readings.ph.value
      if (n === null && typeof r.readings?.nitrogen?.value === "number") n = r.readings.nitrogen.value
      if (p === null && typeof r.readings?.phosphorus?.value === "number") p = r.readings.phosphorus.value
      if (k === null && typeof r.readings?.potassium?.value === "number") k = r.readings.potassium.value
    }
    const hasAnySoilData = ph !== null || n !== null || p !== null || k !== null

    if (hasAnySoilData) {
      if (typeof ph === "number") {
        if (ph < cropBaseline.optimalPh[0] - 0.5) {
          soilFactor -= 0.12
          factors.push({ name: `Acidic Soil pH (${ph.toFixed(1)})`, impact: "negative", effect: "-12%", detail: `Below optimal (${cropBaseline.optimalPh[0]}–${cropBaseline.optimalPh[1]}), reducing nutrient bioavailability.` })
        } else if (ph > cropBaseline.optimalPh[1] + 0.5) {
          soilFactor -= 0.10
          factors.push({ name: `Alkaline Soil pH (${ph.toFixed(1)})`, impact: "negative", effect: "-10%", detail: `Above optimal range, inducing micronutrient lockup.` })
        } else {
          soilFactor += 0.04
          factors.push({ name: `Optimal Soil pH (${ph.toFixed(1)})`, impact: "positive", effect: "+4%", detail: "In ideal zone for root cation exchange." })
        }
      }

      if (typeof n === "number") {
        if (n < 110) {
          soilFactor -= 0.08
          factors.push({ name: `Low Available Nitrogen (${n} mg/kg)`, impact: "negative", effect: "-8%", detail: "Nitrogen deficiency limits vegetative biomass." })
        } else if (n >= 140 && n <= 280) {
          soilFactor += 0.05
          factors.push({ name: `Favorable Nitrogen (${n} mg/kg)`, impact: "positive", effect: "+5%", detail: "Supports robust canopy photosynthesis." })
        }
      }

      if (typeof p === "number" && p < 15) {
        soilFactor -= 0.05
        factors.push({ name: `Low Available Phosphorus (${p} mg/kg)`, impact: "negative", effect: "-5%", detail: "May impair early root development and tillering." })
      }

      if (typeof k === "number" && k >= 160) {
        soilFactor += 0.03
        factors.push({ name: `Good Potassium Reserve (${k} mg/kg)`, impact: "positive", effect: "+3%", detail: "Enhances drought resistance and grain filling." })
      }
    } else {
      factors.push({
        name: "No Soil Test On Record",
        impact: "neutral",
        effect: "0%",
        detail: "Standard baseline assumed. Record a soil test for chemistry-calibrated yield tuning.",
      })
    }

    // 2. Weather & Climate Adjustments
    let weatherFactor = 1.0
    if (typeof currentTemp === "number") {
      if (currentTemp >= 36) {
        weatherFactor -= 0.08
        factors.push({ name: `Thermal Stress (${Math.round(currentTemp)}°C)`, impact: "negative", effect: "-8%", detail: "High daytime temperatures increase plant transpiration and pollen sterility risk." })
      } else if (currentTemp >= 20 && currentTemp <= 30) {
        weatherFactor += 0.04
        factors.push({ name: `Favorable Temperature (${Math.round(currentTemp)}°C)`, impact: "positive", effect: "+4%", detail: "Within optimal metabolic growth window." })
      }
    }

    if (rainForecast7d >= 15 && rainForecast7d <= 80) {
      weatherFactor += 0.03
      factors.push({ name: `Adequate 7-day Rainfall (${Math.round(rainForecast7d)} mm)`, impact: "positive", effect: "+3%", detail: "Sufficient moisture replenishes root zone." })
    }

    // Combined multiplier bounded between 0.60 and 1.35
    const combinedFactor = Math.min(1.35, Math.max(0.60, soilFactor * weatherFactor))

    // Base potential = baseline * area
    const potentialKg = cropBaseline.baselineKgPerHa * areaHa
    const minKg = Math.round(potentialKg * (combinedFactor * 0.90))
    const maxKg = Math.round(potentialKg * (combinedFactor * 1.10))
    const expectedKg = Math.round((minKg + maxKg) / 2)

    totalFarmMinKg += minKg
    totalFarmMaxKg += maxKg
    totalFarmExpectedKg += expectedKg
    zonesWithEstimate++

    return {
      zoneId: zone._id,
      zoneName: zone.name,
      crop: cropBaseline.name,
      rawCrop: zone.crop,
      area: zone.area,
      areaUnit: zone.areaUnit,
      areaHa: Math.round(areaHa * 100) / 100,
      hasSufficientData: true,
      baselineYieldKgPerHa: cropBaseline.baselineKgPerHa,
      potentialKg: Math.round(potentialKg),
      combinedFactor: Math.round(combinedFactor * 100) / 100,
      estimatedKg: {
        min: minKg,
        max: maxKg,
        expected: expectedKg,
      },
      factors,
      assumptions: [
        `Regional baseline yield potential: ${cropBaseline.baselineKgPerHa.toLocaleString()} kg/ha (FAO/ICAR benchmarks).`,
        `Calculated over ${Math.round(areaHa * 100) / 100} hectares with standard seeding rate.`,
        "Assumes recommended weed management and scheduled irrigation adherence.",
        "Ranges reflect natural field microclimate and seasonal variability (±10%).",
      ],
      missingInputs: [],
    }
  })

  return {
    farmId: farm._id,
    generatedAt: new Date(),
    disclaimer: "Heuristic agronomic estimate calculated from verified soil tests, Open-Meteo climate data, and regional baseline crop potentials. Not a guaranteed harvest outcome.",
    totalFarmEstimatedYield: zonesWithEstimate > 0 ? {
      min: totalFarmMinKg,
      max: totalFarmMaxKg,
      expected: totalFarmExpectedKg,
    } : null,
    zonesCount: zones.length,
    zonesEstimated: zonesWithEstimate,
    zones: zoneEstimates,
  }
}

