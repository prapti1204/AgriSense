import mongoose from "mongoose"

const predictionRunSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    zoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Zone" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["crop", "yield", "pest", "irrigation"], required: true },
    status: { type: String, enum: ["queued", "running", "completed", "failed"], default: "queued" },
    inputSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    result: { type: mongoose.Schema.Types.Mixed },
    provider: { type: String, default: "gemini" },
    modelVersion: { type: String },
    promptVersion: { type: String },
    error: { type: String, maxlength: 500 },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

predictionRunSchema.index({ farmId: 1, createdAt: -1 })
export const PredictionRun = mongoose.model("PredictionRun", predictionRunSchema)
