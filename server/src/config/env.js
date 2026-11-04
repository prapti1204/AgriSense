import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://127.0.0.1:5173"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-3.6-flash"),
  WEATHER_CACHE_MINUTES: z.coerce.number().int().positive().default(30),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error("Invalid server environment:", parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
