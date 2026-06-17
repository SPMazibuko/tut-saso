/**
 * Course/faculty buckets for Namibia university dashboards.
 * Kept in this file to preserve existing imports and filters.
 */
export const SA_COURSE_CODES = [
  "ACS",
  "BUS",
  "EDU",
  "ENG",
  "HSC",
  "HUM",
  "ICT",
  "LAW",
  "NSC",
  "SCI",
] as const

export type SACourseCode = (typeof SA_COURSE_CODES)[number]

const SA_COURSE_DISPLAY_NAMES: Record<string, string> = {
  ACS: "Accounting and Finance",
  BUS: "Business and Management",
  EDU: "Education",
  ENG: "Engineering and the Built Environment",
  HSC: "Health Sciences",
  HUM: "Humanities and Social Sciences",
  ICT: "Computing, Informatics and ICT",
  LAW: "Law",
  NSC: "Natural and Agricultural Sciences",
  SCI: "Science and Mathematics",
}

/** Returns display name for a course code, or the code itself if unknown. */
export function getCourseName(code: string): string {
  return SA_COURSE_DISPLAY_NAMES[code] ?? code
}

/** Derives course code from module code prefix (e.g. ENG101 -> ENG). */
export function getCourseCodeFromModule(moduleCode: string): string {
  const match = moduleCode.match(/^([A-Za-z]+)/)
  const prefix = match?.[1]?.toUpperCase() ?? ""
  return prefix || "Other"
}

/** Returns all dashboard course codes with display names for filters/dropdowns. */
export function getCourseOptions(): { code: string; name: string }[] {
  return SA_COURSE_CODES.map((code) => ({ code, name: getCourseName(code) }))
}
