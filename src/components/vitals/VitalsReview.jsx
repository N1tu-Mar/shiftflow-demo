import { useState } from "react"
import { getAbnormalFields, getCriticalFields, calcMAP } from "../../utils/vitalsValidation"
import VitalsAlertBanner from "./VitalsAlertBanner"

function fmt(val, unit) {
  if (val === "" || val === null || val === undefined) return "—"
  return `${val}${unit}`
}

function formatTime(iso) {
  return new Date(iso || Date.now()).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

const ROWS = [
  { key: "systolic", label: "Systolic BP", unit: " mmHg", paired: "diastolic", pairedUnit: " mmHg" },
  { key: "pulse", label: "Pulse", unit: " bpm" },
  { key: "temperature", label: "Temperature", unit: "°F" },
  { key: "respiratoryRate", label: "Respiratory Rate", unit: "/min" },
  { key: "spo2", label: "SpO2", unit: "%" },
]

export default function VitalsReview({ vitals, onConfirm, onBack }) {
  const [alertState, setAlertState] = useState("pending") // pending | override | accepted

  const abnormals = getAbnormalFields(vitals)
  const criticals = getCriticalFields(vitals)
  const map = vitals.map ?? calcMAP(vitals.systolic, vitals.diastolic)
  const hasAlerts = abnormals.length > 0 || criticals.length > 0
  const needsAck = hasAlerts && alertState === "pending"

  function handleConfirm() {
    if (needsAck) return
    onConfirm({ ...vitals, map, critical: criticals.length > 0 })
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Alert banner */}
      {hasAlerts && alertState === "pending" && (
        <VitalsAlertBanner
          abnormals={abnormals}
          criticals={criticals}
          onConfirmAnyway={() => setAlertState("override")}
          onReenter={onBack}
        />
      )}

      {/* Override confirmation */}
      {hasAlerts && alertState === "override" && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 14px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#166534", fontWeight: 600 }}>
            Values acknowledged. You may now confirm.
          </p>
        </div>
      )}

      {/* Vitals table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {ROWS.map(({ key, label, unit, paired, pairedUnit }, i) => {
          const val = vitals[key]
          const paired2 = paired ? vitals[paired] : null
          const displayVal =
            paired && (val !== "" && val !== null && val !== undefined) && (paired2 !== "" && paired2 !== null && paired2 !== undefined)
              ? `${val}/${paired2}${pairedUnit}`
              : val !== "" && val !== null && val !== undefined
              ? `${val}${unit}`
              : "—"

          if (key === "diastolic") return null // rendered with systolic

          const isAbnormal = abnormals.some((a) => a.field === key || a.field === paired)
          const isCritical = criticals.some((c) => c.field === key || c.field === paired)

          return (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 16px",
                borderBottom: i < ROWS.length - 1 ? "1px solid #f1f5f9" : "none",
                backgroundColor: isCritical ? "#fef2f2" : isAbnormal ? "#fffbeb" : "transparent",
              }}
            >
              <span style={{ fontSize: "14px", color: "#64748b" }}>{label}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: isCritical ? "#b91c1c" : isAbnormal ? "#92400e" : "#0f172a" }}>
                {displayVal}
              </span>
            </div>
          )
        })}

        {/* MAP */}
        {map !== null && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderTop: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>MAP</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{map} mmHg</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {vitals.ocrConfidence && (
          <span style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600, color: "#166534" }}>
            OCR Confidence: {Math.round(vitals.ocrConfidence * 100)}%
          </span>
        )}
        {vitals.manualEntry && (
          <span style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600, color: "#1d4ed8" }}>
            Manual Entry
          </span>
        )}
        <span style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", color: "#64748b" }}>
          {formatTime(new Date().toISOString())}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", paddingBottom: "8px" }}>
        <button
          onClick={onBack}
          style={{ flex: 1, height: "48px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={needsAck}
          style={{
            flex: 2,
            height: "48px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: needsAck ? "#e2e8f0" : "#22c55e",
            color: needsAck ? "#94a3b8" : "#fff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: needsAck ? "default" : "pointer",
          }}
        >
          ✓ Confirm Vitals
        </button>
      </div>
    </div>
  )
}
