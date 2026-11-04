import { z } from "zod"

const coordinateSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
})

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
})
export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
})
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(254).optional(),
}).refine((value) => Object.keys(value).length > 0)
export const preferencesSchema = z.object({
  notifications: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
}).refine((value) => Object.keys(value).length > 0)

export const farmCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  locationLabel: z.string().trim().max(160).optional().default(""),
  coordinates: coordinateSchema,
  timezone: z.string().trim().min(1).max(80).optional().default("UTC"),
  area: z.coerce.number().positive().optional(),
  areaUnit: z.enum(["ha", "acre"]).optional().default("ha"),
})
export const farmPatchSchema = farmCreateSchema.partial().refine((value) => Object.keys(value).length > 0)

const geoCoordinateSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
const pointSchema = z.object({ type: z.literal("Point"), coordinates: geoCoordinateSchema })
const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(geoCoordinateSchema).min(4)).min(1),
})
export const zoneCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  crop: z.string().trim().max(80).optional().default(""),
  area: z.coerce.number().positive().optional(),
  areaUnit: z.enum(["ha", "acre"]).optional().default("ha"),
  geometry: z.union([pointSchema, polygonSchema]).optional(),
  irrigation: z.object({
    desiredMode: z.enum(["manual", "scheduled"]).optional(),
    targetLitres: z.number().min(0).nullable().optional(),
  }).optional(),
})
export const zonePatchSchema = zoneCreateSchema.partial().refine((value) => Object.keys(value).length > 0)

const measurementSchema = z.object({
  value: z.coerce.number().finite(),
  unit: z.string().trim().min(1).max(24),
})
export const soilReadingSchema = z.object({
  readings: z.object({
    nitrogen: measurementSchema.optional(),
    phosphorus: measurementSchema.optional(),
    potassium: measurementSchema.optional(),
    ph: measurementSchema.optional(),
    moisture: measurementSchema.optional(),
  }).refine((readings) => Object.keys(readings).length > 0, "At least one soil measurement is required."),
  method: z.enum(["lab", "manual", "sensor"]),
  source: z.string().trim().max(120).optional().default("user-entered"),
  observedAt: z.coerce.date(),
  notes: z.string().trim().max(1000).optional().default(""),
}).superRefine((data, context) => {
  if (data.readings.ph && (data.readings.ph.value < 0 || data.readings.ph.value > 14)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["readings", "ph", "value"], message: "pH must be between 0 and 14." })
  }
  if (data.readings.moisture && (data.readings.moisture.value < 0 || data.readings.moisture.value > 100)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["readings", "moisture", "value"], message: "Moisture percentage must be between 0 and 100." })
  }
})
