import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "32px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", backgroundColor: "#dbeafe", borderRadius: "12px", marginBottom: "16px" }}>
          <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#111827" }}>ShiftFlow Dashboard</h1>
        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#6b7280" }}>CNA / RN View</p>
        <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#9ca3af" }}>Patient workflow features coming next.</p>
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
