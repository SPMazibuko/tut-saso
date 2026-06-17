"use client"

import type { MELMetrics } from "./types"
import { getMELMetrics } from "./governance"

/**
 * MEL Service - Enhanced monitoring, evaluation, and learning metrics
 */

export interface MELTrendData {
  period: string
  metrics: MELMetrics
}

export interface MELComparison {
  schoolId1: string
  schoolId2: string
  differences: {
    monitoring: Record<string, number>
    tracking: Record<string, number>
    analytics: Record<string, number>
    evaluation: Record<string, number>
  }
}

export interface MELAlert {
  schoolId: string
  category: "monitoring" | "tracking" | "analytics" | "evaluation"
  metric: string
  currentValue: number
  threshold: number
  severity: "low" | "medium" | "high"
  message: string
}

/**
 * Calculate comprehensive MEL metrics for a school
 */
export function calculateMELMetrics(schoolId: string, period?: { start: Date; end: Date }): MELMetrics | null {
  // For now, use the existing governance function
  // In a real system, this would aggregate data over the specified period
  return getMELMetrics(schoolId)
}

/**
 * Get MEL trends over multiple periods
 */
export function getMELTrends(schoolId: string, periods: number = 4): MELTrendData[] {
  const trends: MELTrendData[] = []
  
  // Generate mock trend data - in a real system, this would query historical data
  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const period = date.toISOString().slice(0, 7) // YYYY-MM format
    
    const metrics = getMELMetrics(schoolId)
    if (metrics) {
      // Add some variation to show trends (in real system, this would be actual historical data)
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const adjustedMetrics: MELMetrics = {
        ...metrics,
        monitoring: {
          ...metrics.monitoring,
          workflowFidelity: Math.max(0, Math.min(100, metrics.monitoring.workflowFidelity + variation * 100)),
        },
      }
      
      trends.push({
        period,
        metrics: adjustedMetrics,
      })
    }
  }
  
  return trends
}

/**
 * Compare MEL metrics between two schools
 */
export function compareMELMetrics(schoolId1: string, schoolId2: string): MELComparison | null {
  const metrics1 = getMELMetrics(schoolId1)
  const metrics2 = getMELMetrics(schoolId2)
  
  if (!metrics1 || !metrics2) return null
  
  return {
    schoolId1,
    schoolId2,
    differences: {
      monitoring: {
        alertToInterventionLatency: metrics1.monitoring.alertToInterventionLatency - metrics2.monitoring.alertToInterventionLatency,
        interventionClosureTime: metrics1.monitoring.interventionClosureTime - metrics2.monitoring.interventionClosureTime,
        workflowFidelity: metrics1.monitoring.workflowFidelity - metrics2.monitoring.workflowFidelity,
        rolePlayerResponsiveness: metrics1.monitoring.rolePlayerResponsiveness - metrics2.monitoring.rolePlayerResponsiveness,
        atRiskWithActivePlan: metrics1.monitoring.coverageMetrics.atRiskWithActivePlan - metrics2.monitoring.coverageMetrics.atRiskWithActivePlan,
        classesWithCurriculumCoverage: metrics1.monitoring.coverageMetrics.classesWithCurriculumCoverage - metrics2.monitoring.coverageMetrics.classesWithCurriculumCoverage,
        sbaOnTimeUploads: metrics1.monitoring.dataQuality.sbaOnTimeUploads - metrics2.monitoring.dataQuality.sbaOnTimeUploads,
        attendanceCompleteness: metrics1.monitoring.dataQuality.attendanceCompleteness - metrics2.monitoring.dataQuality.attendanceCompleteness,
      },
      tracking: {
        grade8to9: metrics1.tracking.cohortProgression.grade8to9 - metrics2.tracking.cohortProgression.grade8to9,
        grade9to10: metrics1.tracking.cohortProgression.grade9to10 - metrics2.tracking.cohortProgression.grade9to10,
        grade10to11: metrics1.tracking.cohortProgression.grade10to11 - metrics2.tracking.cohortProgression.grade10to11,
        grade11to12: metrics1.tracking.cohortProgression.grade11to12 - metrics2.tracking.cohortProgression.grade11to12,
        firstYearReadinessIndex: metrics1.tracking.feederMapping.firstYearReadinessIndex - metrics2.tracking.feederMapping.firstYearReadinessIndex,
      },
      analytics: {
        predictivePrecision: metrics1.analytics.predictivePrecision - metrics2.analytics.predictivePrecision,
        predictiveRecall: metrics1.analytics.predictiveRecall - metrics2.analytics.predictiveRecall,
        interventionUplift: metrics1.analytics.interventionUplift - metrics2.analytics.interventionUplift,
        withIntervention: metrics1.analytics.counterfactualForecast.withIntervention - metrics2.analytics.counterfactualForecast.withIntervention,
        withoutIntervention: metrics1.analytics.counterfactualForecast.withoutIntervention - metrics2.analytics.counterfactualForecast.withoutIntervention,
      },
      evaluation: {
        attendanceChange: metrics1.evaluation.outcomeKPIs.attendanceChange - metrics2.evaluation.outcomeKPIs.attendanceChange,
        sbaChange: metrics1.evaluation.outcomeKPIs.sbaChange - metrics2.evaluation.outcomeKPIs.sbaChange,
        promotionRateChange: metrics1.evaluation.outcomeKPIs.promotionRateChange - metrics2.evaluation.outcomeKPIs.promotionRateChange,
        repeatRateChange: metrics1.evaluation.outcomeKPIs.repeatRateChange - metrics2.evaluation.outcomeKPIs.repeatRateChange,
        dropoutRateChange: metrics1.evaluation.outcomeKPIs.dropoutRateChange - metrics2.evaluation.outcomeKPIs.dropoutRateChange,
      },
    },
  }
}

/**
 * Get MEL alerts for threshold violations
 */
export function getMELAlerts(schoolId: string): MELAlert[] {
  const metrics = getMELMetrics(schoolId)
  if (!metrics) return []
  
  const alerts: MELAlert[] = []
  
  // Define thresholds
  const thresholds = {
    workflowFidelity: 80,
    rolePlayerResponsiveness: 85,
    atRiskWithActivePlan: 70,
    attendanceCompleteness: 90,
    sbaOnTimeUploads: 85,
    predictivePrecision: 0.70,
    predictiveRecall: 0.75,
    interventionUplift: 5,
  }
  
  // Check monitoring metrics
  if (metrics.monitoring.workflowFidelity < thresholds.workflowFidelity) {
    alerts.push({
      schoolId,
      category: "monitoring",
      metric: "workflowFidelity",
      currentValue: metrics.monitoring.workflowFidelity,
      threshold: thresholds.workflowFidelity,
      severity: metrics.monitoring.workflowFidelity < thresholds.workflowFidelity * 0.8 ? "high" : "medium",
      message: `Workflow fidelity is ${metrics.monitoring.workflowFidelity.toFixed(1)}%, below threshold of ${thresholds.workflowFidelity}%`,
    })
  }
  
  if (metrics.monitoring.rolePlayerResponsiveness < thresholds.rolePlayerResponsiveness) {
    alerts.push({
      schoolId,
      category: "monitoring",
      metric: "rolePlayerResponsiveness",
      currentValue: metrics.monitoring.rolePlayerResponsiveness,
      threshold: thresholds.rolePlayerResponsiveness,
      severity: metrics.monitoring.rolePlayerResponsiveness < thresholds.rolePlayerResponsiveness * 0.8 ? "high" : "medium",
      message: `Role player responsiveness is ${metrics.monitoring.rolePlayerResponsiveness.toFixed(1)}%, below threshold of ${thresholds.rolePlayerResponsiveness}%`,
    })
  }
  
  if (metrics.monitoring.coverageMetrics.atRiskWithActivePlan < thresholds.atRiskWithActivePlan) {
    alerts.push({
      schoolId,
      category: "monitoring",
      metric: "atRiskWithActivePlan",
      currentValue: metrics.monitoring.coverageMetrics.atRiskWithActivePlan,
      threshold: thresholds.atRiskWithActivePlan,
      severity: metrics.monitoring.coverageMetrics.atRiskWithActivePlan < thresholds.atRiskWithActivePlan * 0.8 ? "high" : "medium",
      message: `Only ${metrics.monitoring.coverageMetrics.atRiskWithActivePlan.toFixed(1)}% of at-risk students have active plans, below threshold of ${thresholds.atRiskWithActivePlan}%`,
    })
  }
  
  if (metrics.monitoring.dataQuality.attendanceCompleteness < thresholds.attendanceCompleteness) {
    alerts.push({
      schoolId,
      category: "monitoring",
      metric: "attendanceCompleteness",
      currentValue: metrics.monitoring.dataQuality.attendanceCompleteness,
      threshold: thresholds.attendanceCompleteness,
      severity: metrics.monitoring.dataQuality.attendanceCompleteness < thresholds.attendanceCompleteness * 0.9 ? "high" : "medium",
      message: `Attendance completeness is ${metrics.monitoring.dataQuality.attendanceCompleteness.toFixed(1)}%, below threshold of ${thresholds.attendanceCompleteness}%`,
    })
  }
  
  if (metrics.monitoring.dataQuality.sbaOnTimeUploads < thresholds.sbaOnTimeUploads) {
    alerts.push({
      schoolId,
      category: "monitoring",
      metric: "sbaOnTimeUploads",
      currentValue: metrics.monitoring.dataQuality.sbaOnTimeUploads,
      threshold: thresholds.sbaOnTimeUploads,
      severity: metrics.monitoring.dataQuality.sbaOnTimeUploads < thresholds.sbaOnTimeUploads * 0.9 ? "high" : "medium",
      message: `SBA on-time uploads are ${metrics.monitoring.dataQuality.sbaOnTimeUploads.toFixed(1)}%, below threshold of ${thresholds.sbaOnTimeUploads}%`,
    })
  }
  
  // Check analytics metrics
  if (metrics.analytics.predictivePrecision < thresholds.predictivePrecision) {
    alerts.push({
      schoolId,
      category: "analytics",
      metric: "predictivePrecision",
      currentValue: metrics.analytics.predictivePrecision,
      threshold: thresholds.predictivePrecision,
      severity: metrics.analytics.predictivePrecision < thresholds.predictivePrecision * 0.9 ? "high" : "medium",
      message: `Predictive precision is ${(metrics.analytics.predictivePrecision * 100).toFixed(1)}%, below threshold of ${(thresholds.predictivePrecision * 100).toFixed(1)}%`,
    })
  }
  
  if (metrics.analytics.predictiveRecall < thresholds.predictiveRecall) {
    alerts.push({
      schoolId,
      category: "analytics",
      metric: "predictiveRecall",
      currentValue: metrics.analytics.predictiveRecall,
      threshold: thresholds.predictiveRecall,
      severity: metrics.analytics.predictiveRecall < thresholds.predictiveRecall * 0.9 ? "high" : "medium",
      message: `Predictive recall is ${(metrics.analytics.predictiveRecall * 100).toFixed(1)}%, below threshold of ${(thresholds.predictiveRecall * 100).toFixed(1)}%`,
    })
  }
  
  if (metrics.analytics.interventionUplift < thresholds.interventionUplift) {
    alerts.push({
      schoolId,
      category: "analytics",
      metric: "interventionUplift",
      currentValue: metrics.analytics.interventionUplift,
      threshold: thresholds.interventionUplift,
      severity: metrics.analytics.interventionUplift < thresholds.interventionUplift * 0.8 ? "high" : "medium",
      message: `Intervention uplift is ${metrics.analytics.interventionUplift.toFixed(1)} percentage points, below threshold of ${thresholds.interventionUplift}`,
    })
  }
  
  return alerts
}

/**
 * Get summary statistics across all MEL categories
 */
export function getMELSummary(schoolId: string): {
  monitoringScore: number
  trackingScore: number
  analyticsScore: number
  evaluationScore: number
  overallScore: number
} {
  const metrics = getMELMetrics(schoolId)
  if (!metrics) {
    return {
      monitoringScore: 0,
      trackingScore: 0,
      analyticsScore: 0,
      evaluationScore: 0,
      overallScore: 0,
    }
  }
  
  // Calculate scores (weighted averages)
  const monitoringScore =
    (metrics.monitoring.workflowFidelity * 0.3 +
      metrics.monitoring.rolePlayerResponsiveness * 0.3 +
      metrics.monitoring.coverageMetrics.atRiskWithActivePlan * 0.2 +
      metrics.monitoring.dataQuality.attendanceCompleteness * 0.1 +
      metrics.monitoring.dataQuality.sbaOnTimeUploads * 0.1)
  
  const trackingScore =
    (metrics.tracking.cohortProgression.grade8to9 * 0.25 +
      metrics.tracking.cohortProgression.grade9to10 * 0.25 +
      metrics.tracking.cohortProgression.grade10to11 * 0.25 +
      metrics.tracking.cohortProgression.grade11to12 * 0.25)
  
  const analyticsScore =
    (metrics.analytics.predictivePrecision * 50 +
      metrics.analytics.predictiveRecall * 50)
  
  // Evaluation score (convert changes to 0-100 scale, assuming positive changes are good)
  const evalKPIs = metrics.evaluation.outcomeKPIs
  const evaluationScore =
    (Math.max(0, Math.min(100, 50 + evalKPIs.attendanceChange * 2)) * 0.2 +
      Math.max(0, Math.min(100, 50 + evalKPIs.sbaChange * 2)) * 0.2 +
      Math.max(0, Math.min(100, 50 + evalKPIs.promotionRateChange * 2)) * 0.3 +
      Math.max(0, Math.min(100, 50 - evalKPIs.repeatRateChange * 2)) * 0.15 +
      Math.max(0, Math.min(100, 50 - evalKPIs.dropoutRateChange * 2)) * 0.15)
  
  const overallScore = (monitoringScore * 0.3 + trackingScore * 0.25 + analyticsScore * 0.25 + evaluationScore * 0.2)
  
  return {
    monitoringScore: Math.round(monitoringScore),
    trackingScore: Math.round(trackingScore),
    analyticsScore: Math.round(analyticsScore),
    evaluationScore: Math.round(evaluationScore),
    overallScore: Math.round(overallScore),
  }
}

