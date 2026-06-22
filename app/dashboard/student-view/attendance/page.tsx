"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { getStudentDashboardSummary, getStudentViewModules } from "@/lib/student-view-data"

export default function StudentAttendancePage() {
  const modules = useMemo(() => getStudentViewModules(), [])
  const summary = useMemo(() => getStudentDashboardSummary(modules), [modules])

  const recentSessions = modules.slice(0, 8).map((mod, index) => {
    const statuses = ["present", "present", "present", "late", "present"] as const
    return {
      moduleCode: mod.code,
      moduleName: mod.name,
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      sessionType: index % 3 === 0 ? "Lecture" : index % 3 === 1 ? "Tutorial" : "Practical",
      status: statuses[index % statuses.length],
    }
  })

  const statusIcon = (status: string) => {
    if (status === "present") return <CheckCircle2 className="h-5 w-5 text-green-600" />
    if (status === "absent") return <XCircle className="h-5 w-5 text-red-600" />
    return <Clock className="h-5 w-5 text-yellow-600" />
  }

  return (
    <StudentViewLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Lecture, tutorial and practical attendance across registered modules
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageAttendance}%</div>
              <Progress value={summary.averageAttendance} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Modules Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Minimum Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">80%</div>
              <p className="text-xs text-muted-foreground mt-1">TUT departmental policy</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance by Module</CardTitle>
            <CardDescription>Semester 1, {summary.academicYear}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.code} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono font-medium">{mod.code}</span>
                    <span className="text-muted-foreground ml-2">{mod.name}</span>
                  </div>
                  <Badge variant={mod.attendanceRate >= 80 ? "default" : "destructive"}>
                    {mod.attendanceRate}%
                  </Badge>
                </div>
                <Progress value={mod.attendanceRate} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {statusIcon(session.status)}
                    <div>
                      <p className="text-sm font-medium font-mono">{session.moduleCode}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.sessionType} · {session.date.toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentViewLayout>
  )
}
