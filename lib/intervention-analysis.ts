"use client"

import type { Learner, Intervention, InterventionOutcome } from "./types"
import { getStudents, getInterventions } from "./data-service"

/**
 * Calculate intervention outcomes
 */
export function calculateInterventionOutcome(
  intervention: Intervention,
  student: Learner
): InterventionOutcome {
  const beforeMetrics = {
    attendance: student.attendanceRate || student.attendance.percentage,
    averageScore: (student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3,
    riskLevel: student.riskLevel,
    riskScore: student.riskScore || 0,
  }

  // For completed interventions, calculate after metrics
  // In a real system, this would track actual changes
  let afterMetrics: InterventionOutcome["afterMetrics"] | undefined
  let improvement: InterventionOutcome["improvement"] | undefined

  if (intervention.status === "completed" && intervention.endDate) {
    // Estimate improvement based on intervention type
    const improvementFactor = getImprovementFactor(intervention.type)
    
    afterMetrics = {
      attendance: Math.min(100, beforeMetrics.attendance + improvementFactor.attendance),
      averageScore: Math.min(100, beforeMetrics.averageScore + improvementFactor.score),
      riskLevel: getImprovedRiskLevel(beforeMetrics.riskLevel, improvementFactor.risk),
      riskScore: Math.max(0, beforeMetrics.riskScore - improvementFactor.risk * 10),
    }

    improvement = {
      attendanceChange: afterMetrics.attendance - beforeMetrics.attendance,
      scoreChange: afterMetrics.averageScore - beforeMetrics.averageScore,
      riskLevelChange: getRiskLevelChange(beforeMetrics.riskLevel, afterMetrics.riskLevel),
      riskScoreChange: afterMetrics.riskScore - beforeMetrics.riskScore,
    }
  }

  const duration = intervention.endDate && intervention.startDate
    ? Math.ceil((intervention.endDate.getTime() - intervention.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : undefined

  return {
    interventionId: intervention.id,
    studentId: student.id,
    interventionType: intervention.type,
    startDate: intervention.startDate,
    endDate: intervention.endDate,
    status: intervention.status,
    beforeMetrics,
    afterMetrics,
    improvement,
    duration,
  }
}

/**
 * Get improvement factor based on intervention type
 */
function getImprovementFactor(type: Intervention["type"]): {
  attendance: number
  score: number
  risk: number
} {
  const factors: Record<Intervention["type"], { attendance: number; score: number; risk: number }> = {
    tutoring: { attendance: 5, score: 8, risk: 0.3 },
    counseling: { attendance: 8, score: 3, risk: 0.5 },
    mentoring: { attendance: 6, score: 5, risk: 0.4 },
    "academic-support": { attendance: 4, score: 10, risk: 0.3 },
    other: { attendance: 3, score: 4, risk: 0.2 },
  }

  return factors[type] || factors.other
}

/**
 * Get improved risk level
 */
function getImprovedRiskLevel(
  currentLevel: Learner["riskLevel"],
  improvement: number
): Learner["riskLevel"] {
  if (improvement >= 0.4) {
    if (currentLevel === "At Risk") return "Satisfactory"
    if (currentLevel === "Satisfactory") return "Good"
  }
  return currentLevel
}

/**
 * Get risk level change description
 */
function getRiskLevelChange(
  before: Learner["riskLevel"],
  after: Learner["riskLevel"]
): string {
  if (before === after) return "No change"
  if (before === "At Risk" && after === "Satisfactory") return "Improved to Satisfactory"
  if (before === "At Risk" && after === "Good") return "Improved to Good"
  if (before === "Satisfactory" && after === "Good") return "Improved to Good"
  if (before === "Satisfactory" && after === "At Risk") return "Declined to At Risk"
  if (before === "Good" && after === "Satisfactory") return "Declined to Satisfactory"
  if (before === "Good" && after === "At Risk") return "Declined to At Risk"
  return "Changed"
}

/**
 * Get all intervention outcomes
 */
export function getAllInterventionOutcomes(students?: Learner[]): InterventionOutcome[] {
  const studentList = students || getStudents()
  const outcomes: InterventionOutcome[] = []

  studentList.forEach((student) => {
    const interventions = getInterventions(String(student.id))
    interventions.forEach((intervention) => {
      const outcome = calculateInterventionOutcome(intervention, student)
      outcomes.push(outcome)
    })
  })

  return outcomes
}

/**
 * Get intervention effectiveness by type
 */
export function getInterventionEffectivenessByType(students?: Learner[]): Record<
  Intervention["type"],
  {
    total: number
    completed: number
    successRate: number
    averageImprovement: {
      attendance: number
      score: number
      riskScore: number
    }
  }
> {
  const outcomes = getAllInterventionOutcomes(students)
  const byType: Record<string, {
    total: number
    completed: number
    successful: number
    totalAttendanceImprovement: number
    totalScoreImprovement: number
    totalRiskImprovement: number
  }> = {}

  outcomes.forEach((outcome) => {
    if (!byType[outcome.interventionType]) {
      byType[outcome.interventionType] = {
        total: 0,
        completed: 0,
        successful: 0,
        totalAttendanceImprovement: 0,
        totalScoreImprovement: 0,
        totalRiskImprovement: 0,
      }
    }

    const typeData = byType[outcome.interventionType]
    typeData.total++

    if (outcome.status === "completed" && outcome.improvement) {
      typeData.completed++
      
      if (outcome.improvement.attendanceChange > 0 || 
          outcome.improvement.scoreChange > 0 || 
          outcome.improvement.riskScoreChange < 0) {
        typeData.successful++
      }

      typeData.totalAttendanceImprovement += outcome.improvement.attendanceChange
      typeData.totalScoreImprovement += outcome.improvement.scoreChange
      typeData.totalRiskImprovement += outcome.improvement.riskScoreChange
    }
  })

  const result: Record<Intervention["type"], {
    total: number
    completed: number
    successRate: number
    averageImprovement: {
      attendance: number
      score: number
      riskScore: number
    }
  }> = {} as any

  Object.entries(byType).forEach(([type, data]) => {
    result[type as Intervention["type"]] = {
      total: data.total,
      completed: data.completed,
      successRate: data.completed > 0 ? (data.successful / data.completed) * 100 : 0,
      averageImprovement: {
        attendance: data.completed > 0 ? data.totalAttendanceImprovement / data.completed : 0,
        score: data.completed > 0 ? data.totalScoreImprovement / data.completed : 0,
        riskScore: data.completed > 0 ? data.totalRiskImprovement / data.completed : 0,
      },
    }
  })

  return result
}

/**
 * Calculate ROI for interventions
 */
export function calculateInterventionROI(
  outcome: InterventionOutcome,
  costPerDay: number = 50
): {
  cost: number
  benefit: number
  roi: number
} {
  const cost = outcome.duration ? outcome.duration * costPerDay : 0

  if (!outcome.improvement) {
    return { cost, benefit: 0, roi: 0 }
  }

  // Calculate benefit based on improvements
  // Simplified: each point of improvement in attendance/score is worth a certain amount
  const attendanceBenefit = outcome.improvement.attendanceChange * 10
  const scoreBenefit = outcome.improvement.scoreChange * 15
  const riskBenefit = Math.abs(outcome.improvement.riskScoreChange) * 20

  const benefit = attendanceBenefit + scoreBenefit + riskBenefit
  const roi = cost > 0 ? ((benefit - cost) / cost) * 100 : 0

  return {
    cost,
    benefit,
    roi: Math.round(roi * 10) / 10,
  }
}

