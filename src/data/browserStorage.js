export function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(`cropai:${key}`)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}
export function writeStored(key, value) {
  try {
    localStorage.setItem(`cropai:${key}`, JSON.stringify(value))
  } catch {
    /* The demo also works without browser storage. */
  }
}
