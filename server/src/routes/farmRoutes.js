import { Router } from "express"
import { Farm } from "../models/Farm.js"
import { Zone } from "../models/Zone.js"
import { SoilReading } from "../models/SoilReading.js"
import { PredictionRun } from "../models/PredictionRun.js"
import { asyncHandler, HttpError } from "../lib/httpError.js"
import { getOwnedFarm, getOwnedZone } from "../services/ownership.js"
import { getFarmWeather } from "../services/weatherService.js"
import { recommendCrops } from "../services/geminiPredictionService.js"
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

export default router
