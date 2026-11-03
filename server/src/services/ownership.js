import { Farm } from "../models/Farm.js"
import { Zone } from "../models/Zone.js"
import { HttpError } from "../lib/httpError.js"

export async function getOwnedFarm(farmId, userId) {
  const farm = await Farm.findOne({ _id: farmId, ownerId: userId })
  if (!farm) throw new HttpError(404, "FARM_NOT_FOUND", "Farm not found.")
  return farm
}

export async function getOwnedZone(zoneId, userId) {
  const zone = await Zone.findById(zoneId)
  if (!zone) throw new HttpError(404, "ZONE_NOT_FOUND", "Zone not found.")
  await getOwnedFarm(zone.farmId, userId)
  return zone
}
