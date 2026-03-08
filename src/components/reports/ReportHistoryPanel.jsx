import { useState } from "react"

function getShift(isoString) {
  const hour = new Date(isoString).getHours()
  if (hour >= 7 && hour < 15) return "Day Shift"
  if (hour >= 15 && hour < 23) return "Evening Shift"
  return "Night Shift"
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}

export default function ReportHistoryPanel({ reports = [] }) {
  const [open, setOpen] = useState(false)

  const count = reports.length

  return (
    <div>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Previous Reports
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          height: "44px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          backgroundColor: open ? "#f1f5f9" : "#f8fafc",
          color: "#334155",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          boxSizing: "border-box",
        }}
      >
        <span>
          {count === 0
            ? "No previous reports"
            : `View Report History (${count})`}
        </span>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          style={{
            marginTop: "8px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            backgroundColor: "#fff",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {count === 0 ? (
            <p style={{ margin: 0, padding: "14px 14px", fontSize: "13px", color: "#94a3b8", textAlign: "center" }}>
              No prior reports for this patient.
            </p>
          ) : (
            reports.map((report, i) => (
              <div
                key={report.id}
                style={{
                  padding: "12px 14px",
                  borderBottom: i < reports.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e3a5f" }}>
                      {getShift(report.createdAt)}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {" — "}{report.createdBy}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {formatTime(report.createdAt)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                  {report.noteText}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
