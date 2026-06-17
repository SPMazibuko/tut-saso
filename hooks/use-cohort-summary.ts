"use client"

import { useMemo } from "react"
import { getStudents } from "@/lib/data-service"
import { getCohortSummary, getAvailableCohortYears, type CohortSummary } from "@/lib/cohort-summary"

/**
 * Returns cohort summary and available intake years from current student data.
 * @param enrollmentYear - First-year intake year to filter by, or "all" / undefined for all learners
 */
export function useCohortSummary(
  enrollmentYear?: number | "all"
): { summary: CohortSummary; availableYears: number[] } {
  return useMemo(() => {
    const learners = getStudents()
    const year = enrollmentYear === "all" || enrollmentYear == null ? undefined : enrollmentYear
    const summary = getCohortSummary(learners, year)
    const availableYears = getAvailableCohortYears(learners)
    return { summary, availableYears }
  }, [enrollmentYear])
}
