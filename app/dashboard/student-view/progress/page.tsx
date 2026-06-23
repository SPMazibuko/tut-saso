"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, GraduationCap, AlertTriangle } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { getStudentDashboardSummary, getStudentViewModules } from "@/lib/student-view-data"

export default function StudentProgressPage() {
  const modules = useMemo(() => getStudentViewModules(), [])
  const summary = useMemo(() => getStudentDashboardSummary(modules), [modules])

  // const semesterTrend = [
  //   { semester: "2024 S2", aps: 2.9 },
  //   { semester: "2025 S1", aps: 3.1 },
  //   { semester: "2025 S2", aps: 3.3 },
  //   { semester: "2026 S1", aps: summary.aps },
  // ]

  const markDistribution = [
    { range: "75–100%", count: modules.filter((m) => (m.currentMark ?? 0) >= 75).length },
    { range: "60–74%", count: modules.filter((m) => (m.currentMark ?? 0) >= 60 && (m.currentMark ?? 0) < 75).length },
    { range: "50–59%", count: modules.filter((m) => (m.currentMark ?? 0) >= 50 && (m.currentMark ?? 0) < 60).length },
    { range: "Below 50%", count: modules.filter((m) => (m.currentMark ?? 0) < 50).length },
  ]

  const atRiskModules = modules.filter((m) => m.riskLevel === "At Risk")

  return (
    <StudentViewLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Academic Progress</h1>
          <p className="text-muted-foreground">
            Credit progression and performance across all registered modules
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current APS</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.aps}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                Improving trend
              </p>
            </CardContent>
          </Card> */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Mark</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageMark}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Credits Enrolled</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCredits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Academic Standing</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  summary.academicStanding === "Good Standing"
                    ? "default"
                    : summary.academicStanding === "Probation"
                      ? "destructive"
                      : "secondary"
                }
                className="text-sm"
              >
                {summary.academicStanding}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* <Card>
            <CardHeader>
              <CardTitle>APS Trend</CardTitle>
              <CardDescription>Semester-over-semester academic progress score</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ aps: { label: "APS", color: "hsl(var(--primary))" } }}
                className="h-[240px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={semesterTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" fontSize={12} />
                    <YAxis domain={[0, 4]} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="aps" fill="var(--color-aps)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card> */}

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mark Distribution</CardTitle>
              <CardDescription>Performance bands across {modules.length} modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {markDistribution.map((band) => (
                <div key={band.range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{band.range}</span>
                    <span className="font-medium">{band.count} modules</span>
                  </div>
                  <Progress value={modules.length ? (band.count / modules.length) * 100 : 0} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {atRiskModules.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Modules Requiring Attention
              </CardTitle>
              <CardDescription>Modules below satisfactory academic or attendance thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {atRiskModules.map((mod) => (
                  <div key={mod.code} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-mono font-medium text-sm">{mod.code}</p>
                      <p className="text-xs text-muted-foreground">{mod.name}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Mark: {mod.currentMark}%</p>
                      <p className="text-muted-foreground">Att: {mod.attendanceRate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentViewLayout>
  )
}
