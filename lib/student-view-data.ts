import {
  getSasoFacultyAnalysisData,
  getQualificationName,
  SASO_DASHBOARD_STATS,
  type SasofacultyRecord,
} from "@/lib/tut-saso-data"

export interface StudentModule {
  code: string
  name: string
  department: string
  campus: string
  qualificationCode: string
  qualificationName: string
  blockCode: string
  credits: number
  nqfLevel: number
  semester: "Semester 1" | "Semester 2" | "Year Module"
  currentMark: number | null
  attendanceRate: number
  lecturer: string
  status: "Registered" | "In Progress" | "Completed"
  riskLevel: "Good" | "At Risk" | "Satisfactory"
}

export interface StudentAssignment {
  id: string
  moduleCode: string
  moduleName: string
  title: string
  type: "Assignment" | "Class Test" | "Written Report" | "Project"
  dueDate: Date
  status: "pending" | "submitted" | "graded"
  maxMarks: number
  obtainedMarks?: number
}

export interface StudentActivity {
  title: string
  moduleCode: string
  time: string
  type: "submission" | "grade" | "attendance" | "announcement"
}

const LECTURERS = [
  "Dr. N. Mokoena",
  "Prof. S. van Wyk",
  "Ms. T. Ndlovu",
  "Mr. K. Pillay",
  "Dr. L. Khumalo",
  "Prof. R. Dlamini",
]

function hashCode(value: string): number {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function formatDepartment(raw: string): string {
  return raw
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ")
}

function inferCredits(blockCode: string): number {
  return blockCode === "0" ? 8 : 12
}

function inferNqfLevel(blockCode: string): number {
  return blockCode === "0" ? 5 : 6
}

function inferSemester(code: string, blockCode: string): StudentModule["semester"] {
  if (code.endsWith("X") || blockCode === "0") return "Semester 1"
  const levelDigit = code.match(/\d/)?.[0]
  if (levelDigit === "1") return "Semester 1"
  if (levelDigit === "2") return "Semester 2"
  return "Year Module"
}

function inferRiskLevel(mark: number | null, attendance: number): StudentModule["riskLevel"] {
  if (mark === null) return attendance >= 80 ? "Satisfactory" : "At Risk"
  if (mark < 50 || attendance < 75) return "At Risk"
  if (mark < 60) return "Satisfactory"
  return "Good"
}

function recordToStudentModule(record: SasofacultyRecord): StudentModule {
  const hash = hashCode(record.moduleCode)
  const currentMark = 48 + (hash % 42)
  const attendanceRate = 72 + (hash % 26)
  const lecturer = LECTURERS[hash % LECTURERS.length]

  return {
    code: record.moduleCode,
    name: record.moduleName,
    department: formatDepartment(record.departmentName),
    campus: record.campus,
    qualificationCode: record.qualificationCode,
    qualificationName: record.qualificationName || getQualificationName(record.qualificationCode),
    blockCode: record.blockCode,
    credits: inferCredits(record.blockCode),
    nqfLevel: inferNqfLevel(record.blockCode),
    semester: inferSemester(record.moduleCode, record.blockCode),
    currentMark,
    attendanceRate,
    lecturer,
    status: currentMark >= 50 ? "In Progress" : "Registered",
    riskLevel: inferRiskLevel(currentMark, attendanceRate),
  }
}

export interface StudentEnrollment {
  department: string
  qualificationCode: string
  qualificationName: string
  campus: string
}

export const DEFAULT_STUDENT_QUALIFICATION = "DPIF20"
const ENROLLMENT_STORAGE_KEY = "student_view_enrollment"

const QUALIFICATION_DEPARTMENT: Record<string, string> = {
  DPRS20: "Computer Science",
  DPRSF0: "Computer Science",
  DPIF20: "Informatics",
  DPIFF0: "Informatics",
  DPIT20: "Information Technology",
  DPITF0: "Information Technology",
  DPMC20: "Computer Science",
  DPMCF0: "Computer Science",
  DPYE20_NP6602: "Computer Systems Engineering",
  DPYEF0: "Computer Systems Engineering",
}

function getAllTutModules(): StudentModule[] {
  const seen = new Set<string>()
  const modules: StudentModule[] = []

  for (const record of getSasoFacultyAnalysisData()) {
    if (seen.has(record.moduleCode)) continue
    seen.add(record.moduleCode)
    modules.push(recordToStudentModule(record))
  }

  return modules.sort((a, b) => a.code.localeCompare(b.code))
}

export function getDepartmentForQualification(qualificationCode: string): string {
  return QUALIFICATION_DEPARTMENT[qualificationCode] ?? "Informatics"
}

export function getStoredStudentQualification(): string {
  if (typeof window === "undefined") return DEFAULT_STUDENT_QUALIFICATION
  try {
    const stored = localStorage.getItem(ENROLLMENT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as { qualificationCode?: string }
      if (parsed.qualificationCode) return parsed.qualificationCode
    }
  } catch {
    // ignore
  }
  return DEFAULT_STUDENT_QUALIFICATION
}

export function saveStudentEnrollment(qualificationCode: string, campus: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(
    ENROLLMENT_STORAGE_KEY,
    JSON.stringify({ qualificationCode, campus }),
  )
}

/** A student belongs to exactly one department; modules are scoped to that department. */
export function getStudentEnrollment(): StudentEnrollment {
  const qualificationCode = getStoredStudentQualification()
  const department = getDepartmentForQualification(qualificationCode)

  let campus = "SOSHANGUVE (SOUTH)"
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ENROLLMENT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { campus?: string }
        if (parsed.campus) campus = parsed.campus.toUpperCase()
      }
    } catch {
      // ignore
    }
  }

  return {
    department,
    qualificationCode,
    qualificationName: getQualificationName(qualificationCode),
    campus,
  }
}

/** Registered modules for the student's single home department. */
export function getStudentViewModules(): StudentModule[] {
  const { department } = getStudentEnrollment()
  return getAllTutModules().filter((mod) => mod.department === department)
}

export function getStudentModuleByCode(code: string): StudentModule | undefined {
  return getStudentViewModules().find((m) => m.code === code)
}

export function getStudentDashboardSummary(modules: StudentModule[]) {
  const totalCredits = modules.reduce((sum, m) => sum + m.credits, 0)
  const averageMark =
    modules.length > 0
      ? modules.reduce((sum, m) => sum + (m.currentMark ?? 0), 0) / modules.length
      : 0
  const averageAttendance =
    modules.length > 0
      ? modules.reduce((sum, m) => sum + m.attendanceRate, 0) / modules.length
      : 0
  const atRiskCount = modules.filter((m) => m.riskLevel === "At Risk").length
  const aps = Math.min(4, Math.max(1.5, (averageMark / 25) * 0.8 + (averageAttendance / 100) * 1.2))

  const enrollment = getStudentEnrollment()

  return {
    academicYear: SASO_DASHBOARD_STATS.academicYear,
    semester: "Semester 1",
    department: enrollment.department,
    qualificationName: enrollment.qualificationName,
    campus: enrollment.campus,
    registeredModules: modules.length,
    totalCredits,
    averageMark: Math.round(averageMark),
    averageAttendance: Math.round(averageAttendance),
    aps: Number(aps.toFixed(2)),
    academicStanding: atRiskCount > 2 ? "Probation" : atRiskCount > 0 ? "Satisfactory" : "Good Standing",
    atRiskModules: atRiskCount,
  }
}

const ASSIGNMENT_TITLES = [
  "Assignment 1: Theory Review",
  "Assignment 2: Practical Implementation",
  "Class Test 1",
  "Written Report: Case Study",
  "Group Project Submission",
  "Tutorial Exercise Portfolio",
]

export function getStudentAssignments(modules: StudentModule[]): StudentAssignment[] {
  const assignments: StudentAssignment[] = []
  const now = new Date()

  modules.slice(0, 12).forEach((mod, index) => {
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 3 + index * 2)
    const status: StudentAssignment["status"] =
      index % 4 === 0 ? "graded" : index % 3 === 0 ? "submitted" : "pending"

    assignments.push({
      id: `asn-${mod.code}-${index}`,
      moduleCode: mod.code,
      moduleName: mod.name,
      title: ASSIGNMENT_TITLES[index % ASSIGNMENT_TITLES.length],
      type: index % 2 === 0 ? "Assignment" : "Class Test",
      dueDate,
      status,
      maxMarks: 100,
      obtainedMarks: status === "graded" ? 55 + (hashCode(mod.code) % 40) : undefined,
    })
  })

  return assignments
}

export function getStudentRecentActivity(modules: StudentModule[]): StudentActivity[] {
  const sample = modules.slice(0, 5)
  return [
    {
      title: `Marked ${sample[0]?.code ?? "PPA115D"} Assignment 1`,
      moduleCode: sample[0]?.code ?? "PPA115D",
      time: "2 hours ago",
      type: "grade",
    },
    {
      title: `Submitted ${sample[1]?.code ?? "SYA216D"} Written Report`,
      moduleCode: sample[1]?.code ?? "SYA216D",
      time: "Yesterday",
      type: "submission",
    },
    {
      title: `Attendance recorded for ${sample[2]?.code ?? "CN1115D"} lecture`,
      moduleCode: sample[2]?.code ?? "CN1115D",
      time: "2 days ago",
      type: "attendance",
    },
    {
      title: `New announcement in ${sample[3]?.code ?? "DBA216D"}`,
      moduleCode: sample[3]?.code ?? "DBA216D",
      time: "3 days ago",
      type: "announcement",
    },
  ]
}

export const STUDENT_QUALIFICATION_OPTIONS = [
  { code: "DPRS20", name: "Dip (Computer Science)" },
  { code: "DPIF20", name: "Dip (Informatics)" },
  { code: "DPIT20", name: "Dip (Information Technology)" },
  { code: "DPMC20", name: "Dip (Multimedia Computing)" },
  { code: "DPYE20_NP6602", name: "Dip (Computer Systems Engineering)" },
]

export function getModuleCountLabel(): string {
  const { department } = getStudentEnrollment()
  const count = getStudentViewModules().length
  return `${count} modules in ${department}`
}
