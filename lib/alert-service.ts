"use client"

import type { Alert, Learner } from "./types"
import { mockAlerts, mockStudents } from "./mock-data"
import { predictRisk } from "./ai"
import { getStudent } from "./data-service"

/**
 * Alert Service - Handles automated alert generation and management
 */

// Store for dynamically created alerts (in addition to mock data)
const dynamicAlerts: Alert[] = []

/**
 * Trigger an alert for a student
 */
export function triggerAlert(
  studentId: string,
  type: Alert["type"],
  severity: Alert["severity"],
  message: string,
): Alert {
  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    studentId,
    type,
    severity,
    message,
    createdAt: new Date(),
    read: false,
    actionTaken: false,
  }

  dynamicAlerts.push(alert)
  return alert
}

/**
 * Evaluate student risk and create alerts if thresholds are crossed
 */
export function evaluateRiskAndAlert(studentId: string): Alert | null {
  const student = getStudent(studentId)
  if (!student) return null

  // Get current risk prediction
  const [prediction] = predictRisk([{ studentId, features: {} }])
  if (!prediction) return null

  const riskScore = prediction.riskScore
  const riskLevel = prediction.riskLevel

  // Determine if we need to create an alert based on risk level
  if (riskLevel === "critical" || riskLevel === "high") {
    const severity: Alert["severity"] = riskLevel === "critical" ? "critical" : "high"
    
    // Check if alert already exists for this risk level (avoid duplicates)
    const existingAlerts = getAllAlerts().filter(
      (a) => a.studentId === studentId && a.type === "risk-increase" && !a.read,
    )
    const recentCritical = existingAlerts.some(
      (a) => a.severity === severity && new Date().getTime() - a.createdAt.getTime() < 24 * 60 * 60 * 1000,
    )

    if (!recentCritical) {
      const message = `${student.name} ${student.surname} risk score is ${riskScore} (${riskLevel}) - immediate attention required`
      return triggerAlert(studentId, "risk-increase", severity, message)
    }
  }

  // Check attendance threshold
  const attendanceRate = student.attendanceRate || student.attendance?.percentage || 0
  if (attendanceRate < 80) {
    const existingAttendanceAlerts = getAllAlerts().filter(
      (a) =>
        a.studentId === studentId &&
        a.type === "attendance" &&
        !a.read &&
        new Date().getTime() - a.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000, // Within 7 days
    )

    if (existingAttendanceAlerts.length === 0) {
      const severity: Alert["severity"] = attendanceRate < 70 ? "critical" : attendanceRate < 75 ? "high" : "medium"
      const message = `${student.name} ${student.surname} attendance dropped to ${attendanceRate.toFixed(1)}%`
      return triggerAlert(studentId, "attendance", severity, message)
    }
  }

  // Check grade drop
  const assessments = student.assessments
  if (assessments) {
    const pp = assessments.PP || 0
    if (pp < 50) {
      const existingGradeAlerts = getAllAlerts().filter(
        (a) =>
          a.studentId === studentId &&
          a.type === "grade-drop" &&
          !a.read &&
          new Date().getTime() - a.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000,
      )

      if (existingGradeAlerts.length === 0) {
        const severity: Alert["severity"] = pp < 40 ? "critical" : pp < 45 ? "high" : "medium"
        const message = `${student.name} ${student.surname} assessment score at ${pp}%, review academic progress`
        return triggerAlert(studentId, "grade-drop", severity, message)
      }
    }
  }

  return null
}

/**
 * Process risk change and create alerts if needed
 */
export function processRiskChange(
  studentId: string,
  oldRisk: Learner["riskLevel"],
  newRisk: Learner["riskLevel"],
): Alert | null {
  // Only alert on significant risk increases
  const riskOrder = { Good: 0, Satisfactory: 1, "At Risk": 2 }
  const oldRiskValue = riskOrder[oldRisk] ?? 0
  const newRiskValue = riskOrder[newRisk] ?? 0

  if (newRiskValue > oldRiskValue) {
    const student = getStudent(studentId)
    if (!student) return null

    const severityMap: Record<Learner["riskLevel"], Alert["severity"]> = {
      Good: "low",
      Satisfactory: "high",
      "At Risk": "critical",
    }

    const severity = severityMap[newRisk]
    const message = `${student.name} ${student.surname} risk level changed from ${oldRisk} to ${newRisk}`
    return triggerAlert(studentId, "risk-increase", severity, message)
  }

  return null
}

/**
 * Get all alerts (both mock and dynamic)
 */
export function getAllAlerts(): Alert[] {
  return [...mockAlerts, ...dynamicAlerts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Get alerts for a specific student
 */
export function getAlertsByStudent(studentId: string): Alert[] {
  return getAllAlerts().filter((a) => a.studentId === studentId)
}

/**
 * Get alerts by severity
 */
export function getAlertsBySeverity(severity: Alert["severity"]): Alert[] {
  return getAllAlerts().filter((a) => a.severity === severity)
}

/**
 * Get unread alerts
 */
export function getUnreadAlerts(): Alert[] {
  return getAllAlerts().filter((a) => !a.read)
}

/**
 * Mark alert as read
 */
export function markAlertAsRead(alertId: string): void {
  const alert = dynamicAlerts.find((a) => a.id === alertId)
  if (alert) {
    alert.read = true
  }
  // Also check mock alerts (they're mutable in this mock setup)
  const mockAlert = mockAlerts.find((a) => a.id === alertId)
  if (mockAlert) {
    mockAlert.read = true
  }
}

/**
 * Batch evaluate multiple students for risk alerts
 */
export function batchEvaluateRiskAndAlert(studentIds: string[]): Alert[] {
  const alerts: Alert[] = []
  for (const studentId of studentIds) {
    const alert = evaluateRiskAndAlert(studentId)
    if (alert) {
      alerts.push(alert)
    }
  }
  return alerts
}

