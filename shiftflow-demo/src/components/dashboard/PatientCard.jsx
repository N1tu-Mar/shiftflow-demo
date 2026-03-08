import { useNavigate } from "react-router-dom"
import { showToast } from "../../services/toastBus"

const FALL_RISK_STYLES = {
  HIGH: { backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" },
  MEDIUM: { backgroundColor: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
  LOW: { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
}

export default function PatientCard({ patient, reportCount = 0, onOpenReport }) {
  const navigate = useNavigate()
  const riskStyle = FALL_RISK_STYLES[patient.fallRisk] || FALL_RISK_STYLES.LOW

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "16px",
        marginBottom: "12px",
        border: "1px solid #f3f4f6",
      }}
    >
      <button
        onClick={() => navigate(`/patients/${patient.id}`)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#1e3a5f",
              letterSpacing: "-0.5px",
            }}
          >
            Room {patient.room}
          </span>
          <span
            style={{
              ...riskStyle,
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "20px",
              letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            {patient.fallRisk} Fall Risk
          </span>
        </div>

        <p style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "600", color: "#111827" }}>
          {patient.name}
        </p>
        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#6b7280" }}>
          Age {patient.age}
        </p>
      </button>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onOpenReport(patient)}
          style={{
            flex: 1,
            height: "42px",
            backgroundColor: "#f8fafc",
            border: "1.5px solid #bfdbfe",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#2563eb",
            cursor: "pointer",
          }}
        >
          Report {reportCount > 0 ? `(${reportCount})` : ""}
        </button>

        <button
          onClick={() => showToast("Vitals workflow will be added next")}
          style={{
            flex: 1,
            height: "42px",
            backgroundColor: "#f8fafc",
            border: "1.5px solid #ccfbf1",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#0d9488",
            cursor: "pointer",
          }}
        >
          Vitals
        </button>
      </div>
    </div>
  )
}
