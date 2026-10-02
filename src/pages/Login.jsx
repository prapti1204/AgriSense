import { useFeedback } from "../context/FeedbackContext"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { Sprout, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
export default function Login() {
  const navigate = useNavigate()
  const { notify, showDetail } = useFeedback()
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { isDark } = useTheme()
  const [email, setEmail] = useState("marcus@greenfield.farm")
  const [password, setPassword] = useState("••••••••")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const surface = isDark ? "#1A2A1A" : "#FFFFFF"
  const border = isDark ? "#2A3D2A" : "#E2EBE0"
  const bg = isDark ? "#0F1A0F" : "#F8FAF7"
  const text = isDark ? "#E8F5E8" : "#1A2E1A"
  const muted = isDark ? "#7AAA7A" : "#5A7A5A"
  const inputBg = isDark ? "#223022" : "#F8FAF7"
  const handleLogin = async () => {
    if (loading) return
    setError("")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Password must have at least 8 characters.")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    login(email, password)
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
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <img
          src="/assets/login-field.jpg"
          alt="Smart farming fields at sunrise"
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
              "linear-gradient(160deg, rgba(14,40,14,0.85) 0%, rgba(46,125,50,0.5) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: 40,
            flex: 1,
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
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                marginBottom: 20,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#66BB6A",
                }}
              />
              <span style={{ fontSize: 12, color: "white", fontWeight: 500 }}>
                12,400+ active farmers
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              Grow smarter,
              <br />
              harvest more.
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 340,
              }}
            >
              Join thousands of farmers who use AI-powered insights to optimize
              every stage of their crops.
            </p>

            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "Yield Increase", value: "34%" },
                { label: "Water Saved", value: "40%" },
                { label: "AI Accuracy", value: "94%" },
                { label: "Farms Monitored", value: "12K+" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#66BB6A",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </div>
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

          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
                color: text,
              }}
            >
              Welcome back
            </h1>
            <p style={{ color: muted, fontSize: 14 }}>
              Sign in to your AgriSense dashboard
            </p>
          </div>

          {/* Social login */}
          <div
            data-grid="1fr1fr"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {["Google", "Apple"].map((provider) => (
              <button
                key={provider}
                onClick={() => {
                  login(provider.toLowerCase() + "@demo.invalid", "demo-only")
                  notify(
                    provider +
                      " demo sign-in complete. No external authentication used.",
                  )
                  navigate("/dashboard")
                }}
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  background: inputBg,
                  border: `1px solid ${border}`,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  color: text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>
                  {provider === "Google" ? "G" : ""}
                </span>
                {provider}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ flex: 1, height: 1, background: border }} />
            <span style={{ fontSize: 12, color: muted }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: border }} />
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void handleLogin()
            }}
            style={{ display: "contents" }}
          >
            {/* Form */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <label style={{ fontSize: 13, fontWeight: 600, color: text }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      showDetail(
                        "Demo password help",
                        "This is a frontend demonstration. Sign in with any valid email and a password of at least eight characters. No account or reset email is created.",
                      )
                    }
                    style={{
                      fontSize: 12,
                      color: "#43A047",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
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
                    autoComplete="current-password"
                    type={showPass ? "text" : "password"}
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
                transition: "background 0.2s",
                marginBottom: 20,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
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

          <p style={{ textAlign: "center", fontSize: 14, color: muted }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              style={{
                color: "#2E7D32",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
