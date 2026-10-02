import { createContext, useContext, useState, useEffect } from "react"
import { readStored, writeStored } from "../data/browserStorage"
import { alerts } from "../data/mockData"
export const farmZones = [
  {
    id: "A",
    name: "Zone A – Rice Field",
    crop: "Rice",
    active: true,
    usage: 1840,
    target: 2400,
    next: "Today, 6:00 AM",
    moisture: 68,
    area: 18,
    risk: "High",
    x: 20,
    y: 35,
  },
  {
    id: "B",
    name: "Zone B – Maize Field",
    crop: "Maize",
    active: true,
    usage: 1200,
    target: 2000,
    next: "Today, 2:00 PM",
    moisture: 55,
    area: 16,
    risk: "Medium",
    x: 55,
    y: 25,
  },
  {
    id: "C",
    name: "Zone C – Vegetable Garden",
    crop: "Vegetables",
    active: false,
    usage: 560,
    target: 1200,
    next: "Tomorrow, 7:00 AM",
    moisture: 38,
    area: 8,
    risk: "Low",
    x: 70,
    y: 55,
  },
  {
    id: "D",
    name: "Zone D – Orchard",
    crop: "Orchard",
    active: false,
    usage: 620,
    target: 1800,
    next: "Tomorrow, 10:00 AM",
    moisture: 48,
    area: 8,
    risk: "Low",
    x: 35,
    y: 75,
  },
]
export const allAlerts = [
  ...alerts,
  {
    id: 5,
    type: "info",
    title: "Irrigation Completed",
    message:
      "Zone B maize field irrigation completed successfully. 1,200L used.",
    time: "1 day ago",
    icon: "droplets",
    color: "#43A047",
  },
  {
    id: 6,
    type: "info",
    title: "AI Model Updated",
    message:
      "Crop recommendation model updated with new regional data. Accuracy improved to 94.2%.",
    time: "2 days ago",
    icon: "bug",
    color: "#7986CB",
  },
]
const FarmContext = createContext(null)
export function FarmProvider({ children }) {
  const [zones, setZones] = useState(() => readStored("zones", farmZones))
  const [autoMode, setAuto] = useState(() => readStored("auto", true))
  const [dismissed, setDismissed] = useState(() => readStored("dismissed", []))
  const [farm, updateFarm] = useState(() =>
    readStored("farm", {
      name: "Greenfield Estate",
      location: "Maharashtra",
      area: 50,
    }),
  )
  useEffect(() => {
    writeStored("zones", zones)
  }, [zones])
  useEffect(() => {
    writeStored("auto", autoMode)
  }, [autoMode])
  useEffect(() => {
    writeStored("dismissed", dismissed)
  }, [dismissed])
  useEffect(() => {
    writeStored("farm", farm)
  }, [farm])
  return (
    <FarmContext.Provider
      value={{
        zones,
        autoMode,
        dismissed,
        farm,
        updateFarm,
        toggleZone: (id) =>
          setZones((z) =>
            z.map((zone) =>
              zone.id === id ? { ...zone, active: !zone.active } : zone,
            ),
          ),
        toggleAuto: () => setAuto((v) => !v),
        dismiss: (id) => setDismissed((d) => [...new Set([...d, id])]),
        dismissAll: () => setDismissed(allAlerts.map((a) => a.id)),
      }}
    >
      {children}
    </FarmContext.Provider>
  )
}
export function useFarm() {
  const state = useContext(FarmContext)
  if (!state) throw new Error("FarmProvider required")
  return state
}
