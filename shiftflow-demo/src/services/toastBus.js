const listeners = new Set()

export function showToast(message, type = "default") {
  for (const listener of listeners) {
    listener({ id: `${Date.now()}_${Math.random()}`, message, type })
  }
}

export function subscribeToToasts(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
