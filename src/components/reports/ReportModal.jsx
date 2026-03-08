import { useMemo, useState } from "react"
import { organizeReport } from "../../services/reportAI"
import { showToast } from "../../services/toastBus"
import ReportHistoryPanel from "./ReportHistoryPanel"

// Categories that warrant a warning style (amber/red)
const SAFETY_CATEGORIES = new Set(["risks", "care_precautions", "restraints", "behavior"])

const CATEGORY_LABELS = {
  diseases:        "Diseases / Diagnoses",
  devices:         "Devices",
  behavior:        "Behavior",
  mobility:        "Mobility",
  risks:           "Safety Risks",
  care_precautions: "Care Precautions",
  restraints:      "Restraints",
}

function SignalsPanel({ signals }) {
  const entries = Object.entries(CATEGORY_LABELS).filter(
    ([key]) => signals[key]?.length > 0
  )

  if (entries.length === 0) {
    return (
      <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#64748b" }}>
        No clinical signals detected. Add more detail to the report and try again.
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", backgroundColor: "#1e3a5f", display: "flex", alignItems: "center", gap: "6px" }}>
        <svg width="12" height="12" fill="#93c5fd" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#bfdbfe", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          AI Clinical Signals
        </span>
      </div>

      <div style={{ padding: "10px 12px", display: "grid", gap: "8px" }}>
        {entries.map(([key, label]) => {
          const items = signals[key]
          const isSafety = SAFETY_CATEGORIES.has(key)
          return (
            <div key={key}>
              <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {label}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {items.map((item) => (
                  <span
                    key={item}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      padding: "3px 8px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: isSafety ? "#fef2f2" : "#eff6ff",
                      color: isSafety ? "#b91c1c" : "#1d4ed8",
                      border: isSafety ? "1px solid #fecaca" : "1px solid #bfdbfe",
                    }}
                  >
                    {isSafety ? "⚠" : "✓"} {item}
                  </span>
                ))}
              </div>
            </div>
          )
        })}

        {signals.notes && (
          <div style={{ paddingTop: "6px", borderTop: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Summary
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#374151", lineHeight: 1.4 }}>{signals.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReportModal({ isOpen, patient, currentUserName, patientReports = [], onClose, onSave }) {
  const [noteText, setNoteText] = useState("")
  const [signals, setSignals] = useState(null)
  const [organizing, setOrganizing] = useState(false)
  const [saving, setSaving] = useState(false)

  const patientTitle = useMemo(() => {
    if (!patient) return ""
    return `Room ${patient.room} — ${patient.name}`
  }, [patient])

  if (!isOpen || !patient) return null

  async function handleOrganize() {
    if (!noteText.trim()) {
      showToast("Enter report text first")
      return
    }
    setOrganizing(true)
    setSignals(null)
    try {
      const result = await organizeReport(noteText.trim())
      setSignals(result)
    } catch {
      showToast("Unable to organize report right now")
    } finally {
      setOrganizing(false)
    }
  }

  function handleSave() {
    if (!noteText.trim()) {
      showToast("Report text is required")
      return
    }
    setSaving(true)
    onSave({
      id: `rep_${Date.now()}`,
      patientId: String(patient.id),
      noteType: "General",
      noteText: noteText.trim(),
      signals: signals ?? null,
      createdBy: currentUserName || "Shift Staff",
      createdAt: new Date().toISOString(),
    })
    setSaving(false)
    setNoteText("")
    setSignals(null)
  }

  function handleClose() {
    setNoteText("")
    setSignals(null)
    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        backgroundColor: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "92vh",
          backgroundColor: "#fff",
          borderRadius: "18px 18px 0 0",
          border: "1px solid #e2e8f0",
          boxShadow: "0 -8px 32px rgba(2,6,23,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Add Patient Report</h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b" }}>{patientTitle}</p>
          </div>
          <button
            onClick={handleClose}
            style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#64748b", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "grid", gap: "14px" }}>

          {/* Report history */}
          <ReportHistoryPanel reports={patientReports} />

          {/* Note text */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Report
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              placeholder="Type patient report here...&#10;&#10;Example:&#10;Patient confused overnight.&#10;Attempted to get out of bed twice.&#10;Fall precautions reinforced. RN notified."
              style={{ width: "100%", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "10px 12px", fontSize: "14px", lineHeight: 1.5, color: "#0f172a", resize: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Organize with AI button */}
          <button
            type="button"
            onClick={handleOrganize}
            disabled={organizing}
            style={{
              width: "100%",
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #c7d2fe",
              backgroundColor: organizing ? "#e0e7ff" : "#eef2ff",
              color: "#4338ca",
              fontSize: "14px",
              fontWeight: 700,
              cursor: organizing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {organizing ? (
              <>
                <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #a5b4fc", borderTopColor: "#4338ca", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Analyzing...
              </>
            ) : (
              <>✨ Organize with AI</>
            )}
          </button>

          {/* AI Signals panel — only shown after organize */}
          {signals && <SignalsPanel signals={signals} />}

        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleClose}
            style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#334155", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, height: "42px", borderRadius: "10px", border: "1px solid #2563eb", backgroundColor: "#2563eb", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>

      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
