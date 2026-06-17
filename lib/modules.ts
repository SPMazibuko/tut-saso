/**
 * Module codes and display names for analytics (Progression, Stop-start, Completion Forecast).
 * Sourced from live SASO faculty analysis data.
 */
import {
  SCHEDULE_MODULES,
  getScheduleModuleLabel,
  getScheduleModuleOptions,
} from "@/lib/schedule-modules"

export const MODULE_CODES = SCHEDULE_MODULES.map((mod) => mod.code)

/** Returns display name for a module code, or the code itself if unknown. */
export function getModuleName(code: string): string {
  const label = getScheduleModuleLabel(code)
  const parts = label.split(" — ")
  return parts.length > 1 ? parts[1] : code
}

/** Returns all module codes with display names for filters/dropdowns. */
export function getModuleOptions(): { code: string; name: string }[] {
  return getScheduleModuleOptions().map((opt) => {
    const [code, ...nameParts] = opt.label.split(" — ")
    return { code, name: nameParts.join(" — ") || code }
  })
}
