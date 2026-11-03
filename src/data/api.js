export async function apiRequest(path, options = {}) {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error?.message || "The request could not be completed.")
    error.status = response.status
    error.code = payload.error?.code
    throw error
  }
  return payload
}
