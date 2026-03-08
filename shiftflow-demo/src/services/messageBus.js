// Lightweight pub/sub for in-process real-time message delivery
// (mirrors toastBus.js pattern — no Supabase required for MVP)

const listeners = new Set()

export function dispatchMessageEvent(message) {
  for (const listener of listeners) {
    listener(message)
  }
}

export function subscribeToMessageEvents(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
