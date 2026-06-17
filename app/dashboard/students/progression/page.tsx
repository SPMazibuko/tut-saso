"use client"

import { useState, useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { getCourseName } from "@/lib/sa-courses"

export default function ProgressionPage() {
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

  const progressionChartData = useMemo(() => {
    const byPeriod = new Map<string, { enrolled: number; progressed: number; onTrack: number; atRisk: number }>()
    for (const l of filteredLearners) {
      const period = `${l.enrollmentYear} S${l.semester}`
      if (!byPeriod.has(period)) byPeriod.set(period, { enrolled: 0, progressed: 0, onTrack: 0, atRisk: 0 })
      const row = byPeriod.get(period)!
      row.enrolled += 1
      if (!l.hasDroppedOut) row.progressed += 1
      if (!l.hasDroppedOut && !l.financiallyExcluded) {
        if (l.riskLevel === "At Risk") row.atRisk += 1
        else row.onTrack += 1
      }
    }
    return Array.from(byPeriod.entries())
      .map(([period, row]) => ({
        period,
        ...row,
        progressionRate: row.enrolled > 0 ? (row.progressed / row.enrolled) * 100 : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const yearlyProgressionData = useMemo(() => {
    const byYear = new Map<string, { totalEnrolled: number; completed: number; inProgress: number; dropout: number }>()
    for (const l of filteredLearners) {
      const y = String(l.enrollmentYear)
      if (!byYear.has(y)) byYear.set(y, { totalEnrolled: 0, completed: 0, inProgress: 0, dropout: 0 })
      const row = byYear.get(y)!
      row.totalEnrolled += 1
      if (l.hasDroppedOut) row.dropout += 1
      else if (l.financiallyExcluded) row.inProgress += 1
      else row.completed += 1
    }
    return Array.from(byYear.entries())
      .map(([year, row]) => ({
        period: year,
        year,
        ...row,
        completionRate: row.totalEnrolled > 0 ? (row.completed / row.totalEnrolled) * 100 : 0,
      }))
      .sort((a, b) => a.year.localeCompare(b.year))
  }, [filteredLearners])

  const gradeProgressionData = useMemo(() => {
    const byPeriod = new Map<string, { grades: number[] }>()
    for (const l of filteredLearners) {
      const period = `${l.enrollmentYear} S${l.semester}`
      if (!byPeriod.has(period)) byPeriod.set(period, { grades: [] })
      const pp = l.assessments?.PP ?? (l.assessments.AS + l.assessments.CT + l.assessments.WR) / 3
      byPeriod.get(period)!.grades.push(pp)
    }
    return Array.from(byPeriod.entries())
      .map(([period, { grades }]) => {
        const n = grades.length
        const avg = n ? grades.reduce((s, g) => s + g, 0) / n : 0
        const passRate = n ? (grades.filter((g) => g >= 50).length / n) * 100 : 0
        const distinction = n ? (grades.filter((g) => g >= 75).length / n) * 100 : 0
        return { period, averageGrade: Math.round(avg * 10) / 10, passRate: Math.round(passRate * 10) / 10, distinction: Math.round(distinction * 10) / 10 }
      })
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const filteredProgressionData = useMemo(() => {
    let data = [...progressionChartData]
    if (yearFilter !== "all") data = data.filter((d) => d.period.startsWith(yearFilter))
    if (semesterFilter !== "all") data = data.filter((d) => d.period.endsWith(`S${semesterFilter}`))
    return data
  }, [progressionChartData, yearFilter, semesterFilter])

  const currentStats = useMemo(() => {
    if (filteredProgressionData.length === 0) {
      const n = filteredLearners.length
      const progressed = filteredLearners.filter((l) => !l.hasDroppedOut).length
      const onTrack = filteredLearners.filter((l) => !l.hasDroppedOut && !l.financiallyExcluded && l.riskLevel !== "At Risk").length
      const atRisk = filteredLearners.filter((l) => !l.hasDroppedOut && l.riskLevel === "At Risk").length
      return { enrolled: n, progressed, onTrack, atRisk, progressionRate: n ? (progressed / n) * 100 : 0 }
    }
    return filteredProgressionData[filteredProgressionData.length - 1]
  }, [filteredProgressionData, filteredLearners])

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Progression Tracking"
        subtitle="Track student progression per semester and year"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter progression data by year and semester</CardDescription>
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
                <span className="text-sm font-medium text-muted-foreground">Course</span>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All courses</SelectItem>
                    {availableCourses.map((code) => (
                      <SelectItem key={code} value={code}>
                        {getCourseName(code)}
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
                  ? `Showing ${cohortSummary.total.toLocaleString()} students (first year ${cohortYear === "all" ? "all" : cohortYear}, course: ${getCourseName(courseFilter)})`
                  : `Cohort size: ${cohortSummary.total.toLocaleString()} students (first year in ${cohortYear})`}
              </p>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">By course</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
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
                        {row.courseName} ({row.courseCode})
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
            <CardDescription>Total Enrolled</CardDescription>
            <CardTitle className="text-2xl">{currentStats.enrolled.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progression Rate</CardDescription>
            <CardTitle className="text-2xl">{currentStats.progressionRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>On Track</CardDescription>
            <CardTitle className="text-2xl">{currentStats.onTrack.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>At Risk</CardDescription>
            <CardTitle className="text-2xl">{currentStats.atRisk.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progression Trends */}
      <TrendLineChart
        data={filteredProgressionData}
        title="Progression Rate Over Time"
        description="Student Progression to Next Semester (Filtered by Cohort and Course)"
        lines={[
          { dataKey: "progressionRate", name: "Progression Rate %", color: "#82ca9d" },
        ]}
      />

      <TrendAreaChart
        data={filteredProgressionData}
        title="Enrollment vs Progression"
        description="Enrolled vs Progressing Students (Filtered by Cohort and Course)"
        areas={[
          { dataKey: "enrolled", name: "Enrolled", color: "#8884d8" },
          { dataKey: "progressed", name: "Progressed", color: "#82ca9d" },
        ]}
      />

      <TrendBarChart
        data={filteredProgressionData}
        title="Student Status Distribution"
        description="On-Track vs At-Risk Students (Filtered by Cohort and Course)"
        bars={[
          { dataKey: "onTrack", name: "On Track", color: "#82ca9d" },
          { dataKey: "atRisk", name: "At Risk", color: "#ff6b6b" },
        ]}
      />

      {/* Yearly Progression */}
      <TrendBarChart
        data={yearlyProgressionData}
        title="Yearly Completion Overview"
        description="Progression and Completion by Year (Filtered by Cohort and Course)"
        bars={[
          { dataKey: "completed", name: "Completed", color: "#82ca9d" },
          { dataKey: "inProgress", name: "In Progress", color: "#ffc658" },
          { dataKey: "dropout", name: "Dropped Out", color: "#ff6b6b" },
        ]}
      />

      {/* Grade Progression */}
      <TrendLineChart
        data={gradeProgressionData}
        title="Academic Performance Trends"
        description="Average Pass Rates and Distinction Rates Over Time (Filtered by Cohort and Course)"
        lines={[
          { dataKey: "averageGrade", name: "Average Grade", color: "#8884d8" },
          { dataKey: "passRate", name: "Pass Rate %", color: "#82ca9d" },
          { dataKey: "distinction", name: "Distinction Rate %", color: "#ffc658" },
        ]}
      />
    </div>
  )
}
