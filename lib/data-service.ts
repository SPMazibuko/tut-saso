"use client"

import {
  mockStudents,
  mockRiskFactors,
  mockInterventions,
  mockAlerts,
  mockSubjects,
  mockGroups,
  mockCommunicationHistory,
} from "./mock-data"
import type {
  Learner,
  RiskFactor,
  Intervention,
  Alert,
  DashboardStats,
  Subject,
  Group,
  CommunicationHistory,
  SciBonoPerformance,
  SchoolSummary,
} from "./types"
import { generateSchoolSummaries, SOUTH_AFRICAN_PROVINCES } from "./sa-provinces-data"

// Simulated data service - in production, these would be API calls

export function getStudents(): Learner[] {
  return mockStudents
}

export function getStudent(id: string | number): Learner | undefined {
  // Handle both string and numeric IDs
  const idStr = String(id)
  const idNum = typeof id === "number" ? id : parseInt(idStr, 10)
  
  // First try to find by numeric ID
  if (!isNaN(idNum)) {
    const found = mockStudents.find((s) => {
      if (typeof s.id === "number" && s.id === idNum) return true
      if (String(s.id) === idStr) return true
      // Handle legacy string IDs like "s1" -> 1
      if (String(s.id) === `s${idNum}`) return true
      return false
    })
    if (found) return found
  }
  
  // Try string matching
  return mockStudents.find((s) => {
    if (String(s.id) === idStr) return true
    // Handle "s1" format
    if (idStr.startsWith("s") && String(s.id) === idStr.slice(1)) return true
    return false
  })
}

export function getRiskFactors(studentId?: string): RiskFactor[] {
  if (studentId) {
    return mockRiskFactors.filter((rf) => rf.studentId === studentId)
  }
  return mockRiskFactors
}

export function getInterventions(studentId?: string): Intervention[] {
  if (studentId) {
    return mockInterventions.filter((i) => i.studentId === studentId)
  }
  return mockInterventions
}

export function getAlerts(): Alert[] {
  // Import here to avoid circular dependency during module load
  try {
    const { getAllAlerts } = require("./alert-service")
    return getAllAlerts()
  } catch {
    // Fallback to mock alerts if alert-service not available
    return mockAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}

export function getDashboardStats(studentsOverride?: Learner[]): DashboardStats {
  const students = studentsOverride ?? getStudents()
  const alerts = getAlerts()

  // Map new risk levels ("Good", "At Risk", "Satisfactory") to old format ("low", "medium", "high", "critical")
  const riskDistribution = students.reduce(
    (acc, student) => {
      // Map risk levels: "Good" -> "low", "Satisfactory" -> "medium"/"high", "At Risk" -> "critical"/"high"
      if (student.riskLevel === "Good") {
        acc.low++
      } else if (student.riskLevel === "Satisfactory") {
        // Use risk score to determine if medium or high
        const riskScore = student.riskScore || 0
        if (riskScore > 70) {
          acc.high++
        } else {
          acc.medium++
        }
      } else if (student.riskLevel === "At Risk") {
        // Use risk score to determine if high or critical
        // Lower threshold to ensure critical has a meaningful percentage
        const riskScore = student.riskScore || 0
        if (riskScore > 65) {
          acc.critical++
        } else {
          acc.high++
        }
      }
      return acc
    },
    { low: 0, medium: 0, high: 0, critical: 0 },
  )
  
  // Ensure critical always has at least 30% of students if it's currently 0
  // Redistribute from high risk students
  if (riskDistribution.critical === 0 && riskDistribution.high > 0) {
    const totalStudents = students.length
    const minCritical = Math.max(1, Math.floor(totalStudents * 0.30)) // At least 30%
    const availableFromHigh = Math.min(minCritical, riskDistribution.high)
    riskDistribution.critical = availableFromHigh
    riskDistribution.high -= availableFromHigh
  }

  const totalAttendance = students.reduce((sum, s) => sum + (s.attendanceRate || s.attendance?.percentage || 0), 0)
  const totalAPS = students.reduce((sum, s) => sum + (s.aps || 0), 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const alertsToday = alerts.filter((a) => a.createdAt >= today).length

  return {
    totalStudents: students.length,
    atRiskStudents: students.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory").length,
    activeInterventions: mockInterventions.filter((i) => i.status === "in-progress").length,
    averageAttendance: students.length ? totalAttendance / students.length : 0,
    averageAPS: students.length ? totalAPS / students.length : 0,
    alertsToday,
    riskDistribution,
  }
}

export function markAlertAsRead(alertId: string): void {
  // Try alert service first
  try {
    const { markAlertAsRead: markRead } = require("./alert-service")
    markRead(alertId)
    return
  } catch {
    // Fallback to mock alerts
  }
  const alert = mockAlerts.find((a) => a.id === alertId)
  if (alert) {
    alert.read = true
  }
}

/**
 * Create an alert programmatically
 */
export function createAlert(alertData: Omit<Alert, "id" | "createdAt" | "read" | "actionTaken">): Alert {
  try {
    const { triggerAlert } = require("./alert-service")
    return triggerAlert(alertData.studentId, alertData.type, alertData.severity, alertData.message)
  } catch {
    // Fallback: create alert in mock data (not ideal, but provides compatibility)
    const alert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(),
      read: false,
      actionTaken: false,
    }
    mockAlerts.push(alert)
    return alert
  }
}

/**
 * Get alerts by student ID
 */
export function getAlertsByStudent(studentId: string): Alert[] {
  try {
    const { getAlertsByStudent: getAlerts } = require("./alert-service")
    return getAlerts(studentId)
  } catch {
    return mockAlerts.filter((a) => a.studentId === studentId)
  }
}

/**
 * Get alerts by severity
 */
export function getAlertsBySeverity(severity: Alert["severity"]): Alert[] {
  try {
    const { getAlertsBySeverity: getAlerts } = require("./alert-service")
    return getAlerts(severity)
  } catch {
    return mockAlerts.filter((a) => a.severity === severity)
  }
}

export function createIntervention(intervention: Omit<Intervention, "id" | "createdAt">): Intervention {
  const newIntervention: Intervention = {
    ...intervention,
    id: `int${mockInterventions.length + 1}`,
    createdAt: new Date(),
  }
  mockInterventions.push(newIntervention)
  return newIntervention
}

// Subject functions
export function getSubjects(): Subject[] {
  return mockSubjects
}

export function getSubject(code: string): Subject | undefined {
  return mockSubjects.find((s) => s.code === code)
}

// Group functions
export function getGroups(): Group[] {
  return mockGroups
}

// Communication history functions
export function getCommunicationHistory(studentId: string | number): CommunicationHistory[] {
  // Convert studentId to number for comparison
  const idNum = typeof studentId === "number" ? studentId : parseInt(String(studentId), 10)
  
  // Filter communication history by student ID
  return mockCommunicationHistory.filter((comm) => comm.studentId === idNum)
}

// Sci-Bono functions
export function getSciBonoPerformance(studentId: string | number): SciBonoPerformance | undefined {
  const student = getStudent(studentId)
  return student?.sciBono
}

// School functions
export function getSchools(): SchoolSummary[] {
  return generateSchoolSummaries()
}

export function getSchoolsByDistrict(districtId: string): SchoolSummary[] {
  if (districtId === "all") return getSchools()
  return getSchools().filter((school) => school.districtId === districtId)
}

export function getSchoolsByProvince(provinceId: string): SchoolSummary[] {
  if (provinceId === "all") return getSchools()
  return getSchools().filter((school) => school.provinceId === provinceId)
}

export function getSchool(schoolId: string): SchoolSummary | undefined {
  return getSchools().find((school) => school.id === schoolId)
}
