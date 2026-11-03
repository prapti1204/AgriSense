import { Router } from "express"
import bcrypt from "bcryptjs"
import { User } from "../models/User.js"
import { asyncHandler, HttpError } from "../lib/httpError.js"
import { requireAuth, cookieName, cookieOptions, createSessionToken } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { loginSchema, preferencesSchema, profileSchema, signupSchema } from "../validators/schemas.js"

const router = Router()
const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  preferences: user.preferences,
  createdAt: user.createdAt,
})

router.post("/signup", validate(signupSchema), asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase()
  if (await User.exists({ email })) throw new HttpError(409, "EMAIL_IN_USE", "An account with this email already exists.")
  const passwordHash = await bcrypt.hash(req.body.password, 12)
  const user = await User.create({ name: req.body.name, email, passwordHash })
  res.cookie(cookieName, createSessionToken(user._id), cookieOptions)
  res.status(201).json({ user: publicUser(user) })
}))

router.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+passwordHash")
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.")
  }
  res.cookie(cookieName, createSessionToken(user._id), cookieOptions)
  res.json({ user: publicUser(user) })
}))

router.post("/logout", (_req, res) => {
  const { maxAge: _maxAge, ...clearOptions } = cookieOptions
  res.clearCookie(cookieName, clearOptions)
  res.status(204).end()
})

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }))
router.patch("/me", requireAuth, validate(profileSchema), asyncHandler(async (req, res) => {
  const updates = { ...req.body }
  if (updates.email) updates.email = updates.email.toLowerCase()
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })
  res.json({ user: publicUser(user) })
}))
router.get("/me/preferences", requireAuth, (req, res) => res.json({ preferences: req.user.preferences }))
router.patch("/me/preferences", requireAuth, validate(preferencesSchema), asyncHandler(async (req, res) => {
  const updates = Object.fromEntries(Object.entries(req.body).map(([key, value]) => [`preferences.${key}`, value]))
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })
  res.json({ preferences: user.preferences })
}))

export default router
