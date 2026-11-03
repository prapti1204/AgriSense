import mongoose from "mongoose"

const zoneSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    crop: { type: String, trim: true, maxlength: 80, default: "" },
    area: { type: Number, min: 0 },
    areaUnit: { type: String, enum: ["ha", "acre"], default: "ha" },
    geometry: {
      type: { type: String, enum: ["Point", "Polygon"] },
      coordinates: { type: mongoose.Schema.Types.Mixed },
    },
    irrigation: {
      desiredMode: { type: String, enum: ["manual", "scheduled"], default: "manual" },
      targetLitres: { type: Number, min: 0 },
    },
  },
  { timestamps: true },
)

zoneSchema.index({ farmId: 1, createdAt: 1 })
export const Zone = mongoose.model("Zone", zoneSchema)
