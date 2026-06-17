"use client"

import type { Alert, Intervention, Learner } from "./types"
import { predictRisk, monitorStudentRisk } from "./ai"
import { evaluateRiskAndAlert, processRiskChange, getAllAlerts } from "./alert-service"
import {
  autoCreateIntervention,
  evaluateInterventionNeed,
  assignIntervention,
  processAlertForIntervention,
} from "./intervention-workflow"
import { getStudent, getStudents } from "./data-service"

/**
 * Workflow Orchestrator - Coordinates the complete risk → alert → intervention flow
 */

export interface WorkflowExecution {
  id: string
  studentId: string
  timestamp: Date
  steps: WorkflowStep[]
  status: "completed" | "failed" | "partial"
  error?: string
}

export interface WorkflowStep {
  step: string
  timestamp: Date
  success: boolean
  result?: any
  error?: string
}

// Store workflow execution history
const workflowHistory: WorkflowExecution[] = []

/**
 * Execute full workflow for a student: Risk Assessment → Alert Generation → Intervention Creation
 */
export async function executeWorkflowForStudent(studentId: string): Promise<WorkflowExecution> {
  const execution: WorkflowExecution = {
    id: `workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    studentId,
    timestamp: new Date(),
    steps: [],
    status: "partial",
  }

  try {
    // Step 1: Get student data
    const student = getStudent(studentId)
    if (!student) {
      execution.status = "failed"
      execution.error = "Student not found"
      execution.steps.push({
        step: "get_student",
        timestamp: new Date(),
        success: false,
        error: "Student not found",
      })
      workflowHistory.push(execution)
      return execution
    }

    execution.steps.push({
      step: "get_student",
      timestamp: new Date(),
      success: true,
      result: { studentId: student.id, name: student.name },
    })

    // Step 2: Perform risk assessment
    let riskPrediction
    try {
      const predictions = predictRisk([{ studentId, features: {} }])
      riskPrediction = predictions[0]
      execution.steps.push({
        step: "risk_assessment",
        timestamp: new Date(),
        success: true,
        result: {
          riskScore: riskPrediction.riskScore,
          riskLevel: riskPrediction.riskLevel,
        },
      })
    } catch (error: any) {
      execution.steps.push({
        step: "risk_assessment",
        timestamp: new Date(),
        success: false,
        error: error.message,
      })
      execution.status = "failed"
      execution.error = "Risk assessment failed"
      workflowHistory.push(execution)
      return execution
    }

    // Step 3: Evaluate and create alerts if needed
    let alert: Alert | null = null
    try {
      const oldRiskLevel = student.riskLevel
      // Note: In a real system, we'd compare with previous risk level from storage
      // For now, we'll just evaluate current risk
      alert = evaluateRiskAndAlert(studentId)
      if (alert) {
        execution.steps.push({
          step: "alert_generation",
          timestamp: new Date(),
          success: true,
          result: {
            alertId: alert.id,
            type: alert.type,
            severity: alert.severity,
          },
        })
      } else {
        execution.steps.push({
          step: "alert_generation",
          timestamp: new Date(),
          success: true,
          result: { message: "No alert needed" },
        })
      }
    } catch (error: any) {
      execution.steps.push({
        step: "alert_generation",
        timestamp: new Date(),
        success: false,
        error: error.message,
      })
    }

    // Step 4: Evaluate intervention need and create if necessary
    let intervention: Intervention | null = null
    try {
      const evaluation = evaluateInterventionNeed(studentId)
      if (evaluation.needsIntervention) {
        // If we have an alert, use it to create intervention
        if (alert) {
          intervention = processAlertForIntervention(alert.id)
        } else {
          // Otherwise, assign intervention directly
          intervention = assignIntervention(studentId, evaluation.recommendedType, evaluation.priority)
        }

        if (intervention) {
          execution.steps.push({
            step: "intervention_creation",
            timestamp: new Date(),
            success: true,
            result: {
              interventionId: intervention.id,
              type: intervention.type,
              status: intervention.status,
            },
          })
        } else {
          execution.steps.push({
            step: "intervention_creation",
            timestamp: new Date(),
            success: false,
            error: "Failed to create intervention",
          })
        }
      } else {
        execution.steps.push({
          step: "intervention_creation",
          timestamp: new Date(),
          success: true,
          result: { message: "No intervention needed", reason: evaluation.reason },
        })
      }
    } catch (error: any) {
      execution.steps.push({
        step: "intervention_creation",
        timestamp: new Date(),
        success: false,
        error: error.message,
      })
    }

    // Determine final status
    const failedSteps = execution.steps.filter((s) => !s.success)
    if (failedSteps.length === 0) {
      execution.status = "completed"
    } else if (execution.steps.length === failedSteps.length) {
      execution.status = "failed"
    } else {
      execution.status = "partial"
    }

    workflowHistory.push(execution)
    return execution
  } catch (error: any) {
    execution.status = "failed"
    execution.error = error.message
    execution.steps.push({
      step: "workflow_error",
      timestamp: new Date(),
      success: false,
      error: error.message,
    })
    workflowHistory.push(execution)
    return execution
  }
}

/**
 * Batch execute workflow for multiple students
 */
export async function batchExecuteWorkflow(studentIds: string[]): Promise<WorkflowExecution[]> {
  const executions: WorkflowExecution[] = []
  for (const studentId of studentIds) {
    const execution = await executeWorkflowForStudent(studentId)
    executions.push(execution)
  }
  return executions
}

/**
 * Execute workflow for all at-risk students
 */
export async function executeWorkflowForAtRiskStudents(): Promise<WorkflowExecution[]> {
  const students = getStudents()
  const atRiskStudentIds = students
    .filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory")
    .map((s) => String(s.id))
  return batchExecuteWorkflow(atRiskStudentIds)
}

/**
 * Get workflow execution history
 */
export function getWorkflowHistory(studentId?: string): WorkflowExecution[] {
  if (studentId) {
    return workflowHistory.filter((w) => w.studentId === studentId)
  }
  return workflowHistory
}

/**
 * Get workflow execution by ID
 */
export function getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
  return workflowHistory.find((w) => w.id === executionId)
}

/**
 * Get recent workflow executions (last N)
 */
export function getRecentWorkflowExecutions(limit: number = 50): WorkflowExecution[] {
  return workflowHistory
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

