/**
 * TUT ICT faculty buckets for SASO dashboards.
 */
export const SA_COURSE_CODES = [
  "CS",
  "CSE",
  "INF",
  "IT",
  "MMC",
  "FYU",
] as const

export type SACourseCode = (typeof SA_COURSE_CODES)[number]

const SA_COURSE_DISPLAY_NAMES: Record<string, string> = {
  CS: "Computer Science",
  CSE: "Computer Systems Engineering",
  INF: "Informatics",
  IT: "Information Technology",
  MMC: "Multimedia Computing",
  FYU: "ICT First Year & Foundation Unit",
}

export function getCourseName(code: string): string {
  return SA_COURSE_DISPLAY_NAMES[code] ?? code
}

export function getCourseCodeFromModule(moduleCode: string): string {
  const upper = moduleCode.toUpperCase()
  if (upper.startsWith("PPA") || upper.startsWith("PG") || upper.startsWith("CFA") || upper.startsWith("CGA")) return "CS"
  if (upper.startsWith("DE") || upper.startsWith("EL") || upper.startsWith("DP")) return "CSE"
  if (upper.startsWith("BU") || upper.startsWith("SY") || upper.startsWith("DB") || upper.startsWith("ITP")) return "INF"
  if (upper.startsWith("CN") || upper.startsWith("CH") || upper.startsWith("WN") || upper.startsWith("NM")) return "IT"
  if (upper.startsWith("TM") || upper.startsWith("IV") || upper.startsWith("MT")) return "MMC"
  if (upper.startsWith("16") || upper.startsWith("CAP") || upper.startsWith("CMS")) return "FYU"
  const match = moduleCode.match(/^([A-Za-z]+)/)
  const prefix = match?.[1]?.toUpperCase() ?? ""
  return prefix || "Other"
}

export function getCourseOptions(): { code: string; name: string }[] {
  return SA_COURSE_CODES.map((code) => ({ code, name: getCourseName(code) }))
}
