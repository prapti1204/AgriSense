import { HttpError } from "../lib/httpError.js"

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source])
    if (!parsed.success) {
      return next(new HttpError(400, "VALIDATION_ERROR", "Request validation failed.", parsed.error.flatten()))
    }
    req[source] = parsed.data
    next()
  }
}
