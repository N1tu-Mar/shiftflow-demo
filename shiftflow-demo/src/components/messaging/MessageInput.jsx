import { useState } from "react"

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("")

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText("")
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8px",
        padding: "10px 12px",
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "#fff",
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type message..."
        rows={1}
        style={{
          flex: 1,
          borderRadius: "20px",
          border: "1.5px solid #cbd5e1",
          padding: "10px 14px",
          fontSize: "14px",
          color: "#0f172a",
          resize: "none",
          outline: "none",
          lineHeight: "1.4",
          maxHeight: "96px",
          overflowY: "auto",
          fontFamily: "inherit",
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        style={{
          flexShrink: 0,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: text.trim() ? "#2563eb" : "#e2e8f0",
          color: text.trim() ? "#fff" : "#94a3b8",
          cursor: text.trim() ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.15s",
        }}
        aria-label="Send"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  )
}
