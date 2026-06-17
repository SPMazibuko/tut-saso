import {
  mockStudents,
  mockAlerts,
  mockInterventions,
  mockRiskFactors,
  mockAssessments,
  mockAttendanceRecords,
  mockInterventionCases,
  mockConversations,
  mockCommunicationInsights,
} from "../mock-data"
import type { Learner, Alert, Intervention, RiskFactor, Assessment, AttendanceRecord, InterventionCase } from "../types"

// Dataset registry - maps dataset names to actual data arrays
export const DATASET_REGISTRY: Record<string, any[]> = {
  students: mockStudents,
  alerts: mockAlerts,
  interventions: mockInterventions,
  riskFactors: mockRiskFactors,
  assessments: mockAssessments,
  attendanceRecords: mockAttendanceRecords,
  interventionCases: mockInterventionCases,
  conversations: mockConversations,
}

// Helper to get dataset by name
export function getDataset(name: string): any[] {
  const dataset = DATASET_REGISTRY[name]
  if (!dataset) {
    throw new Error(`Dataset "${name}" not found. Available datasets: ${Object.keys(DATASET_REGISTRY).join(", ")}`)
  }
  return dataset
}

// Get all available dataset names
export function getAvailableDatasets(): string[] {
  return Object.keys(DATASET_REGISTRY)
}

// Get dataset schema info (field names and types) for a dataset
export function getDatasetSchema(name: string): Record<string, string> {
  const dataset = getDataset(name)
  if (dataset.length === 0) {
    return {}
  }

  const sample = dataset[0]
  const schema: Record<string, string> = {}

  for (const key in sample) {
    const value = sample[key]
    if (value === null || value === undefined) {
      schema[key] = "unknown"
    } else if (Array.isArray(value)) {
      schema[key] = "array"
    } else if (value instanceof Date) {
      schema[key] = "date"
    } else if (typeof value === "object") {
      schema[key] = "object"
    } else {
      schema[key] = typeof value
    }
  }

  return schema
}
