import { useFeedback } from "../context/FeedbackContext"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import {
  Sprout,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
export default function Signup() {
  const navigate = useNavigate()
  const { notify, showDetail } = useFeedback()
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { isDark } = useTheme()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const surface = isDark ? "#1A2A1A" : "#FFFFFF"
  const border = isDark ? "#2A3D2A" : "#E2EBE0"
  const bg = isDark ? "#0F1A0F" : "#F8FAF7"
  const text = isDark ? "#E8F5E8" : "#1A2E1A"
  const muted = isDark ? "#7AAA7A" : "#5A7A5A"
  const inputBg = isDark ? "#223022" : "#F8FAF7"
  const handleSignup = async () => {
    if (loading) return
    setError("")
    if (name.trim().length < 2) {
      setError("Please enter your full name.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must have at least 8 characters.")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    login(email.trim(), password, name.trim())
    navigate("/dashboard")
  }
  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: bg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left panel */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src="/assets/signup-field.jpg"
          alt="Farmer with tablet in a smart farm field"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(27,94,32,0.88) 0%, rgba(66,160,71,0.5) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: 40,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sprout size={20} color="white" />
            </div>
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "white",
              }}
            >
              AgriSense
            </span>
          </div>

          <div>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 30,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Start growing smarter
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 28,
                maxWidth: 360,
              }}
            >
              Create your account to access crop recommendations, weather
              monitoring, and soil analysis.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "AI-powered crop recommendations",
                "Real-time soil & weather monitoring",
                "Smart irrigation scheduling",
                "Pest detection with image AI",
                "Yield prediction & forecasting",
              ].map((benefit) => (
                <div
                  key={benefit}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <CheckCircle2 size={16} color="#66BB6A" />
                  <span
                    style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 64px",
          background: surface,
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: muted,
              background: "none",
              border: "none",
              cursor: "pointer",
              marginBottom: 32,
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Back to home
          </button>

          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
                color: text,
              }}
            >
              Create your account
            </h1>
            <p style={{ color: muted, fontSize: 14 }}>
              Join 12,400+ farmers on AgriSense
            </p>
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void handleSignup()
            }}
            style={{ display: "contents" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: text,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Full name
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    color={muted}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    id="name"
                    aria-label="Full name"
                    autoComplete="name"
                    type="text"
                    placeholder="Marcus Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 38px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: text,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: text,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color={muted}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    id="email"
                    aria-label="Email address"
                    autoComplete="email"
                    type="email"
                    placeholder="you@yourfarm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 12px 11px 38px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: text,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: text,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color={muted}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    id="password"
                    aria-label="Password"
                    autoComplete="new-password"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 40px 11px 38px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: text,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    aria-label={showPass ? "Hide password" : "Show password"}
                    onClick={() => setShowPass((s) => !s)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: muted,
                      display: "flex",
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 11,
                background: loading ? "#81C784" : "#2E7D32",
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                marginBottom: 16,
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            {error && (
              <p
                role="alert"
                style={{ color: "#E53935", fontSize: 13, marginBottom: 16 }}
              >
                {error}
              </p>
            )}
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: muted,
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            By signing up, you agree to our{" "}
            <button
              type="button"
              onClick={() =>
                showDetail(
                  "Demo terms",
                  "AgriSense is a frontend demonstration with mock data. This form creates only a demo profile in your browser.",
                )
              }
              style={{
                color: "#2E7D32",
                cursor: "pointer",
                border: 0,
                background: "none",
                padding: 0,
              }}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() =>
                showDetail(
                  "Demo privacy",
                  "Your profile and farm preferences stay in this browser. Passwords and plant images are not stored or transmitted.",
                )
              }
              style={{
                color: "#2E7D32",
                cursor: "pointer",
                border: 0,
                background: "none",
                padding: 0,
              }}
            >
              Privacy Policy
            </button>
          </p>

          <p style={{ textAlign: "center", fontSize: 14, color: muted }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                color: "#2E7D32",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
