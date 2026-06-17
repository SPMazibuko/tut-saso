"use client"

import type { Learner, RiskFactor } from "./types"
import { getStudents, getRiskFactors } from "./data-service"

export interface EarlyWarningIndicator {
  studentId: number
  studentName: string
  studentNumber: string
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  indicators: string[]
  predictedDropoutRisk: number // 0-100
  recommendedActions: string[]
}

export interface RiskFactorCorrelation {
  factor: string
  correlation: number // -1 to 1
  impact: "positive" | "negative"
  description: string
}

/**
 * Calculate comprehensive risk score for early warning
 */
export function calculateEarlyWarningRisk(student: Learner, riskFactors?: RiskFactor[]): {
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  indicators: string[]
  predictedDropoutRisk: number
} {
  const factors = riskFactors || getRiskFactors(String(student.id))
  let riskScore = student.riskScore || 0
  const indicators: string[] = []

  // Attendance-based indicators
  const attendanceRate = student.attendanceRate || student.attendance.percentage
  if (attendanceRate < 70) {
    riskScore += 15
    indicators.push("Low attendance (<70%)")
  } else if (attendanceRate < 80) {
    riskScore += 8
    indicators.push("Below average attendance (70-80%)")
  }

  // Academic performance indicators
  const avgScore = (student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3
  if (avgScore < 40) {
    riskScore += 20
    indicators.push("Very low academic performance (<40%)")
  } else if (avgScore < 50) {
    riskScore += 12
    indicators.push("Below passing threshold (40-50%)")
  }

  // Risk factor indicators
  const criticalFactors = factors.filter((f) => f.severity === "critical" && !f.resolved)
  const highFactors = factors.filter((f) => f.severity === "high" && !f.resolved)

  if (criticalFactors.length > 0) {
    riskScore += criticalFactors.length * 10
    indicators.push(`${criticalFactors.length} critical risk factor(s)`)
  }
  if (highFactors.length > 0) {
    riskScore += highFactors.length * 5
    indicators.push(`${highFactors.length} high risk factor(s)`)
  }

  // Academic status indicators
  if (student.academicStatus === "Repeating Grade") {
    riskScore += 15
    indicators.push("Repeating grade")
  } else if (student.academicStatus === "Academic Warning") {
    riskScore += 10
    indicators.push("Academic warning status")
  }

  // Previous subjects (repeaters)
  if (student.previousSubjects && student.previousSubjects.length >= 2) {
    riskScore += student.previousSubjects.length * 3
    indicators.push(`Repeating ${student.previousSubjects.length} subject(s)`)
  }

  // Clamp risk score
  riskScore = Math.min(100, Math.max(0, riskScore))

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" | "critical"
  if (riskScore >= 80) {
    riskLevel = "critical"
  } else if (riskScore >= 60) {
    riskLevel = "high"
  } else if (riskScore >= 40) {
    riskLevel = "medium"
  } else {
    riskLevel = "low"
  }

  // Predict dropout risk based on multiple factors
  const dropoutRisk = Math.min(100, Math.max(0, 
    (riskScore * 0.4) + 
    ((100 - attendanceRate) * 0.3) + 
    ((100 - avgScore) * 0.2) + 
    (criticalFactors.length * 10) + 
    (highFactors.length * 5)
  ))

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    indicators,
    predictedDropoutRisk: Math.round(dropoutRisk),
  }
}

/**
 * Get early warning indicators for all at-risk students
 */
export function getEarlyWarningIndicators(students?: Learner[]): EarlyWarningIndicator[] {
  const studentList = students || getStudents()
  const indicators: EarlyWarningIndicator[] = []

  studentList.forEach((student) => {
    const riskFactors = getRiskFactors(String(student.id))
    const warning = calculateEarlyWarningRisk(student, riskFactors)

    // Only include students with medium or higher risk
    if (warning.riskLevel === "low") return

    const recommendedActions = getRecommendedActions(warning, student, riskFactors)

    indicators.push({
      studentId: student.id,
      studentName: `${student.name} ${student.surname}`,
      studentNumber: student.studentNumber,
      riskScore: warning.riskScore,
      riskLevel: warning.riskLevel,
      indicators: warning.indicators,
      predictedDropoutRisk: warning.predictedDropoutRisk,
      recommendedActions,
    })
  })

  // Sort by risk score descending
  return indicators.sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Get recommended actions based on risk indicators
 */
function getRecommendedActions(
  warning: ReturnType<typeof calculateEarlyWarningRisk>,
  student: Learner,
  riskFactors: RiskFactor[]
): string[] {
  const actions: string[] = []

  // Attendance-based actions
  const attendanceRate = student.attendanceRate || student.attendance.percentage
  if (attendanceRate < 70) {
    actions.push("Schedule attendance intervention meeting")
    actions.push("Contact parent/guardian regarding attendance")
  }

  // Academic performance actions
  const avgScore = (student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3
  if (avgScore < 50) {
    actions.push("Assign academic tutor or mentor")
    actions.push("Provide additional learning resources")
  }

  // Risk factor actions
  const criticalFactors = riskFactors.filter((f) => f.severity === "critical" && !f.resolved)
  if (criticalFactors.length > 0) {
    actions.push("Immediate intervention required - escalate to support services")
    actions.push("Schedule counseling session")
  }

  // Repeater actions
  if (student.academicStatus === "Repeating Grade" || student.academicStatus === "Academic Warning") {
    actions.push("Develop personalized learning plan")
    actions.push("Regular progress monitoring meetings")
  }

  // High dropout risk actions
  if (warning.predictedDropoutRisk >= 70) {
    actions.push("Urgent: High dropout risk - immediate support needed")
    actions.push("Engage family support services")
  }

  return actions
}

/**
 * Get risk factor correlations
 */
export function getRiskFactorCorrelations(students?: Learner[]): RiskFactorCorrelation[] {
  const studentList = students || getStudents()
  const correlations: RiskFactorCorrelation[] = []

  // Analyze attendance correlation
  const attendanceData = studentList.map((s) => ({
    attendance: s.attendanceRate || s.attendance.percentage,
    riskScore: s.riskScore || 0,
  }))
  const attendanceCorrelation = calculateCorrelation(
    attendanceData.map((d) => d.attendance),
    attendanceData.map((d) => d.riskScore)
  )

  correlations.push({
    factor: "Attendance Rate",
    correlation: attendanceCorrelation,
    impact: attendanceCorrelation < 0 ? "negative" : "positive",
    description: "Lower attendance correlates with higher risk",
  })

  // Analyze academic performance correlation
  const performanceData = studentList.map((s) => {
    const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
    return {
      performance: avgScore,
      riskScore: s.riskScore || 0,
    }
  })
  const performanceCorrelation = calculateCorrelation(
    performanceData.map((d) => d.performance),
    performanceData.map((d) => d.riskScore)
  )

  correlations.push({
    factor: "Academic Performance",
    correlation: performanceCorrelation,
    impact: performanceCorrelation < 0 ? "negative" : "positive",
    description: "Lower performance correlates with higher risk",
  })

  return correlations
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0

  return numerator / denominator
}

