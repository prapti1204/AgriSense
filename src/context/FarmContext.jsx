import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { apiRequest } from "../data/api"
import { useAuth } from "./AuthContext"

// Backward compatibility exports for legacy modules prior to Phase 4
export const farmZones = []
export const allAlerts = []

const FarmContext = createContext(null)

export function FarmProvider({ children }) {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const [farms, setFarms] = useState([])
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [zones, setZones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [autoMode, setAutoMode] = useState(false)
  
  const farm = useMemo(() => {
    if (!farms.length) return null
    return farms.find((f) => (f._id || f.id) === selectedFarmId) || farms[0] || null
  }, [farms, selectedFarmId])

  // Scope dismissed alerts in localStorage to the specific user and farm
  const storageKey = useMemo(() => {
    const userId = user?.id || user?._id || "anon"
    const farmId = farm?._id || farm?.id || "default"
    return `agrisense_dismissed_${userId}_${farmId}`
  }, [user, farm])

  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    if (isLoggedIn && farm) {
      try {
        const stored = localStorage.getItem(storageKey)
        setDismissed(stored ? JSON.parse(stored) : [])
      } catch {
        setDismissed([])
      }
    } else {
      setDismissed([])
    }
  }, [isLoggedIn, farm, storageKey])

  const dismiss = useCallback((id) => {
    setDismissed((prev) => {
      const next = [...new Set([...prev, id])]
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // Storage write error ignored
      }
      return next
    })
  }, [storageKey])

  const dismissAll = useCallback((idsToDismiss) => {
    setDismissed((prev) => {
      const next = [...new Set([...prev, ...(idsToDismiss || [])])]
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // Storage write error ignored
      }
      return next
    })
  }, [storageKey])

  const loadFarmData = useCallback(async (preferredFarmId = null) => {
    if (!isLoggedIn) {
      setFarms([])
      setZones([])
      setSelectedFarmId(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { farms: userFarms } = await apiRequest("/farms")
      const list = userFarms || []
      setFarms(list)

      if (list.length > 0) {
        const candidateId = preferredFarmId || selectedFarmId
        const activeFarm = list.find((f) => (f._id || f.id) === candidateId) || list[0]
        const activeId = activeFarm._id || activeFarm.id
        setSelectedFarmId(activeId)

        try {
          const { zones: farmZones } = await apiRequest(`/farms/${activeId}/zones`)
          setZones(farmZones || [])
        } catch {
          setZones([])
        }
      } else {
        setSelectedFarmId(null)
        setZones([])
      }
    } catch (err) {
      setError(err.message || "Failed to load farm information.")
      setFarms([])
      setZones([])
      setSelectedFarmId(null)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, selectedFarmId])

  useEffect(() => {
    if (!authLoading) {
      void loadFarmData()
    }
  }, [authLoading, isLoggedIn])

  const selectFarm = useCallback(async (farmId) => {
    setSelectedFarmId(farmId)
    setIsLoading(true)
    try {
      const { zones: farmZones } = await apiRequest(`/farms/${farmId}/zones`)
      setZones(farmZones || [])
    } catch (err) {
      setError(err.message || "Failed to load zones.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveFarm = useCallback(async (farmPayload) => {
    const activeFarmId = farmPayload.id || farmPayload._id || farm?._id || farm?.id || selectedFarmId
    const isUpdate = Boolean(activeFarmId && farms.some((f) => (f._id || f.id) === activeFarmId))
    const method = isUpdate ? "PATCH" : "POST"
    const path = isUpdate ? `/farms/${activeFarmId}` : "/farms"

    const { id: _id, _id: __id, ...body } = farmPayload
    const result = await apiRequest(path, {
      method,
      body: JSON.stringify(body),
    })

    const saved = result.farm
    const savedId = saved._id || saved.id
    setFarms((prev) => {
      const exists = prev.some((f) => (f._id || f.id) === savedId)
      if (exists) {
        return prev.map((f) => ((f._id || f.id) === savedId ? { ...f, ...saved } : f))
      }
      return [...prev, saved]
    })
    setSelectedFarmId(savedId)
    try {
      const { zones: farmZones } = await apiRequest(`/farms/${savedId}/zones`)
      setZones(farmZones || [])
    } catch {
      // ignore
    }
    return saved
  }, [farm, farms, selectedFarmId])

  const createZone = useCallback(async (zonePayload) => {
    const activeFarmId = farm?._id || farm?.id || selectedFarmId
    if (!activeFarmId) throw new Error("No active farm selected to create a zone.")

    const result = await apiRequest(`/farms/${activeFarmId}/zones`, {
      method: "POST",
      body: JSON.stringify(zonePayload),
    })
    const newZone = result.zone
    setZones((prev) => [...prev, newZone])
    return newZone
  }, [farm, selectedFarmId])

  const toggleZone = useCallback(async (zoneId) => {
    const target = zones.find((z) => (z._id || z.id) === zoneId)
    if (!target) return

    const currentMode = target.irrigation?.desiredMode || "manual"
    const nextMode = currentMode === "scheduled" ? "manual" : "scheduled"

    setZones((prev) =>
      prev.map((z) =>
        (z._id || z.id) === zoneId
          ? {
              ...z,
              irrigation: {
                ...z.irrigation,
                desiredMode: nextMode,
              },
            }
          : z,
      ),
    )

    try {
      const result = await apiRequest(`/zones/${target._id || target.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          irrigation: {
            ...target.irrigation,
            desiredMode: nextMode,
          },
        }),
      })
      if (result.zone) {
        setZones((prev) =>
          prev.map((z) => ((z._id || z.id) === zoneId ? { ...z, ...result.zone } : z)),
        )
      }
    } catch (err) {
      setZones((prev) =>
        prev.map((z) =>
          (z._id || z.id) === zoneId
            ? {
                ...z,
                irrigation: {
                  ...z.irrigation,
                  desiredMode: currentMode,
                },
              }
            : z,
        ),
      )
      throw err
    }
  }, [zones])

  const updateZone = useCallback(async (zoneId, patchPayload) => {
    const result = await apiRequest(`/zones/${zoneId}`, {
      method: "PATCH",
      body: JSON.stringify(patchPayload),
    })
    if (result.zone) {
      setZones((prev) =>
        prev.map((z) => ((z._id || z.id) === zoneId ? { ...z, ...result.zone } : z)),
      )
    }
    return result.zone
  }, [])

  const normalizedZones = useMemo(() => {
    return zones.map((z, index) => {
      const desiredMode = z.irrigation?.desiredMode || "manual"
      return {
        ...z,
        id: z._id || z.id || String(index + 1),
        name: z.name || `Zone ${index + 1}`,
        crop: z.crop || "Unspecified",
        area: z.area ?? null,
        areaUnit: z.areaUnit || farm?.areaUnit || "ha",
        desiredMode,
        active: desiredMode === "scheduled",
        pumpRunning: null,
        usage: null,
        target: z.irrigation?.targetLitres ?? null,
        next: desiredMode === "scheduled" ? "Scheduled" : "Manual standby",
        moisture: null,
        risk: null,
        x: z.geometry?.coordinates?.[0] != null ? z.geometry.coordinates[0] : 20 + (index * 25) % 60,
        y: z.geometry?.coordinates?.[1] != null ? z.geometry.coordinates[1] : 30 + (index * 20) % 50,
      }
    })
  }, [zones, farm])

  const normalizedFarm = useMemo(() => {
    if (!farm) {
      return {
        id: null,
        _id: null,
        name: "No Farm Configured",
        location: "",
        locationLabel: "",
        area: 0,
        areaUnit: "ha",
        coordinates: null,
        exists: false,
      }
    }
    const farmId = String(farm._id || farm.id || "")
    return {
      ...farm,
      id: farmId,
      _id: farmId,
      name: farm.name || "Unnamed Farm",
      location: farm.locationLabel || farm.location || "",
      locationLabel: farm.locationLabel || farm.location || "",
      area: farm.area ?? 0,
      areaUnit: farm.areaUnit || "ha",
      coordinates: farm.coordinates || null,
      exists: true,
    }
  }, [farm])

  const updateFarm = useCallback((updated) => {
    setFarms((prev) =>
      prev.map((f) => ((f._id || f.id) === (updated._id || updated.id) ? { ...f, ...updated } : f)),
    )
  }, [])

  const addSoilReading = useCallback(async (zoneId, payload) => {
    const result = await apiRequest(`/zones/${zoneId}/soil-readings`, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    // If moisture was included in the reading, update the zone's active moisture telemetry in memory
    if (payload.readings?.moisture?.value != null) {
      const moistureVal = Number(payload.readings.moisture.value)
      setZones((prev) =>
        prev.map((z) =>
          (z._id || z.id) === zoneId
            ? { ...z, moisture: moistureVal }
            : z,
        ),
      )
    }

    return result.reading
  }, [])

  const getSoilReadings = useCallback(async (zoneId = null, limit = 25) => {
    const activeFarmId = farm?._id || farm?.id || selectedFarmId
    if (!activeFarmId) return { readings: [], page: { limit, count: 0 } }
    const query = new URLSearchParams({ limit: String(limit) })
    if (zoneId) query.set("zoneId", zoneId)
    return await apiRequest(`/farms/${activeFarmId}/soil?${query.toString()}`)
  }, [farm, selectedFarmId])

  const requestCropRecommendation = useCallback(async (zoneId) => {
    return await apiRequest(`/zones/${zoneId}/predictions/crop`, {
      method: "POST",
    })
  }, [])

  const getZonePredictions = useCallback(async (zoneId, type = "crop") => {
    return await apiRequest(`/zones/${zoneId}/predictions?type=${type}`)
  }, [])

  const getFarmWeather = useCallback(async (customFarmId = null) => {
    const activeFarmId = customFarmId || farm?._id || farm?.id || selectedFarmId
    if (!activeFarmId) return null
    return await apiRequest(`/farms/${activeFarmId}/weather`)
  }, [farm, selectedFarmId])

  const analyzePlantImage = useCallback(async (zoneId, imageBase64, mimeType) => {
    return await apiRequest(`/zones/${zoneId}/predictions/pest`, {
      method: "POST",
      body: JSON.stringify({ imageBase64, mimeType }),
    })
  }, [])

  const getFarmAlerts = useCallback(async () => {
    const activeFarmId = farm?._id || farm?.id || selectedFarmId
    if (!activeFarmId) return { alerts: [] }
    return await apiRequest(`/farms/${activeFarmId}/alerts`)
  }, [farm, selectedFarmId])

  const getIrrigationAdvisory = useCallback(async (customFarmId = null) => {
    const activeFarmId = customFarmId || farm?._id || farm?.id || selectedFarmId
    if (!activeFarmId) return { zones: [] }
    return await apiRequest(`/farms/${activeFarmId}/irrigation-advisory`)
  }, [farm, selectedFarmId])

  const runIrrigationPrediction = useCallback(async (zoneId) => {
    if (!zoneId) throw new Error("Zone ID is required")
    return await apiRequest(`/zones/${zoneId}/predictions/irrigation`, {
      method: "POST",
    })
  }, [])

  const getYieldEstimate = useCallback(async (customFarmId = null) => {
    const activeFarmId = customFarmId || farm?._id || farm?.id || selectedFarmId
    if (!activeFarmId) return { zones: [] }
    return await apiRequest(`/farms/${activeFarmId}/yield-estimate`)
  }, [farm, selectedFarmId])

  const runYieldPrediction = useCallback(async (zoneId) => {
    if (!zoneId) throw new Error("Zone ID is required")
    return await apiRequest(`/zones/${zoneId}/predictions/yield`, {
      method: "POST",
    })
  }, [])

  return (
    <FarmContext.Provider
      value={{
        farm: normalizedFarm,
        rawFarm: farm,
        farms,
        zones: normalizedZones,
        rawZones: zones,
        hasFarm: normalizedFarm.exists,
        isLoading,
        error,
        autoMode,
        dismissed,
        reloadFarm: loadFarmData,
        selectFarm,
        saveFarm,
        createZone,
        updateZone,
        toggleZone,
        updateFarm,
        addSoilReading,
        getSoilReadings,
        requestCropRecommendation,
        getZonePredictions,
        getFarmWeather,
        analyzePlantImage,
        getFarmAlerts,
        getIrrigationAdvisory,
        runIrrigationPrediction,
        getYieldEstimate,
        runYieldPrediction,
        toggleAuto: () => setAutoMode((v) => !v),
        dismiss,
        dismissAll,
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
