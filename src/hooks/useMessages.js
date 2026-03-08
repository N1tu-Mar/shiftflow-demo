import { useEffect, useState } from "react"
import { subscribeToMessageEvents, dispatchMessageEvent } from "../services/messageBus"

const STORAGE_KEY = "shiftflowMessages"

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedMessages()
  } catch {
    return seedMessages()
  }
}

function seedMessages() {
  const now = Date.now()
  const seed = [
    {
      id: "m1",
      patientId: 1,
      senderId: "user_michael",
      senderName: "Michael Chen",
      senderRole: "RN",
      text: "BP elevated at 128/82. Please monitor.",
      readBy: ["user_michael"],
      createdAt: new Date(now - 8 * 60000).toISOString(),
    },
    {
      id: "m2",
      patientId: 1,
      senderId: "user_sarah",
      senderName: "Sarah Johnson",
      senderRole: "CNA",
      text: "Will recheck at 4 PM.",
      readBy: ["user_sarah", "user_michael"],
      createdAt: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: "m3",
      patientId: 2,
      senderId: "user_sarah",
      senderName: "Sarah Johnson",
      senderRole: "CNA",
      text: "Completed Q2 turn.",
      readBy: ["user_sarah"],
      createdAt: new Date(now - 15 * 60000).toISOString(),
    },
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function saveMessages(msgs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
}

export function useMessages(patientId) {
  const [allMessages, setAllMessages] = useState(loadMessages)

  // Subscribe to cross-tab / cross-component message events
  useEffect(() => {
    const unsub = subscribeToMessageEvents((msg) => {
      setAllMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev
        const next = [...prev, msg]
        saveMessages(next)
        return next
      })
    })
    return unsub
  }, [])

  const messages = patientId
    ? allMessages.filter((m) => m.patientId === patientId)
    : allMessages

  function sendMessage(patientId, { senderId, senderName, senderRole, text }) {
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      patientId,
      senderId,
      senderName,
      senderRole,
      text,
      readBy: [senderId],
      createdAt: new Date().toISOString(),
    }
    setAllMessages((prev) => {
      const next = [...prev, msg]
      saveMessages(next)
      return next
    })
    dispatchMessageEvent(msg)
  }

  function markRead(patientId, userId) {
    setAllMessages((prev) => {
      const next = prev.map((m) =>
        m.patientId === patientId && !m.readBy.includes(userId)
          ? { ...m, readBy: [...m.readBy, userId] }
          : m
      )
      saveMessages(next)
      return next
    })
  }

  function getUnreadCount(patientId, userId) {
    return allMessages.filter(
      (m) => m.patientId === patientId && !m.readBy.includes(userId)
    ).length
  }

  function getLastMessage(patientId) {
    const thread = allMessages
      .filter((m) => m.patientId === patientId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    return thread[thread.length - 1] || null
  }

  return { messages, sendMessage, markRead, getUnreadCount, getLastMessage, allMessages }
}
