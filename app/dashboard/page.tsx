"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats, getAlerts, getStudents } from "@/lib/data-service"
import type { DashboardStats, Alert, Learner } from "@/lib/types"
import { Users, AlertTriangle, ClipboardList, TrendingUp, TrendingDown, BookOpen, UserCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"
import { StudentDashboard } from "@/components/student-dashboard"
import { RecentActivities } from "@/components/admin/recent-activities"
import { StudentStatusOverview } from "@/components/admin/student-status-overview"
import { FirstYearUnit } from "@/components/admin/first-year-unit"
import { ModuleTutors } from "@/components/admin/module-tutors"
import { IdentifiedModules } from "@/components/admin/identified-modules"
import { ConditionalLetters } from "@/components/admin/conditional-letters copy"
import { ProbationFormStatistics } from "@/components/admin/probation-form-statistics"
import { ExclusionPerDepartment } from "@/components/admin/exclusion-per-department"
import { ReadmissionPerDepartment } from "@/components/admin/readmission-per-department"
import { ProbationPerDepartment } from "@/components/admin/probation-per-department"
import { SupportedModulesPerDepartment, type BreakdownCategory } from "@/components/admin/supported-modules-per-department"
import { ModuleSupportDrilldownDialog } from "@/components/admin/module-support-drilldown-dialog"
import { ModulesPerDepartment } from "@/components/admin/modules-per-department"
import { StudentStatusPieChart } from "@/components/admin/student-statistics copy"
import { AtRiskResidencyBreakdown } from "@/components/admin/at-risk-residency-breakdown"
import { AtRiskResidencyDifference } from "@/components/admin/at-risk-residency-difference"
import { ReadmittedFundingBreakdown } from "@/components/admin/readmitted-funding-breakdown"
import { FinancialExclusionDropoutMetric } from "@/components/admin/financial-exclusion-dropout-metric"
import { ProbationReasonBreakdown } from "@/components/admin/probation-reason-breakdown"
import { ReadmittedFundingDrilldownDialog } from "@/components/admin/readmitted-funding-drilldown-dialog"
import { StudentFundingDrilldownDialog } from "@/components/admin/student-funding-drilldown-dialog"
import { ProbationReasonDrilldownDialog } from "@/components/admin/probation-reason-drilldown-dialog"
import { AtRiskResidencyDrilldownDialog } from "@/components/admin/at-risk-residency-drilldown-dialog"
import { ResidencyDifferenceDrilldownDialog } from "@/components/admin/residency-difference-drilldown-dialog"
import {
  SASO_DASHBOARD_STATS,
  SASO_CAMPUS_PERFORMANCE,
  getSasoDepartmentPerformance,
  getSasoModuleBreakdownByDepartment,
} from "@/lib/tut-saso-data"

const enhancedStudentStatus = SASO_DASHBOARD_STATS.studentStatus
const firstYearUnitData = SASO_DASHBOARD_STATS.breakdown
const moduleTutorsCount = SASO_DASHBOARD_STATS.moduleTutors
const identifiedModulesData = SASO_DASHBOARD_STATS.identifiedModules
const modulesPerDepartmentData = SASO_DASHBOARD_STATS.modulesPerDepartment
const supportedModulesPerDepartmentData = SASO_DASHBOARD_STATS.supportedModulesPerDepartment
const conditionalLettersData = SASO_DASHBOARD_STATS.conditionalLetters
const probationFormData = SASO_DASHBOARD_STATS.probationForm
const exclusionPerDepartmentData = SASO_DASHBOARD_STATS.exclusionPerDepartment
const readmissionPerDepartmentData = SASO_DASHBOARD_STATS.readmissionPerDepartment
const probationPerDepartmentData = SASO_DASHBOARD_STATS.probationPerDepartment

// TUT Campus Performance (mock rates aligned to departmental breakdown)
const additionalCampusPerformance = SASO_CAMPUS_PERFORMANCE

// TUT ICT department statistics (aligned to SASO probation/exclusion totals)
const departmentStats = [
  { name: "Computer Science", failed: 105, repeatingGrade: 85, academicWarning: 185 },
  { name: "Informatics", failed: 92, repeatingGrade: 72, academicWarning: 152 },
  { name: "Information Technology", failed: 88, repeatingGrade: 68, academicWarning: 128 },
  { name: "Computer Systems Engineering", failed: 115, repeatingGrade: 95, academicWarning: 198 },
  { name: "ICT First Year Unit", failed: 78, repeatingGrade: 58, academicWarning: 112 },
]

const conditionalLetters = [
  { name: "Letters signed", value: 126 },
  { name: "Not signed", value: 201 },
]

// TUT faculty overview from SASO departmental breakdown
const mockFacultyOverview = getSasoDepartmentPerformance()

// Derive historical performance with slightly lower rates for previous years
const facultyOverview2022: typeof mockFacultyOverview = mockFacultyOverview.map((dept) => ({
  ...dept,
  passRate: Math.max(60, dept.passRate - 4),
  successRate: Math.max(60, dept.successRate - 4),
}))

const facultyOverview2023: typeof mockFacultyOverview = mockFacultyOverview.map((dept) => ({
  ...dept,
  passRate: Math.max(60, dept.passRate - 2),
  successRate: Math.max(60, dept.successRate - 2),
}))

const departmentPerformanceByYear: Record<string, typeof mockFacultyOverview> = {
  "2022": facultyOverview2022,
  "2023": facultyOverview2023,
  "2024": mockFacultyOverview,
  "2025": mockFacultyOverview,
  "2026": mockFacultyOverview,
}

// TUT campus performance - detailed breakdown
const campusPerformance = {
  soshanguveSouth: {
    campus: "Soshanguve (South)",
    departments: additionalCampusPerformance.soshanguveSouth.departments,
    overall: additionalCampusPerformance.soshanguveSouth.overall,
  },
  polokwane: {
    campus: "Polokwane",
    departments: additionalCampusPerformance.polokwane.departments,
    overall: additionalCampusPerformance.polokwane.overall,
  },
  emalahleni: {
    campus: "eMalahleni",
    departments: additionalCampusPerformance.emalahleni.departments,
    overall: additionalCampusPerformance.emalahleni.overall,
  },
}

const getModuleBreakdown = (departmentName: string) => {
  return getSasoModuleBreakdownByDepartment(departmentName)
}

// School Performance (removed - high schools don't have multiple campuses)
const additionalSchoolPerformance = {
  mainSchool: {
    school: "Main School",
    departments: [
      { name: "Education", passRate: 82, successRate: 79 },
      { name: "Health Professions", passRate: 85, successRate: 83 },
      { name: "Management", passRate: 79, successRate: 77 },
      { name: "Accounting", passRate: 81, successRate: 79 },
      { name: "Theology", passRate: 84, successRate: 82 },
    ],
    overall: { passRate: 82, successRate: 80 }
  },
  online: {
    school: "Online Learning",
    departments: [
      { name: "Education", passRate: 79, successRate: 76 },
      { name: "Humanities", passRate: 77, successRate: 74 },
      { name: "Management", passRate: 76, successRate: 74 },
      { name: "Accounting", passRate: 78, successRate: 76 },
      { name: "Theology", passRate: 81, successRate: 79 },
    ],
    overall: { passRate: 78, successRate: 76 }
  },
  extension: {
    school: "Extension School",
    departments: [
      { name: "Education", passRate: 80, successRate: 77 },
      { name: "Sciences", passRate: 75, successRate: 73 },
      { name: "Management", passRate: 77, successRate: 75 },
      { name: "Accounting", passRate: 79, successRate: 77 },
    ],
    overall: { passRate: 78, successRate: 76 }
  }
}

// School Performance - Detailed Breakdown (removed - high schools don't have multiple campuses)
const schoolPerformance = {
  mainSchool: {
    school: "Main School",
    departments: [
      { name: "Education", passRate: 82, successRate: 79 },
      { name: "Humanities", passRate: 80, successRate: 77 },
      { name: "Agriculture", passRate: 83, successRate: 81 },
      { name: "Sciences", passRate: 78, successRate: 76 },
      { name: "Health Professions", passRate: 85, successRate: 83 },
      { name: "Management", passRate: 79, successRate: 77 },
      { name: "Accounting", passRate: 81, successRate: 79 },
      { name: "Marketing", passRate: 80, successRate: 78 },
      { name: "Management Information Systems (MIS)", passRate: 78, successRate: 76 },
      { name: "Theology", passRate: 84, successRate: 82 },
      { name: "Chaplaincy / Religious Studies", passRate: 82, successRate: 80 },
    ],
    overall: { passRate: 82, successRate: 80 }
  },
  online: {
    school: "Online Learning",
    departments: [
      { name: "Education", passRate: 79, successRate: 76 },
      { name: "Humanities", passRate: 77, successRate: 74 },
      { name: "Management", passRate: 76, successRate: 74 },
      { name: "Accounting", passRate: 78, successRate: 76 },
      { name: "Theology", passRate: 81, successRate: 79 },
    ],
    overall: { passRate: 78, successRate: 76 }
  },
  extension: {
    school: "Extension School",
    departments: [
      { name: "Education", passRate: 80, successRate: 77 },
      { name: "Sciences", passRate: 75, successRate: 73 },
      { name: "Management", passRate: 77, successRate: 75 },
      { name: "Accounting", passRate: 79, successRate: 77 },
    ],
    overall: { passRate: 78, successRate: 76 }
  }
}

const mockAtRisk = SASO_DASHBOARD_STATS.atRiskAnalytics

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recentStudents, setRecentStudents] = useState<Learner[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>(
    () => modulesPerDepartmentData[0]?.name
  )
  const [selectedCategory, setSelectedCategory] = useState<BreakdownCategory | undefined>(undefined)
  const [drilldownDialogOpen, setDrilldownDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<keyof typeof departmentPerformanceByYear>("2026")
  // New metrics for at-risk and readmitted students
  const [atRiskResidency, setAtRiskResidency] = useState(mockAtRisk.residency)
  const [readmittedFunding, setReadmittedFunding] = useState(mockAtRisk.readmittedFunding)
  const [financialExclusionDropoutCount, setFinancialExclusionDropoutCount] = useState(
    mockAtRisk.financialExclusionDropout
  )
  const [probationReasonBreakdown, setProbationReasonBreakdown] = useState(mockAtRisk.probationReasons)
  const [allStudents, setAllStudents] = useState<Learner[]>([])
  const [studentFundingData, setStudentFundingData] = useState(mockAtRisk.studentFunding)
  const [readmittedDrilldownOpen, setReadmittedDrilldownOpen] = useState(false)
  const [studentFundingDrilldownOpen, setStudentFundingDrilldownOpen] = useState(false)
  const [probationDrilldownOpen, setProbationDrilldownOpen] = useState(false)
  const [atRiskResidencyDrilldownOpen, setAtRiskResidencyDrilldownOpen] = useState(false)
  const [residencyDifferenceDrilldownOpen, setResidencyDifferenceDrilldownOpen] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setUserRole(user?.role || null)

    if (user?.role !== "student") {
      setStats(getDashboardStats())
      setAlerts(getAlerts().slice(0, 5))

      // Get high-risk students: "At Risk" or "Satisfactory" with high risk scores
      const highRiskStudents = getStudents()
        .filter((s) => {
          return s.riskLevel === "At Risk" || (s.riskLevel === "Satisfactory" && (s.riskScore || 0) >= 60)
        })
        .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
        .slice(0, 5)

      // If no high-risk students found, fallback to top 5 students by risk score
      if (highRiskStudents.length === 0) {
        setRecentStudents(
          getStudents()
            .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
            .slice(0, 5),
        )
      } else {
        setRecentStudents(highRiskStudents)
      }

      // Compute at-risk learner metrics
      const studentsList = getStudents()
      setAllStudents(studentsList)
      const atRiskLearners = studentsList.filter(
        (s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory"
      )

      // At-risk residency breakdown
      const atRiskResidencyCounts = atRiskLearners.reduce(
        (acc, s) => {
          if (s.residency === "onCampus") acc.onCampus++
          else if (s.residency === "offCampus") acc.offCampus++
          return acc
        },
        { onCampus: 0, offCampus: 0 }
      )
      setAtRiskResidency(
        atRiskResidencyCounts.onCampus + atRiskResidencyCounts.offCampus > 0
          ? atRiskResidencyCounts
          : mockAtRisk.residency
      )

      // Readmitted funding breakdown
      const readmittedLearners = studentsList.filter((s) => s.isReadmitted === true)
      const readmittedFundingCounts = readmittedLearners.reduce(
        (acc, s) => {
          if (s.fundingType === "self") acc.selfFunded++
          else if (s.fundingType === "nsfas") acc.nsfas++
          return acc
        },
        { selfFunded: 0, nsfas: 0 }
      )
      setReadmittedFunding(
        readmittedFundingCounts.nsfas + readmittedFundingCounts.selfFunded > 0
          ? readmittedFundingCounts
          : mockAtRisk.readmittedFunding
      )

      // Student funding breakdown (all students)
      const fundingCounts = studentsList.reduce(
        (acc, s) => {
          if (s.fundingType === "nsfas") acc.nsfas++
          else if (s.fundingType === "self") acc.selfFunded++
          return acc
        },
        { nsfas: 0, selfFunded: 0 }
      )
      setStudentFundingData(
        fundingCounts.nsfas + fundingCounts.selfFunded > 0 ? fundingCounts : mockAtRisk.studentFunding
      )

      // Financial exclusion dropout metric: financially excluded + academically approved + dropped out
      const financialExclusionDropout = studentsList.filter(
        (s) =>
          s.financiallyExcluded === true &&
          (s.riskLevel === "Good" || s.riskLevel === "Satisfactory") &&
          s.hasDroppedOut === true
      )
      setFinancialExclusionDropoutCount(
        financialExclusionDropout.length > 0
          ? financialExclusionDropout.length
          : mockAtRisk.financialExclusionDropout
      )

      // Probation reason breakdown
      const probationBreakdown = studentsList
        .filter((s) => s.isOnProbation === true)
        .reduce(
          (acc, s) => {
            const reason = s.probationReason || "other"
            acc[reason as keyof typeof acc] = (acc[reason as keyof typeof acc] || 0) + 1
            return acc
          },
          {
            module_cancellation: 0,
            low_credits: 0,
            academic_performance: 0,
            other: 0,
          }
        )
      const probationTotal =
        probationBreakdown.module_cancellation +
        probationBreakdown.low_credits +
        probationBreakdown.academic_performance +
        probationBreakdown.other
      setProbationReasonBreakdown(
        probationTotal > 0 ? probationBreakdown : mockAtRisk.probationReasons
      )



    }
  }, [])



  const handleDepartmentSelect = (departmentName: string) => {
    setSelectedDepartment(departmentName)
  }

  // if (userRole === "student") {
  //   return <StudentDashboard />
  // }

  // // Role-specific dashboards
  // if (userRole === "admin") {
  //   const { AdminDashboard } = require("@/components/dashboards/admin-dashboard")
  //   return <AdminDashboard />
  // }

  // if (userRole === "teacher") {
  //   const { TeacherDashboard } = require("@/components/dashboards/teacher-dashboard")
  //   return <TeacherDashboard />
  // }

  // if (userRole === "parent") {
  //   const { ParentDashboard } = require("@/components/dashboards/parent-dashboard")
  //   return <ParentDashboard />
  // }

  // if (userRole === "district-admin") {
  //   const { DistrictAdminDashboard } = require("@/components/dashboards/district-admin-dashboard")
  //   return <DistrictAdminDashboard />
  // }

  // if (userRole === "provincial-admin") {
  //   const { ProvincialAdminDashboard } = require("@/components/dashboards/provincial-admin-dashboard")
  //   return <ProvincialAdminDashboard />
  // }

  const statCards = stats
    ? [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "At-Risk Students",
      value: stats.atRiskStudents,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: "up",
    },
    {
      title: "Active Interventions",
      value: stats.activeInterventions,
      icon: ClipboardList,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Average Attendance",
      value: `${stats.averageAttendance.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: stats.averageAttendance > 85 ? "up" : "down",
    },
  ]
    : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor student performance and system metrics</p>
      </div>

      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Academic Year:</span>
          <Select
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value as keyof typeof departmentPerformanceByYear)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedDepartment && (
          <Badge variant="outline" className="text-sm">
            Department: {selectedDepartment}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={cn("rounded-full p-2", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span>{stat.trend === "up" ? "Improving" : "Needs attention"}</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Additional Stats Grid using new data */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <div className="rounded-full p-2 bg-blue-100">
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.teachers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identified Subjects</CardTitle>
            <div className="rounded-full p-2 bg-purple-100">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.identifiedSubjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Subjects requiring support</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supported Subjects</CardTitle>
            <div className="rounded-full p-2 bg-green-100">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.supportedSubjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently supported</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications Today</CardTitle>
            <div className="rounded-full p-2 bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.communicationsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Messages sent today</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Student risk levels across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.riskDistribution).map(([level, count]) => {
                const percentage = (count / stats.totalStudents) * 100
                const colors = {
                  low: "bg-green-500",
                  medium: "bg-yellow-500",
                  high: "bg-orange-500",
                  critical: "bg-red-500",
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
                        className={cn("h-full", colors[level as keyof typeof colors])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card> */}

        {/* Recent Alerts */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent alerts</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <AlertTriangle
                      className={cn(
                        "h-5 w-5 mt-0.5",
                        alert.severity === "critical" && "text-red-600",
                        alert.severity === "high" && "text-orange-600",
                        alert.severity === "medium" && "text-yellow-600",
                        alert.severity === "low" && "text-blue-600",
                      )}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleDateString()} at{" "}
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!alert.read && <Badge variant="secondary">New</Badge>}
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard/risk">View All Alerts</Link>
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* High-Risk Students */}
      {/* <Card>
        <CardHeader>
          <CardTitle>High-Risk Students</CardTitle>
          <CardDescription>Students requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Faculty {student.grade} • APS: {student.aps?.toFixed(2) ?? "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={student.riskLevel === "At Risk" ? "destructive" : "secondary"}
                      className={cn(student.riskLevel === "At Risk" && "bg-orange-500 hover:bg-orange-600 text-white")}
                    >
                      {student.riskLevel}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/students/${student.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/dashboard/students">View All Students</Link>
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Enhanced Dashboard Widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        <StudentStatusOverview data={enhancedStudentStatus} />
        <FirstYearUnit data={firstYearUnitData} />
        <ModuleTutors count={moduleTutorsCount} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <IdentifiedModules data={identifiedModulesData} />
        <ConditionalLetters data={conditionalLettersData} />
        <ProbationFormStatistics data={probationFormData} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ExclusionPerDepartment data={exclusionPerDepartmentData} />
        <ReadmissionPerDepartment data={readmissionPerDepartmentData} />
        <ProbationPerDepartment data={probationPerDepartmentData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ModulesPerDepartment
          data={modulesPerDepartmentData}
          onDepartmentSelect={handleDepartmentSelect}
          selectedDepartment={selectedDepartment}
        />
        <SupportedModulesPerDepartment
          data={supportedModulesPerDepartmentData}
          selectedDepartment={selectedDepartment}
          breakdown={selectedDepartment ? getModuleBreakdown(selectedDepartment) : undefined}
          onBreakdownSelect={(category) => {
            setSelectedCategory(category)
            setDrilldownDialogOpen(true)
          }}
        />
      </div>

      {selectedDepartment && selectedCategory && (
        <ModuleSupportDrilldownDialog
          open={drilldownDialogOpen}
          onOpenChange={setDrilldownDialogOpen}
          department={selectedDepartment}
          category={selectedCategory}
        />
      )}

      {/* Additional Campus Performance */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
          <CardTitle className="text-xl font-semibold text-foreground">Campus Performance</CardTitle>
          <CardDescription className="text-muted-foreground">Pass rates and success rates by campus</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-6 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent rounded-xl border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200">
              <h3 className="mb-4 text-lg font-semibold text-foreground">{additionalCampusPerformance.soshanguveSouth.campus}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-foreground">{additionalCampusPerformance.soshanguveSouth.overall.passRate}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">{additionalCampusPerformance.soshanguveSouth.overall.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent rounded-xl border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200">
              <h3 className="mb-4 text-lg font-semibold text-foreground">{additionalCampusPerformance.polokwane.campus}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-foreground">{additionalCampusPerformance.polokwane.overall.passRate}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">{additionalCampusPerformance.polokwane.overall.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent rounded-xl border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200">
              <h3 className="mb-4 text-lg font-semibold text-foreground">{additionalCampusPerformance.emalahleni.campus}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-foreground">{additionalCampusPerformance.emalahleni.overall.passRate}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">{additionalCampusPerformance.emalahleni.overall.successRate}%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Overview - Department Performance by Year */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Department Performance</CardTitle>
              <CardDescription className="text-muted-foreground">
                Pass rates and success rates by department
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">Year</span>
              <Select
                value={selectedYear}
                onValueChange={(value) => setSelectedYear(value as keyof typeof departmentPerformanceByYear)}
              >
                <SelectTrigger className="h-8 w-[110px] rounded-full border-border bg-background/80 text-xs font-medium">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-h-80 overflow-x-auto overflow-y-auto pr-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-semibold text-foreground">Department Name</th>
                  <th className="py-3 px-4 text-center font-semibold text-foreground">Pass Rate</th>
                  <th className="py-3 px-4 text-center font-semibold text-foreground">Success Rate</th>
                  <th className="py-3 px-4 text-center font-semibold text-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {departmentPerformanceByYear[selectedYear].map((dept) => (
                  <tr key={dept.department} className="border-b border-border/60 hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium text-foreground">{dept.department}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-foreground">{`${dept.passRate}%`}</span>
                        <Progress value={dept.passRate} className="h-2 w-16 bg-muted" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-foreground">{`${dept.successRate}%`}</span>
                        <Progress value={dept.successRate} className="h-2 w-16 bg-muted" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {dept.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {dept.trend === "down" && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                        {dept.trend === "stable" && <div className="h-4 w-4 rounded-full bg-gray-400" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Campus Performance */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
          <CardTitle className="text-xl font-semibold text-foreground">Success rate contributors</CardTitle>
          <CardDescription className="text-muted-foreground">Department performance breakdown by campus</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{campusPerformance.soshanguveSouth.campus}</h3>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{campusPerformance.soshanguveSouth.overall.passRate}%</div>
                    <div className="text-muted-foreground">Pass Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{campusPerformance.soshanguveSouth.overall.successRate}%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {campusPerformance.soshanguveSouth.departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{dept.name}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>P: {dept.passRate}%</span>
                      <span>S: {dept.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{campusPerformance.polokwane.campus}</h3>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{campusPerformance.polokwane.overall.passRate}%</div>
                    <div className="text-muted-foreground">Pass Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{campusPerformance.polokwane.overall.successRate}%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {campusPerformance.polokwane.departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{dept.name}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>P: {dept.passRate}%</span>
                      <span>S: {dept.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-foreground">{campusPerformance.emalahleni.campus}</h3>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{campusPerformance.emalahleni.overall.passRate}%</div>
                    <div className="text-muted-foreground">Pass Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{campusPerformance.emalahleni.overall.successRate}%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {campusPerformance.emalahleni.departments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{dept.name}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>P: {dept.passRate}%</span>
                      <span>S: {dept.successRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      <ReadmittedFundingBreakdown
        data={readmittedFunding}
        onOpenDrilldown={() => setReadmittedDrilldownOpen(true)}
      />
      <ReadmittedFundingDrilldownDialog
        open={readmittedDrilldownOpen}
        onOpenChange={setReadmittedDrilldownOpen}
        students={allStudents}
        data={readmittedFunding}
      />

      {/* Financial Exclusion Dropout Metric */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <FinancialExclusionDropoutMetric count={financialExclusionDropoutCount} />
        {/* Student Funding Statistics */}
        <Card
          className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setStudentFundingDrilldownOpen(true)}
          role="button"
        >
          <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">Student Funding</CardTitle>
                <CardDescription className="text-muted-foreground">Distribution of student funding sources</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Bursary/NSFAS */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Bursary/NSFAS</p>
                    <p className="text-sm text-muted-foreground">Government funded students</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{studentFundingData.nsfas}</div>
                  <div className="text-sm text-muted-foreground">students</div>
                </div>
              </div>

              {/* Self Funded */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Self Funded</p>
                    <p className="text-sm text-muted-foreground">Privately funded students</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{studentFundingData.selfFunded}</div>
                  <div className="text-sm text-muted-foreground">students</div>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border/60 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Total Students</span>
                  <span className="text-2xl font-bold text-foreground">{allStudents.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <StudentFundingDrilldownDialog
        open={studentFundingDrilldownOpen}
        onOpenChange={setStudentFundingDrilldownOpen}
        students={allStudents}
        data={studentFundingData}
      />

      {/* Key Metrics */}
      {/* <KPICards items={majorityKPI} /> */}

      {/* Probation Reason Breakdown */}
      <div className="grid gap-4 md:grid-cols-1">
        <ProbationReasonBreakdown
          data={probationReasonBreakdown}
          onOpenDrilldown={() => setProbationDrilldownOpen(true)}
        />
      </div>
      <ProbationReasonDrilldownDialog
        open={probationDrilldownOpen}
        onOpenChange={setProbationDrilldownOpen}
        students={allStudents}
        data={probationReasonBreakdown}
      />

      {/* New At-Risk and Readmitted Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <AtRiskResidencyBreakdown
          data={atRiskResidency}
          onOpenDrilldown={() => setAtRiskResidencyDrilldownOpen(true)}
        />
        <AtRiskResidencyDifference
          difference={atRiskResidency.onCampus - atRiskResidency.offCampus}
          onOpenDrilldown={() => setResidencyDifferenceDrilldownOpen(true)}
        />
      </div>
      <AtRiskResidencyDrilldownDialog
        open={atRiskResidencyDrilldownOpen}
        onOpenChange={setAtRiskResidencyDrilldownOpen}
        students={allStudents}
        data={atRiskResidency}
      />
      <ResidencyDifferenceDrilldownDialog
        open={residencyDifferenceDrilldownOpen}
        onOpenChange={setResidencyDifferenceDrilldownOpen}
        students={allStudents}
        data={{
          onCampus: atRiskResidency.onCampus,
          offCampus: atRiskResidency.offCampus,
          difference: atRiskResidency.onCampus - atRiskResidency.offCampus,
        }}
      />

      {/* Recent Activities */}
      <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
          <CardTitle className="text-xl font-semibold text-foreground">Recent Activities</CardTitle>
          <CardDescription className="text-muted-foreground">Latest system activities and notifications</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <RecentActivities />
        </CardContent>
      </Card>


    </div>
  )
}
