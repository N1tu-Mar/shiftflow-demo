export default function VitalsAlertBanner({ abnormals, criticals, onConfirmAnyway, onReenter }) {
  if (criticals.length > 0) {
    return (
      <div style={{ backgroundColor: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "18px" }}>🚨</span>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Critical Vital{criticals.length > 1 ? "s" : ""} Detected
          </span>
        </div>
        {criticals.map((c) => (
          <p key={c.field} style={{ margin: "0 0 4px", fontSize: "14px", color: "#991b1b", fontWeight: 600 }}>
            {c.label}: {c.value}{c.unit}
          </p>
        ))}
        <p style={{ margin: "8px 0 12px", fontSize: "13px", color: "#b91c1c" }}>
          Notify RN immediately.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onConfirmAnyway}
            style={{ flex: 1, height: "40px", borderRadius: "10px", border: "1.5px solid #fca5a5", backgroundColor: "#fff", color: "#b91c1c", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Confirm Anyway
          </button>
          <button
            onClick={onReenter}
            style={{ flex: 1, height: "40px", borderRadius: "10px", border: "none", backgroundColor: "#ef4444", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Re-enter
          </button>
        </div>
      </div>
    )
  }

  if (abnormals.length > 0) {
    return (
      <div style={{ backgroundColor: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "16px" }}>⚠️</span>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Abnormal Value{abnormals.length > 1 ? "s" : ""}
          </span>
        </div>
        {abnormals.map((a) => (
          <p key={a.field} style={{ margin: "0 0 2px", fontSize: "13px", color: "#92400e" }}>
            {a.label}: <strong>{a.value}{a.unit}</strong> (normal: {a.normalRange})
          </p>
        ))}
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button
            onClick={onConfirmAnyway}
            style={{ flex: 1, height: "40px", borderRadius: "10px", border: "1.5px solid #fde68a", backgroundColor: "#fff", color: "#92400e", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Confirm Anyway
          </button>
          <button
            onClick={onReenter}
            style={{ flex: 1, height: "40px", borderRadius: "10px", border: "none", backgroundColor: "#f59e0b", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Re-enter
          </button>
        </div>
      </div>
    )
  }

  return null
}
