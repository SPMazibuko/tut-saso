"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getInterventionCaseAnalytics,
  getRecentInterventionCases,
  getInterventionCasesByStatus,
  type InterventionCaseAnalytics,
} from "@/lib/chat-workflows"
import type { InterventionCase } from "@/lib/types"
import { MessageSquare, TrendingUp, Clock, CheckCircle2, AlertTriangle, Users, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AISupportPage() {
  const [analytics, setAnalytics] = useState<InterventionCaseAnalytics | null>(null)
  const [recentCases, setRecentCases] = useState<InterventionCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAnalytics(getInterventionCaseAnalytics())
    setRecentCases(getRecentInterventionCases(20))
    setLoading(false)
  }, [])

  if (loading || !analytics) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading AI support analytics...</p>
      </div>
    )
  }

  const openCases = getInterventionCasesByStatus("open")
  const escalatedCases = getInterventionCasesByStatus("escalated")
  const closedCases = getInterventionCasesByStatus("closed")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Support Analytics</h1>
        <p className="text-muted-foreground">Monitor AI chat support performance and intervention cases</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCases}</div>
            <p className="text-xs text-muted-foreground">All intervention cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.openCases}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalCases > 0 ? ((analytics.openCases / analytics.totalCases) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageResponseTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Time to escalation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.resolutionRate.toFixed(1)}%</div>
            <Progress value={analytics.resolutionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cases by Root Cause */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Root Cause</CardTitle>
            <CardDescription>Breakdown of intervention case causes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.casesByRootCause)
                .sort(([, a], [, b]) => b - a)
                .map(([cause, count]) => {
                  const percentage = (count / analytics.totalCases) * 100
                  return (
                    <div key={cause} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{cause}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Cases by Risk Level */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Risk Level</CardTitle>
            <CardDescription>Risk distribution of cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.casesByRiskLevel)
                .sort(([, a], [, b]) => b - a)
                .map(([level, count]) => {
                  const percentage = (count / analytics.totalCases) * 100
                  const colors = {
                    low: "bg-green-500",
                    moderate: "bg-yellow-500",
                    high: "bg-orange-500",
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
                        <div
                          className={colors[level as keyof typeof colors] || "bg-blue-500"}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Cases by Support Type */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Support Type</CardTitle>
            <CardDescription>Types of support provided</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.casesBySupportType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => {
                  const percentage = (count / analytics.totalCases) * 100
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{type.replace(/-/g, " ")}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response & Resolution Times</CardTitle>
            <CardDescription>Average time metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-2xl font-bold">{analytics.averageResponseTime.toFixed(1)}h</span>
              </div>
              <p className="text-xs text-muted-foreground">Time from case creation to escalation</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg Resolution Time</span>
                <span className="text-2xl font-bold">{analytics.averageResolutionTime.toFixed(1)}h</span>
              </div>
              <p className="text-xs text-muted-foreground">Time from case creation to closure</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Status Overview</CardTitle>
            <CardDescription>Current case distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Open Cases</span>
              </div>
              <span className="text-2xl font-bold">{analytics.openCases}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Escalated Cases</span>
              </div>
              <span className="text-2xl font-bold">{analytics.escalatedCases}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Closed Cases</span>
              </div>
              <span className="text-2xl font-bold">{analytics.closedCases}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Intervention Cases</CardTitle>
          <CardDescription>Latest AI chat intervention cases</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No intervention cases</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Root Cause</TableHead>
                  <TableHead>Support Type</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCases.slice(0, 10).map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.studentId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {caseItem.rootCause}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{caseItem.supportType.replace(/-/g, " ")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          caseItem.riskLevel === "high"
                            ? "destructive"
                            : caseItem.riskLevel === "moderate"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {caseItem.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {caseItem.closed ? (
                          <Badge variant="default" className="bg-green-500">
                            Closed
                          </Badge>
                        ) : caseItem.escalated ? (
                          <Badge variant="destructive">Escalated</Badge>
                        ) : (
                          <Badge variant="secondary">Open</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(caseItem.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

