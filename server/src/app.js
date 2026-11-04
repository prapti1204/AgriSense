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

// Allow both 127.0.0.1 and localhost variants of CLIENT_ORIGIN so that
// development works consistently regardless of which loopback alias the
// browser resolves. No arbitrary origins are permitted.
const allowedOrigins = new Set([env.CLIENT_ORIGIN])
if (env.CLIENT_ORIGIN.includes("127.0.0.1")) {
  allowedOrigins.add(env.CLIENT_ORIGIN.replace("127.0.0.1", "localhost"))
} else if (env.CLIENT_ORIGIN.includes("localhost")) {
  allowedOrigins.add(env.CLIENT_ORIGIN.replace("localhost", "127.0.0.1"))
}
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (server-to-server, curl, health checks)
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    callback(new Error(`CORS: origin '${origin}' is not allowed`))
  },
  credentials: true,
}))
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "agrisense-api" }))

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false })
app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1", requireAuth, farmRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
