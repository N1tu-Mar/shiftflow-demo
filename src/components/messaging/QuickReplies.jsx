const QUICK_REPLIES = [
  "Completed",
  "On My Way",
  "Needs RN",
  "Vitals Abnormal",
]

export default function QuickReplies({ onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "8px 12px 0",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {QUICK_REPLIES.map((label) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          style={{
            flexShrink: 0,
            padding: "7px 14px",
            borderRadius: "20px",
            border: "1.5px solid #bfdbfe",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
