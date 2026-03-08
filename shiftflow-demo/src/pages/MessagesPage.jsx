import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { demoPatients } from "../data/patients"
import { useMessages } from "../hooks/useMessages"
import Conversation from "../components/messaging/Conversation"
import BottomNav from "../components/dashboard/BottomNav"

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function MessagesPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const { allMessages, getUnreadCount, getLastMessage, markRead } = useMessages()

  useEffect(() => {
    const stored = localStorage.getItem("shiftflowUser")
    if (!stored) { navigate("/login", { replace: true }); return }
    setUser(JSON.parse(stored))
  }, [navigate])

  if (!user) return null

  if (selectedPatient) {
    return (
      <Conversation
        patient={selectedPatient}
        user={user}
        onBack={() => setSelectedPatient(null)}
      />
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", paddingBottom: "80px" }}>

      {/* Header */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <div style={{ width: "28px", height: "28px", backgroundColor: "#2563eb", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: "800", fontSize: "11px" }}>SF</span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#111827", letterSpacing: "-0.3px" }}>ShiftFlow</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              {user.name} &nbsp;·&nbsp; {user.role} &nbsp;·&nbsp; Day Shift
            </p>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "2px 8px", fontSize: "10px", fontWeight: "600", color: "#166534" }}>
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Encrypted
          </span>
        </div>
      </header>

      {/* Page title */}
      <div style={{ padding: "16px 16px 0" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: "18px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px" }}>
          Messages
        </h2>

        {/* Patient thread list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {demoPatients.map((patient) => {
            const last = getLastMessage(patient.id)
            const unread = getUnreadCount(patient.id, user.id)

            return (
              <button
                key={patient.id}
                onClick={() => {
                  markRead(patient.id, user.id)
                  setSelectedPatient(patient)
                }}
                style={{
                  width: "100%",
                  background: "#fff",
                  border: unread > 0 ? "1.5px solid #bfdbfe" : "1px solid #f3f4f6",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Room + name */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "#1e3a5f" }}>
                        Room {patient.room}
                      </span>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                        {patient.name}
                      </span>
                    </div>

                    {/* Last message preview */}
                    {last ? (
                      <p style={{ margin: 0, fontSize: "13px", color: unread > 0 ? "#0f172a" : "#6b7280", fontWeight: unread > 0 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {last.senderName.split(" ")[0]} ({last.senderRole}): {last.text}
                      </p>
                    ) : (
                      <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>
                        No messages yet
                      </p>
                    )}
                  </div>

                  {/* Right column: time + unread badge */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                    {last && (
                      <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {timeAgo(last.createdAt)}
                      </span>
                    )}
                    {unread > 0 && (
                      <span style={{ backgroundColor: "#2563eb", color: "#fff", borderRadius: "20px", fontSize: "11px", fontWeight: 700, padding: "2px 8px", minWidth: "20px", textAlign: "center" }}>
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
