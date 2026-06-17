import type { CategorizedStudent, StudentCategory, CategoryResponsible, Learner } from "./types"
import { mockStudents } from "./mock-data"

export const TUTORIAL_DATES = [
  { date: "14 Feb 2024", time: "09:51 PM - 09:47 PM" },
  { date: "19 Feb 2024", time: "08:08 PM - 10:03 PM" },
  { date: "21 Feb 2024", time: "07:12 PM - 09:03 PM" },
  { date: "4 Mar 2024", time: "10:00 PM - 11:00 PM" },
  { date: "9 Mar 2024", time: "09:05 PM - 10:03 PM" },
  { date: "19 Mar 2024", time: "12:00 PM - 01:00 PM" },
  { date: "20 Mar 2024", time: "11:00 PM - 01:00 PM" },
  { date: "27 Mar 2024", time: "12:00 PM - 02:00 PM" },
]

export const CATEGORY_CONFIG: Record<
  StudentCategory,
  { label: string; responsible: CategoryResponsible; color: string; bgColor: string; headerBg: string; description: string }
> = {
  dropout: {
    label: "Dropout",
    responsible: "AD",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    headerBg: "bg-gray-200 dark:bg-gray-700",
    description: "Students who dropped out or cancelled modules",
  },
  inactive: {
    label: "Inactive",
    responsible: "AD",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50 dark:bg-red-950",
    headerBg: "bg-red-100 dark:bg-red-900",
    description: "Failed/absent students with poor attendance",
  },
  "suspended-risk": {
    label: "Suspended-Risk",
    responsible: "HOD",
    color: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-rose-50 dark:bg-rose-950",
    headerBg: "bg-rose-100 dark:bg-rose-900",
    description: "Failed students despite good attendance",
  },
  active: {
    label: "Active",
    responsible: "HOD",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    headerBg: "bg-emerald-100 dark:bg-emerald-900",
    description: "Passing students with poor attendance",
  },
}

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function formatDuration(rng: () => number): string | null {
  if (rng() < 0.45) return null
  if (rng() < 0.15) return "Present"
  const h = Math.floor(rng() * 2)
  const m = Math.floor(rng() * 60)
  const s = Math.floor(rng() * 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function classifyStudent(s: Learner): StudentCategory {
  if (s.hasDroppedOut) return "dropout"

  const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
  const passed = avgScore >= 50
  const goodAttendance = s.attendance.percentage >= 70

  if (!passed && !goodAttendance) return "inactive"
  if (!passed && goodAttendance) return "suspended-risk"
  if (passed && !goodAttendance) return "active"

  // passed + good attendance -> active (healthy but tracked)
  return "active"
}

function learnerToCategorized(s: Learner, category: StudentCategory): CategorizedStudent {
  const rng = seededRng(s.id * 31 + 7)

  const tutorials = TUTORIAL_DATES.map(() => {
    const dur = formatDuration(rng)
    if (!dur) return null
    return { date: "", time: "", duration: dur }
  })

  const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3

  let academicProgress = ""
  if (category === "dropout") {
    academicProgress = s.financiallyExcluded
      ? "Financially excluded — dropped out"
      : "Cancelled / withdrew from module"
  } else if (category === "inactive") {
    academicProgress = avgScore === 0
      ? "ABSENT S1 & Assignments 0% + NOT"
      : `ABSENT S1 + POOR ATTENDANCE + STATUS`
  } else if (category === "suspended-risk") {
    academicProgress = `FAILED S1 + STATUS`
  } else {
    academicProgress = "POOR ATTENDANCE + STATUS"
  }

  let statusLabel = s.academicStatus as string
  if (s.isReadmitted) statusLabel = "Readmitted"
  if (s.isOnProbation) statusLabel = "Probation"

  return {
    id: s.id,
    name: `${s.name} ${s.surname}`,
    studentNumber: s.studentNumber,
    email: s.email,
    academicStatus: statusLabel,
    academicProgress,
    lectureAttendance: s.attendance.percentage,
    individualAssignments: s.assessments.AS,
    groupWork: s.assessments.PP,
    s1Score: Math.round(avgScore),
    tutorials,
    onlineStudyDate: rng() < 0.2 ? "Present" : "",
    contactSmartphone: rng() < 0.25 ? `${Math.floor(rng() * 2)}h ${Math.floor(rng() * 60)}m ${Math.floor(rng() * 60)}s` : "",
    usageStudyStyle: rng() < 0.2 ? (rng() < 0.4 ? "Present" : `${Math.floor(rng() * 10)}h ${Math.floor(rng() * 60)}m`) : "",
    category,
    moduleCode: s.moduleCode,
  }
}

let _cache: CategorizedStudent[] | null = null

function buildAll(): CategorizedStudent[] {
  if (_cache) return _cache
  _cache = mockStudents.map((s) => {
    const cat = classifyStudent(s)
    return learnerToCategorized(s, cat)
  })
  return _cache
}

export function getCategorizedStudents(category?: StudentCategory, moduleCode?: string): CategorizedStudent[] {
  let students = buildAll()
  if (category) students = students.filter((s) => s.category === category)
  if (moduleCode && moduleCode !== "all") students = students.filter((s) => s.moduleCode === moduleCode)
  return students
}

export function getCategoryCounts(moduleCode?: string): Record<StudentCategory, number> {
  let students = buildAll()
  if (moduleCode && moduleCode !== "all") students = students.filter((s) => s.moduleCode === moduleCode)
  return {
    dropout: students.filter((s) => s.category === "dropout").length,
    inactive: students.filter((s) => s.category === "inactive").length,
    "suspended-risk": students.filter((s) => s.category === "suspended-risk").length,
    active: students.filter((s) => s.category === "active").length,
  }
}

export function getAvailableModules(): string[] {
  const all = buildAll()
  const set = new Set<string>()
  for (const s of all) {
    if (s.moduleCode) set.add(s.moduleCode)
  }
  return Array.from(set).sort()
}
