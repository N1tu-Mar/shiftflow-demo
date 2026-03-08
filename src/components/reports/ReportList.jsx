const SAFETY_KEYS = ["risks", "care_precautions", "restraints", "behavior"]

const CATEGORY_LABELS = {
  diseases:         "Diagnoses",
  devices:          "Devices",
  behavior:         "Behavior",
  mobility:         "Mobility",
  risks:            "Safety Risks",
  care_precautions: "Precautions",
  restraints:       "Restraints",
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}

function SignalsBadges({ signals }) {
  const entries = Object.entries(CATEGORY_LABELS).filter(
    ([key]) => signals[key]?.length > 0
  )
  if (entries.length === 0) return null

  return (
    <div style={{ marginTop: "10px", display: "grid", gap: "6px" }}>
      {entries.map(([key, label]) => {
        const isSafety = SAFETY_KEYS.includes(key)
        return (
          <div key={key}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              {label}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "3px" }}>
              {signals[key].map((item) => (
                <span
                  key={item}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor: isSafety ? "#fef2f2" : "#f0f9ff",
                    color: isSafety ? "#b91c1c" : "#0369a1",
                    border: isSafety ? "1px solid #fecaca" : "1px solid #bae6fd",
                  }}
                >
                  {isSafety ? "⚠" : "✓"} {item}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ReportList({ reports }) {
  return (
    <section style={{ marginTop: "14px" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>
        Patient Reports
        {reports.length > 0 && (
          <span style={{ marginLeft: "6px", fontSize: "13px", fontWeight: 500, color: "#64748b" }}>
            ({reports.length})
          </span>
        )}
      </h3>

      {reports.length === 0 ? (
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#64748b" }}>
          No reports yet for this patient.
        </div>
      ) : (
        reports.map((report) => (
          <article
            key={report.id}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 1px 6px rgba(2,6,23,0.06)",
              padding: "14px",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>{report.createdBy}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{report.noteType}</p>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                {formatDate(report.createdAt)}
              </p>
            </div>

            <p style={{ margin: 0, fontSize: "14px", color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {report.noteText}
            </p>

            {report.signals && <SignalsBadges signals={report.signals} />}
          </article>
        ))
      )}
    </section>
  )
}
