import mongoose from "mongoose"

const weatherSnapshotSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    provider: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    observedAt: { type: Date },
    fetchedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

weatherSnapshotSchema.index({ farmId: 1, fetchedAt: -1 })
weatherSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export const WeatherSnapshot = mongoose.model("WeatherSnapshot", weatherSnapshotSchema)
