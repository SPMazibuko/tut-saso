"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/gradient-card"
import { FileText, Users, TrendingUp, CheckCircle, Star } from "lucide-react"

interface FacultyAnalytics {
  moduleCode: string
  moduleName: string
  qualification: string
  totalStudents: number
  validCancellations: number
  activeStudents: number
  failed: number
  passed: number
  qualifyMainStream: number
  qualifyReExam: number
  above70: number
  passRate: number
  successRate: number
  failRate: number
  totalRepeaters?: number
  failedMainExam?: number
  marksBetween50And59?: number
  marksBetween60And74?: number
  marksAbove74?: number
}

interface CampusBreakdown {
  campus: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
}

interface DepartmentBreakdown {
  department: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
  campuses?: CampusDepartmentBreakdown[]
}

interface CampusDepartmentBreakdown {
  campus: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
}

interface HistoricalAnalysis {
  moduleCode: string
  qualification: string
  moduleName: string
  yearlyPerformance: {
    [year: number]: {
      passRate: number
      successRate: number
    }
  }
}

export default function ModuleDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const moduleCode = (params?.moduleCode as string) || ''
  const [moduleData, setModuleData] = useState<FacultyAnalytics | null>(null)
  const [campusBreakdown, setCampusBreakdown] = useState<CampusBreakdown[]>([])
  const [departmentBreakdown, setDepartmentBreakdown] = useState<DepartmentBreakdown[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingCampus, setLoadingCampus] = useState(false)
  const [loadingDepartment, setLoadingDepartment] = useState(false)
  const [loadingHistorical, setLoadingHistorical] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState("2025")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!moduleCode || moduleCode.trim() === '') {
      setError('Invalid module code')
      setLoading(false)
      return
    }
    
    const fetchModuleData = async () => {
      try {
        setLoading(true)
        setError(null)
        const trimmedModuleCode = moduleCode.trim()
        const url = `/api/faculty-analysis?year=${yearFilter}&moduleCode=${encodeURIComponent(trimmedModuleCode)}`
        console.log('=== FETCHING MODULE DATA ===')
        console.log('Module Code from URL:', moduleCode)
        console.log('Trimmed Module Code:', trimmedModuleCode)
        console.log('Year:', yearFilter)
        console.log('Full URL:', url)
        
        const response = await fetch(url)
        const result = await response.json()
        
        console.log('=== API RESPONSE ===')
        console.log('Success:', result.success)
        console.log('Data length:', result.data?.length)
        console.log('All module codes in response:', result.data?.map((d: FacultyAnalytics) => d.moduleCode))
        
        if (result.success && result.data && result.data.length > 0) {
          // Strictly filter to ensure we only have data for this specific module (case-insensitive, trimmed)
          const moduleSpecificData = result.data.filter((item: FacultyAnalytics) => {
            const itemCode = (item.moduleCode || '').trim().toUpperCase()
            const expectedCode = trimmedModuleCode.trim().toUpperCase()
            const matches = itemCode === expectedCode
            if (!matches) {
              console.warn(`Filtered out: "${item.moduleCode}" (expected: "${trimmedModuleCode}")`)
            }
            return matches
          })
          
          console.log('Filtered data length:', moduleSpecificData.length)
          console.log('Filtered module codes:', moduleSpecificData.map((d: FacultyAnalytics) => d.moduleCode))
          
          if (moduleSpecificData.length === 0) {
            console.error('No matching data found!')
            console.error('Expected module code:', trimmedModuleCode)
            console.error('Received module codes:', [...new Set(result.data.map((d: FacultyAnalytics) => d.moduleCode))])
            setError(`No data found for module ${trimmedModuleCode} in year ${yearFilter}`)
            setModuleData(null)
            return
          }
          
          // Verify all filtered items belong to the same module
          const uniqueModuleCodes = [...new Set(moduleSpecificData.map((d: FacultyAnalytics) => d.moduleCode.trim().toUpperCase()))]
          if (uniqueModuleCodes.length > 1) {
            console.error('ERROR: Multiple different module codes found after filtering!', uniqueModuleCodes)
            setError(`Data inconsistency: Found multiple modules (${uniqueModuleCodes.join(', ')})`)
            setModuleData(null)
            return
          }
          
          // Aggregate all records for this module (in case there are multiple class groups/campuses)
          const aggregated = moduleSpecificData.reduce((acc: FacultyAnalytics, item: FacultyAnalytics) => {
            return {
              moduleCode: item.moduleCode,
              moduleName: item.moduleName,
              qualification: item.qualification, // Use the first qualification
              totalStudents: acc.totalStudents + (item.totalStudents ?? 0),
              validCancellations: acc.validCancellations + (item.validCancellations ?? 0),
              activeStudents: acc.activeStudents + (item.activeStudents ?? 0),
              failed: acc.failed + (item.failedMainExam ?? item.failed ?? 0),
              passed: acc.passed + (item.passed ?? 0),
              qualifyMainStream: acc.qualifyMainStream + (item.qualifyMainStream ?? 0),
              qualifyReExam: acc.qualifyReExam + (item.qualifyReExam ?? 0),
              above70: acc.above70 + (item.above70 ?? 0),
              passRate: 0, // Will calculate below
              successRate: 0, // Will calculate below
              failRate: 0, // Will calculate below
              totalRepeaters: (acc.totalRepeaters || 0) + (item.totalRepeaters || 0),
              failedMainExam: (acc.failedMainExam || 0) + (item.failedMainExam || 0),
              marksBetween50And59: (acc.marksBetween50And59 || 0) + (item.marksBetween50And59 || 0),
              marksBetween60And74: (acc.marksBetween60And74 || 0) + (item.marksBetween60And74 || 0),
              marksAbove74: (acc.marksAbove74 || 0) + (item.marksAbove74 || 0),
            }
          }, {
            moduleCode: moduleSpecificData[0].moduleCode,
            moduleName: moduleSpecificData[0].moduleName,
            qualification: moduleSpecificData[0].qualification,
            totalStudents: 0,
            validCancellations: 0,
            activeStudents: 0,
            failed: 0,
            passed: 0,
            qualifyMainStream: 0,
            qualifyReExam: 0,
            above70: 0,
            passRate: 0,
            successRate: 0,
            failRate: 0,
            totalRepeaters: 0,
            failedMainExam: 0,
            marksBetween50And59: 0,
            marksBetween60And74: 0,
            marksAbove74: 0,
          })

          // Calculate aggregated rates
          aggregated.passRate = aggregated.totalStudents > 0 
            ? (aggregated.passed / aggregated.totalStudents) * 100 
            : 0
          aggregated.successRate = aggregated.totalStudents > 0 
            ? (aggregated.passed / aggregated.totalStudents) * 100 
            : 0
          aggregated.failRate = aggregated.totalStudents > 0
            ? (aggregated.failed / aggregated.totalStudents) * 100
            : 0

          // Round to 1 decimal
          aggregated.passRate = Math.round(aggregated.passRate * 10) / 10
          aggregated.successRate = Math.round(aggregated.successRate * 10) / 10
          aggregated.failRate = Math.round(aggregated.failRate * 10) / 10

          // Final validation: ensure aggregated module code matches expected
          const aggregatedCode = (aggregated.moduleCode || '').trim().toUpperCase()
          const expectedCode = trimmedModuleCode.trim().toUpperCase()
          if (aggregatedCode !== expectedCode) {
            console.error('ERROR: Aggregated module code does not match expected!')
            console.error('Expected:', expectedCode)
            console.error('Got:', aggregatedCode)
            setError(`Data mismatch: Expected module ${trimmedModuleCode} but got ${aggregated.moduleCode}`)
            setModuleData(null)
            return
          }

          console.log('Aggregated module data:', aggregated)
          setModuleData(aggregated)
        } else {
          console.log('No data found for module:', moduleCode)
          setError(`Module ${moduleCode} not found for year ${yearFilter}`)
          setModuleData(null)
        }
      } catch (err) {
        console.error('Error fetching module data:', err)
        setError('Failed to fetch module data')
        setModuleData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchModuleData()
  }, [moduleCode, yearFilter])

  // Fetch campus breakdown when tab is active
  useEffect(() => {
    if (activeTab === 'campus' && moduleCode) {
      const fetchCampusBreakdown = async () => {
        try {
          setLoadingCampus(true)
          const response = await fetch(`/api/faculty-analysis/campus-breakdown?year=${yearFilter}&moduleCode=${moduleCode}`)
          const result = await response.json()
          
          if (result.success) {
            setCampusBreakdown(result.data || [])
          } else {
            setCampusBreakdown([])
          }
        } catch (err) {
          console.error('Error fetching campus breakdown:', err)
          setCampusBreakdown([])
        } finally {
          setLoadingCampus(false)
        }
      }

      fetchCampusBreakdown()
    }
  }, [activeTab, moduleCode, yearFilter])

  // Fetch departmental breakdown when tab is active
  useEffect(() => {
    if (activeTab === 'departmental' && moduleCode) {
      const fetchDepartmentBreakdown = async () => {
        try {
          setLoadingDepartment(true)
          const response = await fetch(`/api/faculty-analysis/departmental?year=${yearFilter}&moduleCode=${moduleCode}&includeCampus=true`)
          const result = await response.json()
          
          if (result.success) {
            setDepartmentBreakdown(result.data || [])
          } else {
            setDepartmentBreakdown([])
          }
        } catch (err) {
          console.error('Error fetching departmental breakdown:', err)
          setDepartmentBreakdown([])
        } finally {
          setLoadingDepartment(false)
        }
      }

      fetchDepartmentBreakdown()
    }
  }, [activeTab, moduleCode, yearFilter])

  // Fetch historical analysis when tab is active
  useEffect(() => {
    if (activeTab === 'historical' && moduleCode) {
      const fetchHistoricalAnalysis = async () => {
        try {
          setLoadingHistorical(true)
          const response = await fetch(`/api/faculty-analysis/historical?moduleCode=${moduleCode}&years=2022,2023,2024`)
          const result = await response.json()
          
          if (result.success) {
            setHistoricalData(result.data)
          } else {
            setHistoricalData(null)
          }
        } catch (err) {
          console.error('Error fetching historical analysis:', err)
          setHistoricalData(null)
        } finally {
          setLoadingHistorical(false)
        }
      }

      fetchHistoricalAnalysis()
    }
  }, [activeTab, moduleCode])

  const getPassRateBadge = (passRate: number) => {
    if (passRate >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (passRate >= 70) return <Badge className="bg-primary/10 text-primary">Good</Badge>
    if (passRate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    return <Badge variant="destructive">At-Risk</Badge>
  }

  const getSuccessRateBadge = (successRate: number) => {
    if (successRate >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (successRate >= 70) return <Badge className="bg-primary/10 text-primary">Good</Badge>
    if (successRate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
    return <Badge variant="destructive">At-Risk</Badge>
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <Button
          variant="ghost"
          className="w-fit hover:bg-purple-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faculty Analysis
        </Button>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-2 text-slate-600">Loading module data...</p>
        </div>
      </div>
    )
  }

  if (error || !moduleData) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <Button
          variant="ghost"
          className="w-fit hover:bg-purple-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faculty Analysis
        </Button>
        <div className="text-center py-8 text-slate-500">
          <p className="font-medium text-red-600">Error loading module</p>
          <p className="text-sm mt-1">{error || 'Module not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          className="w-fit hover:bg-purple-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Faculty Analysis
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {moduleData.moduleCode}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-1 dark:text-slate-400">
            {moduleData.moduleName}
          </p>
          <p className="text-slate-500 text-sm mt-1">{moduleData.qualification}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Year:</label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px] bg-white border-slate-200">
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <GradientCard gradient="blue" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Total Students</div>
              <div className="text-3xl font-bold text-white">{moduleData.totalStudents.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{moduleData.activeStudents} active in {moduleData.moduleCode}</span>
          </div>
        </GradientCard>

        <GradientCard gradient="emerald" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Pass Rate</div>
              <div className="text-3xl font-bold text-white">{moduleData.passRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{moduleData.passed} passed, {moduleData.failedMainExam ?? moduleData.failed ?? 0} failed in {moduleData.moduleCode}</span>
          </div>
        </GradientCard>

        <GradientCard gradient="cyan" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Success Rate</div>
              <div className="text-3xl font-bold text-white">{moduleData.successRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{moduleData.qualifyMainStream} qualify for main stream in {moduleData.moduleCode}</span>
          </div>
        </GradientCard>

        <GradientCard gradient="red" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Failed Main Exam</div>
              <div className="text-3xl font-bold text-white">{moduleData.failedMainExam ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {moduleData.totalStudents > 0
                ? ((moduleData.failedMainExam ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="indigo" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Total Repeaters</div>
              <div className="text-3xl font-bold text-white">{moduleData.totalRepeaters ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {moduleData.totalStudents > 0
                ? ((moduleData.totalRepeaters ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="coral" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">50% - 59%</div>
              <div className="text-3xl font-bold text-white">{moduleData.marksBetween50And59 ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {moduleData.totalStudents > 0
                ? ((moduleData.marksBetween50And59 ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="amber" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">60% - 74%</div>
              <div className="text-3xl font-bold text-white">{moduleData.marksBetween60And74 ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {moduleData.totalStudents > 0
                ? ((moduleData.marksBetween60And74 ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="rose" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">&gt;74%</div>
              <div className="text-3xl font-bold text-white">{moduleData.marksAbove74 ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {moduleData.totalStudents > 0
                ? ((moduleData.marksAbove74 ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campus">Campus Breakdown</TabsTrigger>
          <TabsTrigger value="departmental">Departmental Analysis</TabsTrigger>
          <TabsTrigger value="historical">Historical Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Detailed Statistics Table */}
          <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Module Performance Details</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Comprehensive performance metrics for {moduleData.moduleCode} - {moduleData.moduleName} ({yearFilter})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                  <TableHead className="font-semibold text-slate-900 dark:text-white">Metric</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Value</TableHead>
                  <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Total Students (Module)</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.totalStudents}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">100%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Valid Cancellations</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">{moduleData.validCancellations}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.validCancellations / moduleData.totalStudents) * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Active Students</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.activeStudents}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.activeStudents / moduleData.totalStudents) * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-emerald-600">Passed</TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">{moduleData.passed}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{moduleData.passRate.toFixed(1)}%</span>
                      {getPassRateBadge(moduleData.passRate)}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-red-600">Failed</TableCell>
                  <TableCell className="text-right font-medium text-red-600">{moduleData.failedMainExam ?? moduleData.failed ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">{(moduleData.failRate ?? 0).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Qualify Main Exam</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.qualifyMainStream}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{moduleData.successRate.toFixed(1)}%</span>
                      {getSuccessRateBadge(moduleData.successRate)}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Qualify Re-exam</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">{moduleData.qualifyReExam ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.activeStudents > 0
                      ? (((moduleData.qualifyReExam ?? 0) / moduleData.activeStudents) * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Marks 50% - 59%</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.marksBetween50And59 ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.marksBetween50And59 ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Marks 60% - 74%</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.marksBetween60And74 ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.marksBetween60And74 ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Marks &gt;74%</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.marksAbove74 ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.marksAbove74 ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-red-600">Failed Main Exam</TableCell>
                  <TableCell className="text-right font-medium text-red-600">{moduleData.failedMainExam ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.failedMainExam ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-slate-900 dark:text-white">Total Repeaters</TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-white">{moduleData.totalRepeaters ?? 0}</TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {moduleData.totalStudents > 0
                      ? ((moduleData.totalRepeaters ?? 0) / moduleData.totalStudents * 100).toFixed(1)
                      : 0}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="campus" className="space-y-6 mt-6">
          <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Campus Performance Breakdown</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Performance metrics by campus for {moduleData.moduleCode} - {yearFilter}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingCampus ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="mt-2 text-slate-600">Loading campus breakdown...</p>
                </div>
              ) : campusBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No campus breakdown data available</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                        <TableHead className="font-semibold text-slate-900 dark:text-white min-w-[250px]">Campus Name</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Pass Rate</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campusBreakdown.map((campus, index) => {
                        const isOverall = /module overall|including all campuses/i.test(campus.campus)
                        return (
                          <TableRow
                            key={index}
                            className={isOverall 
                              ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-b-2 border-blue-200 dark:border-blue-800' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }
                          >
                            <TableCell className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                              {campus.campus}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                  {campus.passRate.toFixed(1)}%
                                </span>
                                {!isOverall && getPassRateBadge(campus.passRate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                  {campus.successRate.toFixed(1)}%
                                </span>
                                {!isOverall && getSuccessRateBadge(campus.successRate)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departmental" className="space-y-6 mt-6">
          <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Departmental Performance Analysis</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Performance metrics by department for {moduleData.moduleCode} - {yearFilter}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingDepartment ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="mt-2 text-slate-600">Loading departmental breakdown...</p>
                </div>
              ) : departmentBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No departmental breakdown data available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Faculty Performance */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{yearFilter}</h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                            <TableHead className="font-semibold text-slate-900 dark:text-white min-w-[250px]">Department Name</TableHead>
                            <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Pass Rate</TableHead>
                            <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Success Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {departmentBreakdown.map((dept, index) => {
                            const isOverall = dept.department.includes('MODULE OVERALL') || dept.department.includes('FACULTY OVERALL')
                            return (
                              <TableRow
                                key={index}
                                className={isOverall 
                                  ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-b-2 border-blue-200 dark:border-blue-800' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }
                              >
                                <TableCell className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                  {dept.department}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                      {dept.passRate.toFixed(1)}%
                                    </span>
                                    {!isOverall && getPassRateBadge(dept.passRate)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                      {dept.successRate.toFixed(1)}%
                                    </span>
                                    {!isOverall && getSuccessRateBadge(dept.successRate)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Campus-Specific Departmental Breakdown */}
                  {departmentBreakdown.some(dept => dept.campuses && dept.campuses.length > 0) && (() => {
                    // Get all unique campuses from the data
                    const allCampuses = new Set<string>()
                    departmentBreakdown.forEach(dept => {
                      if (dept.campuses) {
                        dept.campuses.forEach(campus => allCampuses.add(campus.campus))
                      }
                    })
                    const uniqueCampuses = Array.from(allCampuses).sort()

                    return (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Campus-Specific Performance by Department</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {uniqueCampuses.map((campusName) => {
                          const campusDepartments = departmentBreakdown
                            .filter(dept => 
                              dept.campuses && 
                              dept.campuses.some(c => c.campus === campusName) &&
                              !dept.department.includes('MODULE OVERALL') &&
                              !dept.department.includes('FACULTY OVERALL')
                            )
                            .map(dept => ({
                              department: dept.department,
                              campusData: dept.campuses!.find(c => c.campus === campusName)!
                            }))

                          if (campusDepartments.length === 0) return null

                          // Calculate campus overall
                          const campusOverall = campusDepartments.reduce(
                            (acc, item) => ({
                              totalStudents: acc.totalStudents + item.campusData.totalStudents,
                              activeStudents: acc.activeStudents + item.campusData.activeStudents,
                              passed: acc.passed + item.campusData.passed,
                              failed: acc.failed + item.campusData.failed,
                            }),
                            { totalStudents: 0, activeStudents: 0, passed: 0, failed: 0 }
                          )

                          const campusOverallPassRate = campusOverall.totalStudents > 0 
                            ? (campusOverall.passed / campusOverall.totalStudents) * 100 
                            : 0
                          const campusOverallSuccessRate = campusOverall.totalStudents > 0 
                            ? (campusOverall.passed / campusOverall.totalStudents) * 100 
                            : 0

                          // Assign colors based on campus name
                          const getCampusColor = (campus: string) => {
                            const upperCampus = campus.toUpperCase()
                            if (upperCampus.includes('CAPETOWN')) {
                              return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                            }
                            if (upperCampus.includes('STELLENBOSCH')) {
                              return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            }
                            if (upperCampus.includes('DURBAN')) {
                              return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            }
                            return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                          }
                          const headerColor = getCampusColor(campusName)

                          return (
                            <div key={campusName} className="rounded-xl border border-slate-200 overflow-hidden">
                              <div className={`${headerColor} px-4 py-3 border-b`}>
                                <h4 className="font-semibold text-slate-900 dark:text-white">{campusName}</h4>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <TableHead className="font-semibold text-slate-900 dark:text-white text-xs">Department Name</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900 dark:text-white text-xs">Pass Rate</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-900 dark:text-white text-xs">Success Rate</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {campusDepartments.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                      <TableCell className="font-medium text-slate-900 dark:text-white text-sm">
                                        {item.department}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        <div className="flex items-center justify-end gap-1">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            {item.campusData.passRate.toFixed(1)}%
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        <div className="flex items-center justify-end gap-1">
                                          <span className="font-medium text-slate-900 dark:text-white">
                                            {item.campusData.successRate.toFixed(1)}%
                                          </span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow className={`${headerColor} border-t-2`}>
                                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                                      CAMPUS OVERALL
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-slate-900 dark:text-white">
                                      {campusOverallPassRate.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-slate-900 dark:text-white">
                                      {campusOverallSuccessRate.toFixed(1)}%
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-6 mt-6">
          <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Historical Performance Analysis</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Multi-year performance trends for {moduleData?.moduleCode || moduleCode}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingHistorical ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="mt-2 text-slate-600">Loading historical data...</p>
                </div>
              ) : !historicalData ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No historical data available</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      {/* Main header row */}
                      <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                        <TableHead rowSpan={2} className="font-semibold text-slate-900 dark:text-white min-w-[120px] border-r border-slate-200">
                          Module Code
                        </TableHead>
                        <TableHead rowSpan={2} className="font-semibold text-slate-900 dark:text-white min-w-[200px] border-r border-slate-200">
                          Qualification
                        </TableHead>
                        <TableHead rowSpan={2} className="font-semibold text-slate-900 dark:text-white min-w-[250px] border-r border-slate-200">
                          Module Name
                        </TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold text-slate-900 dark:text-white border-r border-slate-200">
                          Success Rate
                        </TableHead>
                        <TableHead colSpan={2} className="text-center font-semibold text-slate-900 dark:text-white">
                          2024
                        </TableHead>
                      </TableRow>
                      {/* Sub-header row */}
                      <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                        <TableHead className="text-center font-semibold text-slate-900 dark:text-white border-r border-slate-200">
                          2022
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-900 dark:text-white border-r border-slate-200">
                          2023
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-900 dark:text-white border-r border-slate-200">
                          2024
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-900 dark:text-white border-r border-slate-200">
                          PASS RATE
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-900 dark:text-white">
                          SUCCESS RATE
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="font-medium text-slate-900 dark:text-white border-r border-slate-200">
                          {historicalData.moduleCode}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.qualification}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.moduleName}
                        </TableCell>
                        <TableCell className="text-center text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.yearlyPerformance[2022]?.successRate > 0 
                            ? `${historicalData.yearlyPerformance[2022].successRate.toFixed(0)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.yearlyPerformance[2023]?.successRate > 0 
                            ? `${historicalData.yearlyPerformance[2023].successRate.toFixed(0)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.yearlyPerformance[2024]?.successRate > 0 
                            ? `${historicalData.yearlyPerformance[2024].successRate.toFixed(0)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-900 dark:text-white border-r border-slate-200">
                          {historicalData.yearlyPerformance[2024]?.passRate > 0 
                            ? `${historicalData.yearlyPerformance[2024].passRate.toFixed(0)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-900 dark:text-white">
                          {historicalData.yearlyPerformance[2024]?.successRate > 0 
                            ? `${historicalData.yearlyPerformance[2024].successRate.toFixed(0)}%` 
                            : '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
