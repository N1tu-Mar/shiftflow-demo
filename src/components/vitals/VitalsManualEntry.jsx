import { useState } from "react"
import { validateField, calcMAP } from "../../utils/vitalsValidation"

const FIELDS = [
  { key: "systolic", label: "Systolic BP", placeholder: "e.g. 120", unit: "mmHg" },
  { key: "diastolic", label: "Diastolic BP", placeholder: "e.g. 80", unit: "mmHg" },
  { key: "pulse", label: "Pulse", placeholder: "e.g. 72", unit: "bpm" },
  { key: "temperature", label: "Temperature", placeholder: "e.g. 98.6", unit: "°F" },
  { key: "respiratoryRate", label: "Respiratory Rate", placeholder: "e.g. 16", unit: "/min" },
  { key: "spo2", label: "SpO2", placeholder: "e.g. 98", unit: "%" },
]

export default function VitalsManualEntry({ onContinue, onBack }) {
  const [values, setValues] = useState({
    systolic: "", diastolic: "", pulse: "", temperature: "", respiratoryRate: "", spo2: "",
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  function handleChange(key, raw) {
    setValues((v) => ({ ...v, [key]: raw }))
    setTouched((t) => ({ ...t, [key]: true }))
    const err = validateField(key, raw)
    setErrors((e) => ({ ...e, [key]: err }))
  }

  function handleContinue() {
    // Validate all filled fields
    const newErrors = {}
    let hasAny = false
    let hasError = false
    for (const { key } of FIELDS) {
      const val = values[key]
      if (val !== "") {
        hasAny = true
        const err = validateField(key, val)
        if (err) { newErrors[key] = err; hasError = true }
      }
    }
    setErrors(newErrors)
    setTouched(Object.fromEntries(FIELDS.map(({ key }) => [key, true])))
    if (!hasAny) return // nothing entered
    if (hasError) return
    const map = calcMAP(values.systolic, values.diastolic)
    onContinue({ ...values, map, ocrConfidence: null, manualEntry: true })
  }

  const map = calcMAP(values.systolic, values.diastolic)
  const hasAny = FIELDS.some(({ key }) => values[key] !== "")

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "grid", gap: "12px" }}>
      {FIELDS.map(({ key, label, placeholder, unit }) => (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              {label}
            </label>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{unit}</span>
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={values[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "10px",
              border: `1.5px solid ${errors[key] && touched[key] ? "#fca5a5" : "#cbd5e1"}`,
              padding: "0 12px",
              fontSize: "16px",
              color: "#0f172a",
              backgroundColor: "#fff",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {errors[key] && touched[key] && (
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#ef4444" }}>{errors[key]}</p>
          )}
        </div>
      ))}

      {/* Calculated MAP */}
      {map !== null && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>Calculated MAP</span>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#166534" }}>{map} mmHg</span>
        </div>
      )}

      {/* Footer buttons */}
      <div style={{ display: "flex", gap: "8px", paddingBottom: "8px" }}>
        <button
          onClick={onBack}
          style={{ flex: 1, height: "46px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasAny}
          style={{
            flex: 2,
            height: "46px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: hasAny ? "#2563eb" : "#e2e8f0",
            color: hasAny ? "#fff" : "#94a3b8",
            fontSize: "14px",
            fontWeight: 700,
            cursor: hasAny ? "pointer" : "default",
          }}
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}
