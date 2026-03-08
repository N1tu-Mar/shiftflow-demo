import { useNavigate } from "react-router-dom"

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "32px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", backgroundColor: "#ede9fe", borderRadius: "12px", marginBottom: "16px" }}>
          <svg width="24" height="24" fill="none" stroke="#7c3aed" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#111827" }}>ShiftFlow Analytics</h1>
        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#6b7280" }}>Administrator View</p>
        <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#9ca3af" }}>Analytics dashboard features coming next.</p>
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
