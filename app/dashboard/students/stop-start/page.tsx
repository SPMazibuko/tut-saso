"use client"

import { useState, useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendLineChart, TrendBarChart, TrendAreaChart } from "@/components/analysis/trend-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStudents } from "@/lib/data-service"
import { getAvailableCohortYears, getAvailableCourseCodes, getLearnerCourseCode } from "@/lib/cohort-summary"
import { getCourseName } from "@/lib/sa-courses"

const mockExclusionReasons = [
  { reason: "Academic Performance", count: 142, percentage: 52.2 },
  { reason: "Attendance Issues", count: 68, percentage: 25.0 },
  { reason: "Disciplinary", count: 35, percentage: 12.9 },
  { reason: "Financial", count: 18, percentage: 6.6 },
  { reason: "Other", count: 9, percentage: 3.3 },
]

export default function StopStartPage() {
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")
  const [cohortFilter, setCohortFilter] = useState<number | "all">("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")

  const learners = useMemo(() => getStudents(), [])
  const availableYears = useMemo(() => getAvailableCohortYears(learners), [learners])
  const availableCourses = useMemo(() => getAvailableCourseCodes(learners), [learners])

  const filteredLearners = useMemo(() => {
    let list = [...learners]
    if (cohortFilter !== "all") list = list.filter((l) => l.enrollmentYear === cohortFilter)
    if (courseFilter !== "all") list = list.filter((l) => getLearnerCourseCode(l) === courseFilter)
    return list
  }, [learners, cohortFilter, courseFilter])

  const exclusionTrendsData = useMemo(() => {
    const byPeriod = new Map<string, { exclusions: number; reEntries: number }>()
    const addPeriod = (key: string, type: "exclusion" | "reEntry") => {
      if (!byPeriod.has(key)) byPeriod.set(key, { exclusions: 0, reEntries: 0 })
      const r = byPeriod.get(key)!
      if (type === "exclusion") r.exclusions += 1
      else r.reEntries += 1
    }
    for (const l of filteredLearners) {
      if (l.financiallyExcludedAt) {
        const d = new Date(l.financiallyExcludedAt)
        const y = d.getFullYear()
        const sem = d.getMonth() < 6 ? 1 : 2
        addPeriod(`${y} S${sem}`, "exclusion")
      }
      if (l.readmittedAt) {
        const d = new Date(l.readmittedAt)
        const y = d.getFullYear()
        const sem = d.getMonth() < 6 ? 1 : 2
        addPeriod(`${y} S${sem}`, "reEntry")
      }
    }
    const totalExcl = filteredLearners.filter((l) => l.financiallyExcluded).length
    const totalRe = filteredLearners.filter((l) => l.readmittedAt).length
    return Array.from(byPeriod.entries())
      .map(([period, row]) => ({
        period,
        ...row,
        exclusionRate: totalExcl > 0 ? (row.exclusions / filteredLearners.length) * 100 : 0,
        reEntryRate: totalRe > 0 ? (row.reEntries / totalRe) * 100 : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const exclusionsByYearData = useMemo(() => {
    const byYear = new Map<number, number>()
    for (const l of filteredLearners) {
      if (l.financiallyExcludedAt) {
        const y = new Date(l.financiallyExcludedAt).getFullYear()
        byYear.set(y, (byYear.get(y) ?? 0) + 1)
      }
    }
    return Array.from(byYear.entries())
      .map(([year, exclusions]) => ({ period: String(year), year: String(year), exclusions }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const reEntriesByYearData = useMemo(() => {
    const byYear = new Map<number, number>()
    for (const l of filteredLearners) {
      if (l.readmittedAt) {
        const y = new Date(l.readmittedAt).getFullYear()
        byYear.set(y, (byYear.get(y) ?? 0) + 1)
      }
    }
    return Array.from(byYear.entries())
      .map(([year, reEntries]) => ({ period: String(year), year: String(year), reEntries }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const exclusionReturnTableData = useMemo(() => {
    const keyCount = new Map<string, number>()
    for (const l of filteredLearners) {
      if (!l.financiallyExcludedAt) continue
      const yEx = new Date(l.financiallyExcludedAt).getFullYear()
      const yRet = l.readmittedAt ? new Date(l.readmittedAt).getFullYear() : null
      const key = `${yEx}-${yRet ?? "null"}`
      keyCount.set(key, (keyCount.get(key) ?? 0) + 1)
    }
    return Array.from(keyCount.entries()).map(([key, count]) => {
      const [yEx, yRetStr] = key.split("-")
      return { yearExcluded: parseInt(yEx, 10), yearReturned: yRetStr === "null" ? null : parseInt(yRetStr, 10), count }
    }).sort((a, b) => a.yearExcluded - b.yearExcluded || (a.yearReturned ?? 0) - (b.yearReturned ?? 0))
  }, [filteredLearners])

  const exclusionsByYearAndCourseData = useMemo(() => {
    const out: { yearExcluded: number; courseCode: string; count: number }[] = []
    const byKey = new Map<string, number>()
    for (const l of filteredLearners) {
      if (!l.financiallyExcludedAt) continue
      const y = new Date(l.financiallyExcludedAt).getFullYear()
      const code = getLearnerCourseCode(l)
      const key = `${y}-${code}`
      byKey.set(key, (byKey.get(key) ?? 0) + 1)
    }
    byKey.forEach((count, key) => {
      const dashIdx = key.indexOf("-")
      const y = key.slice(0, dashIdx)
      const courseCode = key.slice(dashIdx + 1)
      out.push({ yearExcluded: parseInt(y, 10), courseCode, count })
    })
    return out.sort((a, b) => a.yearExcluded - b.yearExcluded || a.courseCode.localeCompare(b.courseCode))
  }, [filteredLearners])

  const reEntriesByYearAndCourseData = useMemo(() => {
    const out: { yearReturned: number; courseCode: string; count: number }[] = []
    const byKey = new Map<string, number>()
    for (const l of filteredLearners) {
      if (!l.readmittedAt) continue
      const y = new Date(l.readmittedAt).getFullYear()
      const code = getLearnerCourseCode(l)
      const key = `${y}-${code}`
      byKey.set(key, (byKey.get(key) ?? 0) + 1)
    }
    byKey.forEach((count, key) => {
      const dashIdx = key.indexOf("-")
      const y = key.slice(0, dashIdx)
      const courseCode = key.slice(dashIdx + 1)
      out.push({ yearReturned: parseInt(y, 10), courseCode, count })
    })
    return out.sort((a, b) => a.yearReturned - b.yearReturned || a.courseCode.localeCompare(b.courseCode))
  }, [filteredLearners])

  const courseRepetitionData = useMemo(() => {
    const byPeriod = new Map<string, { firstRepeat: number; secondRepeat: number; thirdRepeat: number; fourthRepeat: number }>()
    for (const l of filteredLearners) {
      const period = `${l.enrollmentYear} S${l.semester}`
      if (!byPeriod.has(period)) byPeriod.set(period, { firstRepeat: 0, secondRepeat: 0, thirdRepeat: 0, fourthRepeat: 0 })
      const row = byPeriod.get(period)!
      const n = (l.previousSubjects?.length ?? 0)
      if (n === 1) row.firstRepeat += 1
      else if (n === 2) row.secondRepeat += 1
      else if (n === 3) row.thirdRepeat += 1
      else if (n >= 4) row.fourthRepeat += 1
    }
    return Array.from(byPeriod.entries())
      .map(([period, row]) => ({ period, ...row }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const reEntryTimelineData = useMemo(() => {
    const byPeriod = new Map<string, { reEntryWithin1Sem: number; reEntryWithin1Year: number; reEntryAfter1Year: number }>()
    for (const l of filteredLearners) {
      if (!l.financiallyExcludedAt || !l.readmittedAt) continue
      const ex = new Date(l.financiallyExcludedAt)
      const re = new Date(l.readmittedAt)
      const months = (re.getFullYear() - ex.getFullYear()) * 12 + (re.getMonth() - ex.getMonth())
      const y = ex.getFullYear()
      const sem = ex.getMonth() < 6 ? 1 : 2
      const period = `${y} S${sem}`
      if (!byPeriod.has(period)) byPeriod.set(period, { reEntryWithin1Sem: 0, reEntryWithin1Year: 0, reEntryAfter1Year: 0 })
      const row = byPeriod.get(period)!
      if (months < 6) row.reEntryWithin1Sem += 1
      else if (months < 12) row.reEntryWithin1Year += 1
      else row.reEntryAfter1Year += 1
    }
    return Array.from(byPeriod.entries())
      .map(([period, row]) => ({ period, ...row }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredLearners])

  const filteredExclusionData = useMemo(() => {
    let data = [...exclusionTrendsData]
    if (yearFilter !== "all") data = data.filter((d) => d.period.startsWith(yearFilter))
    if (semesterFilter !== "all") data = data.filter((d) => d.period.endsWith(`S${semesterFilter}`))
    return data
  }, [exclusionTrendsData, yearFilter, semesterFilter])

  const filteredRepetitionData = useMemo(() => {
    let data = [...courseRepetitionData]
    if (yearFilter !== "all") data = data.filter((d) => d.period.startsWith(yearFilter))
    if (semesterFilter !== "all") data = data.filter((d) => d.period.endsWith(`S${semesterFilter}`))
    return data
  }, [courseRepetitionData, yearFilter, semesterFilter])

  const filteredReEntryTimelineData = useMemo(() => {
    let data = [...reEntryTimelineData]
    if (yearFilter !== "all") data = data.filter((d) => d.period.startsWith(yearFilter))
    if (semesterFilter !== "all") data = data.filter((d) => d.period.endsWith(`S${semesterFilter}`))
    return data
  }, [reEntryTimelineData, yearFilter, semesterFilter])

  const totalExclusions = useMemo(() => filteredLearners.filter((l) => l.financiallyExcluded).length, [filteredLearners])
  const totalReEntries = useMemo(() => filteredLearners.filter((l) => l.readmittedAt).length, [filteredLearners])
  const currentStats = useMemo(() => {
    if (filteredExclusionData.length === 0)
      return { exclusionRate: totalExclusions && filteredLearners.length ? (totalExclusions / filteredLearners.length) * 100 : 0, reEntryRate: totalReEntries && totalExclusions ? (totalReEntries / totalExclusions) * 100 : 0 }
    const last = filteredExclusionData[filteredExclusionData.length - 1]
    return { exclusionRate: last.exclusionRate ?? 0, reEntryRate: last.reEntryRate ?? 0 }
  }, [filteredExclusionData, totalExclusions, totalReEntries, filteredLearners.length])

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Stop-start & Exclusions"
        subtitle="Analyze course repetition and stop-start patterns, including students returning from exclusion"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter data by year and semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
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
            <Select value={cohortFilter === "all" ? "all" : String(cohortFilter)} onValueChange={(v) => setCohortFilter(v === "all" ? "all" : parseInt(v, 10))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All cohorts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cohorts</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {availableCourses.map((code) => (
                  <SelectItem key={code} value={code}>
                    {getCourseName(code)} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredLearners.length === 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">No data for the selected cohort and course. Adjust the filters or choose &quot;All cohorts&quot; / &quot;All courses&quot; to see data.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Exclusions</CardDescription>
            <CardTitle className="text-2xl">{totalExclusions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Re-entries</CardDescription>
            <CardTitle className="text-2xl">{totalReEntries}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Exclusion Rate</CardDescription>
            <CardTitle className="text-2xl">{typeof currentStats.exclusionRate === "number" ? currentStats.exclusionRate.toFixed(1) : String(currentStats.exclusionRate)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Re-entry Rate</CardDescription>
            <CardTitle className="text-2xl">{currentStats.reEntryRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Exclusion Trends */}
      <TrendLineChart
        data={filteredExclusionData}
        title="Exclusion Trends Over Time"
        description="Exclusions and Re-entries per Semester (Filtered by Cohort and Course)"
        lines={[
          { dataKey: "exclusions", name: "Exclusions", color: "#ff6b6b" },
          { dataKey: "reEntries", name: "Re-entries", color: "#82ca9d" },
        ]}
      />

      {/* Exclusions and re-entries by year */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrendBarChart
          data={exclusionsByYearData}
          title="Exclusions by Calendar Year"
          description="Exclusions by Calendar Year (Filtered by Cohort and Course)"
          bars={[{ dataKey: "exclusions", name: "Exclusions", color: "#ff6b6b" }]}
        />
        <TrendBarChart
          data={reEntriesByYearData}
          title="Re-entries by Calendar Year"
          description="Return of Excluded Students by Calendar Year (Filtered by Cohort and Course)"
          bars={[{ dataKey: "reEntries", name: "Re-entries", color: "#82ca9d" }]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exclusion and Return by Year</CardTitle>
          <CardDescription>Exclusion and Return by Year (Filtered by Cohort and Course)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year excluded</TableHead>
                <TableHead>Year returned</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exclusionReturnTableData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.yearExcluded}</TableCell>
                  <TableCell>{row.yearReturned ?? "Not yet returned"}</TableCell>
                  <TableCell className="text-right">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exclusions and re-entries by year and module */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exclusions by Calendar Year and Course</CardTitle>
            <CardDescription>Exclusions by Calendar Year and Course (Filtered by Cohort and Course)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year excluded</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exclusionsByYearAndCourseData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.yearExcluded}</TableCell>
                    <TableCell>{getCourseName(row.courseCode)} ({row.courseCode})</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Re-entries by Calendar Year and Course</CardTitle>
            <CardDescription>Return of Excluded Students by Calendar Year and Course (Filtered by Cohort and Course)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year returned</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reEntriesByYearAndCourseData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.yearReturned}</TableCell>
                    <TableCell>{getCourseName(row.courseCode)} ({row.courseCode})</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <TrendAreaChart
        data={filteredExclusionData}
        title="Exclusion vs Re-entry Rates"
        description="Exclusion and Re-entry Rates (Filtered by Cohort and Course)"
        areas={[
          { dataKey: "exclusionRate", name: "Exclusion Rate %", color: "#ff6b6b" },
          { dataKey: "reEntryRate", name: "Re-entry Rate %", color: "#82ca9d" },
        ]}
      />

      {/* Course Repetition */}
      <TrendBarChart
        data={filteredRepetitionData}
        title="Course Repetition Patterns"
        description="Students Repeating Courses by Attempt Number (Filtered by Cohort and Course)"
        bars={[
          { dataKey: "firstRepeat", name: "1st Repeat", color: "#ffc658" },
          { dataKey: "secondRepeat", name: "2nd Repeat", color: "#ffa726" },
          { dataKey: "thirdRepeat", name: "3rd Repeat", color: "#ff6b6b" },
          { dataKey: "fourthRepeat", name: "4th+ Repeat", color: "#d32f2f" },
        ]}
      />

      {/* Exclusion Reasons */}
      <Card>
        <CardHeader>
          <CardTitle>Exclusion Reasons Breakdown</CardTitle>
          <CardDescription>Primary reasons for student exclusions (aggregated data, no individual identification)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExclusionReasons.map((item) => (
              <div key={item.reason} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.reason}</span>
                  <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Re-entry Timeline */}
      <TrendBarChart
        data={filteredReEntryTimelineData}
        title="Re-entry Timeline Patterns"
        description="Time to Return of Excluded Students (Filtered by Cohort and Course)"
        bars={[
          { dataKey: "reEntryWithin1Sem", name: "Within 1 Semester", color: "#82ca9d" },
          { dataKey: "reEntryWithin1Year", name: "Within 1 Year", color: "#ffc658" },
          { dataKey: "reEntryAfter1Year", name: "After 1+ Years", color: "#ffa726" },
        ]}
      />
    </div>
  )
}
