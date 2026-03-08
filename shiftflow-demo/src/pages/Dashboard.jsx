import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import PatientCard from "../components/dashboard/PatientCard"
import BottomNav from "../components/dashboard/BottomNav"
import ReportModal from "../components/reports/ReportModal"
import { demoPatients } from "../data/patients"
import { showToast } from "../services/toastBus"

const ROLE_LABELS = {
  CNA: "CNA",
  RN: "RN",
  CHARGE_NURSE: "Charge Nurse",
  ADMIN: "Administrator",
}

export default function Dashboard({ reports, addReport }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [reportPatient, setReportPatient] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem("shiftflowUser")
    if (!stored) {
      navigate("/login", { replace: true })
      return
    }
    setUser(JSON.parse(stored))
  }, [navigate])

  const reportCounts = useMemo(() => {
    const counts = {}
    for (const report of reports) {
      const key = String(report.patientId)
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [reports])

  function handleLogout() {
    localStorage.removeItem("shiftflowUser")
    navigate("/login", { replace: true })
  }

  function handleSaveReport(report) {
    addReport(report)
    setReportPatient(null)
    showToast("Report saved successfully")
  }

  if (!user) return null

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", paddingBottom: "80px" }}>
      <header
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 16px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#2563eb",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: "800", fontSize: "11px" }}>SF</span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#111827", letterSpacing: "-0.3px" }}>
                ShiftFlow
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              {user.name} &nbsp;·&nbsp; {ROLE_LABELS[user.role] || user.role} &nbsp;·&nbsp; Day Shift
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "20px",
                padding: "2px 8px",
                fontSize: "10px",
                fontWeight: "600",
                color: "#166534",
              }}
            >
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Encrypted
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                color: "#9ca3af",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: "16px 16px 0" }}>
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: "15px",
            fontWeight: "700",
            color: "#374151",
            letterSpacing: "-0.2px",
          }}
        >
          My Patients ({demoPatients.length})
        </h2>

        {demoPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            reportCount={reportCounts[String(patient.id)] || 0}
            onOpenReport={setReportPatient}
          />
        ))}
      </main>

      <ReportModal
        isOpen={Boolean(reportPatient)}
        patient={reportPatient}
        currentUserName={user.name}
        patientReports={reportPatient ? reports.filter((r) => String(r.patientId) === String(reportPatient.id)) : []}
        onClose={() => setReportPatient(null)}
        onSave={handleSaveReport}
      />

      <BottomNav />
    </div>
  )
}
