import mongoose from "mongoose"

const farmSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    locationLabel: { type: String, trim: true, maxlength: 160, default: "" },
    coordinates: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
    },
    timezone: { type: String, trim: true, default: "UTC" },
    area: { type: Number, min: 0 },
    areaUnit: { type: String, enum: ["ha", "acre"], default: "ha" },
  },
  { timestamps: true },
)

farmSchema.index({ ownerId: 1, createdAt: -1 })
export const Farm = mongoose.model("Farm", farmSchema)
