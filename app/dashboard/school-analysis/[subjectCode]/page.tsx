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

interface SchoolAnalytics {
  subjectCode: string
  subjectName: string
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

interface SchoolBreakdown {
  school: string
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
  schools?: SchoolDepartmentBreakdown[]
}

interface SchoolDepartmentBreakdown {
  school: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
}

interface HistoricalAnalysis {
  subjectCode: string
  qualification: string
  subjectName: string
  yearlyPerformance: {
    [year: number]: {
      passRate: number
      successRate: number
    }
  }
}

export default function SubjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const subjectCode = (params?.subjectCode as string) || ''
  const [subjectData, setSubjectData] = useState<SchoolAnalytics | null>(null)
  const [schoolBreakdown, setSchoolBreakdown] = useState<SchoolBreakdown[]>([])
  const [departmentBreakdown, setDepartmentBreakdown] = useState<DepartmentBreakdown[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSchool, setLoadingSchool] = useState(false)
  const [loadingDepartment, setLoadingDepartment] = useState(false)
  const [loadingHistorical, setLoadingHistorical] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState("2025")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!subjectCode || subjectCode.trim() === '') {
      setError('Invalid subject code')
      setLoading(false)
      return
    }
    
    const fetchSubjectData = async () => {
      try {
        setLoading(true)
        setError(null)
        const trimmedSubjectCode = subjectCode.trim()
        const url = `/api/school-analysis?year=${yearFilter}&subjectCode=${encodeURIComponent(trimmedSubjectCode)}`
        console.log('=== FETCHING SUBJECT DATA ===')
        console.log('Subject Code from URL:', subjectCode)
        console.log('Trimmed Subject Code:', trimmedSubjectCode)
        console.log('Year:', yearFilter)
        console.log('Full URL:', url)
        
        const response = await fetch(url)
        const result = await response.json()
        
        console.log('=== API RESPONSE ===')
        console.log('Success:', result.success)
        console.log('Data length:', result.data?.length)
        console.log('All subject codes in response:', result.data?.map((d: SchoolAnalytics) => d.subjectCode))
        
        if (result.success && result.data && result.data.length > 0) {
          const subjectSpecificData = result.data.filter((item: SchoolAnalytics) => {
            const itemCode = (item.subjectCode || '').trim().toUpperCase()
            const expectedCode = trimmedSubjectCode.trim().toUpperCase()
            const matches = itemCode === expectedCode
            if (!matches) {
              console.warn(`Filtered out: "${item.subjectCode}" (expected: "${trimmedSubjectCode}")`)
            }
            return matches
          })
          
          console.log('Filtered data length:', subjectSpecificData.length)
          console.log('Filtered subject codes:', subjectSpecificData.map((d: SchoolAnalytics) => d.subjectCode))
          
          if (subjectSpecificData.length === 0) {
            console.error('No matching data found!')
            console.error('Expected subject code:', trimmedSubjectCode)
            console.error('Received subject codes:', [...new Set(result.data.map((d: SchoolAnalytics) => d.subjectCode))])
            setError(`No data found for subject ${trimmedSubjectCode} in year ${yearFilter}`)
            setSubjectData(null)
            return
          }
          
          const uniqueSubjectCodes = [...new Set(subjectSpecificData.map((d: SchoolAnalytics) => d.subjectCode.trim().toUpperCase()))]
          if (uniqueSubjectCodes.length > 1) {
            console.error('ERROR: Multiple different subject codes found after filtering!', uniqueSubjectCodes)
            setError(`Data inconsistency: Found multiple subjects (${uniqueSubjectCodes.join(', ')})`)
            setSubjectData(null)
            return
          }
          
          const aggregated = subjectSpecificData.reduce((acc: SchoolAnalytics, item: SchoolAnalytics) => {
            return {
              subjectCode: item.subjectCode,
              subjectName: item.subjectName,
              qualification: item.qualification,
              totalStudents: acc.totalStudents + (item.totalStudents || 0),
              validCancellations: acc.validCancellations + (item.validCancellations || 0),
              activeStudents: acc.activeStudents + (item.activeStudents || 0),
              failed: (acc.failed || 0) + (item.failed || item.failedMainExam || 0),
              passed: acc.passed + (item.passed || 0),
              qualifyMainStream: acc.qualifyMainStream + (item.qualifyMainStream || 0),
              qualifyReExam: acc.qualifyReExam + (item.qualifyReExam || 0),
              above70: acc.above70 + (item.above70 || 0),
              passRate: 0,
              successRate: 0,
              failRate: 0,
              totalRepeaters: (acc.totalRepeaters || 0) + (item.totalRepeaters || 0),
              failedMainExam: (acc.failedMainExam || 0) + (item.failedMainExam || 0),
              marksBetween50And59: (acc.marksBetween50And59 || 0) + (item.marksBetween50And59 || 0),
              marksBetween60And74: (acc.marksBetween60And74 || 0) + (item.marksBetween60And74 || 0),
              marksAbove74: (acc.marksAbove74 || 0) + (item.marksAbove74 || 0),
            }
          }, {
            subjectCode: subjectSpecificData[0].subjectCode,
            subjectName: subjectSpecificData[0].subjectName,
            qualification: subjectSpecificData[0].qualification,
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

          aggregated.passRate = aggregated.totalStudents > 0 
            ? (aggregated.passed / aggregated.totalStudents) * 100 
            : 0
          aggregated.successRate = aggregated.totalStudents > 0 
            ? (aggregated.passed / aggregated.totalStudents) * 100 
            : 0
          aggregated.failRate = aggregated.activeStudents > 0 
            ? (aggregated.failed / aggregated.activeStudents) * 100 
            : 0

          aggregated.passRate = Math.round(aggregated.passRate * 10) / 10
          aggregated.successRate = Math.round(aggregated.successRate * 10) / 10
          aggregated.failRate = Math.round(aggregated.failRate * 10) / 10

          const aggregatedCode = (aggregated.subjectCode || '').trim().toUpperCase()
          const expectedCode = trimmedSubjectCode.trim().toUpperCase()
          if (aggregatedCode !== expectedCode) {
            console.error('ERROR: Aggregated subject code does not match expected!')
            console.error('Expected:', expectedCode)
            console.error('Got:', aggregatedCode)
            setError(`Data mismatch: Expected subject ${trimmedSubjectCode} but got ${aggregated.subjectCode}`)
            setSubjectData(null)
            return
          }

          console.log('Aggregated subject data:', aggregated)
          setSubjectData(aggregated)
        } else {
          console.log('No data found for subject:', subjectCode)
          setError(`Subject ${subjectCode} not found for year ${yearFilter}`)
          setSubjectData(null)
        }
      } catch (err) {
        console.error('Error fetching subject data:', err)
        setError('Failed to fetch subject data')
        setSubjectData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSubjectData()
  }, [subjectCode, yearFilter])

  useEffect(() => {
    if (activeTab === 'school' && subjectCode) {
      const fetchSchoolBreakdown = async () => {
        try {
          setLoadingSchool(true)
          const response = await fetch(`/api/school-analysis/school-breakdown?year=${yearFilter}&subjectCode=${subjectCode}`)
          const result = await response.json()
          
          if (result.success) {
            setSchoolBreakdown(result.data || [])
          } else {
            setSchoolBreakdown([])
          }
        } catch (err) {
          console.error('Error fetching school breakdown:', err)
          setSchoolBreakdown([])
        } finally {
          setLoadingSchool(false)
        }
      }

      fetchSchoolBreakdown()
    }
  }, [activeTab, subjectCode, yearFilter])

  useEffect(() => {
    if (activeTab === 'departmental' && subjectCode) {
      const fetchDepartmentBreakdown = async () => {
        try {
          setLoadingDepartment(true)
          const response = await fetch(`/api/school-analysis/departmental?year=${yearFilter}&subjectCode=${subjectCode}&includeSchool=true`)
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
  }, [activeTab, subjectCode, yearFilter])

  useEffect(() => {
    if (activeTab === 'historical' && subjectCode) {
      const fetchHistoricalAnalysis = async () => {
        try {
          setLoadingHistorical(true)
          const response = await fetch(`/api/school-analysis/historical?subjectCode=${subjectCode}&years=2022,2023,2024`)
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
  }, [activeTab, subjectCode])

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
          Back to School Analysis
        </Button>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-2 text-slate-600">Loading module data...</p>
        </div>
      </div>
    )
  }

  if (error || !subjectData) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <Button
          variant="ghost"
          className="w-fit hover:bg-purple-50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to School Analysis
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
          Back to School Analysis
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {subjectData.subjectCode}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-1 dark:text-slate-400">
            {subjectData.subjectName}
          </p>
          <p className="text-slate-500 text-sm mt-1">{subjectData.qualification}</p>
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
              <div className="text-3xl font-bold text-white">{subjectData.totalStudents.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{subjectData.activeStudents} active in {subjectData.subjectCode}</span>
          </div>
        </GradientCard>

        <GradientCard gradient="emerald" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 " />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium  uppercase tracking-wide">Pass Rate</div>
              <div className="text-3xl font-bold ">{subjectData.passRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{subjectData.passed} passed, {subjectData.failed} failed in {subjectData.subjectCode}</span>
          </div>
        </GradientCard>

        <GradientCard gradient="cyan" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Success Rate</div>
              <div className="text-3xl font-bold text-white">{subjectData.successRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{subjectData.qualifyMainStream} qualify for main stream in {subjectData.subjectCode}</span>
          </div>
        </GradientCard>

        <GradientCard gradient="red" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Failed Main Exam</div>
              <div className="text-3xl font-bold text-white">{subjectData.failedMainExam ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {subjectData.totalStudents > 0
                ? ((subjectData.failedMainExam ?? 0) / subjectData.totalStudents * 100).toFixed(1)
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
              <div className="text-3xl font-bold text-white">{subjectData.totalRepeaters ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {subjectData.totalStudents > 0
                ? ((subjectData.totalRepeaters ?? 0) / subjectData.totalStudents * 100).toFixed(1)
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
              <div className="text-3xl font-bold text-white">{subjectData.marksBetween50And59 ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {subjectData.totalStudents > 0
                ? ((subjectData.marksBetween50And59 ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="amber" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="h-6 w-6 " />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium  uppercase tracking-wide">60% - 74%</div>
              <div className="text-3xl font-bold ">{subjectData.marksBetween60And74 ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
                {subjectData.totalStudents > 0
                ? ((subjectData.marksBetween60And74 ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="rose" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="h-6 w-6 " />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium uppercase tracking-wide">&gt;74%</div>
              <div className="text-3xl font-bold">{subjectData.marksAbove74 ?? 0}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {subjectData.totalStudents > 0
                ? ((subjectData.marksAbove74 ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                : 0}% of module students
            </span>
          </div>
        </GradientCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="school">School Breakdown</TabsTrigger>
          <TabsTrigger value="departmental">Departmental Analysis</TabsTrigger>
          <TabsTrigger value="historical">Historical Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Subject Performance Details</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Comprehensive performance metrics for {subjectData.subjectCode} - {subjectData.subjectName} ({yearFilter})
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
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.totalStudents}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">100%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Valid Cancellations</TableCell>
                          <TableCell className="text-right text-slate-600 dark:text-slate-400">{subjectData.validCancellations}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.validCancellations / subjectData.totalStudents) * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Active Students</TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.activeStudents}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.activeStudents / subjectData.totalStudents) * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-emerald-600">Passed</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">{subjectData.passed}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">{(subjectData.passRate || 0).toFixed(1)}%</span>
                          {getPassRateBadge(subjectData.passRate)}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">Failed</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{subjectData.failed ?? subjectData.failedMainExam ?? 0}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">{(subjectData.failRate || 0).toFixed(1)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Qualify Main Exam</TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.qualifyMainStream}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">{(subjectData.successRate || 0).toFixed(1)}%</span>
                          {getSuccessRateBadge(subjectData.successRate)}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Qualify Re-exam</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">{subjectData.qualifyReExam}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.activeStudents > 0
                          ? ((subjectData.qualifyReExam / subjectData.activeStudents) * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Marks 50% - 59%</TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.marksBetween50And59 ?? 0}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.marksBetween50And59 ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Marks 60% - 74%</TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.marksBetween60And74 ?? 0}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.marksBetween60And74 ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Marks &gt;74%</TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.marksAbove74 ?? 0}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.marksAbove74 ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-red-600">Failed Main Exam</TableCell>
                      <TableCell className="text-right font-medium text-red-600">{subjectData.failedMainExam ?? 0}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.failedMainExam ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-slate-900 dark:text-white">Total Repeaters</TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">{subjectData.totalRepeaters ?? 0}</TableCell>
                      <TableCell className="text-right text-slate-600 dark:text-slate-400">
                        {subjectData.totalStudents > 0
                          ? ((subjectData.totalRepeaters ?? 0) / subjectData.totalStudents * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="space-y-6 mt-6">
          <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">School Performance Breakdown</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Performance metrics by school for {subjectData.subjectCode} - {yearFilter}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingSchool ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="mt-2 text-slate-600">Loading school breakdown...</p>
                </div>
              ) : schoolBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No school breakdown data available</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                        <TableHead className="font-semibold text-slate-900 dark:text-white min-w-[250px]">School Name</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Pass Rate</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900 dark:text-white">Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schoolBreakdown.map((schoolItem, index) => {
                        const isOverall = schoolItem.school.includes('OVERALL') || schoolItem.school.includes('ALL SCHOOLS')
                        return (
                          <TableRow
                            key={index}
                            className={isOverall 
                              ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-b-2 border-blue-200 dark:border-blue-800' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }
                          >
                            <TableCell className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                              {schoolItem.school}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                  {schoolItem.passRate.toFixed(1)}%
                                </span>
                                {!isOverall && getPassRateBadge(schoolItem.passRate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-medium ${isOverall ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>
                                  {schoolItem.successRate.toFixed(1)}%
                                </span>
                                {!isOverall && getSuccessRateBadge(schoolItem.successRate)}
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
                Performance metrics by department for {subjectData.subjectCode} - {yearFilter}
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
                            const isOverall = dept.department.includes('MODULE OVERALL') || dept.department.includes('SCHOOL OVERALL')
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
                Multi-year performance trends for {subjectData.subjectCode}
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
                          {historicalData.subjectCode}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.qualification}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 border-r border-slate-200">
                          {historicalData.subjectName}
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

