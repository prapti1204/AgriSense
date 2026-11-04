import { HttpError } from "../lib/httpError.js"

export function notFound(_req, _res, next) {
  next(new HttpError(404, "NOT_FOUND", "The requested resource was not found."))
}

export function errorHandler(error, _req, res, _next) {
  if (error?.code === 11000) {
    return res.status(409).json({ error: { code: "DUPLICATE_RESOURCE", message: "An account with this email already exists." } })
  }
  const status = error.status || (["ValidationError", "CastError"].includes(error.name) ? 400 : 500)
  if (status >= 500) console.error(error)
  res.status(status).json({
    error: {
      code: error.code || (["ValidationError", "CastError"].includes(error.name) ? "VALIDATION_ERROR" : "INTERNAL_ERROR"),
      message: error instanceof HttpError ? error.message : (status >= 500 ? "An unexpected server error occurred." : error.message),
      ...(error.details ? { details: error.details } : {}),
    },
  })
}
