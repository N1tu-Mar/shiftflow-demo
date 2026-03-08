import { useEffect, useRef, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./assets/Login"
import Dashboard from "./pages/Dashboard"
import PatientDetail from "./pages/PatientDetail"
import ChargeDashboard from "./assets/ChargeDashboard"
import AdminDashboard from "./assets/AdminDashboard"
import { useReports } from "./hooks/useReports"
import { useTasks } from "./hooks/useTasks"
import ToastViewport from "./components/ToastViewport"
import TasksPage from "./pages/TasksPage"
import TaskReminderModal from "./components/tasks/TaskReminderModal"
import MessagesPage from "./pages/MessagesPage"
import { subscribeToMessageEvents } from "./services/messageBus"
import { showToast } from "./services/toastBus"
import { demoPatients } from "./data/patients"


function App() {
  const { reports, addReport } = useReports()
  const { tasks, addTask, completeTask, snoozeTask, markAlerted } = useTasks()
  const [dueTask, setDueTask] = useState(null)

  const tasksRef = useRef(tasks)
  const dueTaskRef = useRef(dueTask)
  useEffect(() => { tasksRef.current = tasks }, [tasks])
  useEffect(() => { dueTaskRef.current = dueTask }, [dueTask])

  // On mount: silently mark already-overdue tasks so alarm doesn't fire immediately
  useEffect(() => {
    const nowMs = Date.now()
    tasks.forEach((t) => {
      if (!t.completed && !t.alerted && new Date(t.scheduledTime).getTime() <= nowMs) {
        markAlerted(t.id)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Global reminder timer — checks every 10s regardless of current route
  useEffect(() => {
    const interval = setInterval(() => {
      if (dueTaskRef.current) return
      const nowMs = Date.now()
      const next = tasksRef.current.find(
        (t) => !t.completed && !t.alerted && new Date(t.scheduledTime).getTime() <= nowMs
      )
      if (next) {
        markAlerted(next.id)
        setDueTask(next)
      }
    }, 10000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Global message toast — fires when a new message arrives from another user
  useEffect(() => {
    const unsub = subscribeToMessageEvents((msg) => {
      const user = (() => {
        try { return JSON.parse(localStorage.getItem("shiftflowUser")) } catch { return null }
      })()
      if (!user || msg.senderId === user.id) return
      const patient = demoPatients.find((p) => p.id === msg.patientId)
      const roomLabel = patient ? `Room ${patient.room}` : "Unknown room"
      showToast(`New message — ${roomLabel}\n${msg.senderName}: ${msg.text}`)
    })
    return unsub
  }, [])

  function handleComplete(id) {
    completeTask(id)
    setDueTask(null)
  }

  function handleSnooze(id) {
    snoozeTask(id)
    setDueTask(null)
  }

  return (
    <BrowserRouter>
      <ToastViewport />
      {dueTask && (
        <TaskReminderModal
          task={dueTask}
          onComplete={handleComplete}
          onSnooze={handleSnooze}
        />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<Dashboard reports={reports} addReport={addReport} addTask={addTask} />}
        />
        <Route
          path="/patients/:patientId"
          element={<PatientDetail reports={reports} addReport={addReport} />}
        />
        <Route
          path="/tasks"
          element={
            <TasksPage
              tasks={tasks}
              addTask={addTask}
              completeTask={completeTask}
              snoozeTask={snoozeTask}
              markAlerted={markAlerted}
            />
          }
        />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/charge-dashboard" element={<ChargeDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
