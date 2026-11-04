import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { env } from "../config/env.js"
import { HttpError } from "../lib/httpError.js"
import { handleGeminiError, withGeminiRetry } from "../lib/geminiError.js"

const pestAnalysisSchema = {
  type: "object",
  properties: {
    identified: { type: "boolean" },
    issueName: { type: "string" },
    scientificName: { type: "string" },
    category: { type: "string", enum: ["pest", "disease", "deficiency", "healthy", "unknown"] },
    severity: { type: "string", enum: ["low", "moderate", "high", "severe", "unknown"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    symptoms: { type: "array", items: { type: "string" } },
    treatments: { type: "array", items: { type: "string" } },
    prevention: { type: "array", items: { type: "string" } },
    diagnosisNotes: { type: "string" },
  },
  required: ["identified", "issueName", "category", "severity", "confidence", "symptoms", "treatments", "diagnosisNotes"],
}

const pestAnalysisResultSchema = z.object({
  identified: z.boolean(),
  issueName: z.string().min(1).max(120),
  scientificName: z.string().max(120).optional().default(""),
  category: z.enum(["pest", "disease", "deficiency", "healthy", "unknown"]),
  severity: z.enum(["low", "moderate", "high", "severe", "unknown"]),
  confidence: z.number().min(0).max(1),
  symptoms: z.array(z.string().max(500)).max(10),
  treatments: z.array(z.string().max(500)).max(10),
  prevention: z.array(z.string().max(500)).max(10).optional().default([]),
  diagnosisNotes: z.string().max(1500),
})

export async function analyzePlantPest(base64Image, mimeType, cropContext = "") {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(503, "PREDICTION_NOT_CONFIGURED", "Gemini is not configured. Set GEMINI_API_KEY on the server.")
  }

  const prompt = [
    "Act as an expert agricultural plant pathologist and entomologist.",
    "Carefully inspect the provided image of a plant/leaf.",
    cropContext ? `Context: This plant is reported as ${cropContext}.` : "",
    "Diagnose any visible pests, fungal/bacterial/viral disease, or nutritional deficiency.",
    "If the image is blurry, does not show a plant, or no clear issue can be identified, set identified: false, category: 'unknown', and explain why honestly in diagnosisNotes. Do NOT invent a fake pathogen or disease.",
    "If the plant appears fully healthy, set identified: true, issueName: 'Healthy Crop', category: 'healthy', severity: 'low'.",
    "Provide practical, safe organic and conventional treatment recommendations.",
  ].filter(Boolean).join(" ")

  const rawData = base64Image.replace(/^data:[^;]+;base64,/, "").trim()

  const imagePart = {
    inlineData: {
      data: rawData,
      mimeType: mimeType || "image/jpeg",
    },
  }

  let response
  try {
    const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
    response = await withGeminiRetry(() =>
      client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [imagePart, prompt],
        config: {
          responseMimeType: "application/json",
          responseSchema: pestAnalysisSchema,
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
    throw new HttpError(502, "INVALID_MODEL_RESPONSE", "Gemini returned an invalid structured pest diagnosis.")
  }

  const validated = pestAnalysisResultSchema.safeParse(result)
  if (!validated.success) {
    throw new HttpError(502, "INVALID_MODEL_RESPONSE", "Gemini diagnosis response did not match the required schema.")
  }

  return validated.data
}

