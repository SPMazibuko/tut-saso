/**
 * Module codes and display names for analytics (Progression, Stop-start, Completion Forecast).
 * Aligned with ModuleCode in lib/types.ts.
 */
export const MODULE_CODES = [
  "ENG101",
  "ENG102",
  "ENG103",
  "ENG201",
  "BUS101",
  "BUS102",
  "BUS103",
  "HRM101",
  "HRM102",
  "HRM103",
  "MED101",
  "MED102",
  "MED103",
  "LEG101",
  "LEG102",
] as const

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  ENG101: "English 101",
  ENG102: "English 102",
  ENG103: "English 103",
  ENG201: "English 201",
  BUS101: "Business 101",
  BUS102: "Business 102",
  BUS103: "Business 103",
  HRM101: "Human Resource Management 101",
  HRM102: "Human Resource Management 102",
  HRM103: "Human Resource Management 103",
  MED101: "Medicine 101",
  MED102: "Medicine 102",
  MED103: "Medicine 103",
  LEG101: "Law 101",
  LEG102: "Law 102",
}

/** Returns display name for a module code, or the code itself if unknown. */
export function getModuleName(code: string): string {
  return MODULE_DISPLAY_NAMES[code] ?? code
}

/** Returns all module codes with display names for filters/dropdowns. */
export function getModuleOptions(): { code: string; name: string }[] {
  return MODULE_CODES.map((code) => ({ code, name: getModuleName(code) }))
}
