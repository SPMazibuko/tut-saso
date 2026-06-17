"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDashboardStats } from "@/lib/data-service"
import { getScopeDescription } from "@/lib/user-context"
import type { DashboardStats } from "@/lib/types"
import { Building2, TrendingUp, Users, FileText, Network, BarChart3 } from "lucide-react"
import Link from "next/link"

export function ProvincialAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [scope, setScope] = useState<string>("")

  useEffect(() => {
    setStats(getDashboardStats())
    setScope(getScopeDescription())
  }, [])

  if (!stats) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provincial Admin Dashboard</h1>
          <p className="text-muted-foreground">{scope}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/governance">
              <Network className="h-4 w-4 mr-2" />
              Governance
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
            <p className="text-xs text-muted-foreground">Province-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
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
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInterventions}</div>
            <p className="text-xs text-muted-foreground">Province-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Province average</p>
          </CardContent>
        </Card>
      </div>

      {/* Province Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Province Overview</CardTitle>
          <CardDescription>Performance metrics across the province</CardDescription>
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
              <p className="text-sm font-medium text-muted-foreground">Performance</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Average APS</span>
                  <span className="font-bold">{stats.averageAPS?.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Attendance</span>
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
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Activity</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Today's Alerts</span>
                  <span className="font-bold">{stats.alertsToday}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Provincial administration tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/governance">
                <Network className="h-4 w-4 mr-2" />
                Governance
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/mel-metrics">
                <Building2 className="h-4 w-4 mr-2" />
                MEL Metrics
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/school-analysis">
                <BarChart3 className="h-4 w-4 mr-2" />
                School Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

