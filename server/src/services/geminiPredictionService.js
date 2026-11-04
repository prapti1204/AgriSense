import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { env } from "../config/env.js"
import { HttpError } from "../lib/httpError.js"
import { handleGeminiError, withGeminiRetry } from "../lib/geminiError.js"

const cropRecommendationSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ready", "insufficient_data", "uncertain"] },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          crop: { type: "string" },
          suitability: { type: "number", minimum: 0, maximum: 1 },
          reasons: { type: "array", items: { type: "string" } },
        },
        required: ["crop", "suitability", "reasons"],
      },
    },
    missingInputs: { type: "array", items: { type: "string" } },
    explanation: { type: "string" },
  },
  required: ["status", "recommendations", "missingInputs", "explanation"],
}

const cropRecommendationResultSchema = z.object({
  status: z.enum(["ready", "insufficient_data", "uncertain"]),
  recommendations: z.array(z.object({
    crop: z.string().min(1).max(100),
    suitability: z.number().min(0).max(1),
    reasons: z.array(z.string().max(500)).max(8),
  })).max(5),
  missingInputs: z.array(z.string().max(120)).max(20),
  explanation: z.string().max(1500),
})

export async function recommendCrops(input) {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(503, "PREDICTION_NOT_CONFIGURED", "Gemini is not configured. Set GEMINI_API_KEY on the server.")
  }

  let response
  try {
    const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
    response = await withGeminiRetry(() =>
      client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [
          "Act as a cautious agricultural decision-support assistant. Recommend crops only from the supplied farm data. Do not invent soil measurements or local market facts. Return insufficient_data when essential information is missing, and uncertain where the evidence is weak. Suitability is a qualitative score from 0 to 1, not a calibrated probability. Do not provide chemical treatment or dosage advice.\n\nFarm data:\n",
          JSON.stringify(input),
        ].join(""),
        config: {
          responseMimeType: "application/json",
          responseSchema: cropRecommendationSchema,
        },
      })
    )
  } catch (apiError) {
    throw handleGeminiError(apiError)
  }

  let result
  try {
    result = JSON.parse(response.text)
  } catch {
    throw new HttpError(502, "INVALID_MODEL_RESPONSE", "Gemini returned an invalid structured prediction.")
  }
  const validated = cropRecommendationResultSchema.safeParse(result)
  if (!validated.success) {
    throw new HttpError(502, "INVALID_MODEL_RESPONSE", "Gemini returned a prediction that did not match the expected schema.")
  }
  return validated.data
}
