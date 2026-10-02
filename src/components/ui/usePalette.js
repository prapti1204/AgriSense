import { useTheme } from "../../context/ThemeContext"
export function usePalette() {
  const { isDark } = useTheme()
  return {
    isDark,
    bg: isDark ? "#0F1A0F" : "#F1F5F0",
    surface: isDark ? "#1A2A1A" : "#FFFFFF",
    border: isDark ? "#2A3D2A" : "#E2EBE0",
    text: isDark ? "#E8F5E8" : "#1A2E1A",
    muted: isDark ? "#7AAA7A" : "#5A7A5A",
    gridLine: isDark ? "#223022" : "#F0F5EF",
    tooltipBg: isDark ? "#1A2A1A" : "#FFFFFF",
  }
}
