import { useEffect, useState } from "react"
import { subscribeToToasts } from "../services/toastBus"

export default function ToastViewport() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setItems((prev) => [...prev, toast])
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toast.id))
      }, 2400)
    })

    return unsubscribe
  }, [])

  return (
    <div style={{ position: "fixed", top: "12px", left: 0, right: 0, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", pointerEvents: "none" }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            backgroundColor: "#0f172a",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            boxShadow: "0 8px 20px rgba(15,23,42,0.35)",
          }}
        >
          {item.message}
        </div>
      ))}
    </div>
  )
}
