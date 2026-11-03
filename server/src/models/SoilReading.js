import mongoose from "mongoose"

const measurementSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true },
    unit: { type: String, required: true, trim: true, maxlength: 24 },
  },
  { _id: false },
)

const soilReadingSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    readings: {
      nitrogen: measurementSchema,
      phosphorus: measurementSchema,
      potassium: measurementSchema,
      ph: measurementSchema,
      moisture: measurementSchema,
    },
    method: { type: String, enum: ["lab", "manual", "sensor"], required: true },
    source: { type: String, trim: true, maxlength: 120, default: "user-entered" },
    observedAt: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
)

soilReadingSchema.index({ farmId: 1, zoneId: 1, observedAt: -1 })
export const SoilReading = mongoose.model("SoilReading", soilReadingSchema)
