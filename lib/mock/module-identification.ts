/**
 * TUT ICT module identification data sourced from SASO Modules Per Department API.
 */

import {
  getSasoDepartmentModuleEntries,
  normalizeSasoDepartmentName,
} from "@/lib/saso-modules-per-department"

export type ModuleSupport = "solusi" | "department" | "none"

export interface MockStaff {
  id: string
  name: string
}

export interface MockIdentifiedModule {
  department: string
  moduleCode: string
  moduleName: string
  support: ModuleSupport
  lecturer: MockStaff
  tutors: MockStaff[]
  semester: 1 | 2
  year: number
}

const LECTURERS = [
  "Dr. Nomsa Mokoena",
  "Prof. Thabo Nkosi",
  "Dr. Lerato Khumalo",
  "Mr. Sipho Dlamini",
  "Ms. Zanele Ndlovu",
  "Dr. James van der Merwe",
] as const

const TUTORS = [
  "Ms. Thandi Moyo",
  "Mr. Peter Sithole",
  "Ms. Nomvula Zulu",
  "Mr. David Molefe",
] as const

function assignSupport(index: number, total: number): ModuleSupport {
  const solusiCount = Math.round(total * 0.36)
  const departmentCount = Math.round(total * 0.27)
  if (index < solusiCount) return "solusi"
  if (index < solusiCount + departmentCount) return "department"
  return "none"
}

function buildIdentifiedModules(): MockIdentifiedModule[] {
  const entries = getSasoDepartmentModuleEntries()
  const countsByDepartment = new Map<string, number>()

  for (const entry of entries) {
    countsByDepartment.set(entry.department, (countsByDepartment.get(entry.department) ?? 0) + 1)
  }

  const indexByDepartment = new Map<string, number>()

  return entries.map((entry) => {
    const department = normalizeSasoDepartmentName(entry.department)
    const index = indexByDepartment.get(department) ?? 0
    indexByDepartment.set(department, index + 1)
    const total = countsByDepartment.get(department) ?? 1
    const support = assignSupport(index, total)

    return {
      department,
      moduleCode: entry.code,
      moduleName: entry.name,
      support,
      lecturer: {
        id: `L-${entry.code}`,
        name: LECTURERS[index % LECTURERS.length],
      },
      tutors:
        index % 2 === 0
          ? [{ id: `T-${entry.code}`, name: TUTORS[index % TUTORS.length] }]
          : [],
      semester: (index % 2) + 1 as 1 | 2,
      year: 2026,
    }
  })
}

export const mockIdentifiedModules: MockIdentifiedModule[] = buildIdentifiedModules()

const DEPARTMENTS = [...new Set(mockIdentifiedModules.map((m) => m.department))].sort((a, b) => {
  const priority = [
    "Computer Systems Engineering",
    "Computer Science",
    "Informatics",
    "Information Technology",
    "FYU",
    "End User Computing Unit",
    "Library",
    "Mathematics And Statistics",
    "SDS",
    "Unknown",
  ]
  const aIndex = priority.indexOf(a)
  const bIndex = priority.indexOf(b)
  if (aIndex !== -1 || bIndex !== -1) {
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  }
  return a.localeCompare(b)
})

export interface ModulesPerDepartmentItem {
  name: string
  count: number
}

export interface ModuleBreakdownItem {
  supportedBySOLUSI: number
  supportedByDepartment: number
  notSupported: number
}

export interface IdentifiedModulesTotals {
  departmentModules: number
  supportedModules: number
  sasoModules: number
}

/** Count of modules per department (all modules). */
export function getModulesPerDepartment(): ModulesPerDepartmentItem[] {
  return DEPARTMENTS.map((name) => ({
    name,
    count: mockIdentifiedModules.filter((m) => m.department === name).length,
  }))
}

/** Count of supported modules (SASO or department) per department. */
export function getSupportedModulesPerDepartment(): ModulesPerDepartmentItem[] {
  return DEPARTMENTS.map((name) => ({
    name,
    count: mockIdentifiedModules.filter(
      (m) => m.department === name && (m.support === "solusi" || m.support === "department")
    ).length,
  })).filter((item) => item.count > 0)
}

/** Per-department breakdown: SASO / department / not supported counts. */
export function getModuleBreakdownByDepartment(department: string): ModuleBreakdownItem | undefined {
  const mods = mockIdentifiedModules.filter((m) => m.department === department)
  if (mods.length === 0) return undefined
  return {
    supportedBySOLUSI: mods.filter((m) => m.support === "solusi").length,
    supportedByDepartment: mods.filter((m) => m.support === "department").length,
    notSupported: mods.filter((m) => m.support === "none").length,
  }
}

/** Totals for Identified Modules widget. */
export function getIdentifiedModulesTotals(): IdentifiedModulesTotals {
  const departmentModules = mockIdentifiedModules.length
  const supportedModules = mockIdentifiedModules.filter(
    (m) => m.support === "solusi" || m.support === "department"
  ).length
  const sasoModules = mockIdentifiedModules.filter((m) => m.support === "solusi").length
  return { departmentModules, supportedModules, sasoModules }
}

/** All modules for a department (for drill-down). */
export function getModulesByDepartment(department: string): MockIdentifiedModule[] {
  return mockIdentifiedModules.filter((m) => m.department === department)
}

/** Single module by department + code (for drill-down). */
export function getModuleByDepartmentAndCode(department: string, moduleCode: string): MockIdentifiedModule | undefined {
  return mockIdentifiedModules.find((m) => m.department === department && m.moduleCode === moduleCode)
}
