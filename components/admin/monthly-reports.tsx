"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Filter } from "lucide-react"
import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyReport {
  month: string
  riskNotes: number
  communications: number
  uploadedRecords: number
  resolvedCases: number
}

interface MonthlyReportsProps {
  reports: MonthlyReport[]
  onFilter: (filters: any) => void
  onExport: () => void
}

export function MonthlyReports({ reports, onFilter, onExport }: MonthlyReportsProps) {
  const [yearFilter, setYearFilter] = useState("2024")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Mock data
  const summary = {
    riskNotes: [
      { month: "Jan", count: 25 },
      { month: "Feb", count: 30 },
      { month: "Mar", count: 28 },
      { month: "Apr", count: 35 },
      { month: "May", count: 32 },
      { month: "Jun", count: 40 },
    ],
    communications: [
      { month: "Jan", count: 120 },
      { month: "Feb", count: 150 },
      { month: "Mar", count: 140 },
      { month: "Apr", count: 180 },
      { month: "May", count: 160 },
      { month: "Jun", count: 200 },
    ],
    uploadedRecords: [
      { month: "Jan", count: 450 },
      { month: "Feb", count: 380 },
      { month: "Mar", count: 420 },
      { month: "Apr", count: 500 },
      { month: "May", count: 480 },
      { month: "Jun", count: 550 },
    ],
    resolvedCases: [
      { month: "Jan", count: 20 },
      { month: "Feb", count: 25 },
      { month: "Mar", count: 22 },
      { month: "Apr", count: 30 },
      { month: "May", count: 28 },
      { month: "Jun", count: 35 },
    ],
    departments: [
      "Computer Science",
      "Engineering",
      "Business",
      "Arts",
      "Science",
    ],
  }

  // Calculate trends
  const riskNoteTrend = ((summary.riskNotes[5].count - summary.riskNotes[4].count) / summary.riskNotes[4].count) * 100
  const communicationsTrend = ((summary.communications[5].count - summary.communications[4].count) / summary.communications[4].count) * 100
  const recordsTrend = ((summary.uploadedRecords[5].count - summary.uploadedRecords[4].count) / summary.uploadedRecords[4].count) * 100
  const resolutionTrend = ((summary.resolvedCases[5].count - summary.resolvedCases[4].count) / summary.resolvedCases[4].count) * 100

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {summary.departments.map((dept) => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="icon" onClick={() => onFilter({
                year: yearFilter,
                department: departmentFilter,
              })}>
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Notes</CardTitle>
            <Badge variant={riskNoteTrend >= 0 ? "default" : "destructive"}>
              {riskNoteTrend >= 0 ? "+" : ""}{riskNoteTrend.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.riskNotes[5].count}</div>
            <p className="text-xs text-muted-foreground">Last Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <Badge variant={communicationsTrend >= 0 ? "default" : "destructive"}>
              {communicationsTrend >= 0 ? "+" : ""}{communicationsTrend.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.communications[5].count}</div>
            <p className="text-xs text-muted-foreground">Last Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploaded Records</CardTitle>
            <Badge variant={recordsTrend >= 0 ? "default" : "destructive"}>
              {recordsTrend >= 0 ? "+" : ""}{recordsTrend.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uploadedRecords[5].count}</div>
            <p className="text-xs text-muted-foreground">Last Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Resolution</CardTitle>
            <Badge variant={resolutionTrend >= 0 ? "default" : "destructive"}>
              {resolutionTrend >= 0 ? "+" : ""}{resolutionTrend.toFixed(1)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.resolvedCases[5].count}</div>
            <p className="text-xs text-muted-foreground">Last Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Risk Notes & Resolution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={summary.riskNotes.map((m, i) => ({
                  month: m.month,
                  riskNotes: m.count,
                  resolvedCases: summary.resolvedCases[i].count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="riskNotes"
                  name="Risk Notes"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="resolvedCases"
                  name="Resolved Cases"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communications & Records Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={summary.communications.map((m, i) => ({
                  month: m.month,
                  communications: m.count,
                  uploadedRecords: summary.uploadedRecords[i].count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="communications"
                  name="Communications"
                  stroke="rgb(147, 51, 234)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="uploadedRecords"
                  name="Uploaded Records"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
