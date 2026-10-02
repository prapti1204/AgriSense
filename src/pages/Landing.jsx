import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import {
  Sprout,
  CloudRain,
  Bug,
  BarChart3,
  Droplets,
  Zap,
  Sun,
  ArrowRight,
  Star,
  Moon,
} from "lucide-react"
import { useState } from "react"
const features = [
  {
    icon: Sprout,
    title: "AI Crop Recommendation",
    desc: "Get precision crop suggestions based on soil data, weather patterns, and market prices.",
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
  {
    icon: Droplets,
    title: "Smart Irrigation",
    desc: "Automated watering schedules that save up to 40% water while maximizing yield.",
    color: "#1565C0",
    bg: "#E3F2FD",
  },
  {
    icon: Bug,
    title: "Pest Detection",
    desc: "AI-powered image analysis identifies diseases and pests before they spread.",
    color: "#E53935",
    bg: "#FFEBEE",
  },
  {
    icon: CloudRain,
    title: "Weather Forecast",
    desc: "Hyperlocal 7-day forecasts with rain probability and microclimate data.",
    color: "#64B5F6",
    bg: "#E3F2FD",
  },
  {
    icon: BarChart3,
    title: "Yield Prediction",
    desc: "Machine learning models predict harvest volumes with 92%+ accuracy.",
    color: "#F9A825",
    bg: "#FFF8E1",
  },
  {
    icon: Zap,
    title: "Real-time Insights",
    desc: "IoT sensors deliver live soil moisture, temperature, and NPK readings.",
    color: "#7B1FA2",
    bg: "#F3E5F5",
  },
]
const stats = [
  { label: "Farms Monitored", value: "12,400+" },
  { label: "Yield Increase", value: "34%" },
  { label: "Water Saved", value: "40%" },
  { label: "AI Accuracy", value: "94%" },
]
const testimonials = [
  {
    name: "Arjun Patel",
    role: "Farmer, Maharashtra",
    text: "AgriSense transformed how I manage my 50-acre farm. The yield prediction alone saved me from a bad planting decision last season.",
    rating: 5,
  },
  {
    name: "Sunita Devi",
    role: "Agricultural Cooperative, Punjab",
    text: "The pest detection feature caught a fungal outbreak 8 days early. We saved over ₹3 lakh worth of wheat crop.",
    rating: 5,
  },
  {
    name: "James Mwangi",
    role: "Farm Manager, Kenya",
    text: "Smart irrigation cut our water bill by 38% in the first season. The ROI was immediate and undeniable.",
    rating: 5,
  },
]
export default function Landing() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const bg = isDark ? "#0F1A0F" : "#F8FAF7"
  const surface = isDark ? "#1A2A1A" : "#FFFFFF"
  const border = isDark ? "#2A3D2A" : "#E2EBE0"
  const text = isDark ? "#E8F5E8" : "#1A2E1A"
  const muted = isDark ? "#7AAA7A" : "#5A7A5A"
  return (
    <div
      style={{
        background: bg,
        color: text,
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: isDark ? "rgba(15,26,15,0.85)" : "rgba(248,250,247,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg,#2E7D32,#66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sprout size={18} color="white" />
            </div>
            <span
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#2E7D32",
              }}
            >
              AgriSense
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              aria-label={isDark ? "Use light theme" : "Use dark theme"}
              onClick={toggleTheme}
              style={{
                padding: "8px",
                borderRadius: 8,
                background: "transparent",
                border: `1px solid ${border}`,
                color: muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "transparent",
                border: `1px solid ${border}`,
                color: text,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#2E7D32",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          paddingTop: 120,
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(102,187,106,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(100,181,246,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            data-grid="1fr1fr"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 64,
              alignItems: "center",
            }}
          >
            {/* Left content */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 100,
                  background: isDark ? "#1A3D1A" : "#E8F5E9",
                  border: `1px solid ${isDark ? "#2A5D2A" : "#C8E6C9"}`,
                  marginBottom: 24,
                }}
              >
                <Zap size={12} color="#66BB6A" fill="#66BB6A" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#43A047",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  AI-Powered Agriculture Platform
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: 20,
                  letterSpacing: -1,
                }}
              >
                AI-Powered Smart Farming for{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Better Harvests
                </span>
              </h1>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: muted,
                  marginBottom: 32,
                  maxWidth: 480,
                }}
              >
                Monitor weather, analyze soil health, detect pests, and receive
                AI-powered crop recommendations — all in one platform built for
                modern farmers.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 40,
                }}
              >
                <button
                  onClick={() => navigate("/signup")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    borderRadius: 12,
                    background: "#2E7D32",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(46,125,50,0.35)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  Get Started <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    borderRadius: 12,
                    background: "transparent",
                    color: text,
                    border: `1.5px solid ${border}`,
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Live Dashboard
                </button>
              </div>
            </div>

            {/* Right hero illustration */}
            <div style={{ position: "relative" }}>
              <div
                className="float-anim"
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 24px 64px rgba(46,125,50,0.2)",
                  border: `1px solid ${border}`,
                }}
              >
                <img
                  src="/assets/hero-field.jpg"
                  alt="Smart farming with IoT sensors in green fields"
                  style={{ width: "100%", display: "block" }}
                />
                {/* Overlay card */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    right: 20,
                    background: isDark
                      ? "rgba(26,42,26,0.9)"
                      : "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 16,
                    padding: 16,
                    border: `1px solid ${border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Crop Health Score
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#43A047",
                        fontWeight: 600,
                        background: "#E8F5E9",
                        padding: "2px 8px",
                        borderRadius: 100,
                      }}
                    >
                      ↑ 12% this week
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[
                      { label: "Soil pH", value: "6.8", color: "#43A047" },
                      { label: "Moisture", value: "63%", color: "#64B5F6" },
                      { label: "N-P-K", value: "72-58-84", color: "#F9A825" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        style={{ flex: 1, textAlign: "center" }}
                      >
                        <div
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontWeight: 600,
                            fontSize: 16,
                            color: m.color,
                          }}
                        >
                          {m.value}
                        </div>
                        <div
                          style={{ fontSize: 10, color: muted, marginTop: 2 }}
                        >
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: -16,
                  background: "#E8F5E9",
                  border: "1.5px solid #C8E6C9",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(46,125,50,0.15)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#43A047",
                  }}
                />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#2E7D32" }}
                >
                  AI Scanning Active
                </span>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "40%",
                  left: -24,
                  background: isDark ? "#1A2A1A" : "white",
                  border: `1px solid ${border}`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ fontSize: 11, color: muted }}>
                  Rain Probability
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#64B5F6",
                  }}
                >
                  85%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          padding: "40px 24px",
          background: isDark ? "#1A2A1A" : "#FFFFFF",
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          data-grid="repeat(4,1fr)"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#2E7D32",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: muted, marginTop: 6 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 36,
                fontWeight: 800,
                marginBottom: 12,
                letterSpacing: -0.5,
              }}
            >
              Everything your farm needs
            </h2>
            <p
              style={{
                color: muted,
                fontSize: 16,
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              From soil to harvest — AI-driven insights at every stage of the
              farming cycle.
            </p>
          </div>

          <div
            data-grid="repeat(3,1fr)"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="card-hover"
                  style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: 20,
                    padding: 28,
                    cursor: "default",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: f.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={22} color={f.color} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      marginBottom: 8,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Farm Image Section */}
      <section style={{ padding: "0 24px 80px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src="/assets/farm-panorama.jpg"
            alt="Aerial view of smart farm with sensors and irrigation systems"
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(14,40,14,0.8) 0%, rgba(14,40,14,0.2) 100%)",
            }}
          />
          <div
            className="landing-farm-overlay"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              padding: 64,
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "white",
                  maxWidth: 460,
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                Monitor every inch of your farm in real time
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 16,
                  maxWidth: 380,
                  marginBottom: 28,
                  lineHeight: 1.7,
                }}
              >
                IoT sensors, drone imagery, and AI analysis give you complete
                visibility over soil, crops, and weather — from anywhere.
              </p>
              <button
                onClick={() => navigate("/signup")}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  background: "#66BB6A",
                  color: "#0F2810",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        style={{
          padding: "0 24px 80px",
          background: isDark ? "#1A2A1A" : "#FFFFFF",
          paddingTop: 64,
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 32,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Trusted by farmers worldwide
            </h2>
            <p style={{ color: muted, fontSize: 15 }}>
              Real results from real agricultural professionals
            </p>
          </div>
          <div
            data-grid="repeat(3,1fr)"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  background: isDark ? "#223022" : "#F8FAF7",
                  border: `1px solid ${border}`,
                  borderRadius: 20,
                  padding: 28,
                }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} color="#F9A825" fill="#F9A825" />
                  ))}
                </div>
                <p
                  style={{
                    color: isDark ? "#C8E6C9" : "#2E4A2E",
                    fontSize: 14,
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  "{t.text}"
                </p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: muted }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 36,
              fontWeight: 800,
              color: "white",
              marginBottom: 16,
            }}
          >
            Ready to grow smarter?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 16,
              marginBottom: 32,
              lineHeight: 1.7,
            }}
          >
            Join 12,400+ farmers already using AgriSense to maximize yield,
            reduce waste, and farm sustainably.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                background: "#66BB6A",
                color: "#0F2810",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                background: "transparent",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 24px",
          borderTop: `1px solid ${border}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "linear-gradient(135deg,#2E7D32,#66BB6A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sprout size={13} color="white" />
          </div>
          <span
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#2E7D32",
            }}
          >
            AgriSense
          </span>
        </div>
        <p style={{ fontSize: 13, color: muted }}>
          © 2024 AgriSense Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
