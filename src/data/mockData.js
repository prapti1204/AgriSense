export const weatherForecast = [
  { day: "Mon", high: 28, low: 18, icon: "sun", rain: 5 },
  { day: "Tue", high: 25, low: 17, icon: "cloud", rain: 30 },
  { day: "Wed", high: 22, low: 15, icon: "rain", rain: 75 },
  { day: "Thu", high: 20, low: 14, icon: "storm", rain: 85 },
  { day: "Fri", high: 24, low: 16, icon: "partly", rain: 20 },
  { day: "Sat", high: 27, low: 18, icon: "sun", rain: 5 },
  { day: "Sun", high: 29, low: 19, icon: "sun", rain: 2 },
]
export const temperatureData = [
  { time: "6AM", temp: 18, humidity: 72 },
  { time: "9AM", temp: 22, humidity: 68 },
  { time: "12PM", temp: 28, humidity: 58 },
  { time: "3PM", temp: 31, humidity: 52 },
  { time: "6PM", temp: 26, humidity: 60 },
  { time: "9PM", temp: 22, humidity: 67 },
  { time: "12AM", temp: 19, humidity: 74 },
]
export const rainfallData = [
  { month: "Apr", rainfall: 45 },
  { month: "May", rainfall: 82 },
  { month: "Jun", rainfall: 120 },
  { month: "Jul", rainfall: 95 },
  { month: "Aug", rainfall: 60 },
  { month: "Sep", rainfall: 38 },
]
export const yieldData = [
  { month: "Jan", actual: 0, predicted: 0 },
  { month: "Feb", actual: 0, predicted: 0 },
  { month: "Mar", actual: 420, predicted: 400 },
  { month: "Apr", actual: 680, predicted: 650 },
  { month: "May", actual: 920, predicted: 880 },
  { month: "Jun", actual: 1240, predicted: 1200 },
  { month: "Jul", actual: 1580, predicted: 1520 },
  { month: "Aug", actual: 0, predicted: 1800 },
  { month: "Sep", actual: 0, predicted: 2050 },
]
export const soilHealth = {
  nitrogen: 72,
  phosphorus: 58,
  potassium: 84,
  ph: 6.8,
  moisture: 63,
}
export const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Heavy Rain Warning",
    message:
      "Expected 85mm rainfall in next 24hrs. Adjust irrigation schedule.",
    time: "2 hours ago",
    icon: "cloud-rain",
    color: "#64B5F6",
  },
  {
    id: 2,
    type: "danger",
    title: "High Pest Risk Detected",
    message:
      "AI detected aphid infestation risk in Zone B. Immediate action recommended.",
    time: "4 hours ago",
    icon: "bug",
    color: "#E53935",
  },
  {
    id: 3,
    type: "warning",
    title: "Low Soil Moisture",
    message: "Zone C soil moisture at 28%. Schedule irrigation within 6 hours.",
    time: "5 hours ago",
    icon: "droplets",
    color: "#F9A825",
  },
  {
    id: 4,
    type: "info",
    title: "Heat Wave Alert",
    message:
      "Temperatures expected to exceed 35°C Thu–Fri. Shade netting recommended.",
    time: "1 day ago",
    icon: "thermometer-sun",
    color: "#FF7043",
  },
]
export const cropRecommendation = {
  crop: "Maize (Zea mays)",
  variety: "DK8031 Hybrid",
  confidence: 94,
  profit: "₹2,40,000",
  season: "Kharif 2024",
  water: "450–600mm",
  days: "90–100 days",
  soilSuitability: "Excellent",
}
export const irrigationSchedule = [
  {
    zone: "Zone A – Rice",
    next: "Today, 6:00 AM",
    duration: "45 min",
    status: "scheduled",
  },
  {
    zone: "Zone B – Maize",
    next: "Today, 2:00 PM",
    duration: "30 min",
    status: "running",
  },
  {
    zone: "Zone C – Vegetables",
    next: "Tomorrow, 7:00 AM",
    duration: "20 min",
    status: "scheduled",
  },
]
