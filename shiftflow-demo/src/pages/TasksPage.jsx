import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import TaskCard from "../components/tasks/TaskCard"
import AddTaskModal from "../components/tasks/AddTaskModal"
import BottomNav from "../components/dashboard/BottomNav"

const ROLE_LABELS = {
  CNA: "CNA",
  RN: "RN",
  CHARGE_NURSE: "Charge Nurse",
  ADMIN: "Administrator",
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

export default function TasksPage({ tasks, addTask, completeTask }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [now, setNow] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)

  // Auth check
  useEffect(() => {
    const stored = localStorage.getItem("shiftflowUser")
    if (!stored) { navigate("/login", { replace: true }); return }
    setUser(JSON.parse(stored))
  }, [navigate])

  // Live clock — drives countdown labels
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!user) return null

  // Split tasks
  const pending = tasks.filter((t) => !t.completed).sort(
    (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
  )
  const completed = tasks.filter((t) => t.completed).sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  )

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
              {user.name} &nbsp;·&nbsp; {ROLE_LABELS[user.role] || user.role} &nbsp;·&nbsp; Day Shift
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
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px" }}>Tasks</h2>
          <span style={{ fontSize: "13px", color: "#64748b" }}>{formatDate(now)}</span>
        </div>

        {/* Summary bar */}
        {pending.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", marginTop: "8px" }}>
            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
              {pending.filter(t => new Date(t.scheduledTime) <= now).length} overdue
            </span>
            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
              {pending.length} pending
            </span>
          </div>
        )}

        {/* Pending tasks */}
        {pending.length === 0 ? (
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", textAlign: "center", marginBottom: "12px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>No pending tasks. Tap + to add one.</p>
          </div>
        ) : (
          pending.map((task) => (
            <TaskCard key={task.id} task={task} now={now} onComplete={completeTask} />
          ))
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <>
            <h3 style={{ margin: "16px 0 10px", fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Completed ({completed.length})
            </h3>
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} now={now} onComplete={completeTask} />
            ))}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "16px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#2563eb",
          border: "none",
          color: "#fff",
          fontSize: "28px",
          fontWeight: 400,
          lineHeight: 1,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(37,99,235,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 60,
        }}
        aria-label="Add task"
      >
        +
      </button>

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSave={(data) => { addTask(data); setShowAddModal(false) }}
        />
      )}

      <BottomNav />
    </div>
  )
}
