"use client"

import { useState, useEffect } from "react"
import {
  getTopBottomSchools,
  getGovernanceKPIs,
  getMELMetrics,
  getSchoolPerformanceReport,
  getSchoolSummary,
  getDistrictSummaries,
  getProvinceSummaries,
} from "@/lib/governance"
import type {
  SchoolPerformance,
  PerformanceTrend,
  PerformanceFlag,
  PerformanceCategory,
  MELMetrics,
  GovernanceKPIs,
  SchoolPerformanceReport,
} from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Award,
  FileText,
  Download,
  Eye,
  ArrowUpDown,
  Target,
  Activity,
  Users,
  BarChart3,
  Clock,
  Shield,
  TrendingUpDown,
  AlertCircle,
  Building2,
  MapPin,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { getUserScope, getScopeDescription } from "@/lib/user-context"

export default function GovernancePage() {
  const [topBottomSchools, setTopBottomSchools] = useState<ReturnType<typeof getTopBottomSchools> | null>(null)
  const [kpis, setKPIs] = useState<GovernanceKPIs | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [schoolReport, setSchoolReport] = useState<SchoolPerformanceReport | null>(null)

  useEffect(() => {
    setTopBottomSchools(getTopBottomSchools())
    setKPIs(getGovernanceKPIs())
  }, [])

  const handleViewReport = (schoolId: string) => {
    setSelectedSchool(schoolId)
    const report = getSchoolPerformanceReport(schoolId)
    setSchoolReport(report)
  }

  if (!topBottomSchools || !kpis) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Governance Overview</h1>
        <p className="text-muted-foreground">
          Multi-level governance views and performance rankings by faculty
        </p>
      </div>

      <Tabs defaultValue="multi-level" className="w-full">
        <TabsList>
          <TabsTrigger value="multi-level">Multi-Level View</TabsTrigger>
          <TabsTrigger value="rankings">Performance Rankings</TabsTrigger>
        </TabsList>

        {/* Multi-Level Governance View (Original) */}
        <TabsContent value="multi-level" className="space-y-6">
          <MultiLevelGovernanceView />
        </TabsContent>

        {/* Performance Rankings View (New) */}
        <TabsContent value="rankings" className="space-y-6">

          {/* Governance KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Governance KPIs</CardTitle>
              <CardDescription>Key performance indicators across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPITile
                  label="Attendance Compliance (Gr 10-12)"
                  value={`${kpis.attendanceCompliance}%`}
                  target="≥ 90%"
                  status={kpis.attendanceCompliance >= 90 ? "success" : "warning"}
                  icon={<Users className="h-4 w-4" />}
                />
                <KPITile
                  label="SBA On-Time Uploads"
                  value={`${kpis.sbaOnTimeUploads}%`}
                  target="≥ 95%"
                  status={kpis.sbaOnTimeUploads >= 95 ? "success" : "warning"}
                  icon={<FileText className="h-4 w-4" />}
                />
                <KPITile
                  label="Alert-to-Intervention Median"
                  value={`${kpis.alertToInterventionMedian.toFixed(1)} days`}
                  target="≤ 3 days"
                  status={kpis.alertToInterventionMedian <= 3 ? "success" : "warning"}
                  icon={<Clock className="h-4 w-4" />}
                />
                <KPITile
                  label="Intervention Closure SLA"
                  value={`${kpis.interventionClosureSLA}%`}
                  target="≥ 80%"
                  status={kpis.interventionClosureSLA >= 80 ? "success" : "warning"}
                  icon={<CheckCircle className="h-4 w-4" />}
                />
                <KPITile
                  label="At-Risk with Active Plans"
                  value={`${kpis.atRiskWithActivePlans}%`}
                  target="≥ 85%"
                  status={kpis.atRiskWithActivePlans >= 85 ? "success" : "warning"}
                  icon={<Target className="h-4 w-4" />}
                />
                <KPITile
                  label="Promotion Rate Change (Gr 12)"
                  value={`${kpis.promotionRateChange > 0 ? "+" : ""}${kpis.promotionRateChange.toFixed(1)} pp`}
                  target="+X pp vs baseline"
                  status={kpis.promotionRateChange > 0 ? "success" : "warning"}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <KPITile
                  label="Intervention Uplift"
                  value={`${kpis.interventionUplift > 0 ? "+" : ""}${kpis.interventionUplift.toFixed(1)} pp`}
                  target="+Y pp for supported students"
                  status={kpis.interventionUplift > 0 ? "success" : "warning"}
                  icon={<TrendingUpDown className="h-4 w-4" />}
                />
                <KPITile
                  label="Data Quality Errors"
                  value={`${kpis.dataQualityErrors}%`}
                  target="≤ 1%"
                  status={kpis.dataQualityErrors <= 1 ? "success" : "warning"}
                  icon={<Shield className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Top 15 Performing Schools */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top 7 Senior Phase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Top 7 Senior Phase Schools (Grades 8-9)
                </CardTitle>
                <CardDescription>Highest performing schools in Senior Phase</CardDescription>
              </CardHeader>
              <CardContent>
                <SchoolRankingTable
                  schools={topBottomSchools.top15.seniorPhase}
                  onViewReport={handleViewReport}
                />
              </CardContent>
            </Card>

            {/* Top 8 FET */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Top 8 FET Schools (Grades 10-12)
                </CardTitle>
                <CardDescription>Highest performing schools in FET Phase</CardDescription>
              </CardHeader>
              <CardContent>
                <SchoolRankingTable
                  schools={topBottomSchools.top15.fet}
                  onViewReport={handleViewReport}
                />
              </CardContent>
            </Card>
          </div>

          {/* Bottom 15 Underperforming Schools */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bottom 7 Senior Phase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Bottom 7 Senior Phase Schools (Grades 8-9)
                </CardTitle>
                <CardDescription>Schools requiring urgent intervention</CardDescription>
              </CardHeader>
              <CardContent>
                <SchoolRankingTable
                  schools={topBottomSchools.bottom15.seniorPhase}
                  onViewReport={handleViewReport}
                />
              </CardContent>
            </Card>

            {/* Bottom 8 FET */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Bottom 8 FET Schools (Grades 10-12)
                </CardTitle>
                <CardDescription>Schools requiring urgent intervention</CardDescription>
              </CardHeader>
              <CardContent>
                <SchoolRankingTable
                  schools={topBottomSchools.bottom15.fet}
                  onViewReport={handleViewReport}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* School Performance Report Dialog */}
      {selectedSchool && schoolReport && (
        <SchoolPerformanceReportDialog
          report={schoolReport}
          open={!!selectedSchool}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSchool(null)
              setSchoolReport(null)
            }
          }}
        />
      )}
    </div>
  )
}

function MultiLevelGovernanceView() {
  const school = getSchoolSummary()
  const districts = getDistrictSummaries()
  const provinces = getProvinceSummaries()

  // Group districts by province for better organization
  const districtsByProvince = provinces.map((province) => ({
    province,
    districts: districts.filter((d) => d.provinceId === province.id),
  }))

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Multi-Level Governance</h2>
        <p className="text-muted-foreground">
          School, district, and provincial views across all 9 South African provinces
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {provinces.length} Provinces • {districts.length} Districts • {districts.length * 5} Schools
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              School Sample
            </CardTitle>
            <CardDescription>{school.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <StatsGrid
              totalStudents={school.stats.totalStudents}
              atRisk={school.stats.atRiskStudents}
              avgAttendance={school.stats.averageAttendance}
              // avgGpa={school.stats.averageAPS}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Provinces & Districts
            </CardTitle>
            <CardDescription>All {provinces.length} provinces with their districts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {districtsByProvince.map(({ province, districts }) => (
                <div key={province.id} className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div>
                      <p className="font-semibold text-lg">{province.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {province.districts} Districts • {province.districts * 5} Schools
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{province.stats.totalStudents.toLocaleString()} Students</p>
                      <p className="text-xs text-muted-foreground">
                        At Risk: {province.stats.atRiskStudents.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 ml-4">
                    {districts.map((d) => (
                      <div key={d.id} className="p-2 rounded border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{d.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.schools} Schools • {d.stats.totalStudents.toLocaleString()} Students
                            </p>
                          </div>
                          <div className="text-right text-xs space-y-1">
                            <p className="text-muted-foreground">
                              Attendance: {d.stats.averageAttendance.toFixed(1)}%
                            </p>
                            <p className="text-red-600">At Risk: {d.stats.atRiskStudents}</p>
                          </div>
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

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Provinces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{provinces.length}</p>
            <p className="text-xs text-muted-foreground mt-1">All South African Provinces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Districts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{districts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Education Districts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(districts.length * 5).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">5 Schools per District</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {provinces.reduce((sum, p) => sum + p.stats.totalStudents, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across All Schools</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatsGrid({
  totalStudents,
  atRisk,
  avgAttendance,
  // avgGpa,
}: {
  totalStudents: number
  atRisk: number
  avgAttendance: number
  // avgGpa: number
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Students</p>
        <p className="text-2xl font-semibold">{totalStudents}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">At Risk</p>
        <p className="text-2xl font-semibold">{atRisk}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Attendance</p>
        <p className="text-2xl font-semibold">{avgAttendance.toFixed(1)}%</p>
      </div>
      {/* <div>
        <p className="text-sm text-muted-foreground">Average APS</p>
        <p className="text-2xl font-semibold">{avgGpa.toFixed(2)}</p>
      </div> */}
    </div>
  )
}

function KPITile({
  label,
  value,
  target,
  status,
  icon,
}: {
  label: string
  value: string
  target: string
  status: "success" | "warning" | "error"
  icon: React.ReactNode
}) {
  const statusColors = {
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  }

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={statusColors[status]}>{icon}</div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">Target: {target}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${statusColors[status]}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function SchoolRankingTable({
  schools,
  onViewReport,
}: {
  schools: SchoolPerformance[]
  onViewReport: (schoolId: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.schoolId}>
              <TableCell className="font-medium">#{school.phaseRank}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{school.schoolName}</div>
                  <div className="text-xs text-muted-foreground">{school.districtName}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{school.performanceScore.toFixed(1)}</span>
                  <ImprovementIndicator value={school.improvementIndex} />
                </div>
              </TableCell>
              <TableCell>
                <PerformanceCategoryBadge category={school.category} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewReport(school.schoolId)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ImprovementIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <div className="flex items-center text-green-600">
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs">+{value.toFixed(1)}</span>
      </div>
    )
  } else if (value < 0) {
    return (
      <div className="flex items-center text-red-600">
        <TrendingDown className="h-3 w-3" />
        <span className="text-xs">{value.toFixed(1)}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center text-muted-foreground">
      <Minus className="h-3 w-3" />
      <span className="text-xs">0.0</span>
    </div>
  )
}

function PerformanceCategoryBadge({ category }: { category: PerformanceCategory }) {
  const variants: Record<PerformanceCategory, "default" | "secondary" | "destructive" | "outline"> = {
    excellent: "default",
    stable: "secondary",
    declining: "outline",
    "high-risk": "destructive",
  }

  const labels: Record<PerformanceCategory, string> = {
    excellent: "Excellent",
    stable: "Stable",
    declining: "Declining",
    "high-risk": "High-Risk",
  }

  return <Badge variant={variants[category]}>{labels[category]}</Badge>
}

function TrendIcon({ trend }: { trend: PerformanceTrend }) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-3 w-3 text-green-600" />
    case "declining":
      return <TrendingDown className="h-3 w-3 text-red-600" />
    case "stable":
      return <Minus className="h-3 w-3 text-yellow-600" />
  }
}

function FlagIndicator({ flag }: { flag: PerformanceFlag }) {
  const colors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  }

  return (
    <div className={`w-2 h-2 rounded-full ${colors[flag]}`} title={flag} />
  )
}

function SchoolPerformanceReportDialog({
  report,
  open,
  onOpenChange,
}: {
  report: SchoolPerformanceReport
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const school = report.school
  const melMetrics = getMELMetrics(school.schoolId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>School Performance Report: {school.schoolName}</DialogTitle>
          <DialogDescription>
            Comprehensive performance analysis for {school.districtName}, {school.provinceName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grades">Faculty Breakdown</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="mel">MEL Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Overall Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Performance Score</p>
                    <p className="text-2xl font-bold">{school.performanceScore.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Improvement Index</p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      {school.improvementIndex > 0 ? "+" : ""}{school.improvementIndex.toFixed(1)}
                      <ImprovementIndicator value={school.improvementIndex} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{report.overallSummary.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <PerformanceCategoryBadge category={school.category} />
                  </div>
                </div>

                {/* Performance Criteria */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Criteria</h3>
                  <div className="space-y-3">
                    <CriteriaRow
                      label="Attendance"
                      value={school.criteria.attendance}
                      trend={school.trends.attendance}
                      flag={school.flags.attendance}
                    />
                    <CriteriaRow
                      label="SBA Performance"
                      value={school.criteria.sba}
                      trend={school.trends.sba}
                      flag={school.flags.sba}
                    />
                    <CriteriaRow
                      label="Promotion/Pass Rate"
                      value={school.criteria.promotionRate}
                      trend={school.trends.promotionRate}
                      flag={school.flags.promotionRate}
                    />
                    <CriteriaRow
                      label="Curriculum Coverage"
                      value={school.criteria.curriculumCoverage}
                      trend={school.trends.curriculumCoverage}
                      flag={school.flags.curriculumCoverage}
                    />
                    <CriteriaRow
                      label="Risk Score"
                      value={school.criteria.riskScore}
                      trend={school.trends.riskScore}
                      flag={school.flags.riskScore}
                      reverse
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Faculty Breakdown Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Faculty Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {report.overallSummary.gradeBreakdown.map((grade) => (
                    <div key={grade.grade} className="text-center p-3 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Faculty {grade.grade}</p>
                      <p className="text-xl font-bold">{grade.studentCount}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predictive Risk */}
            <Card>
              <CardHeader>
                <CardTitle>Predictive Risk Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Students at Risk</p>
                  <p className="text-xl font-bold">{school.predictiveRisk.learnersAtRisk}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects at Risk</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {school.predictiveRisk.subjectsAtRisk.length > 0 ? (
                      school.predictiveRisk.subjectsAtRisk.map((subject) => (
                        <Badge key={subject} variant="destructive">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="default">None</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected Promotion Impact (if no intervention)</p>
                  <p className="text-xl font-bold">{school.predictiveRisk.projectedPromotionImpact.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            {school.gradeSpecificData.map((gradeData) => (
              <Card key={gradeData.grade}>
                <CardHeader>
                  <CardTitle>Faculty {gradeData.grade} Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Promotion Rate</p>
                      <Progress value={gradeData.promotionRate} className="h-2" />
                      <p className="text-sm mt-1">{gradeData.promotionRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Curriculum Coverage</p>
                      <Progress value={gradeData.curriculumCoverage} className="h-2" />
                      <p className="text-sm mt-1">{gradeData.curriculumCoverage.toFixed(1)}%</p>
                    </div>
                  </div>

                  {gradeData.topSubjects.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Top Performing Subjects</h4>
                      <div className="space-y-2">
                        {gradeData.topSubjects.map((subject) => (
                          <div key={subject.subject} className="flex items-center justify-between p-2 rounded border">
                            <span>{subject.subject}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{subject.avgScore}%</span>
                              <TrendIcon trend={subject.trend} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {gradeData.highRiskSubjects.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">High-Risk Subjects</h4>
                      <div className="space-y-2">
                        {gradeData.highRiskSubjects.map((subject) => (
                          <div key={subject.subject} className="flex items-center justify-between p-2 rounded border border-red-200 bg-red-50">
                            <span>{subject.subject}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{subject.avgScore}%</span>
                              <span className="text-xs text-muted-foreground">
                                {subject.atRiskCount} students at risk
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {/* Strengths */}
            {report.detailedAnalysis.strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {report.detailedAnalysis.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weaknesses */}
            {report.detailedAnalysis.weaknesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {report.detailedAnalysis.weaknesses.map((weakness, idx) => (
                      <li key={idx}>{weakness}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Root Causes */}
            {report.detailedAnalysis.rootCauses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Root Cause Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.detailedAnalysis.rootCauses.map((cause, idx) => (
                      <div key={idx} className="p-3 rounded-lg border">
                        <Badge variant="outline" className="mb-2">{cause.type}</Badge>
                        <p>{cause.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {report.detailedAnalysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>System-Generated Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.detailedAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary">{rec.weaknessType}</Badge>
                          <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                        </div>
                        <p className="font-medium mb-2">{rec.recommendation}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Role Player: {rec.rolePlayer}</p>
                          <p>Minimum Standard: {rec.minStandard}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Intervention Guidance */}
            {report.interventionGuidance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Intervention Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.interventionGuidance.map((guidance, idx) => (
                      <div key={idx} className="p-3 rounded-lg border">
                        <p className="font-medium mb-1">{guidance.intervention}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Role Player: {guidance.rolePlayer}</p>
                          <p>Timeline: {guidance.timeline}</p>
                          <p>Expected Outcome: {guidance.expectedOutcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Follow-Up Cycle */}
            <Card>
              <CardHeader>
                <CardTitle>Follow-Up Cycle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Monitoring</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {report.followUpCycle.monitoring.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Escalation</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {report.followUpCycle.escalation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Closure</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {report.followUpCycle.closure.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mel" className="space-y-4">
            {melMetrics && <MELMetricsDisplay metrics={melMetrics} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function CriteriaRow({
  label,
  value,
  trend,
  flag,
  reverse = false,
}: {
  label: string
  value: number
  trend: PerformanceTrend
  flag: PerformanceFlag
  reverse?: boolean
}) {
  const displayValue = reverse ? value : value
  const maxValue = reverse ? 100 : 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlagIndicator flag={flag} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{displayValue.toFixed(1)}%</span>
          <TrendIcon trend={trend} />
        </div>
      </div>
      <Progress value={reverse ? 100 - value : value} className="h-2" />
    </div>
  )
}

function MELMetricsDisplay({ metrics }: { metrics: MELMetrics }) {
  return (
    <div className="space-y-4">
      {/* Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring KPIs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MetricTile
              label="Alert-to-Intervention Latency"
              value={`${metrics.monitoring.alertToInterventionLatency.toFixed(1)} days`}
              target="≤ 3 days"
            />
            <MetricTile
              label="Intervention Closure Time"
              value={`${metrics.monitoring.interventionClosureTime.toFixed(1)} days`}
            />
            <MetricTile
              label="Workflow Fidelity"
              value={`${metrics.monitoring.workflowFidelity.toFixed(1)}%`}
              target="≥ 80%"
            />
            <MetricTile
              label="Role Player Responsiveness"
              value={`${metrics.monitoring.rolePlayerResponsiveness.toFixed(1)}%`}
              target="≥ 85%"
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">Coverage Metrics</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <p className="text-sm">
                At-Risk with Active Plans: {metrics.monitoring.coverageMetrics.atRiskWithActivePlan.toFixed(1)}%
              </p>
              <p className="text-sm">
                Classes with Curriculum Coverage:{" "}
                {metrics.monitoring.coverageMetrics.classesWithCurriculumCoverage.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics KPIs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MetricTile
              label="Predictive Precision"
              value={`${(metrics.analytics.predictivePrecision * 100).toFixed(1)}%`}
            />
            <MetricTile
              label="Predictive Recall"
              value={`${(metrics.analytics.predictiveRecall * 100).toFixed(1)}%`}
            />
            <MetricTile
              label="Intervention Uplift"
              value={`${metrics.analytics.interventionUplift.toFixed(1)} pp`}
            />
          </div>
          <div>
            <h4 className="font-semibold mb-2">Counterfactual Forecast</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <p className="text-sm">
                With Intervention: {metrics.analytics.counterfactualForecast.withIntervention.toFixed(1)}%
              </p>
              <p className="text-sm">
                Without Intervention: {metrics.analytics.counterfactualForecast.withoutIntervention.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricTile
              label="Attendance Change"
              value={`${metrics.evaluation.outcomeKPIs.attendanceChange > 0 ? "+" : ""}${metrics.evaluation.outcomeKPIs.attendanceChange.toFixed(1)} pp`}
            />
            <MetricTile
              label="SBA Change"
              value={`${metrics.evaluation.outcomeKPIs.sbaChange > 0 ? "+" : ""}${metrics.evaluation.outcomeKPIs.sbaChange.toFixed(1)} pp`}
            />
            <MetricTile
              label="Promotion Rate Change"
              value={`${metrics.evaluation.outcomeKPIs.promotionRateChange > 0 ? "+" : ""}${metrics.evaluation.outcomeKPIs.promotionRateChange.toFixed(1)} pp`}
            />
            <MetricTile
              label="Dropout Rate Change"
              value={`${metrics.evaluation.outcomeKPIs.dropoutRateChange.toFixed(1)} pp`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricTile({ label, value, target }: { label: string; value: string; target?: string }) {
  return (
    <div className="p-3 rounded-lg border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {target && <p className="text-xs text-muted-foreground mt-1">Target: {target}</p>}
    </div>
  )
}