import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import { User } from "../models/User.js"
import { HttpError } from "../lib/httpError.js"

export const cookieName = "agrisense_session"
export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export function createSessionToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: "7d" })
}

export async function requireAuth(req, _res, next) {
  try {
    const token = req.cookies?.[cookieName]
    if (!token) throw new HttpError(401, "UNAUTHENTICATED", "Please sign in.")
    const payload = jwt.verify(token, env.JWT_SECRET)
    const user = await User.findById(payload.sub).select("name email preferences")
    if (!user) throw new HttpError(401, "UNAUTHENTICATED", "Please sign in.")
    req.user = user
    next()
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "UNAUTHENTICATED", "Please sign in."))
  }
}
