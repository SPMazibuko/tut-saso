"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboardStats, getStudents, getAlerts, getInterventions } from "@/lib/data-service"
import type { DashboardStats, Learner, Alert, Intervention } from "@/lib/types"
import { Users, AlertTriangle, ClipboardList, TrendingUp, Plus, FileText, MessageSquare, Calendar, Network, Building2, BarChart3, GraduationCap } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [recentInterventions, setRecentInterventions] = useState<Intervention[]>([])
  const [atRiskStudents, setAtRiskStudents] = useState<Learner[]>([])

  useEffect(() => {
    setStats(getDashboardStats())
    setRecentAlerts(getAlerts().slice(0, 5))
    setRecentInterventions(getInterventions().filter((i) => i.status === "in-progress" || i.status === "planned").slice(0, 5))
    const allStudents = getStudents()
    setAtRiskStudents(allStudents.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory").slice(0, 5))
  }, [])

  if (!stats) return null

  // Calculate average assessment scores for all students
  const allStudents = getStudents()
  const averageAssessments = allStudents.reduce(
    (acc, student) => {
      const assessments = student.assessments || { AS: 0, CT: 0, WR: 0, PP: 0 }
      acc.AS += assessments.AS
      acc.CT += assessments.CT
      acc.WR += assessments.WR
      acc.PP += assessments.PP
      return acc
    },
    { AS: 0, CT: 0, WR: 0, PP: 0 }
  )
  const studentCount = allStudents.length || 1
  const avgAS = averageAssessments.AS / studentCount
  const avgCT = averageAssessments.CT / studentCount
  const avgWR = averageAssessments.WR / studentCount
  const avgOverall = (avgAS + avgCT + avgWR) / 3

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">School-wide overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/interventions">
              <Plus className="h-4 w-4 mr-2" />
              Create Intervention
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRiskStudents}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.atRiskStudents / stats.totalStudents) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interventions</CardTitle>
            <ClipboardList className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInterventions}</div>
            <Link href="/dashboard/interventions" className="text-xs text-blue-600 hover:underline">
              View all interventions
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">School-wide average</p>
          </CardContent>
        </Card>
      </div>

      {/* School Overview */}
      <Card>
        <CardHeader>
          <CardTitle>School Overview</CardTitle>
          <CardDescription>Performance metrics across the school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Distribution</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Critical</span>
                  <span className="font-bold">{stats.riskDistribution.critical}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High</span>
                  <span className="font-bold">{stats.riskDistribution.high}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium</span>
                  <span className="font-bold">{stats.riskDistribution.medium}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span className="font-bold">{stats.riskDistribution.low}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Performance Metrics</p>
              <div className="mt-2 space-y-1">
                {/* <div className="flex justify-between text-sm">
                  <span>Average APS</span>
                  <span className="font-bold">{stats.averageAPS?.toFixed(2) || "N/A"}</span>
                </div> */}
                <div className="flex justify-between text-sm">
                  <span>Average Attendance</span>
                  <span className="font-bold">{stats.averageAttendance.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interventions</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Active</span>
                  <span className="font-bold">{stats.activeInterventions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Planned</span>
                  <span className="font-bold">
                    {getInterventions().filter((i) => i.status === "planned").length}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today's Activity</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Alerts</span>
                  <span className="font-bold">{stats.alertsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Students</span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance Overview</CardTitle>
          <CardDescription>Average assessment scores across all students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Assignment Score (AS)</span>
              <span className="text-sm font-bold">{avgAS.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${avgAS}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Class Test (CT)</span>
              <span className="text-sm font-bold">{avgCT.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${avgCT}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Written Work (WR)</span>
              <span className="text-sm font-bold">{avgWR.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${avgWR}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Average</span>
              <span className="text-sm font-bold">{avgOverall.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: `${avgOverall}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent alerts</p>
              ) : (
                recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50">
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                        alert.severity === "critical" ? "text-red-600" : alert.severity === "high" ? "text-orange-600" : "text-yellow-600"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={alert.severity === "critical" ? "destructive" : alert.severity === "high" ? "secondary" : "outline"}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/risk">View All Alerts</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Active Interventions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Interventions</CardTitle>
            <CardDescription>Ongoing and planned interventions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInterventions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active interventions</p>
              ) : (
                recentInterventions.map((intervention) => (
                  <div key={intervention.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50">
                    <ClipboardList className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{intervention.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {intervention.type} • {intervention.status}
                      </p>
                    </div>
                    <Badge variant={intervention.status === "in-progress" ? "default" : "secondary"}>
                      {intervention.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/interventions">View All Interventions</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Students Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle>Students Needing Attention</CardTitle>
            <CardDescription>Students at risk who may need intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No at-risk students</p>
              ) : (
                atRiskStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.name} {student.surname}</p>
                        <p className="text-xs text-muted-foreground">
                          Faculty {student.grade || student.enrollmentYear} • Attendance: {student.attendanceRate || student.attendance?.percentage || 0}%
                        </p>
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/students">
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/school-analysis">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/governance">
                <Network className="h-4 w-4 mr-2" />
                Governance
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports
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
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/mel-metrics">
                <Building2 className="h-4 w-4 mr-2" />
                MEL Metrics
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/my-progress">
                <GraduationCap className="h-4 w-4 mr-2" />
                Progress
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

