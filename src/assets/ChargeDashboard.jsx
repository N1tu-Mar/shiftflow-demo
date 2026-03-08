import { useNavigate } from "react-router-dom"

export default function ChargeDashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "32px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", backgroundColor: "#ccfbf1", borderRadius: "12px", marginBottom: "16px" }}>
          <svg width="24" height="24" fill="none" stroke="#0d9488" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#111827" }}>ShiftFlow Dashboard</h1>
        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#6b7280" }}>Charge Nurse View</p>
        <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#9ca3af" }}>Unit overview features coming next.</p>
        <button
          onClick={() => navigate("/login")}
          style={{ width: "100%", height: "44px", backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: "pointer" }}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
