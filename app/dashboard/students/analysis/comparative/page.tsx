"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Printer } from "lucide-react"
import {
  getAllComparativeMetrics,
  getStudentComparison,
  compareGroups,
} from "@/lib/comparative-analysis"
import { getStudents, getStudent } from "@/lib/data-service"
import { ComparisonBarChart, ComparisonRadarChart, SideBySideComparison } from "@/components/analysis/comparison-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Learner, ComparativeMetrics } from "@/lib/types"

export default function ComparativeAnalysisPage() {
  const [students, setStudents] = useState<Learner[]>([])
  const [levelFilter, setLevelFilter] = useState<"school" | "district" | "province">("school")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")

  useEffect(() => {
    setStudents(getStudents())
  }, [])

  const metrics = getAllComparativeMetrics(levelFilter, students)
  const selectedStudent = selectedStudentId ? getStudent(selectedStudentId) : null
  const studentComparison = selectedStudent ? getStudentComparison(selectedStudent, students) : null

  // Prepare chart data
  const metricsChartData = metrics.slice(0, 10).map((m) => ({
    name: m.name,
    attendance: m.averageAttendance,
    aps: m.averageAPS,
    passRate: m.passRate,
    atRisk: m.atRiskPercentage,
  }))

  const exportToCSV = () => {
    const headers = ["Level", "Name", "Total Students", "Avg Attendance", "Avg APS", "Pass Rate", "At Risk %"]
    const rows = metrics.map((m) => [
      m.level,
      m.name,
      m.totalStudents.toString(),
      m.averageAttendance.toString(),
      m.averageAPS.toString(),
      m.passRate.toString(),
      m.atRiskPercentage.toString(),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `comparative-analysis-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Comparative Analysis"
        subtitle="Compare performance across schools, districts, and provinces"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as "school" | "district" | "province")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Comparison Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="province">Province</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Compare Student (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {students.slice(0, 50).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} {s.surname} ({s.studentNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total {levelFilter}s</CardDescription>
            <CardTitle className="text-2xl">{metrics.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Attendance</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.length > 0
                ? Math.round(metrics.reduce((sum, m) => sum + m.averageAttendance, 0) / metrics.length)
                : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Pass Rate</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.length > 0
                ? Math.round(metrics.reduce((sum, m) => sum + m.passRate, 0) / metrics.length)
                : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average At Risk %</CardDescription>
            <CardTitle className="text-2xl">
              {metrics.length > 0
                ? Math.round(metrics.reduce((sum, m) => sum + m.atRiskPercentage, 0) / metrics.length)
                : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Comparison Charts */}
      <ComparisonBarChart
        data={metricsChartData}
        title={`Top 10 ${levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)}s by Performance`}
        description="Comparison of key metrics across top performers"
        bars={[
          { dataKey: "attendance", name: "Avg Attendance %", color: "#8884d8" },
          { dataKey: "aps", name: "Avg APS", color: "#82ca9d" },
          { dataKey: "passRate", name: "Pass Rate %", color: "#ffc658" },
        ]}
      />

      {/* Student Comparison */}
      {studentComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Student vs Context Comparison</CardTitle>
            <CardDescription>
              Comparing {selectedStudent?.name} {selectedStudent?.surname} against their school, district, and province
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonRadarChart
              data={[
                studentComparison.student,
                studentComparison.school,
                studentComparison.district,
                studentComparison.province,
              ].filter(Boolean) as ComparativeMetrics[]}
              title="Performance Comparison"
              metrics={[
                { key: "averageAttendance", name: "Attendance" },
                { key: "averageAPS", name: "APS" },
                { key: "passRate", name: "Pass Rate" },
                { key: "atRiskPercentage", name: "At Risk %" },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>{levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)} Performance Metrics</CardTitle>
          <CardDescription>Detailed comparison across all {levelFilter}s</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Avg Attendance</TableHead>
                  <TableHead className="text-right">Avg APS</TableHead>
                  <TableHead className="text-right">Pass Rate</TableHead>
                  <TableHead className="text-right">At Risk %</TableHead>
                  <TableHead className="text-right">Risk Distribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell className="text-right">{metric.totalStudents}</TableCell>
                    <TableCell className="text-right">{metric.averageAttendance.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{metric.averageAPS.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{metric.passRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{metric.atRiskPercentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-sm">
                      G:{metric.riskDistribution.good} S:{metric.riskDistribution.satisfactory} R:
                      {metric.riskDistribution.atRisk}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

