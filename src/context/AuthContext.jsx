import { createContext, useContext, useState } from "react"
import { readStored, writeStored } from "../data/browserStorage"
const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {},
  updateProfile: () => {},
  logout: () => {},
})
function avatar(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored("demo-user", null))
  const save = (value) => {
    setUser(value)
    writeStored("demo-user", value)
  }
  const login = (email, _password, name = "Marcus Chen") =>
    save({ name, email, farm: "Greenfield Estate", avatar: avatar(name) })
  const updateProfile = (name, email) =>
    save({
      name,
      email,
      farm: user?.farm || "Greenfield Estate",
      avatar: avatar(name),
    })
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        updateProfile,
        logout: () => save(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
