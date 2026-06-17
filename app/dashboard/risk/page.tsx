"use client"

import { useEffect, useState, useMemo } from "react"
import { getAlerts, getStudents, getRiskFactors } from "@/lib/data-service"
import type { Alert, Learner, RiskFactor } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Users, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppHeader } from "@/components/layout/app-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

// Get data from data service
const allAlerts = getAlerts()
const allStudents = getStudents()
const allRiskFactors = getRiskFactors()

export default function RiskDetectionPage() {
  const [alertsPage, setAlertsPage] = useState(1)
  const [studentsPage, setStudentsPage] = useState(1)
  const [factorsPage, setFactorsPage] = useState(1)
  const [alertsItemsPerPage, setAlertsItemsPerPage] = useState(8)
  const [studentsItemsPerPage, setStudentsItemsPerPage] = useState(8)
  const [factorsItemsPerPage, setFactorsItemsPerPage] = useState(5)

  // Use new risk levels: "At Risk" → critical, "Satisfactory" → high
  const criticalStudents = useMemo(() => allStudents.filter((s) => s.riskLevel === "At Risk"), [])
  const highRiskStudents = useMemo(() => allStudents.filter((s) => s.riskLevel === "Satisfactory"), [])
  const unresolvedFactors = useMemo(() => allRiskFactors.filter((rf) => !rf.resolved), [])

  const riskByCategory = useMemo(
    () =>
      unresolvedFactors.reduce(
        (acc, factor) => {
          acc[factor.category] = (acc[factor.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    [unresolvedFactors],
  )

  const combinedStudents = useMemo(() => [...criticalStudents, ...highRiskStudents], [criticalStudents, highRiskStudents])

  const factorsSorted = useMemo(
    () => [...unresolvedFactors].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()),
    [unresolvedFactors],
  )

  // Pagination calculations
  const alertsTotalPages = Math.max(1, Math.ceil(allAlerts.length / alertsItemsPerPage))
  const studentsTotalPages = Math.max(1, Math.ceil(combinedStudents.length / studentsItemsPerPage))
  const factorsTotalPages = Math.max(1, Math.ceil(factorsSorted.length / factorsItemsPerPage))

  const alertsPageItems = useMemo(
    () => allAlerts.slice((alertsPage - 1) * alertsItemsPerPage, alertsPage * alertsItemsPerPage),
    [alertsPage, alertsItemsPerPage],
  )
  const studentsPageItems = useMemo(
    () => combinedStudents.slice((studentsPage - 1) * studentsItemsPerPage, studentsPage * studentsItemsPerPage),
    [combinedStudents, studentsPage, studentsItemsPerPage],
  )
  const factorsPageItems = useMemo(
    () => factorsSorted.slice((factorsPage - 1) * factorsItemsPerPage, factorsPage * factorsItemsPerPage),
    [factorsSorted, factorsPage, factorsItemsPerPage],
  )

  // Ensure pages stay in bounds when data or page size changes
  useEffect(() => {
    setAlertsPage((p) => Math.min(alertsTotalPages, Math.max(1, p)))
  }, [alertsTotalPages])

  useEffect(() => {
    setStudentsPage((p) => Math.min(studentsTotalPages, Math.max(1, p)))
  }, [studentsTotalPages])

  useEffect(() => {
    setFactorsPage((p) => Math.min(factorsTotalPages, Math.max(1, p)))
  }, [factorsTotalPages])


  // Helper to render compact pagination with ellipses (reusable)
  const getPageNumbers = (totalPages: number, currentPage: number) => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push("ellipsis-start")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end")
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <AppHeader title="Risk Detection & Alerts" subtitle="Monitor and respond to student risk indicators" />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalStudents.length}</div>
            <p className="text-xs text-muted-foreground">Students requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskStudents.length}</div>
            <p className="text-xs text-muted-foreground">Students needing intervention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allAlerts.filter((a) => !a.read).length}</div>
              <p className="text-xs text-muted-foreground">Unread notifications</p>
            </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Factors</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedFactors.length}</div>
            <p className="text-xs text-muted-foreground">Unresolved issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="critical">Critical Students</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No alerts</p>
                ) : (
                  alertsPageItems.map((alert) => {
                    const student = allStudents.find((s) => String(s.id) === alert.studentId)
                    return (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <AlertTriangle
                          className={cn(
                            "h-5 w-5 mt-0.5 flex-shrink-0",
                            alert.severity === "critical" && "text-red-600",
                            alert.severity === "high" && "text-orange-600",
                            alert.severity === "medium" && "text-yellow-600",
                            alert.severity === "low" && "text-blue-600",
                          )}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium leading-none mb-1">{alert.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleDateString()} at{" "}
                                {new Date(alert.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!alert.read && <Badge variant="secondary">New</Badge>}
                              {alert.actionTaken && <Badge className="bg-green-500 hover:bg-green-600">Actioned</Badge>}
                            </div>
                          </div>
                          {student && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/students/${student.id}`}>View Student</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {allAlerts.length > 0 && (
                <div className="flex items-center justify-between border-t px-6 py-4 mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {(alertsPage - 1) * alertsItemsPerPage + 1} to {Math.min(alertsPage * alertsItemsPerPage, allAlerts.length)} of {allAlerts.length} alerts
                    </p>
                    <Select
                      value={alertsItemsPerPage.toString()}
                      onValueChange={(value) => {
                        setAlertsItemsPerPage(Number(value))
                        setAlertsPage(1)
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
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
                            if (alertsPage > 1) setAlertsPage(alertsPage - 1)
                          }}
                          className={alertsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getPageNumbers(alertsTotalPages, alertsPage).map((page, index) => {
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
                                setAlertsPage(page as number)
                              }}
                              isActive={alertsPage === page}
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
                            if (alertsPage < alertsTotalPages) setAlertsPage(alertsPage + 1)
                          }}
                          className={alertsPage === alertsTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical & High Risk Students</CardTitle>
              <CardDescription>Students requiring immediate intervention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...criticalStudents, ...highRiskStudents].length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No critical or high-risk students</p>
                ) : (
                  studentsPageItems.map((student) => (
                    <div
                      key={student.id}
                      className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                          {student.name.charAt(0)}
                          {student.surname.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {student.name} {student.surname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.studentNumber} • {student.riskLevel}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Assessment (PP)</p>
                          <p className="font-semibold">{student.assessments?.PP || 0}%</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Attendance</p>
                          <p className="font-semibold">{student.attendance?.percentage || student.attendanceRate || 0}%</p>
                        </div>
                        <Badge variant={student.riskLevel === "At Risk" ? "destructive" : "secondary"}>
                          {student.riskLevel}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/students/${student.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {combinedStudents.length > 0 && (
                <div className="flex items-center justify-between border-t px-6 py-4 mt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {(studentsPage - 1) * studentsItemsPerPage + 1} to {Math.min(studentsPage * studentsItemsPerPage, combinedStudents.length)} of {combinedStudents.length} students
                    </p>
                    <Select
                      value={studentsItemsPerPage.toString()}
                      onValueChange={(value) => {
                        setStudentsItemsPerPage(Number(value))
                        setStudentsPage(1)
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
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
                            if (studentsPage > 1) setStudentsPage(studentsPage - 1)
                          }}
                          className={studentsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getPageNumbers(studentsTotalPages, studentsPage).map((page, index) => {
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
                                setStudentsPage(page as number)
                              }}
                              isActive={studentsPage === page}
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
                            if (studentsPage < studentsTotalPages) setStudentsPage(studentsPage + 1)
                          }}
                          className={studentsPage === studentsTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors by Category</CardTitle>
                <CardDescription>Distribution of unresolved risk factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(riskByCategory).map(([category, count]) => {
                    const percentage = (count / unresolvedFactors.length) * 100
                    const colors = {
                      academic: "bg-blue-500",
                      attendance: "bg-purple-500",
                      behavioral: "bg-orange-500",
                      social: "bg-green-500",
                    }

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium">{category}</span>
                          <span className="text-muted-foreground">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full", colors[category as keyof typeof colors])}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Risk Factors</CardTitle>
                <CardDescription>Latest identified risk indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {factorsPageItems.map((factor) => {
                    const student = allStudents.find((s) => String(s.id) === factor.studentId)
                    return (
                      <div key={factor.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge
                            variant={
                              factor.severity === "critical" || factor.severity === "high" ? "destructive" : "secondary"
                            }
                            className={cn(
                              factor.severity === "medium" && "bg-yellow-500 hover:bg-yellow-600 text-white",
                              factor.severity === "low" && "bg-blue-500 hover:bg-blue-600 text-white",
                            )}
                          >
                            {factor.severity}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {factor.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{factor.description}</p>
                        {student && (
                          <p className="text-xs text-muted-foreground">
                            Student: {student.name} {student.surname} ({student.studentNumber}) • {new Date(factor.detectedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {factorsSorted.length > 0 && (
                  <div className="flex items-center justify-between border-t px-6 py-4 mt-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Showing {(factorsPage - 1) * factorsItemsPerPage + 1} to {Math.min(factorsPage * factorsItemsPerPage, factorsSorted.length)} of {factorsSorted.length} risk factors
                      </p>
                      <Select
                        value={factorsItemsPerPage.toString()}
                        onValueChange={(value) => {
                          setFactorsItemsPerPage(Number(value))
                          setFactorsPage(1)
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="20">20</SelectItem>
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
                              if (factorsPage > 1) setFactorsPage(factorsPage - 1)
                            }}
                            className={factorsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {getPageNumbers(factorsTotalPages, factorsPage).map((page, index) => {
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
                                  setFactorsPage(page as number)
                                }}
                                isActive={factorsPage === page}
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
                              if (factorsPage < factorsTotalPages) setFactorsPage(factorsPage + 1)
                            }}
                            className={factorsPage === factorsTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
