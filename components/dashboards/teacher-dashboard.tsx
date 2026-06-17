"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStudents } from "@/lib/data-service"
import { getCurrentUser } from "@/lib/auth"
import type { Learner } from "@/lib/types"
import { Users, AlertTriangle, BookOpen, MessageSquare } from "lucide-react"
import Link from "next/link"

export function TeacherDashboard() {
  const [myStudents, setMyStudents] = useState<Learner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    // Filter students assigned to this teacher
    const allStudents = getStudents()
    const assigned = allStudents.filter((s) => String(s.teacherId) === user.id || s.teacherId === 1) // Default to teacher ID 1 for mock
    setMyStudents(assigned)
    setLoading(false)
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  const atRiskCount = myStudents.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory").length
  const averageAttendance = myStudents.reduce((sum, s) => sum + (s.attendanceRate || s.attendance?.percentage || 0), 0) / myStudents.length || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Overview of your assigned students</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStudents.length}</div>
            <p className="text-xs text-muted-foreground">Assigned students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              {myStudents.length > 0 ? ((atRiskCount / myStudents.length) * 100).toFixed(1) : 0}% of my students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students */}
      <Card>
        <CardHeader>
          <CardTitle>Students Needing Attention</CardTitle>
          <CardDescription>Students at risk who may need intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myStudents.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory").length === 0 ? (
              <p className="text-sm text-muted-foreground">No at-risk students</p>
            ) : (
              myStudents
                .filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory")
                .slice(0, 5)
                .map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name} {student.surname}</p>
                        <p className="text-xs text-muted-foreground">Faculty {student.grade} • Attendance: {student.attendanceRate || student.attendance?.percentage || 0}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={student.riskLevel === "At Risk" ? "destructive" : "secondary"}>
                        {student.riskLevel}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/students/${student.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link href="/dashboard/students">View All Students</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common teaching tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/students">
                <Users className="h-4 w-4 mr-2" />
                View Students
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/communications">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/interventions">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Interventions
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

