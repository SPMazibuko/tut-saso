import { getSasoFacultyAnalysisData, SASO_DASHBOARD_STATS } from "@/lib/tut-saso-data"

export const SCHEDULE_ACADEMIC_YEAR = SASO_DASHBOARD_STATS.academicYear

export interface ScheduleModule {
  code: string
  name: string
  department: string
  campus: string
}

function formatDepartment(raw: string): string {
  return raw
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ")
}

/** SASO ICT modules available for semester schedule management. */
export function getScheduleModules(): ScheduleModule[] {
  const seen = new Set<string>()
  const modules: ScheduleModule[] = []

  for (const record of getSasoFacultyAnalysisData()) {
    if (seen.has(record.moduleCode)) continue
    seen.add(record.moduleCode)
    modules.push({
      code: record.moduleCode,
      name: record.moduleName,
      department: formatDepartment(record.departmentName),
      campus: record.campus,
    })
  }

  return modules.sort((a, b) => a.code.localeCompare(b.code))
}

export const SCHEDULE_MODULES = getScheduleModules()

export function getScheduleModuleLabel(code: string): string {
  const mod = SCHEDULE_MODULES.find((m) => m.code === code)
  return mod ? `${mod.code} — ${mod.name}` : code
}

export function getScheduleModuleOptions(): { value: string; label: string }[] {
  return SCHEDULE_MODULES.map((mod) => ({
    value: mod.code,
    label: `${mod.code} — ${mod.name}`,
  }))
}
