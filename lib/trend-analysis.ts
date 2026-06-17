"use client"

import type { Learner, TrendDataPoint } from "./types"
import { getStudents } from "./data-service"
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns"

export interface EnrollmentTrend {
  period: string
  enrollmentCount: number
  newEnrollments: number
  dropouts: number
}

export interface PerformanceTrend {
  period: string
  averageScore: number
  passRate: number
  attendanceRate: number
  atRiskPercentage: number
}

export interface RetentionMetrics {
  period: string
  retentionRate: number
  dropoutRate: number
  newEnrollments: number
}

/**
 * Get enrollment trends over time
 */
export function getEnrollmentTrends(
  students?: Learner[],
  months: number = 12
): EnrollmentTrend[] {
  const studentList = students || getStudents()
  const trends: EnrollmentTrend[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const periodDate = subMonths(now, i)
    const periodStart = startOfMonth(periodDate)
    const periodEnd = endOfMonth(periodDate)
    const periodLabel = format(periodDate, "MMM yyyy")

    // Count students enrolled in this period
    const enrolledInPeriod = studentList.filter((s) => {
      if (!s.enrollmentDate) return false
      const enrollDate = s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())
      return enrollDate >= periodStart && enrollDate <= periodEnd
    }).length

    // Estimate new enrollments (simplified - in real system would track actual enrollments)
    const newEnrollments = enrolledInPeriod

    // Estimate dropouts (students who haven't been active recently)
    const dropouts = studentList.filter((s) => {
      if (!s.lastAssessment) return false
      const lastAssess = s.lastAssessment instanceof Date ? s.lastAssessment : parseISO(s.lastAssessment.toString())
      return lastAssess < periodStart && s.enrollmentDate && 
        (s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())) < periodStart
    }).length

    trends.push({
      period: periodLabel,
      enrollmentCount: studentList.filter((s) => {
        if (!s.enrollmentDate) return false
        const enrollDate = s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())
        return enrollDate <= periodEnd
      }).length,
      newEnrollments,
      dropouts: Math.floor(dropouts / months), // Distribute dropouts across periods
    })
  }

  return trends
}

/**
 * Get performance trends over time
 */
export function getPerformanceTrends(
  students?: Learner[],
  months: number = 12
): PerformanceTrend[] {
  const studentList = students || getStudents()
  const trends: PerformanceTrend[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const periodDate = subMonths(now, i)
    const periodStart = startOfMonth(periodDate)
    const periodEnd = endOfMonth(periodDate)
    const periodLabel = format(periodDate, "MMM yyyy")

    // Get students active in this period
    const activeStudents = studentList.filter((s) => {
      if (!s.lastAssessment) return false
      const lastAssess = s.lastAssessment instanceof Date ? s.lastAssessment : parseISO(s.lastAssessment.toString())
      return lastAssess >= periodStart && lastAssess <= periodEnd
    })

    if (activeStudents.length === 0) {
      trends.push({
        period: periodLabel,
        averageScore: 0,
        passRate: 0,
        attendanceRate: 0,
        atRiskPercentage: 0,
      })
      continue
    }

    // Calculate average score
    const avgScore = activeStudents.reduce((sum, s) => {
      const avg = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return sum + avg
    }, 0) / activeStudents.length

    // Calculate pass rate
    const passRate = activeStudents.filter((s) => {
      const avg = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return avg >= 50
    }).length / activeStudents.length * 100

    // Calculate average attendance
    const avgAttendance = activeStudents.reduce((sum, s) => {
      return sum + (s.attendanceRate || s.attendance.percentage)
    }, 0) / activeStudents.length

    // Calculate at-risk percentage
    const atRisk = activeStudents.filter((s) => s.riskLevel === "At Risk").length / activeStudents.length * 100

    trends.push({
      period: periodLabel,
      averageScore: Math.round(avgScore * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
      attendanceRate: Math.round(avgAttendance * 10) / 10,
      atRiskPercentage: Math.round(atRisk * 10) / 10,
    })
  }

  return trends
}

/**
 * Get retention metrics over time
 */
export function getRetentionMetrics(
  students?: Learner[],
  months: number = 12
): RetentionMetrics[] {
  const studentList = students || getStudents()
  const metrics: RetentionMetrics[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const periodDate = subMonths(now, i)
    const periodStart = startOfMonth(periodDate)
    const periodEnd = endOfMonth(periodDate)
    const periodLabel = format(periodDate, "MMM yyyy")

    // Learners enrolled before this period
    const enrolledBefore = studentList.filter((s) => {
      if (!s.enrollmentDate) return false
      const enrollDate = s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())
      return enrollDate < periodStart
    }).length

    // Learners still active in this period
    const stillActive = studentList.filter((s) => {
      if (!s.enrollmentDate || !s.lastAssessment) return false
      const enrollDate = s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())
      const lastAssess = s.lastAssessment instanceof Date ? s.lastAssessment : parseISO(s.lastAssessment.toString())
      return enrollDate < periodStart && lastAssess >= periodStart
    }).length

    // New enrollments in this period
    const newEnrollments = studentList.filter((s) => {
      if (!s.enrollmentDate) return false
      const enrollDate = s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())
      return enrollDate >= periodStart && enrollDate <= periodEnd
    }).length

    const retentionRate = enrolledBefore > 0 ? (stillActive / enrolledBefore) * 100 : 0
    const dropoutRate = enrolledBefore > 0 ? ((enrolledBefore - stillActive) / enrolledBefore) * 100 : 0

    metrics.push({
      period: periodLabel,
      retentionRate: Math.round(retentionRate * 10) / 10,
      dropoutRate: Math.round(dropoutRate * 10) / 10,
      newEnrollments,
    })
  }

  return metrics
}

/**
 * Get subject enrollment trends
 */
export function getSubjectEnrollmentTrends(students?: Learner[]): Record<string, TrendDataPoint[]> {
  const studentList = students || getStudents()
  const subjectTrends: Record<string, TrendDataPoint[]> = {}
  const now = new Date()

  // Get unique subjects
  const subjects = new Set(studentList.map((s) => s.subjectCode))

  subjects.forEach((subject) => {
    const trends: TrendDataPoint[] = []
    
    for (let i = 11; i >= 0; i--) {
      const periodDate = subMonths(now, i)
      const periodStart = startOfMonth(periodDate)
      const periodEnd = endOfMonth(periodDate)
      const periodLabel = format(periodDate, "MMM yyyy")

      const count = studentList.filter((s) => {
        if (s.subjectCode !== subject) return false
        if (!s.enrollmentDate) return false
        const enrollDate = s.enrollmentDate instanceof Date ? s.enrollmentDate : parseISO(s.enrollmentDate.toString())
        return enrollDate <= periodEnd
      }).length

      trends.push({
        date: periodLabel,
        value: count,
        label: periodLabel,
        category: subject,
      })
    }

    subjectTrends[subject] = trends
  })

  return subjectTrends
}

