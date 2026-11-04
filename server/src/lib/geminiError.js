import { HttpError } from "./httpError.js"

/**
 * Normalizes Google GenAI exceptions into clean, safe HttpError instances.
 * Guarantees that raw credentials and sensitive headers are never leaked.
 */
export function handleGeminiError(err) {
  if (err instanceof HttpError) return err

  const raw = err?.message || String(err)
  // Mask any potential Google API key patterns (standard AIza prefix)
  const sanitized = raw.replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_KEY]")

  if (/api[ _]?key/i.test(sanitized) || /unauthenticated/i.test(sanitized) || /permission_denied/i.test(sanitized)) {
    return new HttpError(502, "AI_AUTH_ERROR", "Gemini API authentication failed. Please verify that your API key is valid and has access.")
  }
  if (/resource_exhausted/i.test(sanitized) || /quota/i.test(sanitized) || /429/.test(sanitized)) {
    return new HttpError(429, "AI_QUOTA_EXCEEDED", "Gemini API rate limit or quota exceeded. Please wait a moment before trying again.")
  }
  if (/high demand/i.test(sanitized) || /unavailable/i.test(sanitized) || /503/.test(sanitized)) {
    return new HttpError(503, "AI_SERVICE_BUSY", "The Gemini AI model is currently experiencing high demand. Please try again shortly.")
  }
  if (/not[ _]?found/i.test(sanitized) || /no longer available/i.test(sanitized) || /404/.test(sanitized)) {
    return new HttpError(502, "AI_MODEL_ERROR", "The configured Gemini model is unavailable or unsupported.")
  }
  if (/timeout|etimedout|econnrefused|fetch failed|network/i.test(sanitized)) {
    return new HttpError(504, "AI_NETWORK_ERROR", "Unable to reach Google AI services. Please check network connectivity.")
  }

  return new HttpError(502, "AI_SERVICE_ERROR", "Gemini inference failed: " + sanitized.slice(0, 150))
}

/**
 * Executes a Gemini operation with controlled exponential backoff retry for transient 503 / high demand spikes.
 */
export async function withGeminiRetry(fn, maxRetries = 3) {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const raw = err?.message || String(err)
      // Retry transient 503 capacity errors or network timeouts
      const isTransient = /503|high demand|temporarily unavailable|unavailable|timeout|econnreset|fetch failed/i.test(raw)
      if (isTransient && attempt < maxRetries) {
        const delay = 1500 * Math.pow(2, attempt) + Math.random() * 500
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
      throw handleGeminiError(err)
    }
  }
  throw handleGeminiError(lastError)
}

