import { useState } from "react"

const STORAGE_KEY = "shiftflowTasks"

function makeId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function seedTasks() {
  const now = Date.now()
  const t = (offsetMs) => new Date(now + offsetMs).toISOString()
  return [
    {
      id: "seed_1",
      title: "Glucose Check",
      description: "",
      patientRoom: "423",
      patientName: "John Davis",
      scheduledTime: t(-30 * 60000), // 30 min ago — will show as overdue
      createdAt: t(-120 * 60000),
      completed: false,
      completedAt: null,
      alerted: false,
    },
    {
      id: "seed_2",
      title: "Q2 Turn — Reposition",
      description: "Reposition to left side",
      patientRoom: "421",
      patientName: "Mary Williams",
      scheduledTime: t(2 * 60000), // 2 min from now — will trigger alarm
      createdAt: t(-30 * 60000),
      completed: false,
      completedAt: null,
      alerted: false,
    },
    {
      id: "seed_3",
      title: "Vitals Check",
      description: "",
      patientRoom: "427",
      patientName: "Robert Thompson",
      scheduledTime: t(90 * 60000), // 90 min from now
      createdAt: t(-10 * 60000),
      completed: false,
      completedAt: null,
      alerted: false,
    },
  ]
}

export function useTasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    const seeds = seedTasks()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds))
    return seeds
  })

  function persist(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }

  function addTask(data) {
    setTasks((prev) => persist([
      {
        id: makeId(),
        title: data.title,
        description: data.description || "",
        patientRoom: data.patientRoom || null,
        patientName: data.patientName || null,
        scheduledTime: data.scheduledTime,
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
        alerted: false,
      },
      ...prev,
    ]))
  }

  function completeTask(id) {
    setTasks((prev) => persist(
      prev.map((t) => t.id === id
        ? { ...t, completed: true, completedAt: new Date().toISOString(), alerted: true }
        : t
      )
    ))
  }

  function snoozeTask(id) {
    const snoozedTime = new Date(Date.now() + 5 * 60000).toISOString()
    setTasks((prev) => persist(
      prev.map((t) => t.id === id
        ? { ...t, scheduledTime: snoozedTime, alerted: false }
        : t
      )
    ))
  }

  function markAlerted(id) {
    setTasks((prev) => persist(
      prev.map((t) => t.id === id ? { ...t, alerted: true } : t)
    ))
  }

  return { tasks, addTask, completeTask, snoozeTask, markAlerted }
}
