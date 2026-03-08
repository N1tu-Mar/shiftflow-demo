import { useEffect } from "react"
import { alarm } from "../../utils/alarmSound"

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function TaskReminderModal({ task, onComplete, onSnooze }) {
  useEffect(() => {
    alarm.start()
    return () => alarm.stop()
  }, [task?.id])

  if (!task) return null

  function handleComplete() {
    alarm.stop()
    onComplete(task.id)
  }

  function handleSnooze() {
    alarm.stop()
    onSnooze(task.id)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        backgroundColor: "rgba(7,10,23,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Pulsing ring */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 0 0 16px rgba(239,68,68,0.2), 0 0 0 32px rgba(239,68,68,0.1)",
          animation: "pulse 1s ease-in-out infinite",
        }}
      >
        <svg width="36" height="36" fill="none" stroke="#fff" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "#ef4444", letterSpacing: "2px", textTransform: "uppercase" }}>
        TASK REMINDER
      </p>

      <h2 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: "-0.5px" }}>
        {task.title}
      </h2>

      {task.patientRoom && (
        <p style={{ margin: "0 0 4px", fontSize: "16px", color: "#94a3b8", textAlign: "center" }}>
          Room {task.patientRoom}{task.patientName ? ` — ${task.patientName}` : ""}
        </p>
      )}

      <p style={{ margin: "0 0 32px", fontSize: "14px", color: "#64748b", textAlign: "center" }}>
        Scheduled for {formatTime(task.scheduledTime)}
      </p>

      {task.description ? (
        <p style={{ margin: "-20px 0 32px", fontSize: "14px", color: "#94a3b8", textAlign: "center", maxWidth: "300px" }}>
          {task.description}
        </p>
      ) : null}

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "320px" }}>
        <button
          onClick={handleComplete}
          style={{
            height: "54px",
            borderRadius: "14px",
            border: "none",
            backgroundColor: "#22c55e",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
          }}
        >
          ✓ Mark Complete
        </button>

        <button
          onClick={handleSnooze}
          style={{
            height: "54px",
            borderRadius: "14px",
            border: "1.5px solid #334155",
            backgroundColor: "transparent",
            color: "#94a3b8",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Snooze 5 min
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(239,68,68,0.3), 0 0 0 20px rgba(239,68,68,0.1); }
          50%       { box-shadow: 0 0 0 16px rgba(239,68,68,0.2), 0 0 0 32px rgba(239,68,68,0.05); }
        }
      `}</style>
    </div>
  )
}
