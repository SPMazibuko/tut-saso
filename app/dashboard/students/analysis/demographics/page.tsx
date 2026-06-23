"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, FileText, Printer } from "lucide-react"
import {
  getDemographicDistribution,
  getGeographicDistribution,
  getDemographicCorrelations,
} from "@/lib/demographic-analysis"
import { getStudents } from "@/lib/data-service"
import { DemographicPieChart, DemographicBarChart, MultiBarChart } from "@/components/analysis/demographic-charts"
import type { Learner } from "@/lib/types"

export default function DemographicsAnalysisPage() {
  const [students, setStudents] = useState<Learner[]>([])
  const [provinceFilter, setProvinceFilter] = useState<string>("all")
  const [districtFilter, setDistrictFilter] = useState<string>("all")

  useEffect(() => {
    setStudents(getStudents())
  }, [])

  // Filter students based on selections
  const filteredStudents = students.filter((student) => {
    if (provinceFilter !== "all" && student.provinceId !== provinceFilter) return false
    if (districtFilter !== "all" && student.districtId !== districtFilter) return false
    return true
  })

  const distribution = getDemographicDistribution(filteredStudents)
  const geographic = getGeographicDistribution(filteredStudents)
  const correlations = getDemographicCorrelations(filteredStudents)

  // Prepare chart data
  const genderData = [
    { name: "Male", value: distribution.gender.male },
    { name: "Female", value: distribution.gender.female },
    { name: "Other", value: distribution.gender.other },
  ]

  const incomeData = [
    { name: "Low", value: distribution.income.low },
    { name: "Middle", value: distribution.income.middle },
    { name: "High", value: distribution.income.high },
  ]

  const languageData = Object.entries(distribution.language)
    .map(([lang, count]) => ({ name: lang, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const gradeData = Object.entries(distribution.grade)
    .map(([grade, count]) => ({ name: `Faculty ${grade}`, value: count }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const correlationData = correlations.map((corr) => ({
    name: `${corr.demographic} - ${corr.value}`,
    attendance: corr.averageAttendance,
    // aps: corr.averageAPS,
    passRate: corr.passRate,
    atRisk: corr.atRiskPercentage,
  }))

  const exportToCSV = () => {
    const headers = ["Demographic", "Value", "Average Attendance", "Pass Rate", "At Risk %"]
    const rows = correlations.map((c) => [
      c.demographic,
      c.value,
      c.averageAttendance.toFixed(2),
      // c.averageAPS.toFixed(2),
      c.passRate.toFixed(2),
      c.atRiskPercentage.toFixed(2),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `demographics-analysis-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Demographic Analysis"
        subtitle="Analyze student demographics and their correlation with academic performance"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {/* Add province options */}
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {/* Add district options */}
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
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-2xl">{filteredStudents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gender Distribution</CardDescription>
            <CardTitle className="text-2xl">
              {distribution.gender.male + distribution.gender.female + distribution.gender.other}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Languages</CardDescription>
            <CardTitle className="text-2xl">{Object.keys(distribution.language).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Provinces</CardDescription>
            <CardTitle className="text-2xl">{Object.keys(distribution.province).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <DemographicPieChart
          data={genderData}
          title="Gender Distribution"
          description="Distribution of students by gender"
        />
        <DemographicPieChart
          data={incomeData}
          title="Income Bracket Distribution"
          description="Distribution of students by household income"
        />
        <DemographicBarChart
          data={languageData}
          title="Top 10 Languages"
          description="Most common household languages"
        />
        <DemographicBarChart
          data={gradeData}
          title="Course Distribution"
          description="Distribution of students by course"
        />
      </div>

      {/* Correlation Analysis */}
      <MultiBarChart
        data={correlationData}
        title="Demographic Performance Correlations"
        description="Academic performance metrics by demographic groups"
        bars={[
          { dataKey: "attendance", name: "Average Attendance %", color: "#8884d8" },
          // { dataKey: "aps", name: "Average APS", color: "#82ca9d" },
          { dataKey: "passRate", name: "Pass Rate %", color: "#ffc658" },
          { dataKey: "atRisk", name: "At Risk %", color: "#ff6b6b" },
        ]}
      />

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Student distribution across provinces, districts, and schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geographic.map((province) => (
              <div key={province.provinceId} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {province.provinceName} ({province.studentCount} students)
                </h3>
                <div className="ml-4 space-y-2">
                  {province.districts.map((district) => (
                    <div key={district.districtId} className="border-l-2 pl-4">
                      <h4 className="font-medium">
                        {district.districtName} ({district.studentCount} students)
                      </h4>
                      <div className="ml-4 text-sm text-muted-foreground">
                        {district.schools.length} schools
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

