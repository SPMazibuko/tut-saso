import type { Learner } from "@/lib/types"
import { SASO_DASHBOARD_STATS } from "@/lib/tut-saso-data"
import { formatStudentNumber } from "@/lib/student-numbers"

export const CLASSLIST_ACADEMIC_YEAR = SASO_DASHBOARD_STATS.academicYear

export const CLASSLIST_GROUPS = [
  {
    id: "0",
    name: "Block 0",
    description: "Foundation / Extended programme",
  },
  {
    id: "1",
    name: "Block 1",
    description: "First-year main stream",
  },
  {
    id: "2",
    name: "Block 2",
    description: "Second year and above",
  },
] as const

export const CLASSLIST_MODULES = [
  {
    id: "1",
    code: "16E105X",
    name: "COMMUNICATION FOR ACADEMIC PURPOSE",
    campus: "Soshanguve (South)",
    department: "ICT 1st Year & Foundation Unit",
    riskLevel: "low" as const,
    stats: {
      probation: 8,
      readmitted: 3,
      repeaters: { first: 4, second: 2, third: 1, fourth: 0 },
      firstTime: 52,
      total: 73,
    },
  },
  {
    id: "2",
    code: "PPA115D",
    name: "PRINCIPLES OF PROGRAMMING A",
    campus: "Soshanguve (South)",
    department: "Computer Science",
    riskLevel: "medium" as const,
    stats: {
      probation: 14,
      readmitted: 5,
      repeaters: { first: 12, second: 6, third: 2, fourth: 1 },
      firstTime: 158,
      total: 194,
    },
  },
  {
    id: "3",
    code: "SYA216D",
    name: "SYSTEM ANALYSIS A",
    campus: "Polokwane",
    department: "Informatics",
    riskLevel: "low" as const,
    stats: {
      probation: 9,
      readmitted: 4,
      repeaters: { first: 7, second: 3, third: 1, fourth: 0 },
      firstTime: 118,
      total: 144,
    },
  },
  {
    id: "4",
    code: "ADS216D",
    name: "ADVANCED DISCRETE STRUCTURES",
    campus: "eMalahleni",
    department: "Computer Science",
    riskLevel: "medium" as const,
    stats: {
      probation: 6,
      readmitted: 2,
      repeaters: { first: 5, second: 2, third: 0, fourth: 0 },
      firstTime: 84,
      total: 102,
    },
  },
  {
    id: "5",
    code: "CN1115D",
    name: "COMPUTER NETWORKS 115R",
    campus: "Soshanguve (South)",
    department: "Information Technology",
    riskLevel: "low" as const,
    stats: {
      probation: 3,
      readmitted: 1,
      repeaters: { first: 2, second: 1, third: 0, fourth: 0 },
      firstTime: 30,
      total: 38,
    },
  },
  {
    id: "6",
    code: "BUA216D",
    name: "BUSINESS ANALYSIS A",
    campus: "Polokwane",
    department: "Informatics",
    riskLevel: "low" as const,
    stats: {
      probation: 5,
      readmitted: 2,
      repeaters: { first: 4, second: 1, third: 0, fourth: 0 },
      firstTime: 72,
      total: 87,
    },
  },
] as const

const MODULE_CODES = CLASSLIST_MODULES.map((module) => module.code)
const GROUP_IDS = CLASSLIST_GROUPS.map((group) => group.id)

export interface ClasslistMockStudent extends Learner {
  moduleCode: string
  previousModules: string[]
  group: string
  campus?: string
}

const FIRST_NAMES = [
  "Thabo",
  "Nomvula",
  "Sipho",
  "Lerato",
  "Bongani",
  "Zanele",
  "Kamogelo",
  "Tshepo",
  "Ayanda",
  "Nomsa",
  "Jabu",
  "Precious",
  "Mandla",
  "Refilwe",
  "Sibusiso",
  "Karabo",
  "Dineo",
  "Mpho",
  "Lungile",
  "Kagiso",
]

const LAST_NAMES = [
  "Mokoena",
  "Ndlovu",
  "Khumalo",
  "Dlamini",
  "Nkosi",
  "Mthembu",
  "Pretorius",
  "Van Wyk",
  "Mahlangu",
  "Sithole",
  "Naidoo",
  "Pillay",
  "Govender",
  "Molefe",
  "Modise",
  "Baloyi",
  "Mabena",
  "Cele",
  "Zulu",
  "Maseko",
]

const ACADEMIC_STATUSES: ClasslistMockStudent["academicStatus"][] = [
  "First-time",
  "Repeating Subject",
  "Repeating Subject",
  "Repeating Subject",
  "Academic Warning",
]

function buildStudent(
  id: number,
  studentNumber: string,
  name: string,
  surname: string,
  moduleCode: string,
  group: string,
  academicStatus: ClasslistMockStudent["academicStatus"],
  assessments: ClasslistMockStudent["assessments"],
  attendance: ClasslistMockStudent["attendance"],
  riskLevel: ClasslistMockStudent["riskLevel"],
  previousModules: string[],
  campus?: string,
): ClasslistMockStudent {
  return {
    id,
    studentNumber,
    name,
    surname,
    email: `${name.toLowerCase()}.${surname.toLowerCase()}@mytut.ac.za`,
    academicStatus,
    subjectCode: moduleCode,
    moduleCode,
    assessments,
    attendance,
    riskLevel,
    enrollmentYear: CLASSLIST_ACADEMIC_YEAR,
    semester: 1,
    teacherId: (id % 3) + 1,
    previousSubjects: previousModules,
    previousModules,
    group,
    campus,
  }
}

function generateAdditionalStudents(): ClasslistMockStudent[] {
  const students: ClasslistMockStudent[] = []
  let studentId = 12
  let studentSequence = 12

  for (let i = 0; i < 119; i++) {
    const name = FIRST_NAMES[i % FIRST_NAMES.length]
    const surname = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]
    const moduleCode = MODULE_CODES[i % MODULE_CODES.length]
    const group = GROUP_IDS[i % GROUP_IDS.length]
    const academicStatus = ACADEMIC_STATUSES[i % ACADEMIC_STATUSES.length]
    const moduleMeta = CLASSLIST_MODULES.find((module) => module.code === moduleCode)

    const registeredModulesCount = 3 + (i % 5)
    const previousModulesCount = registeredModulesCount - 1
    let previousModules: string[] = []

    for (let j = 0; j < previousModulesCount; j++) {
      previousModules.push(MODULE_CODES[(i + j) % MODULE_CODES.length])
    }

    if (academicStatus === "First-time") {
      const firstTimeModulesCount = 2 + (i % 3)
      previousModules = []
      for (let j = 0; j < firstTimeModulesCount; j++) {
        previousModules.push(MODULE_CODES[(i + j) % MODULE_CODES.length])
      }
    }

    const baseScore = 50 + (i % 45)
    const as = baseScore + (i % 10) - 5
    const ct = baseScore + (i % 8) - 4
    const wr = baseScore + (i % 12) - 6
    const pp = baseScore + (i % 7) - 3
    const avgScore = (as + ct + wr) / 3

    let riskLevel: ClasslistMockStudent["riskLevel"]
    if (avgScore >= 70) {
      riskLevel = "Good"
    } else if (avgScore >= 50) {
      riskLevel = "Satisfactory"
    } else {
      riskLevel = "At Risk"
    }

    const attendancePercentage = 60 + (i % 40)
    const totalClasses = 32
    const attended = Math.round((attendancePercentage / 100) * totalClasses)

    students.push(
      buildStudent(
        studentId,
        formatStudentNumber(studentSequence, CLASSLIST_ACADEMIC_YEAR),
        name,
        surname,
        moduleCode,
        group,
        academicStatus,
        {
          AS: Math.max(0, Math.min(100, as)),
          CT: Math.max(0, Math.min(100, ct)),
          WR: Math.max(0, Math.min(100, wr)),
          PP: Math.max(0, Math.min(100, pp)),
        },
        {
          attended,
          total: totalClasses,
          percentage: attendancePercentage,
        },
        riskLevel,
        previousModules,
        moduleMeta?.campus,
      ),
    )

    studentId++
    studentSequence++
  }

  return students
}

export const CLASSLIST_SEED_STUDENTS: ClasslistMockStudent[] = [
  buildStudent(
    1,
    formatStudentNumber(1, CLASSLIST_ACADEMIC_YEAR),
    "Thabo",
    "Mokoena",
    "16E105X",
    "0",
    "First-time",
    { AS: 75, CT: 80, WR: 85, PP: 73 },
    { attended: 28, total: 32, percentage: 87.5 },
    "Good",
    ["PPA115D", "CN1115D"],
    "Soshanguve (South)",
  ),
  buildStudent(
    2,
    `${CLASSLIST_ACADEMIC_YEAR}00002`,
    "Nomvula",
    "Ndlovu",
    "16E105X",
    "0",
    "Repeating Subject",
    { AS: 45, CT: 50, WR: 55, PP: 43 },
    { attended: 22, total: 32, percentage: 68.75 },
    "At Risk",
    ["16E105X", "PPA115D", "SYA216D"],
    "Soshanguve (South)",
  ),
  buildStudent(
    3,
    `${CLASSLIST_ACADEMIC_YEAR}00003`,
    "Sipho",
    "Khumalo",
    "PPA115D",
    "1",
    "Repeating Subject",
    { AS: 60, CT: 65, WR: 70, PP: 63 },
    { attended: 25, total: 32, percentage: 78.125 },
    "Satisfactory",
    ["16E105X", "CN1115D", "ADS216D", "PPA115D"],
    "Soshanguve (South)",
  ),
  buildStudent(
    4,
    `${CLASSLIST_ACADEMIC_YEAR}00004`,
    "Lerato",
    "Dlamini",
    "SYA216D",
    "2",
    "Repeating Subject",
    { AS: 70, CT: 75, WR: 80, PP: 74 },
    { attended: 30, total: 32, percentage: 93.75 },
    "Good",
    ["PPA115D", "BUA216D"],
    "Polokwane",
  ),
  buildStudent(
    5,
    `${CLASSLIST_ACADEMIC_YEAR}00005`,
    "Bongani",
    "Nkosi",
    "BUA216D",
    "2",
    "First-time",
    { AS: 85, CT: 88, WR: 90, PP: 83 },
    { attended: 31, total: 32, percentage: 96.875 },
    "Good",
    ["SYA216D", "PPA115D"],
    "Polokwane",
  ),
  buildStudent(
    6,
    `${CLASSLIST_ACADEMIC_YEAR}00006`,
    "Zanele",
    "Mthembu",
    "BUA216D",
    "2",
    "First-time",
    { AS: 78, CT: 82, WR: 85, PP: 76 },
    { attended: 29, total: 32, percentage: 90.625 },
    "Good",
    ["SYA216D", "CN1115D"],
    "Polokwane",
  ),
  buildStudent(
    7,
    `${CLASSLIST_ACADEMIC_YEAR}00007`,
    "Kamogelo",
    "Pretorius",
    "ADS216D",
    "1",
    "Repeating Subject",
    { AS: 55, CT: 60, WR: 65, PP: 58 },
    { attended: 20, total: 32, percentage: 62.5 },
    "At Risk",
    ["PPA115D", "CN1115D", "16E105X"],
    "eMalahleni",
  ),
  buildStudent(
    8,
    `${CLASSLIST_ACADEMIC_YEAR}00008`,
    "Tshepo",
    "Van Wyk",
    "CN1115D",
    "1",
    "Repeating Subject",
    { AS: 65, CT: 70, WR: 75, PP: 68 },
    { attended: 24, total: 32, percentage: 75 },
    "Satisfactory",
    ["16E105X", "PPA115D", "SYA216D", "BUA216D", "CN1115D"],
    "Soshanguve (South)",
  ),
  buildStudent(
    9,
    `${CLASSLIST_ACADEMIC_YEAR}00009`,
    "Ayanda",
    "Mahlangu",
    "ADS216D",
    "1",
    "Academic Warning",
    { AS: 40, CT: 45, WR: 50, PP: 43 },
    { attended: 18, total: 32, percentage: 56.25 },
    "At Risk",
    ["PPA115D", "16E105X"],
    "eMalahleni",
  ),
  buildStudent(
    10,
    `${CLASSLIST_ACADEMIC_YEAR}00010`,
    "Nomsa",
    "Sithole",
    "PPA115D",
    "1",
    "Repeating Subject",
    { AS: 60, CT: 65, WR: 70, PP: 63 },
    { attended: 26, total: 32, percentage: 81.25 },
    "Satisfactory",
    ["16E105X", "SYA216D", "CN1115D", "PPA115D", "BUA216D", "ADS216D"],
    "Soshanguve (South)",
  ),
  buildStudent(
    11,
    `${CLASSLIST_ACADEMIC_YEAR}00011`,
    "Jabu",
    "Naidoo",
    "16E105X",
    "0",
    "Repeating Subject",
    { AS: 42, CT: 48, WR: 52, PP: 45 },
    { attended: 19, total: 32, percentage: 59.375 },
    "At Risk",
    ["16E105X", "PPA115D", "CN1115D"],
    "Soshanguve (South)",
  ),
]

export const CLASSLIST_MOCK_STUDENTS: ClasslistMockStudent[] = [
  ...CLASSLIST_SEED_STUDENTS,
  ...generateAdditionalStudents(),
]

/** Backward-compatible exports for the classlist page. */
export const mockGroups = CLASSLIST_GROUPS
export const mockModules = CLASSLIST_MODULES
export const mockStudents = CLASSLIST_MOCK_STUDENTS
export type MockStudent = ClasslistMockStudent
