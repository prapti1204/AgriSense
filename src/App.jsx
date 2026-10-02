import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { FarmProvider } from "./context/FarmContext"
import { FeedbackProvider } from "./context/FeedbackContext"
import AppRoutes from "./routes/AppRoutes"
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FarmProvider>
          <FeedbackProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </FeedbackProvider>
        </FarmProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
