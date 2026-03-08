// Web Audio API alarm — no audio file required.
// Falls back silently if AudioContext is unavailable.

let ctx = null
let beepInterval = null

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return ctx
}

function playBeep() {
  try {
    const context = getCtx()
    if (context.state === "suspended") context.resume()

    const osc = context.createOscillator()
    const gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    osc.type = "square"
    osc.frequency.setValueAtTime(880, context.currentTime)
    osc.frequency.setValueAtTime(660, context.currentTime + 0.15)

    gain.gain.setValueAtTime(0.5, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3)

    osc.start(context.currentTime)
    osc.stop(context.currentTime + 0.32)
  } catch {
    // AudioContext not available — fail silently
  }
}

export const alarm = {
  start() {
    if (beepInterval) return // already running
    playBeep()
    beepInterval = setInterval(playBeep, 800)

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300])
    }
  },
  stop() {
    if (beepInterval) {
      clearInterval(beepInterval)
      beepInterval = null
    }
    if (navigator.vibrate) {
      navigator.vibrate(0)
    }
  },
}
