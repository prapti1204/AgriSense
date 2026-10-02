const icons = {
  sun: "☀️",
  cloud: "⛅",
  rain: "🌧️",
  storm: "⛈️",
  partly: "🌤️",
}
export default function WeatherIcon({ icon, size = 24 }) {
  return <span style={{ fontSize: size }}>{icons[icon] || "🌤️"}</span>
}
