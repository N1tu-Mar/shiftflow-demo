import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import MessageBubble from "./MessageBubble"
import QuickReplies from "./QuickReplies"
import MessageInput from "./MessageInput"
import { useMessages } from "../../hooks/useMessages"

export default function Conversation({ patient, user, onBack }) {
  const navigate = useNavigate()
  const { messages, sendMessage, markRead } = useMessages(patient.id)
  const bottomRef = useRef(null)

  // Mark all as read when conversation opens
  useEffect(() => {
    markRead(patient.id, user.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id, user.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const sorted = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  function handleSend(text) {
    sendMessage(patient.id, {
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text,
    })
  }

  const RN_RESPONSES = {
    "Completed": "Thanks. Noted.",
    "On My Way": "Understood.",
    "Needs RN": "On my way. I'll come check.",
    "Vitals Abnormal": "Repeat vitals and notify me if still abnormal.",
  }

  function handleQuickReply(label) {
    handleSend(label)
    const rnResponse = RN_RESPONSES[label]
    if (rnResponse) {
      setTimeout(() => {
        sendMessage(patient.id, {
          senderId: "user_michael",
          senderName: "Michael Chen",
          senderRole: "RN",
          text: rnResponse,
        })
      }, 1500)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f8fafc" }}>

      {/* Header */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onBack || (() => navigate("/messages"))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", padding: "4px", display: "flex", alignItems: "center" }}
            aria-label="Back"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
              Room {patient.room}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>{patient.name}</div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "12px", paddingBottom: "8px" }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "#94a3b8", fontSize: "14px" }}>
            No messages yet. Send the first one.
          </div>
        ) : (
          sorted.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user.id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies + input */}
      <div style={{ flexShrink: 0, backgroundColor: "#fff" }}>
        <QuickReplies onSelect={handleQuickReply} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  )
}
