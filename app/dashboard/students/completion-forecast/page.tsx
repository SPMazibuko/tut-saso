"use client"

import { useState, useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendLineChart, TrendBarChart, TrendAreaChart } from "@/components/analysis/trend-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStudents } from "@/lib/data-service"
import {
  getCohortSummary,
  getCohortSummaryByCourse,
  getAvailableCohortYears,
  getAvailableCourseCodes,
  getLearnerCourseCode,
} from "@/lib/cohort-summary"
import { getQualificationName } from "@/lib/tut-saso-data"

const mockRiskFactors = [
  { factor: "Low Attendance", impact: 35.2, students: 420 },
  { factor: "Poor Academic Performance", impact: 28.5, students: 340 },
  { factor: "Financial Difficulties", impact: 18.3, students: 218 },
  { factor: "Personal Issues", impact: 12.1, students: 144 },
  { factor: "Course Mismatch", impact: 5.9, students: 70 },
]

const mockCompletionLikelihood = [
  { category: "Very High (90-100%)",  count: 40, percentage: 2.8, color: "#82ca9d" },
  { category: "High (75-89%)",  count: 140, percentage: 9.9, color: "#a5d6a7" },
  { category: "Medium (50-74%)", count: 340, percentage: 23.9, color: "#ffc658" },
  { category: "Low (25-49%)", count: 380, percentage: 26.8, color: "#ffa726" },
  { category: "Very Low (0-24%)", count: 520, percentage: 36.6, color: "#ff6b6b" },
]

const mockDropoutPredictions = [
  { period: "2022 S1", predictedDropout: 100, actualDropout: 95, accuracy: 95.0 },
  { period: "2022 S2", predictedDropout: 80, actualDropout: 78, accuracy: 97.5 },
  { period: "2023 S1", predictedDropout: 120, actualDropout: 115, accuracy: 95.8 },
  { period: "2023 S2", predictedDropout: 100, actualDropout: 98, accuracy: 98.0 },
  { period: "2024 S1", predictedDropout: 120, actualDropout: 118, accuracy: 98.3 },
  { period: "2024 S2", predictedDropout: 100, actualDropout: null, accuracy: null },
]

export default function CompletionForecastPage() {
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")
  const [cohortYear, setCohortYear] = useState<number | "all">("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")

  const learners = useMemo(() => getStudents(), [])
  const availableYears = useMemo(() => getAvailableCohortYears(learners), [learners])
  const availableCourses = useMemo(() => getAvailableCourseCodes(learners), [learners])

  const filteredLearners = useMemo(() => {
    let list = [...learners]
    if (cohortYear !== "all") list = list.filter((l) => l.enrollmentYear === cohortYear)
    if (courseFilter !== "all") list = list.filter((l) => getLearnerCourseCode(l) === courseFilter)
    return list
  }, [learners, cohortYear, courseFilter])

  const cohortSummary = useMemo(() => getCohortSummary(filteredLearners), [filteredLearners])
  const cohortByCourse = useMemo(
    () => getCohortSummaryByCourse(learners, cohortYear === "all" ? undefined : cohortYear),
    [learners, cohortYear]
  )

  const forecastChartData = useMemo(() => {
    const byPeriod = new Map<string, { high: number; medium: number; low: number; dropout: number }>()
    for (const l of filteredLearners) {
      const period = `${l.enrollmentYear} S${l.semester}`
      if (!byPeriod.has(period)) byPeriod.set(period, { high: 0, medium: 0, low: 0, dropout: 0 })
      const row = byPeriod.get(period)!
      if (l.hasDroppedOut) row.dropout += 1
      else if (l.riskLevel === "Good") row.high += 1
      else if (l.riskLevel === "Satisfactory") row.medium += 1
      else row.low += 1
    }
    return Array.from(byPeriod.entries())
      .map(([period, row]) => ({
        period,
        highCompletion: row.high,
        mediumCompletion: row.medium,
        lowCompletion: row.low,
        predictedDropout: row.dropout,
        completionConfidence: 84,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const filteredData = useMemo(() => {
    let data = [...forecastChartData]
    if (yearFilter !== "all") data = data.filter((d) => d.period.startsWith(yearFilter))
    if (semesterFilter !== "all") data = data.filter((d) => d.period.endsWith(`S${semesterFilter}`))
    return data
  }, [forecastChartData, yearFilter, semesterFilter])

  const currentStats = useMemo(() => {
    if (filteredData.length === 0) {
      const high = filteredLearners.filter((l) => !l.hasDroppedOut && l.riskLevel === "Good").length
      const medium = filteredLearners.filter((l) => !l.hasDroppedOut && l.riskLevel === "Satisfactory").length
      const low = filteredLearners.filter((l) => !l.hasDroppedOut && l.riskLevel === "At Risk").length
      const dropout = filteredLearners.filter((l) => l.hasDroppedOut).length
      return { highCompletion: high, mediumCompletion: medium, lowCompletion: low, predictedDropout: dropout, completionConfidence: 84 }
    }
    return filteredData[filteredData.length - 1]
  }, [filteredData, filteredLearners])

  const totalStudents = currentStats.highCompletion + currentStats.mediumCompletion + currentStats.lowCompletion + currentStats.predictedDropout
  const predictedCompletion = currentStats.highCompletion + currentStats.mediumCompletion + (currentStats.lowCompletion * 0.3)

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Completion Forecast"
        subtitle="Predictive statistics for students likely to finish vs. those likely to drop out"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter forecast data by year and semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cohort: Where are they now */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort: Where are they now?</CardTitle>
          <CardDescription>
            Cohort Status by First-Year Intake (In Progression, Dropped Out, or Currently Excluded)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">First year intake</span>
                <Select
                  value={cohortYear === "all" ? "all" : String(cohortYear)}
                  onValueChange={(v) => setCohortYear(v === "all" ? "all" : parseInt(v, 10))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All cohorts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cohorts</SelectItem>
                    {availableYears.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Qualification</span>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="All qualifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All qualifications</SelectItem>
                    {availableCourses.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code} — {getQualificationName(code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In progression</CardDescription>
                  <CardTitle className="text-2xl">{cohortSummary.inProgression.toLocaleString()}</CardTitle>
                  {cohortSummary.total > 0 && (
                    <CardDescription className="text-xs mt-1">
                      ({((cohortSummary.inProgression / cohortSummary.total) * 100).toFixed(1)}%)
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Dropped out</CardDescription>
                  <CardTitle className="text-2xl">{cohortSummary.droppedOut.toLocaleString()}</CardTitle>
                  {cohortSummary.total > 0 && (
                    <CardDescription className="text-xs mt-1">
                      ({((cohortSummary.droppedOut / cohortSummary.total) * 100).toFixed(1)}%)
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Currently excluded</CardDescription>
                  <CardTitle className="text-2xl">{cohortSummary.excluded.toLocaleString()}</CardTitle>
                  {cohortSummary.total > 0 && (
                    <CardDescription className="text-xs mt-1">
                      ({((cohortSummary.excluded / cohortSummary.total) * 100).toFixed(1)}%)
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </div>
            {(cohortYear !== "all" || courseFilter !== "all") && (
              <p className="text-sm text-muted-foreground">
                {courseFilter !== "all"
                  ? `Showing ${cohortSummary.total.toLocaleString()} students (first year ${cohortYear === "all" ? "all" : cohortYear}, qualification: ${getQualificationName(courseFilter)} — ${courseFilter})`
                  : `Cohort size: ${cohortSummary.total.toLocaleString()} students (first year in ${cohortYear})`}
              </p>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">By qualification</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Qualification</TableHead>
                    <TableHead className="text-right">In progression</TableHead>
                    <TableHead className="text-right">Dropped out</TableHead>
                    <TableHead className="text-right">Excluded</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohortByCourse.map((row) => (
                    <TableRow key={row.courseCode}>
                      <TableCell>
                        {getQualificationName(row.courseCode)} ({row.courseCode})
                      </TableCell>
                      <TableCell className="text-right">
                        {row.inProgression}
                        {row.total > 0 && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({((row.inProgression / row.total) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.droppedOut}
                        {row.total > 0 && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({((row.droppedOut / row.total) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.excluded}
                        {row.total > 0 && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({((row.excluded / row.total) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-2xl">{totalStudents.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Predicted Completion</CardDescription>
            <CardTitle className="text-2xl">{Math.round(predictedCompletion).toLocaleString()}</CardTitle>
            <CardDescription className="text-xs mt-1">
              ({((predictedCompletion / totalStudents) * 100).toFixed(1)}%)
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Predicted Dropout</CardDescription>
            <CardTitle className="text-2xl">{currentStats.predictedDropout}</CardTitle>
            <CardDescription className="text-xs mt-1">
              ({((currentStats.predictedDropout / totalStudents) * 100).toFixed(1)}%)
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Model Confidence</CardDescription>
            <CardTitle className="text-2xl">{currentStats.completionConfidence.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Completion Likelihood Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Likelihood Distribution</CardTitle>
          <CardDescription>Predicted completion probability for current student cohort</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCompletionLikelihood.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.count} students</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Trends */}
      <TrendAreaChart
        data={filteredData}
        title="Completion Forecast Trends"
        description="Completion Likelihood Categories Over Time (Filtered by Cohort and Course)"
        areas={[
          { dataKey: "highCompletion", name: "High Completion Likelihood", color: "#82ca9d" },
          { dataKey: "mediumCompletion", name: "Medium Completion Likelihood", color: "#ffc658" },
          { dataKey: "lowCompletion", name: "Low Completion Likelihood", color: "#ffa726" },
        ]}
      />

      <TrendLineChart
        data={filteredData}
        title="Predicted Dropout vs Model Confidence"
        description="Dropout Predictions and Model Confidence (Filtered by Cohort and Course)"
        lines={[
          { dataKey: "predictedDropout", name: "Predicted Dropouts", color: "#ff6b6b" },
          { dataKey: "completionConfidence", name: "Model Confidence %", color: "#8884d8" },
        ]}
      />

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Dropout Risk Factors</CardTitle>
          <CardDescription>Primary factors contributing to dropout predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRiskFactors.map((item) => (
              <div key={item.factor} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.factor}</span>
                  <span className="text-muted-foreground">{item.students} students ({item.impact}% impact)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.impact}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prediction Accuracy */}
      <TrendBarChart
        data={mockDropoutPredictions.filter(d => d.accuracy !== null)}
        title="Dropout Prediction Accuracy"
        description="Historical Accuracy of Dropout Predictions vs Actual Outcomes (Filtered by Cohort and Course)"
        bars={[
          { dataKey: "predictedDropout", name: "Predicted", color: "#ff6b6b" },
          { dataKey: "actualDropout", name: "Actual", color: "#82ca9d" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
          <CardDescription>Statistical accuracy of completion and dropout predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">94.8%</div>
              <div className="text-sm text-muted-foreground mt-1">Average Prediction Accuracy</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">87.2%</div>
              <div className="text-sm text-muted-foreground mt-1">Completion Prediction Precision</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">91.5%</div>
              <div className="text-sm text-muted-foreground mt-1">Dropout Prediction Recall</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
