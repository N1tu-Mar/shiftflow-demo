import { useEffect, useState } from "react"
import { simulateVitalsOCR } from "../../utils/vitalsScanner"

export default function VitalsScanner({ patient, onComplete, onBack }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const duration = 2200

    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(tick)
        setDone(true)
        setTimeout(() => {
          const result = simulateVitalsOCR(patient.age)
          onComplete(result)
        }, 300)
      }
    }, 40)

    return () => clearInterval(tick)
  }, [patient.age, onComplete])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Camera preview area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "24px",
        }}
      >
        {/* Corner guides */}
        <div style={{ position: "relative", width: "260px", height: "180px" }}>
          {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => (
            <div
              key={pos}
              style={{
                position: "absolute",
                width: "24px",
                height: "24px",
                borderColor: done ? "#22c55e" : "#2563eb",
                borderStyle: "solid",
                borderWidth: 0,
                ...(pos === "topLeft" && { top: 0, left: 0, borderTopWidth: "3px", borderLeftWidth: "3px" }),
                ...(pos === "topRight" && { top: 0, right: 0, borderTopWidth: "3px", borderRightWidth: "3px" }),
                ...(pos === "bottomLeft" && { bottom: 0, left: 0, borderBottomWidth: "3px", borderLeftWidth: "3px" }),
                ...(pos === "bottomRight" && { bottom: 0, right: 0, borderBottomWidth: "3px", borderRightWidth: "3px" }),
              }}
            />
          ))}

          {/* Simulated monitor reading display */}
          <div
            style={{
              position: "absolute",
              inset: "12px",
              backgroundColor: "#111827",
              borderRadius: "6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "1px solid #1e293b",
            }}
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <span style={{ color: "#22c55e", fontSize: "22px", fontWeight: 800, fontFamily: "monospace" }}>128/82</span>
              <span style={{ color: "#ef4444", fontSize: "22px", fontWeight: 800, fontFamily: "monospace" }}>76</span>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <span style={{ color: "#60a5fa", fontSize: "16px", fontFamily: "monospace" }}>98.6°F</span>
              <span style={{ color: "#a78bfa", fontSize: "16px", fontFamily: "monospace" }}>SpO2 98%</span>
            </div>
            {/* Scanning line */}
            {!done && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "2px",
                  backgroundColor: "rgba(37,99,235,0.7)",
                  top: `${(progress / 100) * 100}%`,
                  transition: "top 0.04s linear",
                  boxShadow: "0 0 8px rgba(37,99,235,0.8)",
                }}
              />
            )}
          </div>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "20px", textAlign: "center" }}>
          {done ? "Extraction complete" : "Position the monitor or vitals sheet inside the frame"}
        </p>
      </div>

      {/* Progress area */}
      <div style={{ padding: "20px 16px", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
            {done ? "Vitals extracted" : "Extracting vitals..."}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: done ? "#16a34a" : "#2563eb" }}>
            {progress}%
          </span>
        </div>
        <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: done ? "#22c55e" : "#2563eb",
              borderRadius: "4px",
              transition: "width 0.04s linear, background-color 0.3s",
            }}
          />
        </div>
        <button
          onClick={onBack}
          disabled={done}
          style={{
            marginTop: "14px",
            width: "100%",
            height: "42px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#fff",
            color: "#374151",
            fontSize: "14px",
            fontWeight: 600,
            cursor: done ? "default" : "pointer",
            opacity: done ? 0.4 : 1,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
