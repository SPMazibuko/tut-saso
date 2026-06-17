import type { Learner } from "./types"
import { getSubjectName } from "./subject-courses"
import { getModuleName } from "./modules"
import { getCourseName, getCourseCodeFromModule } from "./sa-courses"

// Cohort analytics: summary, by subject/course, by module
export interface CohortSummary {
  inProgression: number
  droppedOut: number
  excluded: number
  total: number
}

export interface CohortSummaryBySubject extends CohortSummary {
  subjectCode: string
  subjectName: string
}

export interface CohortSummaryByModule extends CohortSummary {
  moduleCode: string
  moduleName: string
}

export interface CohortSummaryByCourse extends CohortSummary {
  courseCode: string
  courseName: string
}

/**
 * Returns counts for a cohort (optionally filtered by first-year intake): in progression, dropped out, currently excluded.
 * In progression = not dropped out and not currently financially excluded.
 */
export function getCohortSummary(
  learners: Learner[],
  enrollmentYear?: number
): CohortSummary {
  const cohort = enrollmentYear != null
    ? learners.filter((l) => l.enrollmentYear === enrollmentYear)
    : [...learners]
  const total = cohort.length
  const droppedOut = cohort.filter((l) => l.hasDroppedOut === true).length
  const excluded = cohort.filter((l) => l.financiallyExcluded === true).length
  const inProgression = total - droppedOut - excluded
  return { inProgression, droppedOut, excluded, total }
}

/** Returns distinct enrollment years from learners, sorted descending (most recent first). */
export function getAvailableCohortYears(learners: Learner[]): number[] {
  const set = new Set(learners.map((l) => l.enrollmentYear))
  return Array.from(set).sort((a, b) => b - a)
}

/**
 * Returns cohort summary broken down by subject/course. Only includes subjects that have at least one learner in the cohort.
 */
export function getCohortSummaryBySubject(
  learners: Learner[],
  enrollmentYear?: number
): CohortSummaryBySubject[] {
  const cohort = enrollmentYear != null
    ? learners.filter((l) => l.enrollmentYear === enrollmentYear)
    : [...learners]
  const bySubject = new Map<string, Learner[]>()
  for (const l of cohort) {
    const code = l.subjectCode ?? "Other"
    if (!bySubject.has(code)) bySubject.set(code, [])
    bySubject.get(code)!.push(l)
  }
  return Array.from(bySubject.entries()).map(([subjectCode, subs]) => {
    const total = subs.length
    const droppedOut = subs.filter((s) => s.hasDroppedOut === true).length
    const excluded = subs.filter((s) => s.financiallyExcluded === true).length
    const inProgression = total - droppedOut - excluded
    return {
      subjectCode,
      subjectName: getSubjectName(subjectCode),
      inProgression,
      droppedOut,
      excluded,
      total,
    }
  }).sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
}

/** Returns distinct module codes from learners, sorted. */
export function getAvailableModuleCodes(learners: Learner[]): string[] {
  const set = new Set<string>()
  for (const l of learners) {
    const code = l.moduleCode ?? l.subjectCode
    if (code) set.add(code)
  }
  return Array.from(set).sort()
}

/** Returns distinct subject codes from learners, sorted. */
export function getAvailableSubjectCodes(learners: Learner[]): string[] {
  const set = new Set<string>()
  for (const l of learners) {
    const code = l.subjectCode
    if (code) set.add(code)
  }
  return Array.from(set).sort()
}

/** Returns the course code for a learner (courseCode or derived from moduleCode). */
export function getLearnerCourseCode(l: Learner): string {
  const code = l.courseCode ?? (l.moduleCode ? getCourseCodeFromModule(l.moduleCode) : null)
  return code || "Other"
}

/** Returns distinct SA course codes from learners (courseCode or derived from moduleCode), sorted. */
export function getAvailableCourseCodes(learners: Learner[]): string[] {
  const set = new Set<string>()
  for (const l of learners) {
    const code = getLearnerCourseCode(l)
    if (code && code !== "Other") set.add(code)
  }
  return Array.from(set).sort()
}

/**
 * Returns cohort summary broken down by SA course. Only includes courses that have at least one learner in the cohort.
 */
export function getCohortSummaryByCourse(
  learners: Learner[],
  enrollmentYear?: number
): CohortSummaryByCourse[] {
  const cohort = enrollmentYear != null
    ? learners.filter((l) => l.enrollmentYear === enrollmentYear)
    : [...learners]
  const byCourse = new Map<string, Learner[]>()
  for (const l of cohort) {
    const code = getLearnerCourseCode(l)
    if (!byCourse.has(code)) byCourse.set(code, [])
    byCourse.get(code)!.push(l)
  }
  return Array.from(byCourse.entries()).map(([courseCode, subs]) => {
    const total = subs.length
    const droppedOut = subs.filter((s) => s.hasDroppedOut === true).length
    const excluded = subs.filter((s) => s.financiallyExcluded === true).length
    const inProgression = total - droppedOut - excluded
    return {
      courseCode,
      courseName: getCourseName(courseCode),
      inProgression,
      droppedOut,
      excluded,
      total,
    }
  }).sort((a, b) => a.courseCode.localeCompare(b.courseCode))
}

/**
 * Returns cohort summary broken down by module. Only includes modules that have at least one learner in the cohort.
 */
export function getCohortSummaryByModule(
  learners: Learner[],
  enrollmentYear?: number
): CohortSummaryByModule[] {
  const cohort = enrollmentYear != null
    ? learners.filter((l) => l.enrollmentYear === enrollmentYear)
    : [...learners]
  const byModule = new Map<string, Learner[]>()
  for (const l of cohort) {
    const code = l.moduleCode ?? l.subjectCode ?? "Other"
    if (!byModule.has(code)) byModule.set(code, [])
    byModule.get(code)!.push(l)
  }
  return Array.from(byModule.entries()).map(([moduleCode, subs]) => {
    const total = subs.length
    const droppedOut = subs.filter((s) => s.hasDroppedOut === true).length
    const excluded = subs.filter((s) => s.financiallyExcluded === true).length
    const inProgression = total - droppedOut - excluded
    return {
      moduleCode,
      moduleName: getModuleName(moduleCode),
      inProgression,
      droppedOut,
      excluded,
      total,
    }
  }).sort((a, b) => a.moduleCode.localeCompare(b.moduleCode))
}
