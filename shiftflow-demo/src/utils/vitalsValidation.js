// Normal clinical ranges (for warning banners)
export const NORMAL_RANGES = {
  systolic: { min: 90, max: 120, label: "Systolic BP", unit: "mmHg" },
  diastolic: { min: 60, max: 80, label: "Diastolic BP", unit: "mmHg" },
  pulse: { min: 60, max: 100, label: "Pulse", unit: "bpm" },
  temperature: { min: 97.0, max: 99.0, label: "Temperature", unit: "°F" },
  respiratoryRate: { min: 12, max: 20, label: "Respiratory Rate", unit: "/min" },
  spo2: { min: 95, max: 100, label: "SpO2", unit: "%" },
}

// Allowed input ranges (hard validation limits)
export const INPUT_RANGES = {
  systolic: { min: 60, max: 250 },
  diastolic: { min: 40, max: 150 },
  pulse: { min: 30, max: 200 },
  temperature: { min: 95.0, max: 105.0 },
  respiratoryRate: { min: 8, max: 60 },
  spo2: { min: 70, max: 100 },
}

// Critical thresholds — trigger immediate alert
export const CRITICAL_THRESHOLDS = {
  spo2: { max: 90, label: "SpO2", unit: "%" },
  pulse: { max: 130, label: "Pulse", unit: "bpm" },
  temperature: { max: 102.0, label: "Temperature", unit: "°F" },
  systolic: { max: 180, label: "Systolic BP", unit: "mmHg" },
}

/**
 * Returns array of fields that are outside NORMAL_RANGES.
 * Only checks fields that have a value.
 */
export function getAbnormalFields(vitals) {
  const warnings = []
  const fields = ["systolic", "diastolic", "pulse", "temperature", "respiratoryRate", "spo2"]
  for (const field of fields) {
    const val = parseFloat(vitals[field])
    if (isNaN(val)) continue
    const range = NORMAL_RANGES[field]
    if (val < range.min || val > range.max) {
      warnings.push({
        field,
        label: range.label,
        value: val,
        unit: range.unit,
        normalRange: `${range.min}–${range.max}`,
      })
    }
  }
  return warnings
}

/**
 * Returns array of critically abnormal fields.
 */
export function getCriticalFields(vitals) {
  const criticals = []
  for (const [field, threshold] of Object.entries(CRITICAL_THRESHOLDS)) {
    const val = parseFloat(vitals[field])
    if (isNaN(val)) continue
    if (val > threshold.max || (field === "spo2" && val < threshold.max)) {
      criticals.push({
        field,
        label: threshold.label,
        value: val,
        unit: threshold.unit,
        threshold: threshold.max,
      })
    }
  }
  return criticals
}

/**
 * Validates an individual field value against input ranges.
 * Returns error string or null.
 */
export function validateField(field, rawValue) {
  if (rawValue === "" || rawValue === undefined) return null
  const val = parseFloat(rawValue)
  if (isNaN(val)) return "Must be a number"
  const range = INPUT_RANGES[field]
  if (!range) return null
  if (val < range.min || val > range.max) return `Must be ${range.min}–${range.max}`
  return null
}

/**
 * Calculates MAP from systolic and diastolic.
 */
export function calcMAP(systolic, diastolic) {
  const s = parseFloat(systolic)
  const d = parseFloat(diastolic)
  if (isNaN(s) || isNaN(d)) return null
  return Math.round((s + 2 * d) / 3)
}
