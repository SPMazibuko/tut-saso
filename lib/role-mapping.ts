import type { UserRole } from "./types"

/** Role slugs shown on select-role page (11 cards) */
export const SELECTABLE_ROLE_SLUGS = [
  "student",
  "tutor",
  "mentor",
  "lecture",
  "departmental-admin",
  "hod-section-head",
  "assistant-dean",
  "student-enrollment",
  "instructional-designer",
  "module-coordinator",
  "super-admin",
] as const

export type SelectableRoleSlug = (typeof SELECTABLE_ROLE_SLUGS)[number]

/** Map select-role slug to UserRole for auth/dashboard (many-to-one) */
export function mapSelectableRoleToUserRole(slug: string | null): UserRole | null {
  if (!slug) return null
  switch (slug) {
    case "student":
      return "student"
    case "tutor":
    case "mentor":
    case "lecture":
    case "instructional-designer":
    case "module-coordinator":
      return "teacher"
    case "departmental-admin":
    case "assistant-dean":
    case "student-enrollment":
      return "admin"
    case "hod-section-head":
      return "district-admin"
    case "super-admin":
      return "provincial-admin"
    default:
      return null
  }
}

export function isSelectableRole(value: string | null): value is SelectableRoleSlug {
  return value !== null && SELECTABLE_ROLE_SLUGS.includes(value as SelectableRoleSlug)
}
