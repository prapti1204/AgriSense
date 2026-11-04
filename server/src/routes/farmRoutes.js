import { Router } from "express"
import { Farm } from "../models/Farm.js"
import { Zone } from "../models/Zone.js"
import { SoilReading } from "../models/SoilReading.js"
import { PredictionRun } from "../models/PredictionRun.js"
import { asyncHandler, HttpError } from "../lib/httpError.js"
import { getOwnedFarm, getOwnedZone } from "../services/ownership.js"
import { getFarmWeather } from "../services/weatherService.js"
import { recommendCrops } from "../services/geminiPredictionService.js"
import { analyzePlantPest } from "../services/geminiVisionService.js"
import { calculateIrrigationAdvisory, calculateYieldEstimate } from "../services/agronomicEngine.js"
import { env } from "../config/env.js"
import { validate } from "../middleware/validate.js"
import { farmCreateSchema, farmPatchSchema, soilReadingSchema, zoneCreateSchema, zonePatchSchema } from "../validators/schemas.js"

const router = Router()
const idOf = (value) => String(value._id || value)

router.get("/farms", asyncHandler(async (req, res) => {
  const farms = await Farm.find({ ownerId: req.user._id }).sort({ createdAt: 1 })
  res.json({ farms })
}))

router.post("/farms", validate(farmCreateSchema), asyncHandler(async (req, res) => {
  const farm = await Farm.create({ ...req.body, ownerId: req.user._id })
  res.status(201).json({ farm })
}))

router.get("/farms/:farmId", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  res.json({ farm })
}))

router.patch("/farms/:farmId", validate(farmPatchSchema), asyncHandler(async (req, res) => {
  await getOwnedFarm(req.params.farmId, req.user._id)
  const farm = await Farm.findByIdAndUpdate(req.params.farmId, { $set: req.body }, { new: true, runValidators: true })
  res.json({ farm })
}))

router.get("/farms/:farmId/zones", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  const zones = await Zone.find({ farmId: farm._id }).sort({ createdAt: 1 })
  res.json({ zones })
}))

router.post("/farms/:farmId/zones", validate(zoneCreateSchema), asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  const zone = await Zone.create({ ...req.body, farmId: farm._id })
  res.status(201).json({ zone })
}))

router.get("/farms/:farmId/weather", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  res.json({ weather: await getFarmWeather(farm) })
}))

router.get("/farms/:farmId/soil", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100)
  const filter = { farmId: farm._id }
  if (req.query.zoneId) {
    const zone = await getOwnedZone(req.query.zoneId, req.user._id)
    if (idOf(zone.farmId) !== idOf(farm)) throw new HttpError(404, "ZONE_NOT_FOUND", "Zone not found.")
    filter.zoneId = zone._id
  }
  const readings = await SoilReading.find(filter).sort({ observedAt: -1 }).limit(limit)
  res.json({ readings, page: { limit, count: readings.length } })
}))

router.post("/zones/:zoneId/soil-readings", validate(soilReadingSchema), asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  const reading = await SoilReading.create({
    ...req.body,
    farmId: zone.farmId,
    zoneId: zone._id,
    submittedBy: req.user._id,
  })
  res.status(201).json({ reading })
}))

router.patch("/zones/:zoneId", validate(zonePatchSchema), asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  Object.assign(zone, req.body)
  await zone.save()
  res.json({ zone })
}))

router.post("/zones/:zoneId/predictions/crop", asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  const farm = await getOwnedFarm(zone.farmId, req.user._id)
  const [soil, weather] = await Promise.all([
    SoilReading.findOne({ farmId: farm._id, zoneId: zone._id }).sort({ observedAt: -1 }),
    getFarmWeather(farm),
  ])
  const inputSnapshot = {
    cropCurrentlyGrown: zone.crop || null,
    soil: soil ? { readings: soil.readings, method: soil.method, source: soil.source, observedAt: soil.observedAt } : null,
    weather: {
      source: weather.source,
      current: weather.current,
      daily: weather.daily,
      observedAt: weather.timestamps.observedAt,
      fetchedAt: weather.timestamps.fetchedAt,
    },
    farm: { locationLabel: farm.locationLabel, area: farm.area, areaUnit: farm.areaUnit },
  }
  const run = await PredictionRun.create({
    farmId: farm._id,
    zoneId: zone._id,
    requestedBy: req.user._id,
    type: "crop",
    status: "running",
    inputSnapshot,
    provider: "gemini",
    promptVersion: "crop-recommendation-v1",
  })
  try {
    const result = await recommendCrops(inputSnapshot)
    run.status = "completed"
    run.result = result
    run.modelVersion = env.GEMINI_MODEL
    run.completedAt = new Date()
    await run.save()
    res.status(201).json({ prediction: run })
  } catch (error) {
    run.status = "failed"
    run.error = error.message.slice(0, 500)
    run.completedAt = new Date()
    await run.save()
    throw error
  }
}))

router.get("/prediction-runs/:runId", asyncHandler(async (req, res) => {
  const run = await PredictionRun.findById(req.params.runId)
  if (!run) throw new HttpError(404, "PREDICTION_NOT_FOUND", "Prediction not found.")
  await getOwnedFarm(run.farmId, req.user._id)
  res.json({ prediction: run })
}))

router.get("/zones/:zoneId/predictions", asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  const type = req.query.type || "crop"
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50)
  const predictions = await PredictionRun.find({ zoneId: zone._id, type })
    .sort({ createdAt: -1 })
    .limit(limit)
  res.json({ predictions })
}))

router.post("/zones/:zoneId/predictions/pest", asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  const farm = await getOwnedFarm(zone.farmId, req.user._id)

  const { imageBase64, mimeType } = req.body || {}
  if (!imageBase64 || typeof imageBase64 !== "string") {
    throw new HttpError(400, "MISSING_IMAGE", "Please upload or capture a plant image to analyze.")
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
  const approximateByteSize = Math.round((cleanBase64.length * 3) / 4)
  if (approximateByteSize > 6 * 1024 * 1024) {
    throw new HttpError(400, "IMAGE_TOO_LARGE", "Image file exceeds maximum allowable size of 5 MB.")
  }
  const run = await PredictionRun.create({
    farmId: farm._id,
    zoneId: zone._id,
    requestedBy: req.user._id,
    type: "pest",
    status: "running",
    inputSnapshot: {
      zoneName: zone.name,
      crop: zone.crop || "Unknown",
      mimeType: mimeType || "image/jpeg",
    },
    provider: "gemini",
    promptVersion: "pest-disease-v1",
  })

  try {
    const result = await analyzePlantPest(cleanBase64, mimeType, zone.crop)
    run.status = "completed"
    run.result = result
    run.modelVersion = env.GEMINI_MODEL
    run.completedAt = new Date()
    await run.save()
    res.status(201).json({ prediction: run })
  } catch (error) {
    run.status = "failed"
    run.error = error.message.slice(0, 500)
    run.completedAt = new Date()
    await run.save()
    throw error
  }
}))

router.get("/farms/:farmId/alerts", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  const [weatherRes, soilReadings, zones] = await Promise.all([
    getFarmWeather(farm).catch(() => null),
    SoilReading.find({ farmId: farm._id }).sort({ observedAt: -1 }).limit(20),
    Zone.find({ farmId: farm._id }),
  ])

  const alerts = []
  const now = new Date()

  // 1. Weather-based dynamic alerts
  if (weatherRes?.current) {
    const temp = weatherRes.current.temperature_2m
    const code = weatherRes.current.weather_code

    if (temp >= 35) {
      alerts.push({
        id: `heatwave-${farm._id}`,
        type: "danger",
        title: "Extreme Heat Warning",
        message: `Current temperature at ${farm.name} is ${Math.round(temp)}°C. Deploy shade netting and increase hydration cycles.`,
        time: "Current",
        icon: "thermometer-sun",
        color: "#E53935",
      })
    } else if (temp <= 4) {
      alerts.push({
        id: `frost-${farm._id}`,
        type: "danger",
        title: "Frost Risk Detected",
        message: `Low temperatures (${Math.round(temp)}°C) may induce plant chilling or frost injury.`,
        time: "Current",
        icon: "thermometer-sun",
        color: "#1E88E5",
      })
    }

    if ([95, 96, 99].includes(code)) {
      alerts.push({
        id: `storm-${farm._id}`,
        type: "danger",
        title: "Severe Thunderstorm Warning",
        message: `Thunderstorm observed in your area. Secure nursery equipment and pause field spraying.`,
        time: "Current",
        icon: "cloud-rain",
        color: "#D32F2F",
      })
    }
  }

  if (weatherRes?.daily) {
    const maxPrecipProb = weatherRes.daily.precipitation_probability_max?.[0] || 0
    const rainSum = weatherRes.daily.precipitation_sum?.[0] || 0

    if (maxPrecipProb >= 70 || rainSum >= 40) {
      alerts.push({
        id: `rain-${farm._id}`,
        type: "warning",
        title: "Heavy Precipitation Forecast",
        message: `Open-Meteo predicts ${rainSum}mm rainfall (${maxPrecipProb}% probability) in the next 24 hours. Adjust irrigation to prevent waterlogging.`,
        time: "Next 24h",
        icon: "cloud-rain",
        color: "#64B5F6",
      })
    }
  }

  // 2. Soil-based dynamic alerts (only generated if actual readings exist)
  const zoneReadings = new Map()
  for (const r of soilReadings) {
    const zId = String(r.zoneId)
    if (!zoneReadings.has(zId)) zoneReadings.set(zId, r)
  }

  for (const zone of zones) {
    const reading = zoneReadings.get(String(zone._id))
    if (!reading) continue

    const moisture = reading.readings?.moisture?.value
    const ph = reading.readings?.ph?.value

    if (typeof moisture === "number") {
      if (moisture < 30) {
        alerts.push({
          id: `moisture-low-${zone._id}`,
          type: "warning",
          title: `Low Soil Moisture in ${zone.name}`,
          message: `Soil moisture measured at ${moisture}% (${reading.method} sample). Critical water deficit threshold reached.`,
          time: new Date(reading.observedAt).toLocaleDateString(),
          icon: "droplets",
          color: "#F9A825",
        })
      } else if (moisture > 85) {
        alerts.push({
          id: `moisture-high-${zone._id}`,
          type: "warning",
          title: `Soil Saturation in ${zone.name}`,
          message: `Soil moisture measured at ${moisture}%. Risk of root anoxia or fungal development. Check drainage.`,
          time: new Date(reading.observedAt).toLocaleDateString(),
          icon: "droplets",
          color: "#0288D1",
        })
      }
    }

    if (typeof ph === "number") {
      if (ph < 5.5) {
        alerts.push({
          id: `ph-acidic-${zone._id}`,
          type: "info",
          title: `Acidic Soil pH in ${zone.name}`,
          message: `pH is ${ph.toFixed(1)}. Strongly acidic conditions may limit phosphorus and micronutrient uptake.`,
          time: new Date(reading.observedAt).toLocaleDateString(),
          icon: "bug",
          color: "#7E57C2",
        })
      } else if (ph > 8.5) {
        alerts.push({
          id: `ph-alkaline-${zone._id}`,
          type: "info",
          title: `Alkaline Soil pH in ${zone.name}`,
          message: `pH is ${ph.toFixed(1)}. High alkalinity may induce iron/zinc chlorosis.`,
          time: new Date(reading.observedAt).toLocaleDateString(),
          icon: "bug",
          color: "#8D6E63",
        })
      }
    }
  }

  res.json({ alerts })
}))

router.get("/farms/:farmId/irrigation-advisory", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  const [zones, soilReadings, weather] = await Promise.all([
    Zone.find({ farmId: farm._id }),
    SoilReading.find({ farmId: farm._id }).sort({ observedAt: -1 }).limit(50),
    getFarmWeather(farm).catch(() => null),
  ])

  const advisory = calculateIrrigationAdvisory(farm, zones, soilReadings, weather)
  res.json(advisory)
}))

router.post("/zones/:zoneId/predictions/irrigation", asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  const farm = await getOwnedFarm(zone.farmId, req.user._id)

  const [soilReadings, weather] = await Promise.all([
    SoilReading.find({ farmId: farm._id, zoneId: zone._id }).sort({ observedAt: -1 }).limit(10),
    getFarmWeather(farm).catch(() => null),
  ])

  const advisory = calculateIrrigationAdvisory(farm, [zone], soilReadings, weather)
  const zoneAdvisory = advisory.zones[0] || {}

  const run = await PredictionRun.create({
    farmId: farm._id,
    zoneId: zone._id,
    requestedBy: req.user._id,
    type: "irrigation",
    status: "completed",
    inputSnapshot: {
      zoneName: zone.name,
      crop: zone.crop || "Unknown",
      area: zone.area || null,
      areaUnit: zone.areaUnit || "ha",
      currentMoisture: zoneAdvisory.currentMoisture,
      rainForecast48hMm: advisory.weatherSummary.rainForecast48hMm,
    },
    result: zoneAdvisory,
    provider: "agronomic-engine",
    promptVersion: "irrigation-rules-v1",
    completedAt: new Date(),
  })

  res.status(201).json({ prediction: run })
}))

router.get("/farms/:farmId/yield-estimate", asyncHandler(async (req, res) => {
  const farm = await getOwnedFarm(req.params.farmId, req.user._id)
  const [zones, soilReadings, weather] = await Promise.all([
    Zone.find({ farmId: farm._id }),
    SoilReading.find({ farmId: farm._id }).sort({ observedAt: -1 }).limit(50),
    getFarmWeather(farm).catch(() => null),
  ])

  const estimate = calculateYieldEstimate(farm, zones, soilReadings, weather)
  res.json(estimate)
}))

router.post("/zones/:zoneId/predictions/yield", asyncHandler(async (req, res) => {
  const zone = await getOwnedZone(req.params.zoneId, req.user._id)
  const farm = await getOwnedFarm(zone.farmId, req.user._id)

  const [soilReadings, weather] = await Promise.all([
    SoilReading.find({ farmId: farm._id, zoneId: zone._id }).sort({ observedAt: -1 }).limit(10),
    getFarmWeather(farm).catch(() => null),
  ])

  const estimate = calculateYieldEstimate(farm, [zone], soilReadings, weather)
  const zoneEstimate = estimate.zones[0] || {}

  const run = await PredictionRun.create({
    farmId: farm._id,
    zoneId: zone._id,
    requestedBy: req.user._id,
    type: "yield",
    status: zoneEstimate.hasSufficientData ? "completed" : "failed",
    inputSnapshot: {
      zoneName: zone.name,
      crop: zone.crop || "Unknown",
      area: zone.area || null,
      areaUnit: zone.areaUnit || "ha",
    },
    result: zoneEstimate,
    error: zoneEstimate.hasSufficientData ? undefined : zoneEstimate.missingInputs?.join(", "),
    provider: "agronomic-engine",
    promptVersion: "yield-benchmark-v1",
    completedAt: new Date(),
  })

  res.status(201).json({ prediction: run })
}))

export default router
