import mongoose from "mongoose"
import { Farm } from "../models/Farm.js"
import { Zone } from "../models/Zone.js"
import { HttpError } from "../lib/httpError.js"

export async function getOwnedFarm(farmId, userId) {
  if (!farmId || !userId || !mongoose.isValidObjectId(farmId) || !mongoose.isValidObjectId(userId)) {
    throw new HttpError(404, "FARM_NOT_FOUND", "Farm not found.")
  }
  const farm = await Farm.findOne({
    _id: new mongoose.Types.ObjectId(String(farmId)),
    ownerId: new mongoose.Types.ObjectId(String(userId)),
  })
  if (!farm) throw new HttpError(404, "FARM_NOT_FOUND", "Farm not found.")
  return farm
}

export async function getOwnedZone(zoneId, userId) {
  if (!zoneId || !mongoose.isValidObjectId(zoneId)) {
    throw new HttpError(404, "ZONE_NOT_FOUND", "Zone not found.")
  }
  const zone = await Zone.findById(new mongoose.Types.ObjectId(String(zoneId)))
  if (!zone) throw new HttpError(404, "ZONE_NOT_FOUND", "Zone not found.")
  await getOwnedFarm(zone.farmId, userId)
  return zone
}

