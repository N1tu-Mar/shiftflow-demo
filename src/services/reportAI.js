// Structured clinical signal extractor for "Organize with AI".
// Returns strict JSON schema used by ShiftFlow report UI.

const EMPTY_RESULT = {
  diseases: [],
  devices: [],
  behavior: [],
  mobility: [],
  risks: [],
  care_precautions: [],
  restraints: [],
  notes: "",
  history_summary: [],
}

const DISEASE_MAP = [
  { kw: ["alzheimer"], label: "Alzheimer's" },
  { kw: ["dementia"], label: "Dementia" },
  { kw: ["diabetes", "diabetic"], label: "Diabetes" },
  { kw: ["copd"], label: "COPD" },
  { kw: ["parkinson"], label: "Parkinson's" },
  { kw: ["covid"], label: "COVID" },
  { kw: ["influenza", "flu"], label: "Influenza" },
  { kw: ["pneumonia"], label: "Pneumonia" },
]

const DEVICE_MAP = [
  { kw: ["iv", "intravenous"], label: "IV" },
  { kw: ["central line"], label: "Central line" },
  { kw: ["foley", "catheter"], label: "Foley catheter" },
  { kw: ["oxygen", "o2", "nasal cannula"], label: "Oxygen" },
  { kw: ["feeding tube", "peg tube", "ng tube"], label: "Feeding tube" },
  { kw: ["ventilator", "vent"], label: "Ventilator" },
]

const BEHAVIOR_MAP = [
  { kw: ["aggressive"], label: "Aggressive" },
  { kw: ["combative"], label: "Combative" },
  { kw: ["verbally aggressive"], label: "Verbally aggressive" },
  { kw: ["agitated"], label: "Agitated" },
  { kw: ["confused", "confusion"], label: "Confused" },
  { kw: ["disoriented"], label: "Disoriented" },
]

const MOBILITY_MAP = [
  { kw: ["assist x1", "one assist", "1 assist"], label: "Assist x1" },
  { kw: ["assist x2", "two assist", "2 assist"], label: "Assist x2" },
  { kw: ["total assist"], label: "Total assist" },
  { kw: ["bedbound"], label: "Bedbound" },
  { kw: ["fall risk"], label: "Fall risk" },
]

const RISK_MAP = [
  { kw: ["biting", "bit staff", "has bitten"], label: "History of biting staff" },
  { kw: ["hitting", "hit staff"], label: "History of hitting staff" },
  { kw: ["high fall risk"], label: "High fall risk" },
  { kw: ["wandering"], label: "Wandering risk" },
  { kw: ["staff safety"], label: "Staff safety concern" },
]

const PRECAUTION_MAP = [
  { kw: ["do not approach", "don't approach", "not engage alone"], label: "Do not approach patient alone" },
  { kw: ["two staff", "2 staff"], label: "Enter room with two staff" },
  { kw: ["wear gown"], label: "Wear gown" },
  { kw: ["wear gloves"], label: "Wear gloves" },
  { kw: ["ppe", "full ppe"], label: "Use PPE" },
  { kw: ["isolation"], label: "Isolation precautions" },
  { kw: ["monitor closely"], label: "Monitor closely" },
]

const RESTRAINT_MAP = [
  { kw: ["soft restraint"], label: "Soft restraints" },
  { kw: ["four-point restraint", "4-point restraint"], label: "Four-point restraints" },
  { kw: ["restraint"], label: "Restraints required for aggression" },
]

function addMatches(lower, map) {
  const found = []
  for (const { kw, label } of map) {
    if (kw.some((k) => lower.includes(k)) && !found.includes(label)) found.push(label)
  }
  return found
}

function summarizeHistory(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines
    .filter((line) => /previous|prior|history|last shift|overnight/.test(line.toLowerCase()))
    .slice(0, 5)
}

function localExtract(text) {
  const lower = ` ${text.toLowerCase()} `
  const result = {
    diseases: addMatches(lower, DISEASE_MAP),
    devices: addMatches(lower, DEVICE_MAP),
    behavior: addMatches(lower, BEHAVIOR_MAP),
    mobility: addMatches(lower, MOBILITY_MAP),
    risks: addMatches(lower, RISK_MAP),
    care_precautions: addMatches(lower, PRECAUTION_MAP),
    restraints: addMatches(lower, RESTRAINT_MAP),
    notes: text.replace(/\s+/g, " ").trim().slice(0, 260),
    history_summary: summarizeHistory(text),
  }

  if ((result.behavior.length > 0 || result.risks.length > 0) && !result.care_precautions.includes("Enter room with two staff")) {
    if (/bit|hit|aggress|combative/.test(lower)) result.care_precautions.push("Enter room with two staff")
  }

  if ((result.diseases.includes("COVID") || result.diseases.includes("Influenza")) && !result.care_precautions.includes("Isolation precautions")) {
    result.care_precautions.push("Isolation precautions")
  }
  if ((result.diseases.includes("COVID") || result.diseases.includes("Influenza")) && !result.care_precautions.includes("Use PPE")) {
    result.care_precautions.push("Use PPE")
  }
  if ((result.diseases.includes("COVID") || result.diseases.includes("Influenza")) && !result.care_precautions.includes("Wear gown")) {
    result.care_precautions.push("Wear gown")
  }

  return result
}

function normalizeResult(raw) {
  if (!raw || typeof raw !== "object") return { ...EMPTY_RESULT }
  return {
    diseases: Array.isArray(raw.diseases) ? raw.diseases : [],
    devices: Array.isArray(raw.devices) ? raw.devices : [],
    behavior: Array.isArray(raw.behavior) ? raw.behavior : [],
    mobility: Array.isArray(raw.mobility) ? raw.mobility : [],
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    care_precautions: Array.isArray(raw.care_precautions) ? raw.care_precautions : [],
    restraints: Array.isArray(raw.restraints) ? raw.restraints : [],
    notes: typeof raw.notes === "string" ? raw.notes : "",
    history_summary: Array.isArray(raw.history_summary) ? raw.history_summary : [],
  }
}

export async function organizeReport(text) {
  try {
    const res = await fetch("/api/organize-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(8000),
    })

    if (res.ok) {
      const data = await res.json()
      if (data && typeof data === "object") {
        if ("organized" in data && typeof data.organized === "string") {
          return normalizeResult(JSON.parse(data.organized))
        }
        return normalizeResult(data)
      }
    }
  } catch {
    // fall through to local fallback
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))
  return normalizeResult(localExtract(text))
}
