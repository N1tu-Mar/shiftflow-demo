import { useState } from "react"

const STORAGE_KEY = "shiftflowVitals"

function loadVitals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveVitals(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useVitals(patientId) {
  const [allVitals, setAllVitals] = useState(loadVitals)

  const vitals = patientId
    ? allVitals
        .filter((v) => String(v.patientId) === String(patientId))
        .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
        .slice(0, 10)
    : allVitals

  function addVitals(record) {
    const entry = {
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      patientId: record.patientId,
      recordedBy: record.recordedBy,
      systolic: record.systolic !== "" ? Number(record.systolic) : null,
      diastolic: record.diastolic !== "" ? Number(record.diastolic) : null,
      pulse: record.pulse !== "" ? Number(record.pulse) : null,
      temperature: record.temperature !== "" ? Number(record.temperature) : null,
      respiratoryRate: record.respiratoryRate !== "" ? Number(record.respiratoryRate) : null,
      spo2: record.spo2 !== "" ? Number(record.spo2) : null,
      map: record.map ?? null,
      ocrConfidence: record.ocrConfidence ?? null,
      manualEntry: record.manualEntry ?? true,
      recordedAt: new Date().toISOString(),
    }
    setAllVitals((prev) => {
      const next = [entry, ...prev]
      saveVitals(next)
      return next
    })
    return entry
  }

  function getRecentCritical(patientId, windowMs = 6 * 60 * 60 * 1000) {
    const cutoff = Date.now() - windowMs
    return allVitals.filter(
      (v) =>
        String(v.patientId) === String(patientId) &&
        new Date(v.recordedAt).getTime() > cutoff &&
        v.critical === true
    )
  }

  return { vitals, addVitals, getRecentCritical, allVitals }
}
