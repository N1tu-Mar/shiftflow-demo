import { useMemo, useState } from "react"

export function useReports() {
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem("shiftflowReports")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  function addReport(report) {
    setReports((prev) => {
      const next = [report, ...prev]
      localStorage.setItem("shiftflowReports", JSON.stringify(next))
      return next
    })
  }

  const getReportsForPatient = useMemo(
    () => (patientId) => reports.filter((r) => String(r.patientId) === String(patientId)),
    [reports]
  )

  return { reports, addReport, getReportsForPatient }
}
