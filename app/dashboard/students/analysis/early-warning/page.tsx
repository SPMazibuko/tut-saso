"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Printer } from "lucide-react"
import {
  getEarlyWarningIndicators,
  getRiskFactorCorrelations,
} from "@/lib/early-warning"
import { getStudents } from "@/lib/data-service"
import { TrendBarChart } from "@/components/analysis/trend-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import type { Learner } from "@/lib/types"

export default function EarlyWarningPage() {
  const [students, setStudents] = useState<Learner[]>([])
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all")

  useEffect(() => {
    setStudents(getStudents())
  }, [])

  const indicators = getEarlyWarningIndicators(students)
  const filteredIndicators = riskLevelFilter === "all"
    ? indicators
    : indicators.filter((i) => i.riskLevel === riskLevelFilter)

  const correlations = getRiskFactorCorrelations(students)

  // Risk level distribution
  const riskDistribution = {
    critical: indicators.filter((i) => i.riskLevel === "critical").length,
    high: indicators.filter((i) => i.riskLevel === "high").length,
    medium: indicators.filter((i) => i.riskLevel === "medium").length,
  }

  const riskDistributionData = [
    { period: "Critical", value: riskDistribution.critical },
    { period: "High", value: riskDistribution.high },
    { period: "Medium", value: riskDistribution.medium },
  ]

  const exportToCSV = () => {
    const headers = ["Student Number", "Student Name", "Risk Score", "Risk Level", "Dropout Risk %", "Indicators", "Recommended Actions"]
    const rows = filteredIndicators.map((i) => [
      i.studentNumber,
      i.studentName,
      i.riskScore.toString(),
      i.riskLevel,
      i.predictedDropoutRisk.toString(),
      i.indicators.join("; "),
      i.recommendedActions.join("; "),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `early-warning-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Early Warning System"
        subtitle="Identify at-risk students and predict dropout risk"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total At-Risk Students</CardDescription>
            <CardTitle className="text-2xl">{indicators.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Risk</CardDescription>
            <CardTitle className="text-2xl text-red-600">{riskDistribution.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Risk</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{riskDistribution.high}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Medium Risk</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{riskDistribution.medium}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Risk Distribution Chart */}
      <TrendBarChart
        data={riskDistributionData}
        title="Risk Level Distribution"
        description="Distribution of students by risk level"
        bars={[
          { dataKey: "value", name: "Students", color: "#ff6b6b" },
        ]}
      />

      {/* Risk Factor Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Correlations</CardTitle>
          <CardDescription>Factors that correlate with student risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlations.map((corr, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{corr.factor}</h4>
                  <Badge variant={corr.impact === "negative" ? "destructive" : "default"}>
                    Correlation: {corr.correlation.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{corr.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
          <CardDescription>
            Students identified as at-risk with early warning indicators ({filteredIndicators.length} students)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead className="text-right">Dropout Risk</TableHead>
                  <TableHead>Indicators</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicators.slice(0, 50).map((indicator) => (
                  <TableRow key={indicator.studentId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          <Link
                            href={`/dashboard/students/${indicator.studentId}`}
                            className="hover:underline"
                          >
                            {indicator.studentName}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground">{indicator.studentNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(indicator.riskLevel)}</TableCell>
                    <TableCell className="text-right font-medium">{indicator.riskScore}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-red-600">{indicator.predictedDropoutRisk}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {indicator.indicators.slice(0, 2).map((ind, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ind}
                          </Badge>
                        ))}
                        {indicator.indicators.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{indicator.indicators.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {indicator.recommendedActions.slice(0, 2).map((action, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground">
                            • {action}
                          </span>
                        ))}
                      </div>
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

