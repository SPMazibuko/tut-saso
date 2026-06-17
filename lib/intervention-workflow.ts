"use client"

import type { Alert, Intervention, RiskFactor, Learner } from "./types"
import { getStudent, createIntervention, getRiskFactors } from "./data-service"
import { getAllAlerts, getAlertsByStudent } from "./alert-service"

/**
 * Intervention Workflow Service - Handles automated intervention creation and assignment
 */

/**
 * Auto-create intervention from an alert
 */
export function autoCreateIntervention(alertId: string, studentId: string): Intervention | null {
  const alerts = getAllAlerts()
  const alert = alerts.find((a) => a.id === alertId)
  if (!alert) return null

  const student = getStudent(studentId)
  if (!student) return null

  // Determine intervention type based on alert type
  let interventionType: Intervention["type"] = "academic-support"
  if (alert.type === "attendance") {
    interventionType = "tutoring"
  } else if (alert.type === "behavioral") {
    interventionType = "counseling"
  } else if (alert.type === "grade-drop" || alert.type === "risk-increase") {
    interventionType = "academic-support"
  }

  // Determine priority based on severity
  const priority = alert.severity === "critical" ? "high" : alert.severity === "high" ? "medium" : "low"

  // Determine assigned person based on intervention type
  let assignedTo = "teacher@ipass.edu" // Default
  if (interventionType === "counseling") {
    assignedTo = "counselor@ipass.edu"
  } else if (interventionType === "mentoring") {
    assignedTo = "mentor@ipass.edu"
  }

  const intervention = createIntervention({
    studentId,
    title: `Intervention: ${alert.type.replace("-", " ")} - ${student.name}`,
    description: `Auto-generated intervention based on alert: ${alert.message}`,
    type: interventionType,
    status: "planned",
    assignedTo,
    createdBy: "system",
    startDate: new Date(),
    notes: `Created from alert ${alertId}. Alert severity: ${alert.severity}. Alert type: ${alert.type}`,
  })

  return intervention
}

/**
 * Evaluate if a student needs an intervention based on risk factors
 */
export function evaluateInterventionNeed(studentId: string, riskFactors?: RiskFactor[]): {
  needsIntervention: boolean
  recommendedType: Intervention["type"]
  priority: "high" | "medium" | "low"
  reason: string
} {
  const student = getStudent(studentId)
  if (!student) {
    return {
      needsIntervention: false,
      recommendedType: "academic-support",
      priority: "low",
      reason: "Student not found",
    }
  }

  // Get risk factors if not provided
  const factors = riskFactors || getRiskFactors(studentId)
  const unresolvedFactors = factors.filter((f) => !f.resolved)

  // Check student's current risk level
  const riskLevel = student.riskLevel
  const riskScore = student.riskScore || 0

  // Check if there are active interventions already
  const activeInterventions = getInterventionsByStudent(studentId).filter(
    (i) => i.status === "in-progress" || i.status === "planned",
  )

  if (activeInterventions.length > 0) {
    return {
      needsIntervention: false,
      recommendedType: "academic-support",
      priority: "low",
      reason: "Active intervention already exists",
    }
  }

  // Evaluate based on risk level and factors
  if (riskLevel === "At Risk" || riskScore >= 70) {
    const criticalFactors = unresolvedFactors.filter((f) => f.severity === "critical").length
    const highFactors = unresolvedFactors.filter((f) => f.severity === "high").length

    let recommendedType: Intervention["type"] = "academic-support"
    if (criticalFactors > 0 || highFactors >= 2) {
      // Check factor categories to determine type
      const hasBehavioral = unresolvedFactors.some((f) => f.category === "behavioral")
      const hasAttendance = unresolvedFactors.some((f) => f.category === "attendance")
      
      if (hasBehavioral) {
        recommendedType = "counseling"
      } else if (hasAttendance) {
        recommendedType = "tutoring"
      } else {
        recommendedType = "academic-support"
      }

      return {
        needsIntervention: true,
        recommendedType,
        priority: criticalFactors > 0 ? "high" : "medium",
        reason: `High risk student with ${criticalFactors} critical and ${highFactors} high risk factors`,
      }
    }
  }

  if (riskLevel === "Satisfactory" && unresolvedFactors.length >= 2) {
    return {
      needsIntervention: true,
      recommendedType: "academic-support",
      priority: "medium",
      reason: `Moderate risk with ${unresolvedFactors.length} unresolved risk factors`,
    }
  }

  // Check alerts for this student
  const studentAlerts = getAlertsByStudent(studentId)
  const criticalAlerts = studentAlerts.filter((a) => a.severity === "critical" && !a.read)
  const highAlerts = studentAlerts.filter((a) => a.severity === "high" && !a.read)

  if (criticalAlerts.length > 0) {
    return {
      needsIntervention: true,
      recommendedType: determineInterventionTypeFromAlerts(criticalAlerts),
      priority: "high",
      reason: `${criticalAlerts.length} critical alert(s) requiring immediate intervention`,
    }
  }

  if (highAlerts.length >= 2) {
    return {
      needsIntervention: true,
      recommendedType: determineInterventionTypeFromAlerts(highAlerts),
      priority: "medium",
      reason: `${highAlerts.length} high severity alert(s) requiring intervention`,
    }
  }

  return {
    needsIntervention: false,
    recommendedType: "academic-support",
    priority: "low",
    reason: "No intervention needed at this time",
  }
}

/**
 * Determine intervention type from alerts
 */
function determineInterventionTypeFromAlerts(alerts: Alert[]): Intervention["type"] {
  const types = alerts.map((a) => a.type)
  if (types.includes("behavioral")) return "counseling"
  if (types.includes("attendance")) return "tutoring"
  if (types.includes("grade-drop")) return "academic-support"
  return "academic-support"
}

/**
 * Auto-assign intervention based on rules
 */
export function assignIntervention(
  studentId: string,
  type: Intervention["type"],
  priority: "high" | "medium" | "low" = "medium",
): Intervention | null {
  const student = getStudent(studentId)
  if (!student) return null

  // Check if intervention already exists
  const existingInterventions = getInterventionsByStudent(studentId).filter(
    (i) => i.status === "in-progress" || i.status === "planned",
  )
  if (existingInterventions.length > 0) {
    return existingInterventions[0] // Return existing intervention
  }

  // Determine assigned person based on type and priority
  let assignedTo = "teacher@ipass.edu" // Default
  if (type === "counseling") {
    assignedTo = priority === "high" ? "counselor@ipass.edu" : "teacher@ipass.edu"
  } else if (type === "mentoring") {
    assignedTo = "mentor@ipass.edu"
  } else if (type === "tutoring") {
    assignedTo = priority === "high" ? "tutor@ipass.edu" : "teacher@ipass.edu"
  }

  const intervention = createIntervention({
    studentId,
    title: `Intervention: ${type} - ${student.name}`,
    description: `Auto-assigned ${type} intervention for ${student.name} (Priority: ${priority})`,
    type,
    status: priority === "high" ? "in-progress" : "planned",
    assignedTo,
    createdBy: "system",
    startDate: new Date(),
    notes: `Auto-assigned with priority: ${priority}`,
  })

  return intervention
}

/**
 * Get interventions for a student (helper function)
 */
function getInterventionsByStudent(studentId: string): Intervention[] {
  // Import here to avoid circular dependency
  const { getInterventions } = require("./data-service")
  return getInterventions(studentId)
}

/**
 * Process alert and potentially create intervention
 */
export function processAlertForIntervention(alertId: string): Intervention | null {
  const alerts = getAllAlerts()
  const alert = alerts.find((a) => a.id === alertId)
  if (!alert) return null

  // Only auto-create interventions for high/critical alerts
  if (alert.severity === "high" || alert.severity === "critical") {
    const evaluation = evaluateInterventionNeed(alert.studentId)
    if (evaluation.needsIntervention) {
      return autoCreateIntervention(alertId, alert.studentId)
    }
  }

  return null
}

/**
 * Batch process alerts for intervention creation
 */
export function batchProcessAlertsForIntervention(alertIds: string[]): Intervention[] {
  const interventions: Intervention[] = []
  for (const alertId of alertIds) {
    const intervention = processAlertForIntervention(alertId)
    if (intervention) {
      interventions.push(intervention)
    }
  }
  return interventions
}

