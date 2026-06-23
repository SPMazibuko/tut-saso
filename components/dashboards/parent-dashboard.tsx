"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStudent, getStudents } from "@/lib/data-service"
import { getCurrentUser } from "@/lib/auth"
import type { Learner } from "@/lib/types"
import { GraduationCap, TrendingUp, BookOpen, MessageSquare, Calendar } from "lucide-react"
import Link from "next/link"

export function ParentDashboard() {
  const [children, setChildren] = useState<Learner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    // In a real system, we'd link parent to students via a relationship table
    // For now, use the first student as a mock
    const allStudents = getStudents()
    const child = allStudents[0] // Mock: use first student
    if (child) {
      setChildren([child])
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  const child = children[0]
  if (!child) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No student records found</p>
      </div>
    )
  }

  const attendance = child.attendanceRate || child.attendance?.percentage || 0
  const assessments = child.assessments || { AS: 0, CT: 0, WR: 0, PP: 0 }
  const averageGrade = (assessments.AS + assessments.CT + assessments.WR) / 3

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parent Portal</h1>
        <p className="text-muted-foreground">Monitor your child's academic progress</p>
      </div>

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{child.name} {child.surname}</CardTitle>
          <CardDescription>Faculty {child.grade} • Student ID: {child.studentNumber}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              {/* <p className="text-sm font-medium text-muted-foreground">Current APS</p>
              <p className="text-2xl font-bold">{child.aps?.toFixed(2) || "N/A"}</p> */}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold">{attendance.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Status</p>
              <Badge variant={child.riskLevel === "At Risk" ? "destructive" : child.riskLevel === "Satisfactory" ? "secondary" : "default"} className="mt-1">
                {child.riskLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>Current assessment scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Assignment Score (AS)</span>
                <span className="text-sm font-bold">{assessments.AS}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${assessments.AS}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Class Test (CT)</span>
                <span className="text-sm font-bold">{assessments.CT}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${assessments.CT}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Written Work (WR)</span>
                <span className="text-sm font-bold">{assessments.WR}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${assessments.WR}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Average</span>
                <span className="text-sm font-bold">{averageGrade.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${averageGrade}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Current attendance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{attendance.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">
                  {child.attendance?.attended || 0} of {child.attendance?.total || 0} sessions
                </p>
              </div>
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${attendance >= 90 ? "bg-green-500" : attendance >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${attendance}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Parent resources and communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/dashboard/students/${child.id}`}>
                <GraduationCap className="h-4 w-4 mr-2" />
                View Report
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/my-progress">
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/communications">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

