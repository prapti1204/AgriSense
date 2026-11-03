import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import Landing from "../pages/Landing"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"
import { useAuth } from "../context/AuthContext"

function ProtectedDashboard() {
  const { isLoggedIn, isLoading } = useAuth()
  if (isLoading) return <div role="status" style={{ padding: 32 }}>Checking your session…</div>
  return isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard/*" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
