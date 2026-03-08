import { useVitals } from "../../hooks/useVitals"

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function VitalPill({ label, value, unit, critical, abnormal }) {
  const bg = critical ? "#fef2f2" : abnormal ? "#fffbeb" : "#f8fafc"
  const color = critical ? "#b91c1c" : abnormal ? "#92400e" : "#374151"
  const border = critical ? "#fecaca" : abnormal ? "#fde68a" : "#e2e8f0"
  if (value === null || value === undefined) return null
  return (
    <span style={{ backgroundColor: bg, color, border: `1px solid ${border}`, borderRadius: "6px", padding: "2px 7px", fontSize: "12px", fontWeight: 600 }}>
      {label} {value}{unit}
    </span>
  )
}

export default function VitalsHistory({ patientId }) {
  const { vitals } = useVitals(patientId)

  if (vitals.length === 0) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No vitals recorded yet.</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {vitals.map((v) => (
        <div
          key={v.id}
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: v.critical ? "1.5px solid #fca5a5" : "1px solid #e2e8f0",
            padding: "12px 14px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>
              {formatTime(v.recordedAt)}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {v.critical && (
                <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: "20px", padding: "1px 8px", textTransform: "uppercase" }}>
                  Critical
                </span>
          )}
              {v.manualEntry
                ? <span style={{ fontSize: "10px", color: "#94a3b8" }}>Manual</span>
                : <span style={{ fontSize: "10px", color: "#16a34a" }}>Scanned</span>
              }
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {v.systolic !== null && v.diastolic !== null && (
              <VitalPill label="BP" value={`${v.systolic}/${v.diastolic}`} unit="" critical={v.systolic > 180} abnormal={v.systolic > 120 || v.diastolic > 80} />
            )}
            <VitalPill label="Pulse" value={v.pulse} unit=" bpm" critical={v.pulse > 130} abnormal={v.pulse < 60 || v.pulse > 100} />
            <VitalPill label="Temp" value={v.temperature} unit="°F" critical={v.temperature > 102} abnormal={v.temperature < 97 || v.temperature > 99} />
            <VitalPill label="RR" value={v.respiratoryRate} unit="/min" abnormal={v.respiratoryRate < 12 || v.respiratoryRate > 20} />
            <VitalPill label="SpO2" value={v.spo2} unit="%" critical={v.spo2 < 90} abnormal={v.spo2 >= 90 && v.spo2 < 95} />
            {v.map !== null && <VitalPill label="MAP" value={v.map} unit=" mmHg" />}
          </div>
        </div>
      ))}
    </div>
  )
}
