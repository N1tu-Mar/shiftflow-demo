import { useState } from "react"
import { demoPatients } from "../../data/patients"
import { showToast } from "../../services/toastBus"

const QUICK_TEMPLATES = [
  "Q2 Turn",
  "Vitals Check",
  "Glucose Check",
  "Foley Output",
  "Lab Follow-up",
  "Medication",
]

function todayAt(timeString) {
  // timeString = "HH:MM" from <input type="time">
  const [h, m] = timeString.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function defaultTime() {
  // Default to current time + 30 min, rounded to nearest 5 min
  const d = new Date(Date.now() + 30 * 60000)
  const m = Math.round(d.getMinutes() / 5) * 5
  d.setMinutes(m, 0, 0)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(Math.min(m, 59)).padStart(2, "0")
  return `${hh}:${mm}`
}

export default function AddTaskModal({ onClose, onSave }) {
  const [title, setTitle] = useState("")
  const [patientId, setPatientId] = useState("")
  const [timeValue, setTimeValue] = useState(defaultTime)
  const [notes, setNotes] = useState("")

  const selectedPatient = demoPatients.find((p) => String(p.id) === patientId) || null

  function handleSave() {
    if (!title.trim()) {
      showToast("Task title is required")
      return
    }
    if (!timeValue) {
      showToast("Scheduled time is required")
      return
    }
    onSave({
      title: title.trim(),
      description: notes.trim(),
      patientRoom: selectedPatient?.room ?? null,
      patientName: selectedPatient?.name ?? null,
      scheduledTime: todayAt(timeValue),
    })
    onClose()
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ width: "100%", maxWidth: "480px", maxHeight: "92vh", backgroundColor: "#fff", borderRadius: "18px 18px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -8px 32px rgba(2,6,23,0.2)" }}
      >
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Add Task</h3>
          <button onClick={onClose} style={{ width: "30px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff", color: "#64748b", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "grid", gap: "14px" }}>

          {/* Quick templates */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Quick Templates
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: `1.5px solid ${title === t ? "#2563eb" : "#e2e8f0"}`,
                    backgroundColor: title === t ? "#eff6ff" : "#f8fafc",
                    color: title === t ? "#1d4ed8" : "#374151",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Glucose check, Q2 turn..."
              style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "0 12px", fontSize: "14px", color: "#0f172a", backgroundColor: "#fff", boxSizing: "border-box" }}
            />
          </div>

          {/* Patient */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Patient (optional)
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "0 12px", fontSize: "14px", color: "#0f172a", backgroundColor: "#fff", boxSizing: "border-box" }}
            >
              <option value="">No specific patient</option>
              {demoPatients.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  Room {p.room} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Scheduled Time *
            </label>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "0 12px", fontSize: "14px", color: "#0f172a", backgroundColor: "#fff", boxSizing: "border-box" }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              style={{ width: "100%", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "14px", color: "#0f172a", resize: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", gap: "8px", flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#334155", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ flex: 1, height: "44px", borderRadius: "10px", border: "none", backgroundColor: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            Save Task
          </button>
        </div>
      </div>
    </div>
  )
}
