import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import { env } from "./config/env.js"
import { requireAuth } from "./middleware/auth.js"
import authRoutes from "./routes/authRoutes.js"
import farmRoutes from "./routes/farmRoutes.js"
import { errorHandler, notFound } from "./middleware/errors.js"

const app = express()
app.disable("x-powered-by")
app.use(helmet())
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "agrisense-api" }))

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false })
app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1", requireAuth, farmRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
