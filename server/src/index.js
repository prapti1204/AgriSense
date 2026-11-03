import app from "./app.js"
import { env } from "./config/env.js"
import { connectDatabase } from "./config/database.js"

try {
  await connectDatabase()
  const server = app.listen(env.PORT, () => console.log(`AgriSense API listening on http://127.0.0.1:${env.PORT}`))

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => server.close(async () => {
      const mongoose = await import("mongoose")
      await mongoose.default.disconnect()
      process.exit(0)
    }))
  }
} catch (error) {
  console.error("Unable to start AgriSense API:", error.message)
  process.exit(1)
}
