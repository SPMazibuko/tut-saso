"use client"

import { useState, useEffect, useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, TrendingDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Printer } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  getAllInterventionOutcomes,
  getInterventionEffectivenessByType,
  calculateInterventionROI,
} from "@/lib/intervention-analysis"
import { getStudents } from "@/lib/data-service"
import { ComparisonBarChart } from "@/components/analysis/comparison-charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import type { InterventionOutcome, Learner } from "@/lib/types"

export default function InterventionsAnalysisPage() {
  const [students, setStudents] = useState<Learner[]>([])
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    setStudents(getStudents())
  }, [])

  const outcomes = getAllInterventionOutcomes(students)
  const filteredOutcomes = useMemo(() => {
    return outcomes.filter((outcome) => {
      if (typeFilter !== "all" && outcome.interventionType !== typeFilter) return false
      if (statusFilter !== "all" && outcome.status !== statusFilter) return false
      return true
    })
  }, [outcomes, typeFilter, statusFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, statusFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredOutcomes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOutcomes = useMemo(() => {
    return filteredOutcomes.slice(startIndex, endIndex)
  }, [filteredOutcomes, startIndex, endIndex])

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push("ellipsis-start")
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const effectiveness = getInterventionEffectivenessByType(students)

  // Prepare effectiveness chart data
  const effectivenessData = Object.entries(effectiveness).map(([type, data]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1).replace("-", " "),
    successRate: data.successRate,
    avgAttendanceImprovement: data.averageImprovement.attendance,
    avgScoreImprovement: data.averageImprovement.score,
  }))

  const exportToCSV = () => {
    const headers = [
      "Intervention ID",
      "Student ID",
      "Type",
      "Status",
      "Before Attendance",
      "After Attendance",
      "Before Score",
      "After Score",
      "Attendance Change",
      "Score Change",
      "ROI",
    ]
    const rows = filteredOutcomes.map((outcome) => {
      const roi = outcome.improvement ? calculateInterventionROI(outcome) : { roi: 0 }
      return [
        outcome.interventionId,
        outcome.studentId.toString(),
        outcome.interventionType,
        outcome.status,
        outcome.beforeMetrics.attendance.toString(),
        outcome.afterMetrics?.attendance.toString() || "N/A",
        outcome.beforeMetrics.averageScore.toFixed(2),
        outcome.afterMetrics?.averageScore.toFixed(2) || "N/A",
        outcome.improvement?.attendanceChange.toString() || "0",
        outcome.improvement?.scoreChange.toFixed(2) || "0",
        roi.roi.toFixed(2),
      ]
    })
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interventions-analysis-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "planned":
        return <Badge variant="outline">Planned</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader
        title="Intervention Effectiveness"
        subtitle="Track intervention outcomes and measure effectiveness"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Intervention Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tutoring">Tutoring</SelectItem>
                <SelectItem value="counseling">Counseling</SelectItem>
                <SelectItem value="mentoring">Mentoring</SelectItem>
                <SelectItem value="academic-support">Academic Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <CardDescription>Total Interventions</CardDescription>
            <CardTitle className="text-2xl">{outcomes.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {outcomes.filter((o) => o.status === "completed").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {outcomes.filter((o) => o.status === "in-progress").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Success Rate</CardDescription>
            <CardTitle className="text-2xl">
              {Object.values(effectiveness).length > 0
                ? Math.round(
                    Object.values(effectiveness).reduce((sum, e) => sum + e.successRate, 0) /
                      Object.values(effectiveness).length
                  )
                : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Effectiveness by Type */}
      <ComparisonBarChart
        data={effectivenessData}
        title="Intervention Effectiveness by Type"
        description="Success rates and average improvements by intervention type"
        bars={[
          { dataKey: "successRate", name: "Success Rate %", color: "#82ca9d" },
          { dataKey: "avgAttendanceImprovement", name: "Avg Attendance Improvement", color: "#8884d8" },
          { dataKey: "avgScoreImprovement", name: "Avg Score Improvement", color: "#ffc658" },
        ]}
      />

      {/* Intervention Outcomes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Intervention Outcomes</CardTitle>
          <CardDescription>
            Detailed outcomes for all interventions ({filteredOutcomes.length} interventions)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Before</TableHead>
                  <TableHead className="text-right">After</TableHead>
                  <TableHead className="text-right">Improvement</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOutcomes.map((outcome) => {
                  const roi = outcome.improvement ? calculateInterventionROI(outcome) : { roi: 0, cost: 0 }
                  return (
                    <TableRow key={outcome.interventionId}>
                      <TableCell>
                        <Link
                          href={`/dashboard/students/${outcome.studentId}`}
                          className="hover:underline font-medium"
                        >
                          Student {outcome.studentId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{outcome.interventionType}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(outcome.status)}</TableCell>
                      <TableCell className="text-right text-sm">
                        <div>Att: {outcome.beforeMetrics.attendance.toFixed(1)}%</div>
                        <div>Score: {outcome.beforeMetrics.averageScore.toFixed(1)}</div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {outcome.afterMetrics ? (
                          <>
                            <div>Att: {outcome.afterMetrics.attendance.toFixed(1)}%</div>
                            <div>Score: {outcome.afterMetrics.averageScore.toFixed(1)}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {outcome.improvement ? (
                          <div className="flex flex-col items-end gap-1">
                            {outcome.improvement.attendanceChange > 0 ? (
                              <span className="text-green-600 text-sm flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{outcome.improvement.attendanceChange.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-red-600 text-sm flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                {outcome.improvement.attendanceChange.toFixed(1)}%
                              </span>
                            )}
                            {outcome.improvement.scoreChange > 0 ? (
                              <span className="text-green-600 text-sm flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{outcome.improvement.scoreChange.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-red-600 text-sm flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                {outcome.improvement.scoreChange.toFixed(1)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {roi.roi > 0 ? (
                          <span className="text-green-600 font-medium">+{roi.roi.toFixed(1)}%</span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredOutcomes.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOutcomes.length)} of {filteredOutcomes.length} interventions
                </p>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => {
                    if (page === "ellipsis-start" || page === "ellipsis-end") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page as number)
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

