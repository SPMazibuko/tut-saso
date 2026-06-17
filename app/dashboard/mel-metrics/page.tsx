"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMELMetrics } from "@/lib/governance"
import { getMELSummary, getMELAlerts, getMELTrends } from "@/lib/mel-service"
import type { MELMetrics, MELAlert } from "@/lib/mel-service"
import { AlertTriangle, CheckCircle2, TrendingUp, Activity, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockSchoolPerformanceData } from "@/lib/mock-governance-data"

export default function MELMetricsPage() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("")
  const [metrics, setMetrics] = useState<MELMetrics | null>(null)
  const [summary, setSummary] = useState<ReturnType<typeof getMELSummary> | null>(null)
  const [alerts, setAlerts] = useState<MELAlert[]>([])
  const [trends, setTrends] = useState<ReturnType<typeof getMELTrends>>([])

  // Get available schools
  const availableSchools = mockSchoolPerformanceData.map((s) => ({
    id: s.schoolId,
    name: s.schoolName,
  }))

  useEffect(() => {
    if (selectedSchoolId) {
      const melMetrics = getMELMetrics(selectedSchoolId)
      setMetrics(melMetrics)
      if (melMetrics) {
        setSummary(getMELSummary(selectedSchoolId))
        setAlerts(getMELAlerts(selectedSchoolId))
        setTrends(getMELTrends(selectedSchoolId, 6))
      }
    } else if (availableSchools.length > 0) {
      // Set default to first school
      setSelectedSchoolId(availableSchools[0].id)
    }
  }, [selectedSchoolId])

  if (!metrics || !summary) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading MEL metrics...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MEL Metrics Dashboard</h1>
          <p className="text-muted-foreground">Monitoring, Evaluation, and Learning Metrics</p>
        </div>
        <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a school" />
          </SelectTrigger>
          <SelectContent>
            {availableSchools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overallScore}</div>
            <Progress value={summary.overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.monitoringScore}</div>
            <Progress value={summary.monitoringScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracking</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.trackingScore}</div>
            <Progress value={summary.trackingScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.analyticsScore}</div>
            <Progress value={summary.analyticsScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluation</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.evaluationScore}</div>
            <Progress value={summary.evaluationScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Threshold Alerts
            </CardTitle>
            <CardDescription>Metrics below threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "high" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.category} / {alert.metric}
                      </p>
                    </div>
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Workflow Fidelity</span>
                    <span className="text-sm font-bold">{metrics.monitoring.workflowFidelity.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.monitoring.workflowFidelity} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Role Player Responsiveness</span>
                    <span className="text-sm font-bold">{metrics.monitoring.rolePlayerResponsiveness.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.monitoring.rolePlayerResponsiveness} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Alert to Intervention Latency</span>
                    <span className="text-sm font-bold">{metrics.monitoring.alertToInterventionLatency.toFixed(1)} days</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Intervention Closure Time</span>
                    <span className="text-sm font-bold">{metrics.monitoring.interventionClosureTime.toFixed(1)} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage & Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">At Risk with Active Plan</span>
                    <span className="text-sm font-bold">{metrics.monitoring.coverageMetrics.atRiskWithActivePlan.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.monitoring.coverageMetrics.atRiskWithActivePlan} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Curriculum Coverage</span>
                    <span className="text-sm font-bold">{metrics.monitoring.coverageMetrics.classesWithCurriculumCoverage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.monitoring.coverageMetrics.classesWithCurriculumCoverage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SBA On-Time Uploads</span>
                    <span className="text-sm font-bold">{metrics.monitoring.dataQuality.sbaOnTimeUploads.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.monitoring.dataQuality.sbaOnTimeUploads} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Attendance Completeness</span>
                    <span className="text-sm font-bold">{metrics.monitoring.dataQuality.attendanceCompleteness.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.monitoring.dataQuality.attendanceCompleteness} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Foundation Faculty → Applied Faculty</span>
                    <span className="text-sm font-bold">{metrics.tracking.cohortProgression.grade8to9.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.tracking.cohortProgression.grade8to9} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Applied Faculty → Professional Faculty</span>
                    <span className="text-sm font-bold">{metrics.tracking.cohortProgression.grade9to10.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.tracking.cohortProgression.grade9to10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Professional Faculty → Advanced Faculty</span>
                    <span className="text-sm font-bold">{metrics.tracking.cohortProgression.grade10to11.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.tracking.cohortProgression.grade10to11} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Advanced Faculty → Exit Faculty</span>
                    <span className="text-sm font-bold">{metrics.tracking.cohortProgression.grade11to12.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.tracking.cohortProgression.grade11to12} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feeder Mapping & Equity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">First Year Readiness Index</span>
                    <span className="text-sm font-bold">{metrics.tracking.feederMapping.firstYearReadinessIndex.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.tracking.feederMapping.firstYearReadinessIndex} className="h-2" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">TVET Transitions: {metrics.tracking.feederMapping.tvetTransitions}</p>
                  <p className="text-sm font-medium">University Transitions: {metrics.tracking.feederMapping.universityTransitions}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Predictive Precision</span>
                    <span className="text-sm font-bold">{(metrics.analytics.predictivePrecision * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.analytics.predictivePrecision * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Predictive Recall</span>
                    <span className="text-sm font-bold">{(metrics.analytics.predictiveRecall * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.analytics.predictiveRecall * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Intervention Uplift</span>
                    <span className="text-sm font-bold">{metrics.analytics.interventionUplift.toFixed(1)} pp</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Counterfactual Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">With Intervention</span>
                    <span className="text-sm font-bold">{metrics.analytics.counterfactualForecast.withIntervention.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.analytics.counterfactualForecast.withIntervention} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Without Intervention</span>
                    <span className="text-sm font-bold">{metrics.analytics.counterfactualForecast.withoutIntervention.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.analytics.counterfactualForecast.withoutIntervention} className="h-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Expected improvement: +{(metrics.analytics.counterfactualForecast.withIntervention - metrics.analytics.counterfactualForecast.withoutIntervention).toFixed(1)} percentage points
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outcome KPIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium mb-1">Attendance Change</p>
                  <p className={`text-2xl font-bold ${metrics.evaluation.outcomeKPIs.attendanceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metrics.evaluation.outcomeKPIs.attendanceChange > 0 ? "+" : ""}
                    {metrics.evaluation.outcomeKPIs.attendanceChange.toFixed(1)} pp
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">SBA Change</p>
                  <p className={`text-2xl font-bold ${metrics.evaluation.outcomeKPIs.sbaChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metrics.evaluation.outcomeKPIs.sbaChange > 0 ? "+" : ""}
                    {metrics.evaluation.outcomeKPIs.sbaChange.toFixed(1)} pp
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Promotion Rate Change</p>
                  <p className={`text-2xl font-bold ${metrics.evaluation.outcomeKPIs.promotionRateChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metrics.evaluation.outcomeKPIs.promotionRateChange > 0 ? "+" : ""}
                    {metrics.evaluation.outcomeKPIs.promotionRateChange.toFixed(1)} pp
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Repeat Rate Change</p>
                  <p className={`text-2xl font-bold ${metrics.evaluation.outcomeKPIs.repeatRateChange <= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metrics.evaluation.outcomeKPIs.repeatRateChange > 0 ? "+" : ""}
                    {metrics.evaluation.outcomeKPIs.repeatRateChange.toFixed(1)} pp
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Dropout Rate Change</p>
                  <p className={`text-2xl font-bold ${metrics.evaluation.outcomeKPIs.dropoutRateChange <= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metrics.evaluation.outcomeKPIs.dropoutRateChange > 0 ? "+" : ""}
                    {metrics.evaluation.outcomeKPIs.dropoutRateChange.toFixed(1)} pp
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Time to Support Change</p>
                  <p className={`text-2xl font-bold ${metrics.evaluation.outcomeKPIs.timeToSupportChange <= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metrics.evaluation.outcomeKPIs.timeToSupportChange > 0 ? "+" : ""}
                    {metrics.evaluation.outcomeKPIs.timeToSupportChange.toFixed(1)} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

