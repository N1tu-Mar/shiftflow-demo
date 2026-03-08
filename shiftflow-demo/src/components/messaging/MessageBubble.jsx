const ROLE_BADGE = {
  CNA: { backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" },
  RN: { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  CHARGE_NURSE: { backgroundColor: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
  ADMIN: { backgroundColor: "#fdf4ff", color: "#7e22ce", border: "1px solid #e9d5ff" },
}

const ROLE_LABELS = {
  CNA: "CNA",
  RN: "RN",
  CHARGE_NURSE: "Charge",
  ADMIN: "Admin",
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function MessageBubble({ message, isOwn }) {
  const badgeStyle = ROLE_BADGE[message.senderRole] || ROLE_BADGE.CNA

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOwn ? "flex-end" : "flex-start",
        marginBottom: "12px",
        padding: "0 16px",
      }}
    >
      {/* Sender name + role */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
        {!isOwn && (
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
            {message.senderName}
          </span>
        )}
        <span
          style={{
            ...badgeStyle,
            fontSize: "10px",
            fontWeight: 700,
            padding: "1px 7px",
            borderRadius: "20px",
            letterSpacing: "0.3px",
          }}
        >
          {ROLE_LABELS[message.senderRole] || message.senderRole}
        </span>
        {isOwn && (
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
            {message.senderName}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: "78%",
          backgroundColor: isOwn ? "#2563eb" : "#f1f5f9",
          color: isOwn ? "#fff" : "#0f172a",
          borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "10px 14px",
          fontSize: "14px",
          lineHeight: "1.45",
          wordBreak: "break-word",
        }}
      >
        {message.text}
      </div>

      {/* Timestamp */}
      <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
        {formatTime(message.createdAt)}
      </span>
    </div>
  )
}
