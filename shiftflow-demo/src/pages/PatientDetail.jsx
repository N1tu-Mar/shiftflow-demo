import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ReportList from "../components/reports/ReportList"
import ReportModal from "../components/reports/ReportModal"
import { demoPatients } from "../data/patients"
import { showToast } from "../services/toastBus"

const FALL_RISK_COLORS = {
  HIGH: { backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
  MEDIUM: { backgroundColor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
  LOW: { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
}

export default function PatientDetail({ reports, addReport }) {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const patient = demoPatients.find((entry) => String(entry.id) === String(patientId))
  const patientReports = useMemo(
    () => reports.filter((report) => String(report.patientId) === String(patientId)),
    [reports, patientId]
  )
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("shiftflowUser") || "{}")
    } catch {
      return {}
    }
  }, [])

  if (!patient) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280", marginBottom: "10px" }}>Patient not found</p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const riskStyle = FALL_RISK_COLORS[patient.fallRisk] || FALL_RISK_COLORS.LOW

  function handleSaveReport(report) {
    addReport(report)
    setShowModal(false)
    showToast("Report saved successfully")
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "16px" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            border: "none",
            background: "none",
            color: "#2563eb",
            fontWeight: "600",
            marginBottom: "10px",
            padding: 0,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#1e3a5f" }}>Room {patient.room}</h1>
            <span
              style={{
                ...riskStyle,
                fontSize: "11px",
                fontWeight: "700",
                padding: "4px 10px",
                borderRadius: "20px",
                textTransform: "uppercase",
              }}
            >
              {patient.fallRisk} Fall Risk
            </span>
          </div>
          <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#111827" }}>{patient.name}</p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Age {patient.age}</p>

          <button
            onClick={() => setShowModal(true)}
            style={{
              marginTop: "12px",
              width: "100%",
              height: "42px",
              borderRadius: "10px",
              border: "1px solid #bfdbfe",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Add Report
          </button>
        </div>

        <ReportList reports={patientReports} />
      </div>

      <ReportModal
        isOpen={showModal}
        patient={patient}
        currentUserName={currentUser?.name || "Shift Staff"}
        patientReports={patientReports}
        onClose={() => setShowModal(false)}
        onSave={handleSaveReport}
      />
    </div>
  )
}
