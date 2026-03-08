function getStatus(task, now) {
  if (task.completed) return "completed"
  const due = new Date(task.scheduledTime)
  const diffMs = due - now
  if (diffMs < 0) return "overdue"
  if (diffMs < 10 * 60000) return "due-soon" // within 10 min
  return "upcoming"
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatCountdown(task, now) {
  const due = new Date(task.scheduledTime)
  const diffMs = due - now
  if (diffMs <= 0) {
    const overdueMs = now - due
    const m = Math.floor(overdueMs / 60000)
    const h = Math.floor(m / 60)
    if (h > 0) return `${h}h ${m % 60}m overdue`
    return `${m}m overdue`
  }
  const m = Math.floor(diffMs / 60000)
  const h = Math.floor(m / 60)
  if (h > 0) return `Due in ${h}h ${m % 60}m`
  if (m === 0) return "Due now"
  return `Due in ${m}m`
}

const STATUS_STYLES = {
  overdue:   { bg: "#fef2f2", border: "#fca5a5", badge: { bg: "#fee2e2", color: "#b91c1c", text: "OVERDUE" } },
  "due-soon":{ bg: "#fffbeb", border: "#fcd34d", badge: { bg: "#fef3c7", color: "#92400e", text: "DUE SOON" } },
  upcoming:  { bg: "#fff",    border: "#e2e8f0", badge: { bg: "#eff6ff", color: "#1d4ed8", text: "UPCOMING" } },
  completed: { bg: "#f0fdf4", border: "#bbf7d0", badge: { bg: "#dcfce7", color: "#166534", text: "DONE" } },
}

export default function TaskCard({ task, now, onComplete }) {
  const status = getStatus(task, now)
  const styles = STATUS_STYLES[status]

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        border: `1.5px solid ${styles.border}`,
        borderRadius: "14px",
        padding: "14px",
        marginBottom: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          {/* Time */}
          <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
            {formatTime(task.scheduledTime)}
          </p>

          {/* Title */}
          <p style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.2px" }}>
            {task.title}
          </p>

          {/* Patient */}
          {task.patientRoom && (
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#64748b" }}>
              Room {task.patientRoom}{task.patientName ? ` — ${task.patientName}` : ""}
            </p>
          )}

          {/* Description */}
          {task.description && (
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#374151" }}>
              {task.description}
            </p>
          )}

          {/* Countdown / completed info */}
          {!task.completed && (
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: status === "overdue" ? "#b91c1c" : status === "due-soon" ? "#92400e" : "#64748b", fontWeight: 600 }}>
              {formatCountdown(task, now)}
            </p>
          )}
          {task.completed && task.completedAt && (
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#166534" }}>
              Completed at {formatTime(task.completedAt)}
            </p>
          )}
        </div>

        {/* Status badge */}
        <span style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.4px", backgroundColor: styles.badge.bg, color: styles.badge.color, whiteSpace: "nowrap", flexShrink: 0 }}>
          {styles.badge.text}
        </span>
      </div>

      {/* Complete button */}
      {!task.completed && (
        <button
          onClick={() => onComplete(task.id)}
          style={{
            marginTop: "10px",
            width: "100%",
            height: "44px",
            borderRadius: "10px",
            border: "1.5px solid " + (status === "overdue" ? "#fca5a5" : status === "due-soon" ? "#fcd34d" : "#bfdbfe"),
            backgroundColor: status === "overdue" ? "#fff" : status === "due-soon" ? "#fff" : "#fff",
            color: status === "overdue" ? "#b91c1c" : status === "due-soon" ? "#92400e" : "#1d4ed8",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Mark Complete
        </button>
      )}
    </div>
  )
}
