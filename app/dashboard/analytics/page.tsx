"use client"

import { useEffect, useState } from "react"
import { getStudents, getDashboardStats } from "@/lib/data-service"
import type { Learner, DashboardStats } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, GraduationCap } from "lucide-react"

export default function AnalyticsPage() {
  const [students, setStudents] = useState<Learner[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    setStudents(getStudents())
    setStats(getDashboardStats())
  }, [])

  if (!stats) return null

  // Calculate grade distribution
  const gradeDistribution = students.reduce(
    (acc, student) => {
      const grade = student.grade ?? "Unknown"
      acc[grade] = (acc[grade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate APS ranges
  // const apsRanges = {
  //   "3.5-4.0": students.filter((s) => s.aps >= 3.5).length,
  //   "3.0-3.49": students.filter((s) => s.aps >= 3.0 && s.aps < 3.5).length,
  //   "2.5-2.99": students.filter((s) => s.aps >= 2.5 && s.aps < 3.0).length,
  //   "2.0-2.49": students.filter((s) => s.aps >= 2.0 && s.aps < 2.5).length,
  //   "Below 2.0": students.filter((s) => s.aps < 2.0).length,
  // }

  const attendanceRanges = {
    "90-100%": students.filter((s) => (s.attendanceRate ?? 0) >= 90).length,
    "80-89%": students.filter((s) => (s.attendanceRate ?? 0) >= 80 && (s.attendanceRate ?? 0) < 90).length,
    "70-79%": students.filter((s) => (s.attendanceRate ?? 0) >= 70 && (s.attendanceRate ?? 0) < 80).length,
    "60-69%": students.filter((s) => (s.attendanceRate ?? 0) >= 60 && (s.attendanceRate ?? 0) < 70).length,
    "Below 60%": students.filter((s) => (s.attendanceRate ?? 0) < 60).length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground">Comprehensive insights into student performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APS</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAPS?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRiskStudents}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.atRiskStudents / stats.totalStudents) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* APS Distribution */}
        {/* <Card>
          <CardHeader>
            <CardTitle>APS Distribution</CardTitle>
            <CardDescription>Student performance by APS range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(apsRanges).map(([range, count]) => {
                const percentage = (count / students.length) * 100
                return (
                  <div key={range} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{range}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card> */}

        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Student attendance by range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(attendanceRanges).map(([range, count]) => {
                const percentage = (count / students.length) * 100
                return (
                  <div key={range} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{range}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Faculty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Module</CardTitle>
            <CardDescription>Enrollment distribution across faculties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(gradeDistribution)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([grade, count]) => {
                  const percentage = (count / students.length) * 100
                  return (
                    <div key={grade} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Module {grade}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>Students by risk category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.riskDistribution).map(([level, count]) => {
                const percentage = (count / stats.totalStudents) * 100
                const colors = {
                  low: "bg-green-500",
                  medium: "bg-yellow-500",
                  high: "bg-orange-500",
                  critical: "bg-red-500",
                }

                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{level}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={colors[level as keyof typeof colors]} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
