/**
 * Modules Per Department data from saso-system.vercel.app (2026 ICT uploads).
 */

import sasoModulesPerDepartmentJson from "@/lib/data/saso-modules-per-department.json"

export interface SasoModuleRef {
  code: string
  name: string
}

export interface SasoYearBucket {
  total: number
  semester1?: SasoModuleRef[]
  semester2?: SasoModuleRef[]
  bothSemesters?: SasoModuleRef[]
  yearModules?: SasoModuleRef[]
  unknownSemester?: SasoModuleRef[]
}

export interface SasoDepartmentGridData {
  name: string
  totalModules: number
  byYear: Record<"year1" | "year2" | "year3" | "year4", SasoYearBucket>
}

interface RawModule {
  code: string
  name?: string
}

interface RawDepartment {
  name: string
  totalModules: number
  byLevel: Record<
    string,
    {
      count: number
      bySemester: Record<string, { count: number; modules: RawModule[] }>
    }
  >
}

const raw = sasoModulesPerDepartmentJson as {
  departments: RawDepartment[]
}

const DEPARTMENT_ALIASES: Record<string, string> = {
  "END USER COMPUTING UNIT": "End User Computing Unit",
  "LIBRARY & INFO SERVICES": "Library",
}

const DEPARTMENT_PRIORITY = [
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
] as const

export function normalizeSasoDepartmentName(name: string): string {
  return DEPARTMENT_ALIASES[name] ?? name
}

function moduleRef(module: RawModule): SasoModuleRef {
  return {
    code: module.code,
    name: module.name?.trim() || module.code,
  }
}

function emptyYearBucket(): SasoYearBucket {
  return { total: 0 }
}

function addModules(bucket: SasoYearBucket, semesterKey: string, modules: RawModule[]) {
  if (modules.length === 0) return
  const refs = modules.map(moduleRef)

  if (semesterKey === "1") {
    bucket.semester1 = [...(bucket.semester1 ?? []), ...refs]
  } else if (semesterKey === "2") {
    bucket.semester2 = [...(bucket.semester2 ?? []), ...refs]
  } else if (semesterKey === "Both Semester 1 and Semester 2") {
    bucket.bothSemesters = [...(bucket.bothSemesters ?? []), ...refs]
  } else if (semesterKey === "Year") {
    bucket.yearModules = [...(bucket.yearModules ?? []), ...refs]
  } else {
    bucket.unknownSemester = [...(bucket.unknownSemester ?? []), ...refs]
  }

  bucket.total += refs.length
}

function levelToYearKey(level: string): "year1" | "year2" | "year3" | "year4" | "unknown" {
  if (level === "1") return "year1"
  if (level === "2") return "year2"
  if (level === "3") return "year3"
  if (level === "4") return "year4"
  return "unknown"
}

function sortDepartments<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aIndex = DEPARTMENT_PRIORITY.indexOf(a.name as (typeof DEPARTMENT_PRIORITY)[number])
    const bIndex = DEPARTMENT_PRIORITY.indexOf(b.name as (typeof DEPARTMENT_PRIORITY)[number])
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    }
    return a.name.localeCompare(b.name)
  })
}

function collectDepartmentModuleMaps() {
  const byDepartment = new Map<string, Map<string, SasoModuleRef>>()

  for (const department of raw.departments) {
    const departmentName = normalizeSasoDepartmentName(department.name)
    if (!byDepartment.has(departmentName)) {
      byDepartment.set(departmentName, new Map())
    }
    const moduleMap = byDepartment.get(departmentName)!

    for (const level of Object.values(department.byLevel)) {
      for (const semester of Object.values(level.bySemester)) {
        for (const module of semester.modules) {
          if (!module.code) continue
          moduleMap.set(module.code, moduleRef(module))
        }
      }
    }
  }

  return byDepartment
}

/** Flat module list per normalized department (deduped by module code). */
export function getSasoDepartmentModuleEntries(): Array<SasoModuleRef & { department: string }> {
  const entries: Array<SasoModuleRef & { department: string }> = []

  for (const [department, moduleMap] of collectDepartmentModuleMaps()) {
    for (const module of moduleMap.values()) {
      entries.push({ department, ...module })
    }
  }

  return entries.sort((a, b) => {
    if (a.department === b.department) return a.code.localeCompare(b.code)
    return a.department.localeCompare(b.department)
  })
}

/** Grid layout for Modules Per Department page (levels 1–4). */
export function getSasoDepartmentGridData(): SasoDepartmentGridData[] {
  const merged = new Map<string, SasoDepartmentGridData>()

  for (const department of raw.departments) {
    const name = normalizeSasoDepartmentName(department.name)
    if (!merged.has(name)) {
      merged.set(name, {
        name,
        totalModules: 0,
        byYear: {
          year1: emptyYearBucket(),
          year2: emptyYearBucket(),
          year3: emptyYearBucket(),
          year4: emptyYearBucket(),
        },
      })
    }

    const entry = merged.get(name)!
    entry.totalModules = Math.max(entry.totalModules, department.totalModules)

    for (const [levelKey, level] of Object.entries(department.byLevel)) {
      const yearKey = levelToYearKey(levelKey)
      if (yearKey === "unknown") {
        const bucket = entry.byYear.year1
        for (const [semesterKey, semester] of Object.entries(level.bySemester)) {
          addModules(bucket, semesterKey, semester.modules)
        }
        continue
      }

      const bucket = entry.byYear[yearKey]
      for (const [semesterKey, semester] of Object.entries(level.bySemester)) {
        addModules(bucket, semesterKey, semester.modules)
      }
      bucket.total = Math.max(bucket.total, level.count)
    }
  }

  for (const [name, moduleMap] of collectDepartmentModuleMaps()) {
    const entry = merged.get(name)
    if (entry) {
      entry.totalModules = moduleMap.size
    }
  }

  return sortDepartments([...merged.values()])
}
