/**
 * Subject/course codes used for learner analytics (aligned with mock-data subjectCodes).
 * Use for display labels and filters on Progression, Stop-start, and Completion Forecast.
 */
export const SUBJECT_CODES = [
  "MATH",
  "ENG",
  "PHY",
  "LIF",
  "GEO",
  "HIS",
  "ECO",
  "ACC",
  "BUS",
  "LO",
] as const

export type SubjectCode = (typeof SUBJECT_CODES)[number]

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  MATH: "Mathematics",
  ENG: "English",
  PHY: "Physical Sciences",
  LIF: "Life Sciences",
  GEO: "Geography",
  HIS: "History",
  ECO: "Economics",
  ACC: "Accounting",
  BUS: "Business Studies",
  LO: "Life Orientation",
}

/** Returns display name for a subject code, or the code itself if unknown. */
export function getSubjectName(code: string): string {
  return SUBJECT_DISPLAY_NAMES[code] ?? code
}

/** Returns all subject codes with display names for filters/dropdowns. */
export function getSubjectOptions(): { code: string; name: string }[] {
  return SUBJECT_CODES.map((code) => ({ code, name: getSubjectName(code) }))
}
