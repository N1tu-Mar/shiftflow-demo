import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Login.css"

const demoUsers = [
  {
    id: "user_sarah",
    email: "sarah.johnson@pennmedicine.upenn.edu",
    password: "Demo2024!",
    role: "CNA",
    name: "Sarah Johnson",
  },
  {
    id: "user_michael",
    email: "michael.chen@pennmedicine.upenn.edu",
    password: "Demo2024!",
    role: "RN",
    name: "Michael Chen",
  },
  {
    id: "user_jessica",
    email: "jessica.martinez@pennmedicine.upenn.edu",
    password: "Demo2024!",
    role: "CHARGE_NURSE",
    name: "Jessica Martinez",
  },
  {
    id: "user_david",
    email: "david.thompson@pennmedicine.upenn.edu",
    password: "Demo2024!",
    role: "ADMIN",
    name: "David Thompson",
  },
]


function navigateByRole(role, navigate) {
  if (role === "CNA" || role === "RN") {
    navigate("/dashboard")
  } else if (role === "CHARGE_NURSE") {
    navigate("/charge-dashboard")
  } else if (role === "ADMIN") {
    navigate("/admin-dashboard")
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    const match = demoUsers.find(
      (u) =>
        u.email.toLowerCase() === trimmedEmail &&
        u.password === trimmedPassword
    )

    if (match) {
      setError("")
      localStorage.setItem("shiftflowUser", JSON.stringify(match))
      navigateByRole(match.role, navigate)
    } else {
      setError("Invalid email or password")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* ── Branding ── */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              backgroundColor: "#2563eb",
              borderRadius: "14px",
              marginBottom: "12px",
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: "800",
                fontSize: "18px",
                letterSpacing: "-0.5px",
              }}
            >
              SF
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: "700",
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            ShiftFlow
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Hospital Workflow Platform
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              placeholder="your.email@pennmedicine.upenn.edu"
              required
              autoComplete="email"
              style={{
                display: "block",
                width: "100%",
                height: "46px",
                padding: "0 14px",
                fontSize: "14px",
                border: "1.5px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
                color: "#111827",
                backgroundColor: "#fff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                style={{
                  display: "block",
                  width: "100%",
                  height: "46px",
                  padding: "0 60px 0 14px",
                  fontSize: "14px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#111827",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#2563eb",
                  padding: "4px 6px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#b91c1c",
                fontWeight: "500",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "48px",
              backgroundColor: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              letterSpacing: "0.2px",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

{/* ── Disclaimer ── */}
        <p
          style={{
            marginTop: "16px",
            fontSize: "11px",
            color: "#9ca3af",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          Demo Environment — Not HIPAA Compliant.
          <br />
          Do not enter real patient information.
        </p>
      </div>
    </div>
  )
}
