import type { AttendanceMark, AttendanceSession, AttendanceSessionSettings, AttendanceCaptureMethod } from "./types"
import { mockIdentifiedModules } from "@/lib/mock/module-identification"

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID()
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function nowIso(): string {
  return new Date().toISOString()
}

function generateJoinCode(): string {
  // 6 digits, easy to dictate over a call
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

const FIRST_NAMES = [
  "Sifiso",
  "Michael",
  "Sophia",
  "Amina",
  "Lerato",
  "Thabo",
  "Naledi",
  "Kagiso",
  "Zanele",
  "Ayanda",
  "Noah",
  "Ethan",
  "Olivia",
  "Emma",
  "Liam",
  "Mia",
  "Chloe",
  "Daniel",
  "Hannah",
  "Lucas",
]

const LAST_NAMES = [
  "Mazibuko",
  "Chen",
  "Martinez",
  "Ndlovu",
  "Dlamini",
  "Mokoena",
  "Nkosi",
  "Naidoo",
  "Pillay",
  "Smith",
  "Johnson",
  "Brown",
  "Jones",
  "Garcia",
  "Rodriguez",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
]

function makeStudent(studentId: number) {
  const first = FIRST_NAMES[studentId % FIRST_NAMES.length] ?? "Student"
  const last = LAST_NAMES[(studentId * 7) % LAST_NAMES.length] ?? "User"
  const studentNumber = `ST2024${String(studentId).padStart(3, "0")}`
  return { studentId, studentNumber, studentName: `${first} ${last}` }
}

type CreateSessionInput = AttendanceSessionSettings & {
  startedByUserId: string
  startedByUserName: string
}

type EndSessionInput = {
  sessionId: string
  endedByUserId: string
  endedByUserName: string
}

type CreateMarkInput = {
  sessionId: string
  studentId: number
  studentNumber: string
  studentName: string
  method: AttendanceCaptureMethod
  capturedByUserId?: string
  capturedByUserName?: string
  studentDurationMinutes?: number
  knowledgeObtained?: string
}

// In-memory store (demo).
// Use a global singleton so route handlers share state in a single Node process.
const storeKey = "__ipass_attendance_store__"
const globalStore = globalThis as unknown as Record<string, { sessions: AttendanceSession[]; marks: AttendanceMark[] } | undefined>
if (!globalStore[storeKey]) {
  globalStore[storeKey] = { sessions: [], marks: [] }
}
const sessions = globalStore[storeKey]!.sessions
const marks = globalStore[storeKey]!.marks

const QUALIFICATION_BY_DEPARTMENT: Record<string, { code: string; name: string }> = {
  Education: { code: "BEd", name: "Bachelor of Education" },
  Humanities: { code: "BA", name: "Bachelor of Arts" },
  Agriculture: { code: "BAgric", name: "Bachelor of Agriculture" },
  Sciences: { code: "BSc", name: "Bachelor of Science" },
  "Health Professions": { code: "BSc", name: "Bachelor of Science (Health)" },
  Management: { code: "BCom", name: "Bachelor of Commerce" },
  Accounting: { code: "BCom", name: "Bachelor of Commerce (Accounting)" },
  Marketing: { code: "BCom", name: "Bachelor of Commerce (Marketing)" },
  "Management Information Systems (MIS)": { code: "BCom", name: "Bachelor of Commerce (MIS)" },
  Theology: { code: "BTh", name: "Bachelor of Theology" },
  "Chaplaincy / Religious Studies": { code: "BTh", name: "Bachelor of Theology (Chaplaincy)" },
}

const SESSIONS_PER_MODULE = 3
const CLASS_TYPES_PER_MODULE: ("Lecture Session" | "Tutorial Session" | "Mentor Session")[] = [
  "Lecture Session",
  "Tutorial Session",
  "Mentor Session",
]
const DELIVERY_MODES = ["physical", "online", "hybrid"] as const

function seedFromModules(uniqueModules: { department: string; moduleCode: string }[]) {
  const now = new Date()
  const scheduled = new Date(now)
  scheduled.setHours(9, 0, 0, 0)

  let firstSessionId: string | null = null
  let sessionIndex = 0

  for (const mod of uniqueModules) {
    const qual = QUALIFICATION_BY_DEPARTMENT[mod.department] ?? { code: "BSc", name: "Bachelor" }

    for (let k = 0; k < SESSIONS_PER_MODULE; k++) {
      const sessionId = uuid()
      const isFirstActive = firstSessionId === null && k === 0
      if (isFirstActive) firstSessionId = sessionId

      // Spread dates over the past 2–4 weeks (sessionIndex drives variety)
      const daysAgo = (sessionIndex % 28) + 1
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - daysAgo)
      startDate.setHours(9 + (sessionIndex % 4), (sessionIndex % 3) * 20, 0, 0)
      const durationMin = 50 + (sessionIndex % 70)
      const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000)

      sessions.push({
        id: sessionId,
        status: isFirstActive ? "active" : "ended",
        startedAt: startDate.toISOString(),
        startedByUserId: "1",
        startedByUserName: "Molebogeng Mashilo",
        ...(isFirstActive ? {} : { endedAt: endDate.toISOString(), endedByUserId: "1", endedByUserName: "Molebogeng Mashilo" }),
        groupId: "10A",
        department: mod.department,
        qualificationCode: qual.code,
        qualificationName: qual.name,
        moduleCode: mod.moduleCode,
        classType: CLASS_TYPES_PER_MODULE[k],
        scheduledStartAt: startDate.toISOString(),
        classDurationMinutes: durationMin,
        deliveryMode: DELIVERY_MODES[sessionIndex % DELIVERY_MODES.length],
        onlineJoinCode: isFirstActive && DELIVERY_MODES[sessionIndex % DELIVERY_MODES.length] !== "physical" ? "123456" : undefined,
      })

      // Ensure every session has attendance marks (no "0 attendees" sessions in demo).
      // Deterministic per sessionId for stable UI across reloads.
      const rng = seededRandom(hashString(sessionId))
      const attendeeCount = 8 + Math.floor(rng() * 33) // 8–40
      const baseStudentId = 1 + Math.floor(rng() * 60) // pick a starting offset into a 60-student pool
      for (let i = 0; i < attendeeCount; i++) {
        const studentId = 1 + ((baseStudentId + i) % 60)
        const student = makeStudent(studentId)
        const capturedOffsetMin = Math.floor(rng() * Math.min(25, Math.max(5, Math.floor(durationMin / 2))))
        const capturedAt = new Date(startDate.getTime() + capturedOffsetMin * 60 * 1000).toISOString()
        marks.push({
          id: uuid(),
          sessionId,
          studentId: student.studentId,
          studentNumber: student.studentNumber,
          studentName: student.studentName,
          capturedAt,
          capturedByUserId: "1",
          capturedByUserName: "Molebogeng Mashilo",
          method: rng() > 0.65 ? "fingerprint" : "manual",
          studentDurationMinutes: Math.max(20, durationMin - Math.floor(rng() * 15)),
          knowledgeObtained: "Participated in the session activities.",
        })
      }

      sessionIndex++
    }
  }

  // (We now seed marks per-session above.)
}

function seedDemoData() {
  if (sessions.length > 0 || marks.length > 0) return
  const seen = new Set<string>()
  const uniqueModules: { department: string; moduleCode: string }[] = []
  for (const m of mockIdentifiedModules) {
    const key = `${m.department}|${m.moduleCode}`
    if (seen.has(key)) continue
    seen.add(key)
    uniqueModules.push({ department: m.department, moduleCode: m.moduleCode })
  }
  if (uniqueModules.length === 0) {
    uniqueModules.push(
      { department: "Education", moduleCode: "EDU101" },
      { department: "Education", moduleCode: "EDU102" },
      { department: "Humanities", moduleCode: "HUM101" },
    )
  }
  seedFromModules(uniqueModules)
}

/** Call from API route with explicit module list so server seeds same modules as client. */
export function ensureSessionsSeeded(modules: Array<{ department: string; moduleCode: string }>) {
  if (sessions.length > 0) return
  const seen = new Set<string>()
  const unique: { department: string; moduleCode: string }[] = []
  for (const m of modules) {
    const key = `${m.department}|${m.moduleCode}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push({ department: m.department, moduleCode: m.moduleCode })
  }
  if (unique.length === 0) return
  seedFromModules(unique)
}

seedDemoData()

export function listAttendanceSessions(): AttendanceSession[] {
  if (sessions.length === 0) seedDemoData()
  return [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export function getActiveAttendanceSession(): AttendanceSession | null {
  const active = sessions.find((s) => s.status === "active")
  return active ?? null
}

export function getAttendanceSession(sessionId: string): AttendanceSession | null {
  return sessions.find((s) => s.id === sessionId) ?? null
}

export function createAttendanceSession(input: CreateSessionInput): AttendanceSession {
  const existing = getActiveAttendanceSession()
  if (existing) {
    // Idempotent if same starter; otherwise don't silently "join" someone else's session
    if (existing.startedByUserId !== input.startedByUserId) {
      throw new Error(`An active class is already running (started by ${existing.startedByUserName}). Please ask them to end it first.`)
    }
    return existing
  }

  const session: AttendanceSession = {
    id: uuid(),
    status: "active",
    startedAt: nowIso(),
    startedByUserId: input.startedByUserId,
    startedByUserName: input.startedByUserName,
    groupId: input.groupId,
    department: input.department,
    qualificationCode: input.qualificationCode,
    qualificationName: input.qualificationName,
    moduleCode: input.moduleCode,
    classType: input.classType,
    orientationSession: input.orientationSession,
    otherClassTypeLabel: input.otherClassTypeLabel,
    scheduledStartAt: input.scheduledStartAt,
    classDurationMinutes: input.classDurationMinutes,
    deliveryMode: input.deliveryMode,
    onlineJoinCode: input.deliveryMode === "physical" ? undefined : generateJoinCode(),
  }

  sessions.push(session)
  return session
}

export function endAttendanceSession(input: EndSessionInput): AttendanceSession {
  const session = getAttendanceSession(input.sessionId)
  if (!session) {
    throw new Error("Session not found")
  }
  if (session.status !== "active") {
    return session
  }
  if (session.startedByUserId !== input.endedByUserId) {
    throw new Error("Only the user who started the class can end it")
  }

  const ended: AttendanceSession = {
    ...session,
    status: "ended",
    endedAt: nowIso(),
    endedByUserId: input.endedByUserId,
    endedByUserName: input.endedByUserName,
  }

  const idx = sessions.findIndex((s) => s.id === session.id)
  sessions[idx] = ended
  return ended
}

export function listAttendanceMarks(sessionId: string): AttendanceMark[] {
  return marks
    .filter((m) => m.sessionId === sessionId)
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
}

export function createAttendanceMark(input: CreateMarkInput): AttendanceMark {
  const session = getAttendanceSession(input.sessionId)
  if (!session || session.status !== "active") {
    throw new Error("No active session")
  }

  const already = marks.find((m) => m.sessionId === input.sessionId && m.studentId === input.studentId)
  if (already) return already

  const mark: AttendanceMark = {
    id: uuid(),
    sessionId: input.sessionId,
    studentId: input.studentId,
    studentNumber: input.studentNumber,
    studentName: input.studentName,
    capturedAt: nowIso(),
    capturedByUserId: input.capturedByUserId,
    capturedByUserName: input.capturedByUserName,
    method: input.method,
    studentDurationMinutes: input.studentDurationMinutes,
    knowledgeObtained: input.knowledgeObtained,
  }

  marks.push(mark)
  return mark
}

export function findSessionByJoinCode(code: string): AttendanceSession | null {
  const normalized = code.trim()
  if (!normalized) return null
  return sessions.find((s) => s.status === "active" && s.onlineJoinCode === normalized) ?? null
}

