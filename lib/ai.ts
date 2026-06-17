"use client"

import type {
  ModelInfo,
  ModelType,
  PredictionInput,
  PredictionResult,
  Learner,
} from "./types"
import { mockStudents } from "./mock-data"

let models: ModelInfo[] = [
  {
    id: "model-risk-001",
    name: "Dropout Risk Classifier",
    type: "risk-prediction",
    version: "0.1.0",
    trainedAt: new Date("2025-01-10"),
    features: ["gpa", "attendanceRate", "grade"],
    status: "ready",
    fairnessMetrics: [
      { group: "grade-9", metric: "demographic_parity", value: 0.97 },
      { group: "grade-12", metric: "demographic_parity", value: 1.03 },
    ],
  },
]

export function listModels(): ModelInfo[] {
  return models
}

export function startTraining(type: ModelType): ModelInfo {
  const m: ModelInfo = {
    id: `model-${type}-${Date.now()}`,
    name: `${type} model`,
    type,
    version: "training",
    trainedAt: new Date(),
    features: [],
    status: "training",
  }
  models = [m, ...models]
  // Simulate training completion
  setTimeout(() => {
    m.status = "ready"
    m.version = "0.1.1"
    m.trainedAt = new Date()
    m.features = ["gpa", "attendanceRate", "grade"]
  }, 2000)
  return m
}

export function predictRisk(inputs: PredictionInput[]): PredictionResult[] {
  // Simple heuristic stub using existing mock data
  const studentById: Record<string, Learner> = Object.fromEntries(
    mockStudents.map((s) => [s.id, s]),
  )

  return inputs.map(({ studentId }) => {
    const s = studentById[studentId]
    const raw = (100 - s.attendanceRate) * 0.5 + (4 - s.gpa) * 12 + Number(s.grade) * 0.5
    const riskScore = Math.min(100, Math.max(0, Math.round(raw)))
    const riskLevel = riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 40 ? "medium" : "low"
    return {
      studentId,
      riskScore,
      riskLevel,
      shap: [
        { feature: "attendanceRate", contribution: (100 - s.attendanceRate) * 0.5 },
        { feature: "gpa", contribution: (4 - s.gpa) * 12 },
      ],
    }
  })
}

export function explainPrediction(studentId: string): PredictionResult | null {
  const [res] = predictRisk([{ studentId, features: {} }])
  return res ?? null
}

/**
 * Monitor student risk continuously
 * This function can be called periodically to check for risk changes
 */
export function monitorStudentRisk(studentId: string): {
  currentRisk: PredictionResult | null
  changeDetected: boolean
  previousRisk?: PredictionResult
} {
  const currentRisk = explainPrediction(studentId)
  // In a real system, we would store and compare with previous risk
  // For now, we'll just return the current risk
  return {
    currentRisk,
    changeDetected: false,
  }
}

/**
 * Batch risk assessment for multiple students
 */
export function batchRiskAssessment(studentIds: string[]): PredictionResult[] {
  const inputs: PredictionInput[] = studentIds.map((studentId) => ({ studentId, features: {} }))
  return predictRisk(inputs)
}

