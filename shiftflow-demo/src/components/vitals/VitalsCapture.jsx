import { useCallback, useState } from "react"
import VitalsScanner from "./VitalsScanner"
import VitalsManualEntry from "./VitalsManualEntry"
import VitalsReview from "./VitalsReview"
import VitalsHistory from "./VitalsHistory"
import { useVitals } from "../../hooks/useVitals"
import { showToast } from "../../services/toastBus"

// step: "select" | "scan" | "manual" | "review" | "history"

export default function VitalsCapture({ patient, user, onClose, addTask }) {
  const [step, setStep] = useState("select")
  const [pendingVitals, setPendingVitals] = useState(null)
  const { addVitals } = useVitals(patient.id)

  const handleScanComplete = useCallback((result) => {
    setPendingVitals(result)
    setStep("review")
  }, [])

  function handleManualContinue(result) {
    setPendingVitals(result)
    setStep("review")
  }

  function handleConfirm(finalVitals) {
    const record = addVitals({
      ...finalVitals,
      patientId: patient.id,
      recordedBy: user?.name || "Staff",
    })

    // Auto-create follow-up task if critical
    if (finalVitals.critical && addTask) {
      const scheduledTime = new Date(Date.now() + 30 * 60000).toISOString()
      addTask({
        title: "Repeat Vitals (Critical)",
        description: `Critical vitals detected for ${patient.name}. Recheck in 30 min.`,
        patientRoom: patient.room,
        patientName: patient.name,
        scheduledTime,
      })
      showToast(`Critical vitals saved. Follow-up task created for 30 min.`)
    } else {
      showToast(`Vitals recorded for ${patient.name}`)
    }

    onClose()
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "92vh",
          backgroundColor: "#f8fafc",
          borderRadius: "18px 18px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -8px 32px rgba(2,6,23,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
              {step === "history" ? "Vitals History" : "Capture Vitals"}
            </h3>
            <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#64748b" }}>
              Room {patient.room} — {patient.name}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {step !== "history" && (
              <button
                onClick={() => setStep("history")}
                style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: "4px 6px" }}
              >
                History
              </button>
            )}
            {step === "history" && (
              <button
                onClick={() => setStep("select")}
                style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", background: "none", border: "none", cursor: "pointer", padding: "4px 6px" }}
              >
                Capture
              </button>
            )}
            <button
              onClick={onClose}
              style={{ width: "30px", height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff", color: "#64748b", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Step: Select method */}
          {step === "select" && (
            <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#64748b", textAlign: "center" }}>
                How would you like to capture vitals?
              </p>
              <button
                onClick={() => setStep("scan")}
                style={{
                  height: "72px",
                  borderRadius: "14px",
                  border: "1.5px solid #bfdbfe",
                  backgroundColor: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "24px" }}>📷</span>
                Scan Monitor
              </button>
              <button
                onClick={() => setStep("manual")}
                style={{
                  height: "72px",
                  borderRadius: "14px",
                  border: "1.5px solid #d1fae5",
                  backgroundColor: "#f0fdf4",
                  color: "#065f46",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "24px" }}>⌨️</span>
                Manual Entry
              </button>
            </div>
          )}

          {/* Step: Scan */}
          {step === "scan" && (
            <VitalsScanner
              patient={patient}
              onComplete={handleScanComplete}
              onBack={() => setStep("select")}
            />
          )}

          {/* Step: Manual */}
          {step === "manual" && (
            <VitalsManualEntry
              onContinue={handleManualContinue}
              onBack={() => setStep("select")}
            />
          )}

          {/* Step: Review */}
          {step === "review" && pendingVitals && (
            <VitalsReview
              vitals={pendingVitals}
              onConfirm={handleConfirm}
              onBack={() => setStep(pendingVitals.manualEntry ? "manual" : "scan")}
            />
          )}

          {/* Step: History */}
          {step === "history" && (
            <div style={{ padding: "16px" }}>
              <VitalsHistory patientId={patient.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
