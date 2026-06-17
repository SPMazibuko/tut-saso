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
  getEnrollmentTrends,
  getPerformanceTrends,
  getRetentionMetrics,
  getSubjectEnrollmentTrends,
} from "@/lib/trend-analysis"
import { getStudents } from "@/lib/data-service"
import { TrendLineChart, TrendAreaChart, TrendBarChart } from "@/components/analysis/trend-charts"
import type { Learner } from "@/lib/types"

export default function TrendsAnalysisPage() {
  const [students, setStudents] = useState<Learner[]>([])
  const [monthsFilter, setMonthsFilter] = useState<string>("12")

  useEffect(() => {
    setStudents(getStudents())
  }, [])

  const months = parseInt(monthsFilter)
  const enrollmentTrends = getEnrollmentTrends(students, months)
  const performanceTrends = getPerformanceTrends(students, months)
  const retentionMetrics = getRetentionMetrics(students, months)
  const subjectTrends = getSubjectEnrollmentTrends(students)

  const exportToCSV = () => {
    const headers = ["Period", "Enrollment Count", "New Enrollments", "Dropouts", "Average Score", "Pass Rate", "Attendance Rate", "At Risk %", "Retention Rate", "Dropout Rate"]
    const rows = enrollmentTrends.map((enroll, index) => [
      enroll.period,
      enroll.enrollmentCount.toString(),
      enroll.newEnrollments.toString(),
      enroll.dropouts.toString(),
      performanceTrends[index]?.averageScore.toString() || "0",
      performanceTrends[index]?.passRate.toString() || "0",
      performanceTrends[index]?.attendanceRate.toString() || "0",
      performanceTrends[index]?.atRiskPercentage.toString() || "0",
      retentionMetrics[index]?.retentionRate.toString() || "0",
      retentionMetrics[index]?.dropoutRate.toString() || "0",
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trends-analysis-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Trend Analysis"
        subtitle="Track enrollment, performance, and retention trends over time"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={monthsFilter} onValueChange={setMonthsFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
                <SelectItem value="24">Last 24 Months</SelectItem>
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

      {/* Enrollment Trends */}
      <TrendLineChart
        data={enrollmentTrends}
        title="Enrollment Trends"
        description="Student enrollment over time"
        lines={[
          { dataKey: "enrollmentCount", name: "Total Enrollment", color: "#8884d8" },
          { dataKey: "newEnrollments", name: "New Enrollments", color: "#82ca9d" },
        ]}
      />

      <TrendAreaChart
        data={enrollmentTrends}
        title="Enrollment vs Dropouts"
        description="Comparison of new enrollments and dropouts"
        areas={[
          { dataKey: "newEnrollments", name: "New Enrollments", color: "#82ca9d" },
          { dataKey: "dropouts", name: "Dropouts", color: "#ff6b6b" },
        ]}
      />

      {/* Performance Trends */}
      <TrendLineChart
        data={performanceTrends}
        title="Performance Trends"
        description="Academic performance metrics over time"
        lines={[
          { dataKey: "averageScore", name: "Average Score", color: "#8884d8" },
          { dataKey: "passRate", name: "Pass Rate %", color: "#82ca9d" },
          { dataKey: "attendanceRate", name: "Attendance Rate %", color: "#ffc658" },
        ]}
      />

      <TrendBarChart
        data={performanceTrends}
        title="At Risk Percentage Trend"
        description="Percentage of at-risk students over time"
        bars={[
          { dataKey: "atRiskPercentage", name: "At Risk %", color: "#ff6b6b" },
        ]}
      />

      {/* Retention Metrics */}
      <TrendLineChart
        data={retentionMetrics}
        title="Retention & Dropout Rates"
        description="Student retention and dropout trends"
        lines={[
          { dataKey: "retentionRate", name: "Retention Rate %", color: "#82ca9d" },
          { dataKey: "dropoutRate", name: "Dropout Rate %", color: "#ff6b6b" },
        ]}
      />

      {/* Subject Enrollment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Enrollment Trends</CardTitle>
          <CardDescription>Enrollment trends by subject over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(subjectTrends).slice(0, 6).map(([subject, data]) => (
              <TrendLineChart
                key={subject}
                data={data}
                title={`${subject} Enrollment`}
                lines={[
                  { dataKey: "value", name: "Students", color: "#8884d8" },
                ]}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

