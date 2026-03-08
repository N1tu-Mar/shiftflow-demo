# ShiftFlow MVP Prototype - Product Requirements Document
## Claude Code Implementation Prompt

**Project:** ShiftFlow - Bedside Workflow Platform for Hospital Floor Staff  
**Timeline:** 1-2 days (bare minimum working prototype)  
**Deliverable:** Deployed live demo URL + working codebase  
**Purpose:** Pitch competition demo showcasing full end-to-end workflow

---

## 🎯 EXECUTIVE SUMMARY

Build a **mobile-first web application** that demonstrates ShiftFlow's core value proposition: replacing paper-based workflows for hospital CNAs, PCTs, nurses, and administrators with a unified digital platform. This is a **functional demo** with real-time features, not just mockups.

### Critical Success Criteria
1. **Works on mobile browsers** (iPhone/Android primary)
2. **Real-time updates** across all user roles
3. **Demonstrates full workflow** from shift handoff → vitals capture → tasks → admin analytics
4. **Deployable live demo** (Vercel/Netlify)
5. **Looks professional** for investor pitch

---

## 📋 TECH STACK REQUIREMENTS

### Frontend
- **Framework:** React 18+ with Vite
- **Styling:** Tailwind CSS (utility-first)
- **UI Components:** shadcn/ui + Material-UI (healthcare aesthetic)
- **Icons:** Lucide React
- **State Management:** React Context API + hooks (useState, useEffect, useContext)
- **Routing:** React Router v6

### Backend & Database
- **Database:** Supabase (PostgreSQL + real-time subscriptions)
- **Authentication:** Firebase Authentication (email/password)
- **Real-time:** Supabase real-time listeners for live updates
- **Hosting:** Vercel (frontend) + Supabase (backend)

### Key Libraries
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "@shadcn/ui": "latest",
  "@mui/material": "^5.15.0",
  "lucide-react": "latest",
  "react-router-dom": "^6.20.0",
  "firebase": "^10.7.0",
  "supabase-js": "^2.38.0",
  "date-fns": "^3.0.0",
  "react-hot-toast": "^2.4.1"
}
```

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git
- **Environment Variables:** `.env` file for API keys
- **Code Quality:** ESLint + Prettier

---

## 🏗️ APPLICATION ARCHITECTURE

### Database Schema (Supabase)

#### 1. `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  firebase_uid TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CNA', 'RN', 'CHARGE_NURSE', 'ADMIN')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('DAY', 'NIGHT', 'EVENING')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

#### 2. `patients` Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT NOT NULL,
  name TEXT NOT NULL,
  mrn TEXT UNIQUE NOT NULL, -- Medical Record Number
  age INTEGER NOT NULL,
  admission_date DATE NOT NULL,
  diagnosis TEXT,
  allergies TEXT[],
  diet TEXT,
  code_status TEXT CHECK (code_status IN ('FULL_CODE', 'DNR', 'DNI')),
  isolation_precautions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `handoffs` Table
```sql
CREATE TABLE handoffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  shift TEXT NOT NULL,
  shift_date DATE NOT NULL,
  
  -- Core handoff fields
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  mobility_level TEXT CHECK (mobility_level IN ('INDEPENDENT', 'ASSIST_X1', 'ASSIST_X2', 'TOTAL_LIFT')),
  fall_risk_level TEXT CHECK (fall_risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  skin_integrity TEXT,
  iv_lines TEXT[],
  foley_catheter BOOLEAN DEFAULT FALSE,
  oxygen_support TEXT,
  behavioral_notes TEXT,
  pending_tasks TEXT[],
  free_text_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. `vitals` Table
```sql
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES users(id),
  
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  pulse INTEGER,
  temperature DECIMAL(4,1),
  respiratory_rate INTEGER,
  spo2 INTEGER,
  map INTEGER, -- Mean Arterial Pressure
  
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- OCR metadata (for demo)
  ocr_confidence DECIMAL(3,2),
  manual_entry BOOLEAN DEFAULT FALSE
);
```

#### 5. `tasks` Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  
  task_type TEXT NOT NULL CHECK (task_type IN (
    'Q2_TURN',
    'GLUCOSE_CHECK',
    'REPEAT_VITALS',
    'FOLEY_OUTPUT',
    'INTAKE_OUTPUT',
    'REPOSITIONING',
    'FALL_RISK_ROUND'
  )),
  
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'OVERDUE', 'SKIPPED')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. `care_notes` Table
```sql
CREATE TABLE care_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  
  note_type TEXT NOT NULL CHECK (note_type IN (
    'BEHAVIORAL',
    'MOBILITY',
    'DEVICE_MONITORING',
    'CARE_REFUSAL',
    'PAIN_REPORT',
    'GENERAL'
  )),
  
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. `messages` Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'TEAM' CHECK (message_type IN ('TEAM', 'RN_ONLY', 'URGENT')),
  read_by UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_handoffs_patient_shift ON handoffs(patient_id, shift_date, shift);
CREATE INDEX idx_vitals_patient_time ON vitals(patient_id, recorded_at DESC);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_messages_patient_created ON messages(patient_id, created_at DESC);
```

---

## 🎨 USER INTERFACE REQUIREMENTS

### Design Principles
1. **Mobile-first:** All screens must work perfectly on 375px width (iPhone SE)
2. **One-handed operation:** Large touch targets (min 44px), bottom navigation
3. **Glove-friendly:** Buttons must be usable with medical gloves on
4. **High contrast:** Clear text, readable in bright hospital lighting
5. **Clean & minimal:** Reduce cognitive load for busy staff

### Color Palette (Healthcare Theme)
```css
:root {
  --primary-blue: #2563EB;      /* Primary actions */
  --secondary-teal: #0D9488;    /* Success states */
  --warning-amber: #F59E0B;     /* Warnings, overdue tasks */
  --danger-red: #DC2626;        /* Critical alerts */
  --neutral-gray: #6B7280;      /* Text, borders */
  --bg-light: #F9FAFB;          /* Backgrounds */
  --text-dark: #111827;         /* Primary text */
}
```

### Typography
- **Font:** Inter or System UI fonts (clean, modern)
- **Base size:** 16px (mobile readability)
- **Headings:** Bold, 20-24px
- **Body:** Regular, 14-16px
- **Labels:** Medium weight, 12-14px

### Component Standards
- **Buttons:** Rounded (8px), min height 48px, shadow on primary
- **Cards:** Rounded (12px), subtle shadow, 16px padding
- **Inputs:** Rounded (8px), border, 48px height, clear focus states
- **Modals:** Full-screen on mobile, centered overlay on tablet+

---

## 📱 FEATURE SPECIFICATIONS

### MODULE 1: Authentication & User Management

#### Login Screen
- **Firebase email/password authentication**
- Fields: Email, Password
- "Forgot Password" link (can be non-functional for demo)
- Error handling with toast notifications
- Auto-redirect based on role after login

#### Test Accounts (Pre-populated)
Create these users in Firebase + Supabase:

```javascript
const demoUsers = [
  {
    email: 'cna.demo@shiftflow.app',
    password: 'Demo2024!',
    role: 'CNA',
    firstName: 'Sarah',
    lastName: 'Johnson',
    department: 'Med-Surg 4B',
    shift: 'DAY'
  },
  {
    email: 'rn.demo@shiftflow.app',
    password: 'Demo2024!',
    role: 'RN',
    firstName: 'Michael',
    lastName: 'Chen',
    department: 'Med-Surg 4B',
    shift: 'DAY'
  },
  {
    email: 'charge.demo@shiftflow.app',
    password: 'Demo2024!',
    role: 'CHARGE_NURSE',
    firstName: 'Jessica',
    lastName: 'Martinez',
    department: 'Med-Surg 4B',
    shift: 'DAY'
  },
  {
    email: 'admin.demo@shiftflow.app',
    password: 'Demo2024!',
    role: 'ADMIN',
    firstName: 'David',
    lastName: 'Thompson',
    department: 'Administration',
    shift: 'DAY'
  }
];
```

#### Role-Based Routing
After login, redirect to:
- **CNA/RN:** `/dashboard` (patient list + quick actions)
- **CHARGE_NURSE:** `/charge-dashboard` (unit overview + staffing)
- **ADMIN:** `/admin-dashboard` (analytics + metrics)

---

### MODULE 2: Dashboard (CNA/RN View)

#### Layout
```
┌─────────────────────────────────┐
│  [Header: ShiftFlow Logo]       │
│  👤 Sarah Johnson | CNA | Day   │
├─────────────────────────────────┤
│  📋 My Patients (6)             │
│  ┌─────────────────────────┐   │
│  │ 🏥 Room 421             │   │
│  │ Mary Williams | Age 67  │   │
│  │ Fall Risk: HIGH 🔴      │   │
│  │ [Handoff] [Vitals] [Tasks]  │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 🏥 Room 423             │   │
│  │ John Davis | Age 54     │   │
│  │ 2 Tasks Overdue ⚠️      │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│ [🏠] [✓ Tasks] [💬 Messages]   │
└─────────────────────────────────┘
```

#### Patient Card Components
Each patient card shows:
- Room number (large, bold)
- Patient name + age
- Status indicators:
  - Fall risk level (color-coded badge)
  - Isolation precautions (icon badges)
  - Overdue tasks count (warning badge)
  - New messages count (blue badge)
- Quick action buttons:
  - **View Handoff** → Opens handoff details
  - **Capture Vitals** → Opens vitals entry modal
  - **View Tasks** → Opens task list for patient

#### Real-time Updates
- **Live task status changes** (completed tasks update across all users)
- **New vitals appear instantly** (via Supabase subscriptions)
- **Message notifications** (toast when new patient message arrives)

---

### MODULE 3: Shift Handoff

#### Handoff Entry Screen (Outgoing Shift)
Accessed by clicking "View Handoff" → "Edit Handoff" (if user created it)

**Form Fields:**
1. **Pain Level** (0-10 slider with faces icon 😐→😢)
2. **Mobility Level** (dropdown)
   - Independent
   - Assist x1
   - Assist x2
   - Total Lift (highlight in red)
3. **Fall Risk** (dropdown: Low, Medium, High)
4. **Skin Integrity** (textarea: "No issues" / "Stage 2 sacral ulcer" etc.)
5. **IV Lines** (multi-select chips)
   - Left AC
   - Right AC
   - PICC
   - Central line
   - None
6. **Foley Catheter** (toggle switch)
7. **Oxygen Support** (dropdown)
   - Room air
   - Nasal cannula 2L
   - Non-rebreather
   - BiPAP
8. **Behavioral Notes** (textarea: "Confused at night" / "Cooperative" etc.)
9. **Pending Tasks** (multi-select)
   - Lab draw pending
   - X-ray ordered
   - PT consult scheduled
   - Family meeting requested
10. **Additional Notes** (textarea, free-text)

**Save Button:** 
- Validates required fields
- Saves to `handoffs` table
- Shows success toast
- Real-time update to incoming shift viewers

#### Handoff View Screen (Incoming Shift)
Read-only display of all handoff data:
- Clean card layout with section headers
- Color-coded badges for risk levels
- Timestamp + "Created by Sarah Johnson (CNA, Day shift)"
- "Print" button (can be non-functional for demo)

---

### MODULE 4: Vitals Capture

#### Vitals Entry Modal
Triggered by "Capture Vitals" button on patient card.

**Step 1: Capture Method Selection**
```
┌─────────────────────────────┐
│  Capture Vitals - Room 421  │
│  Mary Williams              │
├─────────────────────────────┤
│  How would you like to      │
│  capture vitals?            │
│                             │
│  [📸 Scan Monitor]          │
│  [⌨️  Manual Entry]          │
└─────────────────────────────┘
```

**Step 2A: Scan Monitor (Simulated OCR)**
```
┌─────────────────────────────┐
│  📸 Position camera over    │
│     monitor screen          │
│                             │
│  [■■■■■■■■■■] 100%          │
│  Extracting values...       │
│                             │
│  [Cancel]                   │
└─────────────────────────────┘
```

**Auto-populate after 2 seconds:**
- Generate realistic vital signs based on patient age/condition
- Add simulated OCR confidence (95-99%)
- Show "Review extracted values" screen

**Step 2B: Manual Entry**
Simple form with number inputs for:
- Systolic BP / Diastolic BP (e.g., 120/80)
- Pulse (60-100)
- Temperature (°F, 97.0-99.5)
- Respiratory Rate (12-20)
- SpO2 (95-100%)
- MAP (calculated automatically: (Systolic + 2×Diastolic) / 3)

**Step 3: Review & Confirm**
```
┌─────────────────────────────┐
│  Review Vitals              │
├─────────────────────────────┤
│  BP:    128/82 mmHg  [Edit] │
│  Pulse: 76 bpm       [Edit] │
│  Temp:  98.6°F       [Edit] │
│  RR:    16 /min      [Edit] │
│  SpO2:  98%          [Edit] │
│  MAP:   97 mmHg             │
│                             │
│  ✓ OCR Confidence: 97%      │
│  📅 Mar 7, 2026 2:34 PM     │
│                             │
│  [🔙 Back] [✅ Confirm]     │
└─────────────────────────────┘
```

**Validation Rules:**
- **Systolic BP:** 60-250 mmHg
- **Diastolic BP:** 40-150 mmHg
- **Pulse:** 30-200 bpm
- **Temperature:** 95.0-105.0°F
- **RR:** 8-60 /min
- **SpO2:** 70-100%

**Abnormal Value Warnings:**
If values outside normal ranges, show yellow warning banner:
```
⚠️ Warning: Blood pressure elevated (128/82)
   Normal range: <120/80
   
   [Confirm Anyway] [Re-enter]
```

**On Confirm:**
- Save to `vitals` table with timestamp
- Show success toast: "Vitals recorded for Mary Williams"
- Update patient card with latest vitals
- **Real-time push to all users** viewing this patient

---

### MODULE 5: Task Reminder System

#### Task List View
Accessed via bottom navigation "Tasks" tab.

**Layout:**
```
┌─────────────────────────────────┐
│  Tasks for Day Shift            │
│  📅 March 7, 2026               │
├─────────────────────────────────┤
│  🔴 OVERDUE (2)                 │
│  ┌───────────────────────────┐ │
│  │ ⏰ 2:00 PM - Room 421      │ │
│  │ Q2 Turn - Mary Williams   │ │
│  │ [Mark Complete]           │ │
│  └───────────────────────────┘ │
│                                 │
│  🟡 UPCOMING (5)                │
│  ┌───────────────────────────┐ │
│  │ ⏰ 4:00 PM - Room 423      │ │
│  │ Glucose Check             │ │
│  │ [Mark Complete]           │ │
│  └───────────────────────────┘ │
│                                 │
│  ✅ COMPLETED (12)              │
│  [View All]                     │
└─────────────────────────────────┘
```

#### Task Types & Schedules
Pre-populate tasks for each patient:

**Q2 Turns (Every 2 hours):**
- 8:00 AM, 10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM

**Glucose Checks (for diabetic patients):**
- 7:00 AM, 11:30 AM, 5:00 PM, 9:00 PM

**Repeat Vitals (Q4):**
- 8:00 AM, 12:00 PM, 4:00 PM, 8:00 PM

**Foley Output Monitoring (Q8):**
- 8:00 AM, 4:00 PM, 12:00 AM

#### Task Completion Flow
1. User taps "Mark Complete"
2. Modal appears:
   ```
   ┌─────────────────────────────┐
   │  Mark Complete              │
   │  Q2 Turn - Room 421         │
   ├─────────────────────────────┤
   │  Add notes (optional):      │
   │  ┌───────────────────────┐ │
   │  │ Patient repositioned  │ │
   │  │ to left side. No skin │ │
   │  │ breakdown noted.      │ │
   │  └───────────────────────┘ │
   │                             │
   │  [Cancel] [✅ Complete]     │
   └─────────────────────────────┘
   ```
3. On confirm:
   - Update `tasks` table (status → COMPLETED, completed_at → NOW(), completed_by → current user)
   - Real-time update across all users
   - Remove from "Overdue/Upcoming" list
   - Add to "Completed" list
   - Show success toast

#### Overdue Task Logic
- **Status change:** If `scheduled_time < NOW()` and status = PENDING → status = OVERDUE
- **Visual indicators:**
  - Red badge on patient card
  - Red border on task card
  - Push notification (browser notification API)

#### Push Notifications (Browser API)
Request permission on first login:
```javascript
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}
```

Send notification 5 minutes before scheduled task:
```javascript
new Notification('ShiftFlow Task Reminder', {
  body: 'Q2 Turn due for Mary Williams (Room 421) at 2:00 PM',
  icon: '/logo.png',
  tag: 'task-421-q2turn-14:00'
});
```

---

### MODULE 6: Patient-Linked Messaging

#### Messages Tab (Bottom Navigation)
Shows all patient conversations:

```
┌─────────────────────────────────┐
│  Messages                       │
├─────────────────────────────────┤
│  ┌───────────────────────────┐ │
│  │ 🏥 Room 421               │ │
│  │ Mary Williams             │ │
│  │ Michael (RN): BP elevated │ │
│  │ 2 min ago          [2] 💬 │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ 🏥 Room 423               │ │
│  │ John Davis                │ │
│  │ Sarah (CNA): Completed... │ │
│  │ 15 min ago                │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

#### Conversation View
Tap patient card to open thread:

```
┌─────────────────────────────────┐
│  ← Messages | Room 421           │
│  Mary Williams                  │
├─────────────────────────────────┤
│  [Sarah Johnson - CNA]          │
│  Completed Q2 turn. Patient     │
│  repositioned to left side.     │
│  10:02 AM                       │
│                                 │
│  [Michael Chen - RN]            │
│  BP elevated at 128/82. Please  │
│  monitor and report if >130/85  │
│  2:34 PM                        │
│                                 │
│  [Sarah Johnson - CNA]          │
│  Will do. Next vitals at 4PM.   │
│  2:36 PM                        │
├─────────────────────────────────┤
│  [Type message...]       [Send] │
└─────────────────────────────────┘
```

**Features:**
- Auto-scroll to bottom on new message
- Real-time message arrival (Supabase subscriptions)
- Sender name + role badge
- Timestamp
- Message type indicator (Team / RN Only / Urgent)

**Message Input:**
- Text area with "Send" button
- Optional: Quick replies ("Completed", "Needs RN", "On my way")
- Character limit: 500

**Real-time Implementation:**
```javascript
useEffect(() => {
  const subscription = supabase
    .channel(`messages:patient_id=eq.${patientId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `patient_id=eq.${patientId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [patientId]);
```

---

### MODULE 7: Care Notes

#### Quick Note Entry
From patient card, tap "Add Note" button:

```
┌─────────────────────────────┐
│  Add Care Note              │
│  Room 421 - Mary Williams   │
├─────────────────────────────┤
│  Note Type:                 │
│  [Behavioral ▼]             │
│                             │
│  Note:                      │
│  ┌───────────────────────┐ │
│  │ Patient became        │ │
│  │ confused around 10PM. │ │
│  │ Oriented x3 after     │ │
│  │ reorientation.        │ │
│  └───────────────────────┘ │
│                             │
│  [Cancel] [💾 Save]         │
└─────────────────────────────┘
```

**Note Types:**
- Behavioral
- Mobility Update
- Device Monitoring
- Care Refusal
- Pain Report
- General

**One-Tap Quick Notes** (optional enhancement):
Show button bar with common actions:
```
[Turned] [Ambulated] [Foley Emptied] [Refused Care]
```
Tap → Auto-creates note with timestamp.

---

### MODULE 8: Admin Analytics Dashboard

#### Overview Screen
```
┌─────────────────────────────────┐
│  ShiftFlow Analytics            │
│  Med-Surg 4B | Day Shift        │
│  📅 March 7, 2026               │
├─────────────────────────────────┤
│  📊 Key Metrics                 │
│  ┌─────────────────────────┐   │
│  │ Vitals Documented       │   │
│  │ 48/50 (96%)      ✅     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Tasks Completed         │   │
│  │ 142/150 (94.7%)  ⚠️     │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Avg Documentation Time  │   │
│  │ 3.2 min (↓ 45%)  ✅     │   │
│  └─────────────────────────┘   │
│                                 │
│  📈 Vitals Capture Trend        │
│  [Line chart: 7-day trend]      │
│                                 │
│  👥 Staff Performance           │
│  [Table: Top performers]        │
└─────────────────────────────────┘
```

#### Metrics to Display

**1. Vitals Documentation Rate**
- Formula: (Vitals recorded / Expected vitals) × 100
- Expected vitals = Number of patients × Vitals frequency (e.g., Q4 = 6 per shift)
- Color coding:
  - Green: ≥95%
  - Yellow: 85-94%
  - Red: <85%

**2. Task Completion Rate**
- Formula: (Completed tasks / Total tasks) × 100
- Breakdown by task type (Q2 turns, glucose checks, etc.)

**3. Avg Time from Vitals Capture to EHR Entry**
- For demo: Show simulated "time saved" metric
- Compare "Before ShiftFlow" (38 min avg) vs "With ShiftFlow" (3 min avg)
- Highlight % improvement

**4. Handoff Completion Rate**
- % of patients with documented handoff at shift change
- Goal: 100%

**5. Staff Utilization**
- Tasks completed per staff member
- Vitals captured per staff member
- Active time on platform

#### Charts (Use Recharts library)

**Line Chart: 7-Day Vitals Documentation Trend**
```javascript
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={vitalsData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="percentage" stroke="#2563EB" />
  </LineChart>
</ResponsiveContainer>
```

**Bar Chart: Task Completion by Type**
```javascript
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={taskData}>
    <XAxis dataKey="taskType" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="completed" fill="#0D9488" />
  </BarChart>
</ResponsiveContainer>
```

#### Export Functionality
- "Download Report" button
- Generates CSV with:
  - All vitals records
  - Task completion log
  - Staff performance metrics
- Use `papaparse` library for CSV generation

---

## 🔒 SECURITY & COMPLIANCE FEATURES

### Visual Security Indicators

#### 1. Encryption Badge (Header)
Display in top-right of all authenticated screens:
```
🔒 End-to-End Encrypted
```
Tooltip on hover: "All patient data is encrypted in transit (TLS 1.3) and at rest (AES-256)"

#### 2. Audit Log Modal
Accessible from admin dashboard:

```
┌─────────────────────────────────┐
│  Audit Log                      │
│  Last 24 hours                  │
├─────────────────────────────────┤
│  ✓ Sarah Johnson (CNA)          │
│    Recorded vitals - Room 421   │
│    Mar 7, 2:34 PM               │
│    IP: 192.168.1.100            │
│                                 │
│  ✓ Michael Chen (RN)            │
│    Viewed handoff - Room 421    │
│    Mar 7, 2:30 PM               │
│    IP: 192.168.1.101            │
│                                 │
│  ✓ Sarah Johnson (CNA)          │
│    Completed task - Q2 Turn     │
│    Mar 7, 2:00 PM               │
└─────────────────────────────────┘
```

Implement simple audit logging:
```javascript
async function logAudit(action, details) {
  await supabase.from('audit_logs').insert({
    user_id: currentUser.id,
    action: action,
    details: details,
    ip_address: await fetch('https://api.ipify.org?format=json')
      .then(r => r.json()).then(d => d.ip),
    timestamp: new Date().toISOString()
  });
}
```

#### 3. Session Timeout Warning
After 15 minutes of inactivity, show modal:
```
┌─────────────────────────────────┐
│  ⏰ Session Expiring            │
├─────────────────────────────────┤
│  Your session will expire in    │
│  2 minutes due to inactivity.   │
│                                 │
│  [Log Out] [Stay Logged In]     │
└─────────────────────────────────┘
```

#### 4. HIPAA Compliance Banner
Display on login screen and footer:
```
🔒 DEMO ENVIRONMENT - Not HIPAA compliant
For demonstration purposes only. Do not enter real patient data.
```

**Environment Disclaimer Component:**
```javascript
function DemoDisclaimer() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
      <div className="flex">
        <AlertCircle className="text-amber-500 mr-3" />
        <div>
          <h3 className="font-semibold text-amber-800">Demo Environment</h3>
          <p className="text-sm text-amber-700">
            This is a prototype demonstration. In production, ShiftFlow implements:
          </p>
          <ul className="text-xs text-amber-600 mt-2 ml-4 list-disc">
            <li>HIPAA-compliant infrastructure (AWS HIPAA Eligible Services)</li>
            <li>End-to-end encryption (AES-256, TLS 1.3)</li>
            <li>SOC 2 Type II certification</li>
            <li>Role-based access control (RBAC)</li>
            <li>Comprehensive audit logging</li>
            <li>Business Associate Agreements (BAAs)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 SAMPLE DATA POPULATION

### Sample Patients (5-8 patients)

```javascript
const samplePatients = [
  {
    room_number: '421',
    name: 'Mary Williams',
    mrn: 'MRN-001234',
    age: 67,
    admission_date: '2026-03-05',
    diagnosis: 'CHF exacerbation, Diabetes Type 2',
    allergies: ['Penicillin', 'Latex'],
    diet: 'Cardiac, Diabetic',
    code_status: 'FULL_CODE',
    isolation_precautions: ['Contact Precautions'],
    // Pre-fill handoff data
    handoff: {
      pain_level: 3,
      mobility_level: 'ASSIST_X1',
      fall_risk_level: 'HIGH',
      skin_integrity: 'Stage 2 sacral ulcer, 2x3cm',
      iv_lines: ['Left AC'],
      foley_catheter: true,
      oxygen_support: 'Nasal cannula 2L',
      behavioral_notes: 'Oriented x3, cooperative',
      pending_tasks: ['PT consult scheduled 3/8']
    }
  },
  {
    room_number: '423',
    name: 'John Davis',
    mrn: 'MRN-001235',
    age: 54,
    admission_date: '2026-03-06',
    diagnosis: 'Post-op cholecystectomy, HTN',
    allergies: ['Sulfa'],
    diet: 'Regular',
    code_status: 'FULL_CODE',
    isolation_precautions: [],
    handoff: {
      pain_level: 6,
      mobility_level: 'ASSIST_X2',
      fall_risk_level: 'MEDIUM',
      skin_integrity: 'Intact',
      iv_lines: ['Right AC', 'PICC'],
      foley_catheter: false,
      oxygen_support: 'Room air',
      behavioral_notes: 'Anxious about pain control',
      pending_tasks: ['Pain reassessment q4h']
    }
  },
  {
    room_number: '425',
    name: 'Patricia Garcia',
    mrn: 'MRN-001236',
    age: 72,
    admission_date: '2026-03-04',
    diagnosis: 'Pneumonia, COPD',
    allergies: [],
    diet: 'Mechanical Soft',
    code_status: 'DNR',
    isolation_precautions: ['Droplet Precautions'],
    handoff: {
      pain_level: 2,
      mobility_level: 'INDEPENDENT',
      fall_risk_level: 'LOW',
      skin_integrity: 'Intact',
      iv_lines: [],
      foley_catheter: false,
      oxygen_support: 'BiPAP at night',
      behavioral_notes: 'Alert, follows commands',
      pending_tasks: ['Chest X-ray tomorrow AM']
    }
  },
  {
    room_number: '427',
    name: 'Robert Thompson',
    mrn: 'MRN-001237',
    age: 81,
    admission_date: '2026-03-03',
    diagnosis: 'Sepsis, UTI, Dementia',
    allergies: ['Codeine'],
    diet: 'Pureed',
    code_status: 'DNR',
    isolation_precautions: [],
    handoff: {
      pain_level: 4,
      mobility_level: 'TOTAL_LIFT',
      fall_risk_level: 'HIGH',
      skin_integrity: 'Redness noted on coccyx',
      iv_lines: ['Central line'],
      foley_catheter: true,
      oxygen_support: 'Nasal cannula 3L',
      behavioral_notes: 'Confused, combative at times. Needs 2 staff for care.',
      pending_tasks: ['Family meeting scheduled 3/8']
    }
  },
  {
    room_number: '429',
    name: 'Linda Martinez',
    mrn: 'MRN-001238',
    age: 59,
    admission_date: '2026-03-06',
    diagnosis: 'Acute MI, Diabetes Type 2',
    allergies: ['Aspirin'],
    diet: 'Cardiac, Diabetic, Low Sodium',
    code_status: 'FULL_CODE',
    isolation_precautions: [],
    handoff: {
      pain_level: 1,
      mobility_level: 'ASSIST_X1',
      fall_risk_level: 'MEDIUM',
      skin_integrity: 'Intact',
      iv_lines: ['Left AC'],
      foley_catheter: false,
      oxygen_support: 'Room air',
      behavioral_notes: 'Anxious, requesting frequent reassurance',
      pending_tasks: ['Cardiac rehab consult']
    }
  }
];
```

### Sample Task Generation Logic

For each patient, generate recurring tasks:

```javascript
function generateDailyTasks(patient, shift = 'DAY') {
  const tasks = [];
  const shiftStart = shift === 'DAY' ? 7 : 19; // 7 AM or 7 PM
  
  // Q2 Turns (if mobility limited)
  if (['ASSIST_X1', 'ASSIST_X2', 'TOTAL_LIFT'].includes(patient.handoff.mobility_level)) {
    for (let hour = shiftStart; hour < shiftStart + 12; hour += 2) {
      tasks.push({
        patient_id: patient.id,
        task_type: 'Q2_TURN',
        scheduled_time: `2026-03-07T${hour.toString().padStart(2, '0')}:00:00Z`
      });
    }
  }
  
  // Glucose checks (if diabetic)
  if (patient.diagnosis.includes('Diabetes')) {
    tasks.push(
      { task_type: 'GLUCOSE_CHECK', scheduled_time: '2026-03-07T07:00:00Z' },
      { task_type: 'GLUCOSE_CHECK', scheduled_time: '2026-03-07T11:30:00Z' },
      { task_type: 'GLUCOSE_CHECK', scheduled_time: '2026-03-07T17:00:00Z' }
    );
  }
  
  // Vitals Q4
  for (let hour = shiftStart; hour < shiftStart + 12; hour += 4) {
    tasks.push({
      task_type: 'REPEAT_VITALS',
      scheduled_time: `2026-03-07T${hour.toString().padStart(2, '0')}:00:00Z`
    });
  }
  
  // Foley output monitoring (if applicable)
  if (patient.handoff.foley_catheter) {
    tasks.push({
      task_type: 'FOLEY_OUTPUT',
      scheduled_time: `2026-03-07T${shiftStart}:00:00Z`
    });
  }
  
  return tasks;
}
```

---

## 🚀 DEPLOYMENT REQUIREMENTS

### Environment Variables

Create `.env` file:
```bash
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Supabase
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Config
VITE_APP_NAME=ShiftFlow
VITE_APP_VERSION=1.0.0-demo
```

### Vercel Deployment Steps

1. **Connect GitHub repo to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Build settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy:** Auto-deploy on `main` branch push

### Supabase Setup

1. **Create new Supabase project**
2. **Run SQL schema** (all table creation scripts)
3. **Enable Row Level Security (RLS):**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all records (for demo)
CREATE POLICY "Users can read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can read all patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Users can read all handoffs" ON handoffs FOR SELECT USING (true);

-- Policy: Users can insert/update their own records
CREATE POLICY "Users can insert vitals" ON vitals 
  FOR INSERT WITH CHECK (auth.uid()::text = recorded_by::text);

CREATE POLICY "Users can update tasks" ON tasks 
  FOR UPDATE USING (auth.uid()::text = assigned_to::text);

-- For demo: Allow all authenticated users to perform all operations
-- (In production, use stricter role-based policies)
```

4. **Enable Realtime** for:
   - `vitals`
   - `tasks`
   - `messages`
   - `handoffs`

5. **Seed sample data** (run SQL inserts for demo patients)

---

## 📝 DEVELOPMENT PRIORITIES

### Day 1 Focus (Critical Path)
1. ✅ Project setup (Vite + React + Tailwind + Supabase + Firebase)
2. ✅ Authentication flow (login → role-based routing)
3. ✅ Database schema creation + sample data population
4. ✅ Basic dashboard (patient list cards)
5. ✅ Vitals capture flow (simulated OCR → review → save)
6. ✅ Real-time vitals updates

### Day 2 Focus (Complete Features)
1. ✅ Shift handoff (entry form + view screen)
2. ✅ Task reminder system (list view + completion flow)
3. ✅ Patient messaging (conversation threads)
4. ✅ Admin analytics dashboard (charts + metrics)
5. ✅ Security indicators (encryption badge, audit log, disclaimer)
6. ✅ Deployment to Vercel
7. ✅ Testing across mobile devices

### Nice-to-Haves (If Time Permits)
- Dark mode toggle
- Offline mode (PWA)
- Care notes with AI categorization
- Export reports (CSV/PDF)
- Search/filter patients
- Voice note recording

---

## 🎯 SUCCESS METRICS FOR DEMO

### Technical Checklist
- [ ] Loads in <3 seconds on mobile
- [ ] Works on iPhone Safari, Chrome Android
- [ ] Real-time updates working (vitals, tasks, messages)
- [ ] No console errors in production
- [ ] Responsive on 375px-768px widths
- [ ] All user roles have distinct views
- [ ] Data persists across sessions

### Feature Completeness
- [ ] Can login as all 4 roles
- [ ] Can view patient list
- [ ] Can capture vitals (simulated OCR)
- [ ] Can view/create shift handoffs
- [ ] Can complete tasks
- [ ] Can send/receive messages
- [ ] Admin can view analytics dashboard

### Polish & Presentation
- [ ] Professional design (no placeholder text)
- [ ] Loading states for async operations
- [ ] Error handling with user-friendly messages
- [ ] Toast notifications for actions
- [ ] HIPAA disclaimer visible
- [ ] Security badges displayed

---

## 🛠️ SPECIFIC IMPLEMENTATION NOTES

### File Structure
```
shiftflow-demo/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.jsx
│   │   ├── dashboard/
│   │   │   ├── PatientCard.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── BottomNav.jsx
│   │   ├── vitals/
│   │   │   ├── VitalsCapture.jsx
│   │   │   ├── VitalsReview.jsx
│   │   │   └── VitalsHistory.jsx
│   │   ├── handoff/
│   │   │   ├── HandoffForm.jsx
│   │   │   └── HandoffView.jsx
│   │   ├── tasks/
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskCard.jsx
│   │   ├── messaging/
│   │   │   ├── MessageList.jsx
│   │   │   └── Conversation.jsx
│   │   ├── admin/
│   │   │   ├── Analytics.jsx
│   │   │   └── AuditLog.jsx
│   │   └── shared/
│   │       ├── Header.jsx
│   │       ├── SecurityBadge.jsx
│   │       └── DemoDisclaimer.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── RealtimeContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePatients.js
│   │   ├── useVitals.js
│   │   └── useTasks.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── supabase.js
│   │   └── api.js
│   ├── utils/
│   │   ├── validation.js
│   │   ├── notifications.js
│   │   └── dateHelpers.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── logo.png
├── .env
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### Key React Hooks Examples

**useAuth Hook:**
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Supabase
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', firebaseUser.uid)
          .single();
        setUser(data);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await auth.signInWithEmailAndPassword(email, password);
    return result.user;
  };

  const logout = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Real-time Vitals Hook:**
```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useVitals(patientId) {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchVitals();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`vitals:patient_id=eq.${patientId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vitals',
        filter: `patient_id=eq.${patientId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVitals(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [patientId]);

  async function fetchVitals() {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(10);
    
    if (!error) setVitals(data);
    setLoading(false);
  }

  return { vitals, loading };
}
```

### Simulated OCR Function
```javascript
export function simulateVitalsOCR(patientAge) {
  // Generate realistic vital signs based on age
  const baseValues = {
    systolic: patientAge > 65 ? 135 : 120,
    diastolic: patientAge > 65 ? 85 : 80,
    pulse: patientAge > 65 ? 75 : 72,
    temp: 98.6,
    rr: 16,
    spo2: patientAge > 70 ? 96 : 98
  };

  // Add random variation
  const vitals = {
    systolic_bp: baseValues.systolic + Math.floor(Math.random() * 10 - 5),
    diastolic_bp: baseValues.diastolic + Math.floor(Math.random() * 6 - 3),
    pulse: baseValues.pulse + Math.floor(Math.random() * 8 - 4),
    temperature: (baseValues.temp + (Math.random() * 1.0 - 0.5)).toFixed(1),
    respiratory_rate: baseValues.rr + Math.floor(Math.random() * 4 - 2),
    spo2: baseValues.spo2 + Math.floor(Math.random() * 3 - 1),
    ocr_confidence: (0.95 + Math.random() * 0.04).toFixed(2) // 95-99%
  };

  // Calculate MAP
  vitals.map = Math.round(
    (vitals.systolic_bp + 2 * vitals.diastolic_bp) / 3
  );

  return vitals;
}
```

---

## 🎬 DEMO SCRIPT FOR PITCH

### Opening (30 seconds)
1. Show login screen with demo credentials displayed
2. Login as "Sarah Johnson (CNA)"
3. Dashboard loads with 6 patients

### Vitals Capture Demo (60 seconds)
1. Tap "Capture Vitals" on Mary Williams (Room 421)
2. Tap "Scan Monitor" → Loading animation (2 sec)
3. Review extracted values → Show 97% confidence
4. Highlight abnormal BP warning
5. Confirm → Success toast
6. **Switch to admin view** → Show vitals appear instantly in analytics

### Task Management Demo (45 seconds)
1. Navigate to "Tasks" tab
2. Show overdue Q2 turn highlighted in red
3. Tap "Mark Complete" → Add note "Patient repositioned"
4. Task moves to completed list
5. **Real-time update visible on charge nurse dashboard**

### Messaging Demo (30 seconds)
1. Open message for Room 421
2. Show conversation history with RN
3. Send message: "BP still elevated, will recheck at 4 PM"
4. Message appears instantly
5. **Switch to RN view** → Show notification received

### Admin Analytics (30 seconds)
1. Switch to admin dashboard
2. Show metrics:
   - 96% vitals documentation (vs industry 80%)
   - 94.7% task completion
   - 3.2 min avg documentation time (down 45%)
3. Show 7-day trend chart
4. Highlight time savings

### Security Showcase (15 seconds)
1. Point out encryption badge in header
2. Open audit log modal
3. Show HIPAA disclaimer

**Closing Line:**  
*"This is how ShiftFlow eliminates 38 minutes of wasted time per vitals set, reduces documentation burden by 45%, and gives nurses back the time to care."*

---

## ✅ FINAL CHECKLIST BEFORE SUBMISSION

### Pre-Demo Testing
- [ ] Test on iPhone Safari (iOS 15+)
- [ ] Test on Chrome Android (latest)
- [ ] Test all 4 user roles
- [ ] Verify real-time updates work
- [ ] Check mobile responsiveness (375px, 414px, 768px)
- [ ] Test in incognito/private mode
- [ ] Ensure all links/buttons work
- [ ] Verify no broken images
- [ ] Test form validation
- [ ] Check loading states

### Performance
- [ ] Lighthouse score >90 (Performance, Accessibility)
- [ ] No console errors in production
- [ ] Images optimized (<200KB each)
- [ ] Lazy loading implemented for charts
- [ ] Bundle size <500KB (main JS)

### Content & Copy
- [ ] No Lorem Ipsum text
- [ ] All patient names/data realistic
- [ ] Error messages user-friendly
- [ ] Success toasts clear and concise
- [ ] HIPAA disclaimer visible on every screen

### Deployment
- [ ] Live URL works: https://shiftflow-demo.vercel.app
- [ ] SSL certificate valid (https)
- [ ] Environment variables set correctly
- [ ] Supabase tables populated with sample data
- [ ] Firebase auth configured
- [ ] No hardcoded API keys in code

---

## 📚 ADDITIONAL RESOURCES

### Documentation Links
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/start)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs)
- [Recharts Documentation](https://recharts.org/en-US/api)

### Design References
- Mobile health app UI patterns: Dribbble healthcare designs
- Hospital staff workflow apps: Similar to Voalte, TigerConnect
- Dashboard analytics: Inspired by Tableau Healthcare, Epic Reporting

---

## 🚨 KNOWN LIMITATIONS (Acknowledge in Pitch)

1. **OCR is simulated** (real OCR requires Tesseract.js + training data)
2. **No actual EHR integration** (Redox integration is Phase 2)
3. **Simplified RBAC** (production needs granular permissions)
4. **Demo data only** (not connected to real hospital systems)
5. **No offline mode** (requires service workers + IndexedDB)
6. **Push notifications basic** (production needs FCM/APNS)

**How to address:**  
*"This prototype demonstrates core workflows. In production, we'll integrate Tesseract.js for OCR, connect via Redox for EHR write-back, and implement full HIPAA compliance with SOC 2 certification."*

---

## 🎯 END GOAL

You should be able to demonstrate:
1. **Login** as any role → Correct dashboard appears
2. **Capture vitals** → Data saves and appears in real-time across all users
3. **Complete tasks** → Status updates instantly on all devices
4. **Send messages** → Conversation threads work smoothly
5. **View analytics** → Charts display meaningful metrics
6. **Security features** → Badges, audit logs, disclaimers visible

This demo proves **technical feasibility**, **user experience quality**, and **business value** for investors.

---

## 📞 TROUBLESHOOTING TIPS

### Common Issues & Fixes

**Issue:** Real-time updates not working  
**Fix:** Check Supabase Realtime is enabled for tables, verify subscription code

**Issue:** Firebase auth failing  
**Fix:** Verify API keys in `.env`, check Firebase console for enabled auth methods

**Issue:** Slow load times  
**Fix:** Enable code splitting in Vite config, lazy load components

**Issue:** Mobile viewport issues  
**Fix:** Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to index.html

**Issue:** Tailwind styles not applying  
**Fix:** Verify `tailwind.config.js` content paths include all component files

---

## 💬 QUESTIONS TO ASK CLAUDE CODE DURING BUILD

1. "How do I set up Supabase Row Level Security policies for role-based access?"
2. "What's the best way to structure real-time subscriptions for multiple tables?"
3. "How can I optimize bundle size for production deployment?"
4. "How do I implement browser push notifications for task reminders?"
5. "What's the cleanest way to handle form validation across multiple components?"

---

**END OF PRD**

---

**SUMMARY FOR CLAUDE CODE:**  

Build a mobile-first React web app (Vite + Tailwind + shadcn/ui + Supabase + Firebase) that demonstrates hospital bedside workflow management for CNAs, RNs, Charge Nurses, and Admins. Core features: shift handoffs, vitals capture (simulated OCR), task reminders with real-time updates, patient-linked messaging, and admin analytics dashboard. Deploy to Vercel with live demo URL. Timeline: 1-2 days. Must work flawlessly on mobile browsers with professional healthcare aesthetic. Include security badges, audit logging, and HIPAA disclaimer. Pre-populate with 5-8 sample patients and realistic demo data. Focus on real-time functionality using Supabase subscriptions.

**Key Constraints:**  
- Mobile-first (375px+ widths)
- Real-time updates critical
- Professional design (no placeholder content)
- Deployable to live URL
- Works on iPhone Safari + Chrome Android

**Tech Stack Lock:**  
React 18 + Vite + Tailwind + shadcn/ui + Material-UI + Lucide icons + Supabase (PostgreSQL + Realtime) + Firebase Auth + Recharts + Vercel hosting

**Priority Order:**  
1. Auth + Dashboard + Vitals capture  
2. Tasks + Handoffs + Messaging  
3. Admin analytics + Security features  
4. Polish + Deploy + Test

Let's build this! 🚀
