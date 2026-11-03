import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiRequest } from "../data/api"

const AuthContext = createContext({
  isLoggedIn: false,
  isLoading: true,
  user: null,
  login: async () => {},
  signup: async () => {},
  updateProfile: async () => {},
  logout: async () => {},
})

function withAvatar(user) {
  if (!user) return null
  const avatar = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
  return { ...user, avatar }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiRequest("/auth/me")
      .then(({ user: account }) => {
        if (active) setUser(withAvatar(account))
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    user,
    isLoading,
    isLoggedIn: !!user,
    login: async (email, password) => {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      setUser(withAvatar(result.user))
      return result.user
    },
    signup: async (name, email, password) => {
      const result = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      })
      setUser(withAvatar(result.user))
      return result.user
    },
    updateProfile: async (name, email) => {
      const result = await apiRequest("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      })
      setUser(withAvatar(result.user))
      return result.user
    },
    logout: async () => {
      try {
        await apiRequest("/auth/logout", { method: "POST" })
      } finally {
        setUser(null)
      }
    },
  }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
