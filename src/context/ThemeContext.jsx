import { readStored, writeStored } from "../data/browserStorage"
import { createContext, useContext, useState, useEffect } from "react"
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
})
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStored("theme", "light"))
  useEffect(() => {
    writeStored("theme", theme)
    if (theme === "dark") {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }, [theme])
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"))
  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark: theme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
export const useTheme = () => useContext(ThemeContext)
