/**
 * Simulates OCR extraction of vitals from a monitor/sheet.
 * Generates realistic values based on patient age.
 */
export function simulateVitalsOCR(patientAge) {
  const age = patientAge || 60
  const elderly = age > 65

  const systolic = (elderly ? 135 : 120) + Math.floor(Math.random() * 20 - 5)
  const diastolic = (elderly ? 85 : 80) + Math.floor(Math.random() * 10 - 3)
  const pulse = (elderly ? 75 : 72) + Math.floor(Math.random() * 10 - 4)
  const temperature = parseFloat(
    (98.6 + (Math.random() * 1.2 - 0.4)).toFixed(1)
  )
  const respiratoryRate = 16 + Math.floor(Math.random() * 4 - 2)
  const spo2 = (elderly ? 96 : 98) + Math.floor(Math.random() * 3 - 1)
  const ocrConfidence = parseFloat((0.95 + Math.random() * 0.04).toFixed(2))

  return {
    systolic: String(systolic),
    diastolic: String(diastolic),
    pulse: String(pulse),
    temperature: String(temperature),
    respiratoryRate: String(respiratoryRate),
    spo2: String(Math.min(100, Math.max(70, spo2))),
    ocrConfidence,
    manualEntry: false,
  }
}
