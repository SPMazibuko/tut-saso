"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GradientCard } from "@/components/ui/gradient-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  MoreHorizontal,
  Copy,
  FileText,
  Printer,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FacultyAnalytics {
  moduleCode: string
  moduleName: string
  qualification: string
  qualificationName: string
  qualificationCode?: string
  campus?: string
  offering_type_name?: string
  blockCode?: string
  totalStudents: number
  totalCancellations: number
  validCancellations: number
  invalidCancellations: number
  activeStudents: number
  inactiveStudents: number
  passed: number
  qualifyMainStream: number
  qualifyReExam?: number
  reExam: number
  absentMainExam: number
  above70: number
  passRate: number
  successRate: number
  finalSuccessRate: number
  failRate: number
  failedMainExam?: number
  marksBetween50And59?: number
  marksBetween60And74?: number
  marksAbove74?: number
  isHighRisk?: boolean
  successRateStatus?: 'worst' | 'high-risk' | 'moderate' | 'good' | 'excellent'
  groupedQualifications?: string[]
  groupedQualificationNames?: string[]
  groupedItems?: FacultyAnalytics[] // Store original items for breakdown
}

const ITEMS_PER_PAGE = 10

function toCount(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function formatRate(value: unknown): string {
  const n = Number(value)
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "0.0%"
}

function computeFinalSuccessRate(
  qualifyMainStream: unknown,
  qualifyReExam: unknown,
  totalStudents: unknown,
): number {
  const total = toCount(totalStudents)
  if (total <= 0) return 0
  return ((toCount(qualifyMainStream) + toCount(qualifyReExam)) / total) * 100
}

const QUALIFICATION_NAME_MAP: Record<string, string> = {
  DPRS20: "Dip (Computer Science)",
  DPRSF0: "Dip (Computer Science Extended)",
  DPIF20: "Dip (Informatics)",
  DPIFF0: "Dip (Informatics Extended)",
  DPIT20: "Dip (Information Technology)",
  DPITF0: "Dip (Information Technology Extended)",
  DPMC20: "Dip (Multimedia Computing)",
  DPMCF0: "Dip (Multimedia Computing Extended)",
  DPYEF0: "Dip (Computer Systems Engineering Extended)",
  DPYE20_NP6602: "Dip (Computer Systems Engineering)",
}

const normalizeQualificationCode = (code?: string | null) => (code ? code.replace(/\s+/g, "").toUpperCase() : "")

const QUALIFICATION_FILTER_OPTIONS = [
  { value: "all", label: "All Qualifications" },
  ...Object.entries(QUALIFICATION_NAME_MAP).map(([code, name]) => ({
    value: code,
    label: `${code} - ${name}`,
  })),
]

const ASSESSMENT_MARK_BANDS = [
  "0-19",
  "20-29",
  "30-39",
  "40-49",
  "50-59",
  "60-69",
  "70-79",
  "80-89",
  "90-100",
  "Missed Assessment",
] as const

const ASSESSMENT_ROWS = [
  "ClassTest1",
  "Semester Test 1",
  "Assignment2",
  "Assignment1",
  "Quiz1",
  "Quiz2",
] as const

const ACADEMIC_STATUSES = ["All Student", "Probation", "Readmitted"] as const

export default function FacultyAnalysisPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("2025")
  const [campusFilter, setCampusFilter] = useState("all")
  const [qualificationFilter, setQualificationFilter] = useState("all")
  const [streamFilter, setStreamFilter] = useState("all")
  const [successRateStatusFilter, setSuccessRateStatusFilter] = useState("all")
  const [facultyData, setFacultyData] = useState<FacultyAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<FacultyAnalytics | null>(null)
  const [showCancellationDialog, setShowCancellationDialog] = useState(false)
  const [showQualificationBreakdown, setShowQualificationBreakdown] = useState(false)
  const [breakdownModule, setBreakdownModule] = useState<FacultyAnalytics | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAssessmentModule, setSelectedAssessmentModule] = useState<string>("")

  // Helper function to get success rate status
  const getSuccessRateStatus = (successRate: number): 'worst' | 'high-risk' | 'moderate' | 'good' | 'excellent' => {
    if (successRate < 40) return 'worst'
    if (successRate >= 41 && successRate <= 59) return 'high-risk'
    if (successRate >= 60 && successRate <= 65) return 'moderate'
    if (successRate >= 66 && successRate <= 74) return 'good'
    return 'excellent'
  }

  // Fetch data from API
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/faculty-analysis?year=${yearFilter}&qualification=${qualificationFilter}&campus=${campusFilter}`)
        const result = await response.json()

        if (result.success) {
          // Add success rate status and enrich qualification details for each item
          // First calculate pass and success rates for each individual item BEFORE grouping
          const dataWithStatus = (result.data || []).map((item: FacultyAnalytics) => {
            const rawQualification = (item.qualification || "").trim()
            const normalizedCode = normalizeQualificationCode(rawQualification)
            const mappedQualificationName = normalizedCode ? QUALIFICATION_NAME_MAP[normalizedCode] : undefined
            const normalizedQualificationName =
              (item.qualificationName && item.qualificationName.trim()) || mappedQualificationName

            // Calculate pass rate and success rate for this individual item BEFORE grouping
            const studentsThatWrote = toCount(item.totalStudents) - toCount(item.absentMainExam)
            const passed = toCount(item.passed)
            const totalStudents = toCount(item.totalStudents)
            const passRate = studentsThatWrote > 0 ? (passed / studentsThatWrote) * 100 : 0
            const successRate = totalStudents > 0 ? (passed / totalStudents) * 100 : 0
            const failRate = totalStudents > 0 ? (toCount(item.failedMainExam) / totalStudents) * 100 : 0
            const finalSuccessRate = computeFinalSuccessRate(
              item.qualifyMainStream,
              item.qualifyReExam,
              totalStudents,
            )

            return {
              ...item,
              totalStudents,
              passed,
              passRate,
              successRate,
              finalSuccessRate,
              failRate,
              successRateStatus: getSuccessRateStatus(successRate),
              qualificationCode: normalizedCode || undefined,
              qualificationName: normalizedQualificationName,
            }
          })

          setFacultyData(dataWithStatus)
        } else {
          setError(result.error || 'Failed to fetch faculty data')
          setFacultyData([])
        }
      } catch (err) {
        console.error("Error fetching faculty data:", err)
        setError('Failed to fetch faculty data')
        setFacultyData([])
      } finally {
        setLoading(false)
      }
    }

    fetchFacultyData()
  }, [yearFilter, qualificationFilter, campusFilter])

  // Enhanced stream detection helper
  const isExtendedQualification = (item: FacultyAnalytics): boolean => {
    const qualificationNameLower = (item.qualificationName || "").toLowerCase()
    const qualificationCodeUpper = (item.qualificationCode || item.qualification || "").toUpperCase()
    
    return qualificationNameLower.includes("extended") || 
           qualificationCodeUpper.endsWith("F0") ||
           qualificationCodeUpper.includes("EXTENDED") ||
           qualificationNameLower.includes("extended programme")
  }

  // Helper function to extract campus from offering type
  const getCampusFromOfferingType = (offeringTypeName?: string): string => {
    if (!offeringTypeName) return ""
    
    const campus = offeringTypeName.split("-")[0]?.trim().toLowerCase() || ""
    
    if (campus.includes("soshanguve") && campus.includes("south")) return "soshanguve-south"
    if (campus.includes("soshanguve") && campus.includes("north")) return "soshanguve-north"
    if (campus.includes("soshanguve")) return "soshanguve-south"
    if (campus.includes("pretoria") && campus.includes("west")) return "pretoria-west"
    if (campus.includes("emalahleni")) return "emalahleni"
    if (campus.includes("polokwane")) return "polokwane"
    if (campus.includes("mbombela")) return "mbombela"
    if (campus.includes("arts")) return "arts"

    return campus.replace(/\s+/g, "-")
  }

  // Helper function to normalize offering type for grouping
  const normalizeOfferingType = (offeringType?: string): string => {
    return (offeringType || "").trim()
  }

  // Helper function to normalize block code for grouping
  const normalizeBlockCode = (blockCode?: string): string => {
    return (blockCode || "").trim().toUpperCase()
  }

  // Group data by module code, offering type, and block code
  const groupedData = useMemo(() => {
    const groupMap = new Map<string, FacultyAnalytics[]>()

    // Group items by moduleCode + offering_type_name + blockCode
    facultyData.forEach((item) => {
      const normalizedOfferingType = normalizeOfferingType(item.offering_type_name)
      const normalizedBlockCode = normalizeBlockCode(item.blockCode)
      const groupKey = `${item.moduleCode}|${normalizedOfferingType}|${normalizedBlockCode}`

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(item)
    })

    // Aggregate grouped items
    const aggregated: FacultyAnalytics[] = []
    
    groupMap.forEach((items) => {
      if (items.length === 0) return

      // Use first item as base for non-numeric fields
      const baseItem = items[0]

      // Collect all unique qualifications and qualification names from grouped items
      const uniqueQualificationCodes = new Set<string>()
      const uniqueQualificationNames = new Set<string>()
      
      items.forEach((item) => {
        const code = normalizeQualificationCode(item.qualificationCode || item.qualification)
        if (code) {
          uniqueQualificationCodes.add(code)
        }
        const name = item.qualificationName || item.qualification
        if (name) {
          uniqueQualificationNames.add(name)
        }
      })

      // Sum all numeric fields
      const aggregatedItem: FacultyAnalytics = {
        ...baseItem,
        totalStudents: items.reduce((sum, item) => sum + toCount(item.totalStudents), 0),
        totalCancellations: items.reduce((sum, item) => sum + toCount(item.totalCancellations), 0),
        validCancellations: items.reduce((sum, item) => sum + toCount(item.validCancellations), 0),
        invalidCancellations: items.reduce((sum, item) => sum + toCount(item.invalidCancellations), 0),
        activeStudents: items.reduce((sum, item) => sum + toCount(item.activeStudents), 0),
        inactiveStudents: items.reduce((sum, item) => sum + toCount(item.inactiveStudents), 0),
        passed: items.reduce((sum, item) => sum + toCount(item.passed), 0),
        qualifyMainStream: items.reduce((sum, item) => sum + toCount(item.qualifyMainStream), 0),
        qualifyReExam: items.reduce((sum, item) => sum + toCount(item.qualifyReExam), 0),
        reExam: items.reduce((sum, item) => sum + toCount(item.reExam), 0),
        absentMainExam: items.reduce((sum, item) => sum + toCount(item.absentMainExam), 0),
        above70: items.reduce((sum, item) => sum + toCount(item.above70), 0),
        failedMainExam: items.reduce((sum, item) => sum + toCount(item.failedMainExam), 0),
        marksBetween50And59: items.reduce((sum, item) => sum + toCount(item.marksBetween50And59), 0),
        marksBetween60And74: items.reduce((sum, item) => sum + toCount(item.marksBetween60And74), 0),
        marksAbove74: items.reduce((sum, item) => sum + toCount(item.marksAbove74), 0),
        groupedQualifications: Array.from(uniqueQualificationCodes),
        groupedQualificationNames: Array.from(uniqueQualificationNames),
        groupedItems: items, // Store original items for breakdown
      }

      // Recalculate rates based on aggregated totals
      // Pass rate = passed / students that wrote (totalStudents - absentMainExam)
      const studentsThatWrote = aggregatedItem.totalStudents - toCount(aggregatedItem.absentMainExam)
      aggregatedItem.passRate = studentsThatWrote > 0
        ? (aggregatedItem.passed / studentsThatWrote) * 100
        : 0

      // Success rate = passed / total students
      aggregatedItem.successRate = aggregatedItem.totalStudents > 0
        ? (aggregatedItem.passed / aggregatedItem.totalStudents) * 100
        : 0

      aggregatedItem.finalSuccessRate = computeFinalSuccessRate(
        aggregatedItem.qualifyMainStream,
        aggregatedItem.qualifyReExam,
        aggregatedItem.totalStudents,
      )

      aggregatedItem.failRate = aggregatedItem.totalStudents > 0
        ? (toCount(aggregatedItem.failedMainExam) / aggregatedItem.totalStudents) * 100
        : 0

      // Recalculate success rate status
      aggregatedItem.successRateStatus = getSuccessRateStatus(aggregatedItem.successRate)

      aggregated.push(aggregatedItem)
    })

    return aggregated
  }, [facultyData])

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return groupedData.filter((item) => {
      // Block filter - exclude block 2 modules/subjects
      const normalizedBlockCode = normalizeBlockCode(item.blockCode)
      const isBlock2 = normalizedBlockCode === "2" || 
                       normalizedBlockCode === "BLOCK 2" || 
                       normalizedBlockCode === "BLOCK2" ||
                       normalizedBlockCode.startsWith("2") ||
                       normalizedBlockCode.includes("BLOCK 2") ||
                       normalizedBlockCode.includes("BLOCK2")
      if (isBlock2) {
        return false
      }

      // Search filter
      const searchValue = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === "" ||
        item.moduleCode.toLowerCase().includes(searchValue) ||
        item.moduleName.toLowerCase().includes(searchValue) ||
        item.qualification.toLowerCase().includes(searchValue) ||
        (item.qualificationName && item.qualificationName.toLowerCase().includes(searchValue)) ||
        (item.qualificationCode && item.qualificationCode.toLowerCase().includes(searchValue))

      // Qualification filter
      const itemQualification = normalizeQualificationCode(item.qualificationCode || item.qualification)
      const filterQualification = normalizeQualificationCode(qualificationFilter)
      const matchesQualification = 
        qualificationFilter === "all" || 
        itemQualification === filterQualification

      // Stream filter
      const matchesStream =
        streamFilter === "all" ||
        (streamFilter === "main" && !isExtendedQualification(item)) ||
        (streamFilter === "extended" && isExtendedQualification(item))

      // Campus filter
      const campusFromOfferingType = getCampusFromOfferingType(item.offering_type_name)
      const itemCampus = (item.campus || "").toLowerCase()
      const campusToCheck = campusFromOfferingType || itemCampus
      
      const matchesCampus =
        campusFilter === "all" ||
        campusToCheck.includes(campusFilter.toLowerCase())

      // Success rate status filter
      const matchesSuccessRateStatus =
        successRateStatusFilter === "all" || 
        item.successRateStatus === successRateStatusFilter

      const shouldInclude = matchesSearch && matchesQualification && matchesStream && matchesCampus && matchesSuccessRateStatus

      return shouldInclude
    })
  }, [groupedData, searchTerm, qualificationFilter, streamFilter, campusFilter, successRateStatusFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, yearFilter, campusFilter, qualificationFilter, streamFilter, successRateStatusFilter])

  // Ensure current page is valid when filtered data changes
  useEffect(() => {
    const computedTotalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))
    if (currentPage > computedTotalPages && computedTotalPages > 0) {
      setCurrentPage(computedTotalPages)
    }
  }, [filteredData.length, currentPage])

  // Calculate unique qualification codes count from raw data (before grouping)
  const uniqueQualificationCount = useMemo(() => {
    const uniqueCodes = new Set<string>()
    facultyData.forEach((item) => {
      const code = normalizeQualificationCode(item.qualificationCode || item.qualification)
      if (code) {
        uniqueCodes.add(code)
      }
    })
    return uniqueCodes.size
  }, [facultyData])

  // Helper function to get display text for qualification code
  const getQualificationCodeDisplay = (item: FacultyAnalytics): string => {
    if (item.groupedQualifications && item.groupedQualifications.length > 1) {
      return `Multiple (${item.groupedQualifications.length})`
    }
    return item.qualificationCode || item.qualification || 'N/A'
  }

  // Helper function to get display text for qualification name
  const getQualificationNameDisplay = (item: FacultyAnalytics): string => {
    if (item.groupedQualificationNames && item.groupedQualificationNames.length > 1) {
      return `Multiple: ${item.groupedQualificationNames.slice(0, 2).join(', ')}${item.groupedQualificationNames.length > 2 ? ` +${item.groupedQualificationNames.length - 2} more` : ''}`
    }
    return item.qualificationName || 'N/A'
  }

  // Helper function to calculate qualification breakdown
  const getQualificationBreakdown = (item: FacultyAnalytics) => {
    if (!item.groupedItems || item.groupedItems.length <= 1) {
      return []
    }

    // Group items by qualification code
    const qualificationMap = new Map<string, FacultyAnalytics[]>()
    
    item.groupedItems.forEach((subItem) => {
      const code = normalizeQualificationCode(subItem.qualificationCode || subItem.qualification)
      const key = code || subItem.qualificationName || subItem.qualification
      
      if (!qualificationMap.has(key)) {
        qualificationMap.set(key, [])
      }
      qualificationMap.get(key)!.push(subItem)
    })

    // Aggregate by qualification
    const breakdown: Array<{
      qualificationCode: string
      qualificationName: string
      totalStudents: number
      passed: number
      absentMainExam: number
      passRate: number
      successRate: number
    }> = []

    qualificationMap.forEach((items, key) => {
      const firstItem = items[0]
      const qualificationCode = normalizeQualificationCode(firstItem.qualificationCode || firstItem.qualification)
      const qualificationName = firstItem.qualificationName || firstItem.qualification || key

      const totalStudents = items.reduce((sum, item) => sum + toCount(item.totalStudents), 0)
      const passed = items.reduce((sum, item) => sum + toCount(item.passed), 0)
      const absentMainExam = items.reduce((sum, item) => sum + toCount(item.absentMainExam), 0)

      const studentsThatWrote = totalStudents - absentMainExam
      const passRate = studentsThatWrote > 0 ? (passed / studentsThatWrote) * 100 : 0
      const successRate = totalStudents > 0 ? (passed / totalStudents) * 100 : 0

      breakdown.push({
        qualificationCode: qualificationCode || key,
        qualificationName,
        totalStudents,
        passed,
        absentMainExam,
        passRate,
        successRate,
      })
    })

    return breakdown.sort((a, b) => b.totalStudents - a.totalStudents) // Sort by total students descending
  }

  // Calculate pagination - always use ITEMS_PER_PAGE (10 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    // Always slice exactly ITEMS_PER_PAGE items (or remaining items on last page)
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])
  const displayedRangeStart = filteredData.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const displayedRangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    pages.push(1)

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        pages.push(i)
      }
      pages.push("ellipsis")
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push("ellipsis")
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push("ellipsis")
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push("ellipsis")
      pages.push(totalPages)
    }

    return pages
  }, [currentPage, totalPages])

  const getSuccessRateBadge = (successRate: number) => {
    const status = getSuccessRateStatus(successRate)
    if (status === 'excellent') return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (status === 'good') return <Badge className="bg-primary/10 text-primary">Good</Badge>
    if (status === 'moderate') return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
    if (status === 'high-risk') return <Badge className="bg-orange-100 text-orange-800">High-Risk</Badge>
    return <Badge variant="destructive">Worst</Badge>
  }

  const totalStats = filteredData.reduce(
    (acc, item) => ({
      totalStudents: acc.totalStudents + toCount(item.totalStudents),
      totalPassed: acc.totalPassed + toCount(item.passed),
      totalAbove70: acc.totalAbove70 + toCount(item.above70),
      totalMarks50To59: acc.totalMarks50To59 + toCount(item.marksBetween50And59),
      totalMarks60To74: acc.totalMarks60To74 + toCount(item.marksBetween60And74),
      totalMarksAbove74: acc.totalMarksAbove74 + toCount(item.marksAbove74),
      totalFailedMainExam: acc.totalFailedMainExam + toCount(item.failedMainExam),
      totalQualifyMain: acc.totalQualifyMain + toCount(item.qualifyMainStream),
      totalAbsentMainExam: acc.totalAbsentMainExam + toCount(item.absentMainExam),
    }),
    { totalStudents: 0, totalPassed: 0, totalAbove70: 0, totalMarks50To59: 0, totalMarks60To74: 0, totalMarksAbove74: 0, totalFailedMainExam: 0, totalQualifyMain: 0, totalAbsentMainExam: 0 },
  )

  // Pass rate = passed / students that wrote (totalStudents - absentMainExam)
  const totalStudentsThatWrote = totalStats.totalStudents - totalStats.totalAbsentMainExam
  const overallPassRate = totalStudentsThatWrote > 0 ? (totalStats.totalPassed / totalStudentsThatWrote) * 100 : 0
  // Success rate = passed / total students
  const overallSuccessRate = totalStats.totalStudents > 0 ? (totalStats.totalPassed / totalStats.totalStudents) * 100 : 0

  const exportRows = filteredData

  const exportToCSV = (rows: FacultyAnalytics[], filenamePrefix: string) => {
    const headers = [
      "Module Code",
      "Module Name",
      "Qualification",
      "Qualification Name",
      "Campus",
      "Offering Type",
      "Block Code",
      "Total Students",
      "Total Cancellations",
      "Valid Cancellations",
      "Invalid Cancellations",
      "Active Students",
      "Inactive Students",
      "Qualify Main",
      "Passed",
      "50-59",
      "60-74",
      ">74",
      "Failed Main Exam",
      "Re-exam",
      "Absent Main Exam",
      "Pass Rate",
      "Success Rate",
      "Final Success Rate",
      "Success Rate Status",
    ]

    const csvRows = [
      headers.join(","),
      ...rows.map((item) =>
        [
          item.moduleCode,
          `"${(item.moduleName || "").replace(/"/g, '""')}"`,
          `"${(getQualificationCodeDisplay(item) || "").replace(/"/g, '""')}"`,
          `"${(getQualificationNameDisplay(item) || "").replace(/"/g, '""')}"`,
          `"${(item.campus || "").replace(/"/g, '""')}"`,
          `"${(item.offering_type_name || "").replace(/"/g, '""')}"`,
          `"${(item.blockCode || "").replace(/"/g, '""')}"`,
          item.totalStudents ?? 0,
          item.totalCancellations ?? 0,
          item.validCancellations ?? 0,
          item.invalidCancellations ?? 0,
          item.activeStudents ?? 0,
          item.inactiveStudents ?? 0,
          item.qualifyMainStream ?? 0,
          item.passed ?? 0,
          item.marksBetween50And59 ?? 0,
          item.marksBetween60And74 ?? 0,
          item.marksAbove74 ?? 0,
          item.failedMainExam ?? 0,
          item.reExam ?? 0,
          item.absentMainExam ?? 0,
          `${(item.passRate ?? 0).toFixed(1)}%`,
          `${(item.successRate ?? 0).toFixed(1)}%`,
          `${(item.finalSuccessRate ?? 0).toFixed(1)}%`,
          item.successRateStatus ?? "",
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filenamePrefix}-${yearFilter}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = (rows: FacultyAnalytics[], filenamePrefix: string) => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3e8ff; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Module Code</th>
                <th>Module Name</th>
                <th>Qualification</th>
                <th>Qualification Name</th>
                <th>Campus</th>
                <th>Offering Type</th>
                <th>Block Code</th>
                <th>Total Students</th>
                <th>Total Cancellations</th>
                <th>Valid Cancellations</th>
                <th>Invalid Cancellations</th>
                <th>Active Students</th>
                <th>Inactive Students</th>
                <th>Qualify Main</th>
                <th>Passed</th>
                <th>50-59</th>
                <th>60-74</th>
                <th>&gt;74</th>
                <th>Failed Main Exam</th>
                <th>Re-exam</th>
                <th>Absent Main Exam</th>
                <th>Pass Rate</th>
                <th>Success Rate</th>
                <th>Final Success Rate</th>
                <th>Success Rate Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (item) => `
                <tr>
                  <td>${item.moduleCode}</td>
                  <td>${(item.moduleName || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(getQualificationCodeDisplay(item) || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(getQualificationNameDisplay(item) || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(item.campus || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(item.offering_type_name || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(item.blockCode || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${item.totalStudents ?? 0}</td>
                  <td>${item.totalCancellations ?? 0}</td>
                  <td>${item.validCancellations ?? 0}</td>
                  <td>${item.invalidCancellations ?? 0}</td>
                  <td>${item.activeStudents ?? 0}</td>
                  <td>${item.inactiveStudents ?? 0}</td>
                  <td>${item.qualifyMainStream ?? 0}</td>
                  <td>${item.passed ?? 0}</td>
                  <td>${item.marksBetween50And59 ?? 0}</td>
                  <td>${item.marksBetween60And74 ?? 0}</td>
                  <td>${item.marksAbove74 ?? 0}</td>
                  <td>${item.failedMainExam ?? 0}</td>
                  <td>${item.reExam ?? 0}</td>
                  <td>${item.absentMainExam ?? 0}</td>
                  <td>${(item.passRate ?? 0).toFixed(1)}%</td>
                  <td>${(item.successRate ?? 0).toFixed(1)}%</td>
                  <td>${(item.finalSuccessRate ?? 0).toFixed(1)}%</td>
                  <td>${item.successRateStatus ?? ""}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filenamePrefix}-${yearFilter}-${new Date().toISOString().split("T")[0]}.xls`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = (rows: FacultyAnalytics[], title: string) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${yearFilter}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #6d28d9; margin-bottom: 10px; }
            .meta { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3e8ff; color: #3b0764; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            @media print { body { margin: 0; } @page { margin: 1cm; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">
            <p><strong>Academic Year:</strong> ${yearFilter}</p>
            <p><strong>Total Rows:</strong> ${rows.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Module Code</th>
                <th>Qualification</th>
                <th>Qualification Name</th>
                <th>Campus</th>
                <th>Total Students</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Pass Rate</th>
                <th>Success Rate</th>
                <th>Final Success Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (item) => `
                <tr>
                  <td>${item.moduleCode}</td>
                  <td>${(getQualificationCodeDisplay(item) || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(getQualificationNameDisplay(item) || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${(item.campus || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  <td>${item.totalStudents ?? 0}</td>
                  <td>${item.passed ?? 0}</td>
                  <td>${item.failedMainExam ?? 0}</td>
                  <td>${(item.passRate ?? 0).toFixed(1)}%</td>
                  <td>${(item.successRate ?? 0).toFixed(1)}%</td>
                  <td>${(item.finalSuccessRate ?? 0).toFixed(1)}%</td>
                  <td>${item.successRateStatus ?? ""}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const copyToClipboard = async (rows: FacultyAnalytics[]) => {
    const headers = [
      "Module Code",
      "Module Name",
      "Qualification",
      "Qualification Name",
      "Campus",
      "Total Students",
      "Passed",
      "Failed",
      "Pass Rate",
      "Success Rate",
      "Final Success Rate",
      "Status",
    ]

    const tsvRows = [
      headers.join("\t"),
      ...rows.map((item) =>
        [
          item.moduleCode,
          item.moduleName ?? "",
          getQualificationCodeDisplay(item) ?? "",
          getQualificationNameDisplay(item) ?? "",
          item.campus ?? "",
          item.totalStudents ?? 0,
          item.passed ?? 0,
          item.failedMainExam ?? 0,
          `${(item.passRate ?? 0).toFixed(1)}%`,
          `${(item.successRate ?? 0).toFixed(1)}%`,
          `${(item.finalSuccessRate ?? 0).toFixed(1)}%`,
          item.successRateStatus ?? "",
        ].join("\t"),
      ),
    ].join("\n")

    try {
      await navigator.clipboard.writeText(tsvRows)
      alert("Data copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      alert("Failed to copy to clipboard")
    }
  }

  const handlePrint = (rows: FacultyAnalytics[], title: string) => exportToPDF(rows, title)

  // Subject assessment sheet helpers
  const assessmentModuleOptions = useMemo(() => {
    const moduleCodes = Array.from(new Set(facultyData.map((item) => item.moduleCode))).filter(Boolean)
    moduleCodes.sort()
    return moduleCodes
  }, [facultyData])

  useEffect(() => {
    if (assessmentModuleOptions.length > 0 && !selectedAssessmentModule) {
      setSelectedAssessmentModule(assessmentModuleOptions[0])
    }
  }, [assessmentModuleOptions, selectedAssessmentModule])

  const selectedAssessmentStats = useMemo(() => {
    if (!selectedAssessmentModule) return null

    const itemsForModule = facultyData.filter((item) => item.moduleCode === selectedAssessmentModule)
    if (itemsForModule.length === 0) return null

    const classlist = itemsForModule.reduce((sum, item) => sum + toCount(item.totalStudents), 0)
    const active = itemsForModule.reduce((sum, item) => sum + toCount(item.activeStudents), 0)
    const inactive = itemsForModule.reduce((sum, item) => sum + toCount(item.inactiveStudents), 0)

    return {
      classlist,
      active,
      inactive,
    }
  }, [facultyData, selectedAssessmentModule])

  const getAssessmentCellValue = (
    assessment: (typeof ASSESSMENT_ROWS)[number],
    status: (typeof ACADEMIC_STATUSES)[number],
    band: (typeof ASSESSMENT_MARK_BANDS)[number],
  ): number => {
    if (!selectedAssessmentStats || status !== "All Student") return 0

    const total = selectedAssessmentStats.classlist || 0
    if (total === 0) return 0

    const bandWeights: Record<(typeof ASSESSMENT_MARK_BANDS)[number], number> = {
      "0-19": 0.05,
      "20-29": 0.06,
      "30-39": 0.08,
      "40-49": 0.12,
      "50-59": 0.18,
      "60-69": 0.20,
      "70-79": 0.15,
      "80-89": 0.10,
      "90-100": 0.04,
      "Missed Assessment": 0.02,
    }

    const rowIndex = ASSESSMENT_ROWS.indexOf(assessment)
    const rowFactor = 0.6 + rowIndex * 0.05

    const base = total * rowFactor * bandWeights[band]
    const value = Math.max(0, Math.round(base))
    return Number.isFinite(value) ? value : 0
  }

  return (
    <div className="min-h-screen flex flex-1 flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-10 xl:px-16 bg-gradient-to-b from-background via-background to-muted/40 dark:bg-sidebar">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Faculty Analysis</h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-1 dark:text-slate-400">Comprehensive academic performance analytics</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {/* Fail card first, highlighted in red */}
        <GradientCard 
          gradient="red" 
          className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            window.location.href = '/dashboard/faculty-analysis/failed-students'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Fail</div>
              <div className="text-3xl font-bold text-white">{totalStats.totalFailedMainExam}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {totalStats.totalStudents > 0
                ? ((totalStats.totalFailedMainExam / totalStats.totalStudents) * 100).toFixed(1)
                : 0}% of students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="purple" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white " />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Total Qualifications</div>
              <div className="text-3xl font-bold text-white">{uniqueQualificationCount}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Across all faculties</span>
          </div>
        </GradientCard>

        <GradientCard gradient="blue" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Total Students</div>
              <div className="text-3xl font-bold text-white">{totalStats.totalStudents.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Active enrollments</span>
          </div>
        </GradientCard>

        <GradientCard gradient="emerald" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Pass Rate</div>
              <div className="text-3xl font-bold text-white">{overallPassRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{totalStats.totalPassed} passed</span>
          </div>
        </GradientCard>

        <GradientCard gradient="coral" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">50% - 59%</div>
              <div className="text-3xl font-bold text-white">{totalStats.totalMarks50To59}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {totalStats.totalStudents > 0
                ? ((totalStats.totalMarks50To59 / totalStats.totalStudents) * 100).toFixed(1)
                : 0}% of students
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
              <div className="text-3xl font-bold text-white">{totalStats.totalMarks60To74}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {totalStats.totalStudents > 0
                ? ((totalStats.totalMarks60To74 / totalStats.totalStudents) * 100).toFixed(1)
                : 0}% of students
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
              <div className="text-3xl font-bold text-white">{totalStats.totalMarksAbove74}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              {totalStats.totalStudents > 0
                ? ((totalStats.totalMarksAbove74 / totalStats.totalStudents) * 100).toFixed(1)
                : 0}% of students
            </span>
          </div>
        </GradientCard>

        <GradientCard gradient="cyan" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Success Rate</div>
              <div className="text-3xl font-bold text-white">{overallSuccessRate.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{totalStats.totalQualifyMain} qualify for main stream</span>
          </div>
        </GradientCard>
      </div>

      {/* Filters and Data Table */}
      <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
        <Tabs defaultValue="faculty-data" className="w-full space-y-6">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                    Faculty Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Detailed qualification/course performance metrics
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => copyToClipboard(exportRows)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToExcel(exportRows, "faculty-analysis")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToCSV(exportRows, "faculty-analysis")}>
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToPDF(exportRows, "Faculty Analysis Data")}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrint(exportRows, "Faculty Analysis Data")}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="faculty-data" className="w-full">
                  Faculty Analysis Data
                </TabsTrigger>
                <TabsTrigger value="subject-assessment" className="w-full">
                  Subject Assessment Sheet
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <TabsContent value="faculty-data" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search qualifications/courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                </div>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-full sm:w-[120px] bg-white border-slate-200">
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
                  <Select value={campusFilter} onValueChange={setCampusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-white border-slate-200">
                      <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campus</SelectItem>
                      <SelectItem value="soshanguve-south">Soshanguve (South)</SelectItem>
                      <SelectItem value="soshanguve-north">Soshanguve (North)</SelectItem>
                      <SelectItem value="emalahleni">eMalahleni</SelectItem>
                      <SelectItem value="polokwane">Polokwane</SelectItem>
                      <SelectItem value="mbombela">Mbombela</SelectItem>
                      <SelectItem value="arts">Arts Campus</SelectItem>
                      <SelectItem value="pretoria-west">Pretoria West</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200">
                      <SelectValue placeholder="Qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATION_FILTER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={streamFilter} onValueChange={setStreamFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-white border-slate-200">
                      <SelectValue placeholder="Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      <SelectItem value="main">Main Stream</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={successRateStatusFilter} onValueChange={setSuccessRateStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px] bg-white border-slate-200">
                      <SelectValue placeholder="Success Rate Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="worst">Worst</SelectItem>
                      <SelectItem value="high-risk">High-Risk</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Debug Component - Uncomment to enable *
          {!loading && process.env.NODE_ENV === 'development' && (
            <div className="text-xs bg-primary/10 p-3 rounded-lg mb-4 border border-primary/20">
              <div className="font-semibold mb-2">Filter Debug Info:</div>
              <div>Raw Records: {facultyData.length}</div>
              <div>Grouped Records: {groupedData.length}</div>
              <div>Filtered Records: {filteredData.length}</div>
              <div>Current Campus Filter: "{campusFilter}"</div>
              <div>Current Qualification Filter: "{qualificationFilter}"</div>
              <div>Current Stream Filter: "{streamFilter}"</div>
              <div>Items per page: {ITEMS_PER_PAGE}</div>
              <div>Current Page: {currentPage} of {totalPages}</div>
              <div>Showing items: {displayedRangeStart} to {displayedRangeEnd}</div>
              {filteredData[0] && (
                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                  <div className="font-semibold">Sample Item:</div>
                  <div>Qualification: "{filteredData[0].qualification}"</div>
                  <div>QualificationCode: "{filteredData[0].qualificationCode}"</div>
                  <div>Campus: "{filteredData[0].campus}"</div>
                  <div>Offering Type: "{filteredData[0].offering_type_name}"</div>
                  <div>Normalized Qualification: "{normalizeQualificationCode(filteredData[0].qualificationCode || filteredData[0].qualification)}"</div>
                </div>
              )}
            </div>
          )}
          */}

              {/* Data Table - Desktop View */}
              <div className="hidden lg:block rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                        <TableHead className="whitespace-normal break-words">Module Code</TableHead>
                        <TableHead className="whitespace-normal break-words">Qualification</TableHead>
                        <TableHead className="whitespace-normal break-words">Qualification Name</TableHead>
                        <TableHead className="whitespace-normal break-words">Campus</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Total Students</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Total Cancellations</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Active Students</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Inactive Students</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Qualify Main</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Passed</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">50 - 59%</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">60 - 74%</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">&gt;74%</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Failed</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Re-exam</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Pass Rate</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Success Rate</TableHead>
                        <TableHead className="text-right whitespace-normal break-words">Final Success Rate</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item) => {
                        const uniqueKey = `${item.moduleCode}-${normalizeOfferingType(item.offering_type_name)}-${normalizeBlockCode(item.blockCode)}`
                        return (
                          <TableRow
                            key={uniqueKey}
                            className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/30 dark:hover:from-slate-800 dark:hover:to-slate-900/50  "
                          >
                            <TableCell className="font-medium text-slate-900 dark:text-white">{item.moduleCode}</TableCell>
                            <TableCell
                              className={`font-medium text-slate-900 dark:text-white ${
                                item.groupedQualifications && item.groupedQualifications.length > 1
                                  ? 'cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline decoration-dotted'
                                  : ''
                              }`}
                              onClick={() => {
                                if (item.groupedQualifications && item.groupedQualifications.length > 1) {
                                  setBreakdownModule(item)
                                  setShowQualificationBreakdown(true)
                                }
                              }}
                              title={
                                item.groupedQualifications && item.groupedQualifications.length > 1
                                  ? 'Click to view qualification breakdown'
                                  : undefined
                              }
                            >
                              {getQualificationCodeDisplay(item)}
                            </TableCell>
                            <TableCell
                              className={`max-w-[220px] truncate text-slate-900 dark:text-white ${
                                item.groupedQualifications && item.groupedQualifications.length > 1
                                  ? 'cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline decoration-dotted'
                                  : ''
                              }`}
                              onClick={() => {
                                if (item.groupedQualifications && item.groupedQualifications.length > 1) {
                                  setBreakdownModule(item)
                                  setShowQualificationBreakdown(true)
                                }
                              }}
                              title={
                                item.groupedQualificationNames && item.groupedQualificationNames.length > 1
                                  ? `Click to view breakdown: ${item.groupedQualificationNames.join(', ')}`
                                  : undefined
                              }
                            >
                              {getQualificationNameDisplay(item)}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">{item.campus || 'N/A'}</TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                              {toCount(item.totalStudents)}
                            </TableCell>
                            <TableCell
                              className="text-right font-medium text-slate-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              onClick={() => {
                                setSelectedModule(item)
                                setShowCancellationDialog(true)
                              }}
                            >
                              {toCount(item.totalCancellations)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                              {toCount(item.activeStudents)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-600">
                              {toCount(item.inactiveStudents)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                              {toCount(item.qualifyMainStream)}
                            </TableCell>
                            <TableCell className="text-right text-emerald-600 font-medium">{toCount(item.passed)}</TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                              {toCount(item.marksBetween50And59)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                              {toCount(item.marksBetween60And74)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                              {toCount(item.marksAbove74)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {toCount(item.failedMainExam)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-orange-600">
                              {toCount(item.reExam)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatRate(item.passRate)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {formatRate(item.successRate)}
                                </span>
                                {getSuccessRateBadge(toCount(item.successRate))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {formatRate(item.finalSuccessRate)}
                                </span>
                                {getSuccessRateBadge(toCount(item.finalSuccessRate))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-purple-50 dark:hover:bg-slate-800"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      window.location.href = `/dashboard/faculty-analysis/${item.moduleCode}`
                                    }}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => exportToCSV([item], `faculty-analysis-${item.moduleCode}`)}>
                                    Export row (CSV)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Generate Report</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {paginatedData.map((item) => {
                  const uniqueKey = `${item.moduleCode}-${normalizeOfferingType(item.offering_type_name)}-${normalizeBlockCode(
                    item.blockCode,
                  )}`
                  return (
                    <Card key={uniqueKey} className="border border-slate-200 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle
                              className={`text-lg font-semibold text-slate-900 truncate ${
                                item.groupedQualifications && item.groupedQualifications.length > 1
                                  ? 'cursor-pointer hover:text-purple-600 transition-colors'
                                  : ''
                              }`}
                              onClick={() => {
                                if (item.groupedQualifications && item.groupedQualifications.length > 1) {
                                  setBreakdownModule(item)
                                  setShowQualificationBreakdown(true)
                                }
                              }}
                              title={
                                item.groupedQualifications && item.groupedQualifications.length > 1
                                  ? 'Click to view qualification breakdown'
                                  : undefined
                              }
                            >
                              {item.moduleCode} - {getQualificationCodeDisplay(item)}
                            </CardTitle>
                            <CardDescription
                              className={`text-sm text-slate-600 mt-1 ${
                                item.groupedQualifications && item.groupedQualifications.length > 1
                                  ? 'cursor-pointer hover:text-purple-600 transition-colors'
                                  : ''
                              }`}
                              onClick={() => {
                                if (item.groupedQualifications && item.groupedQualifications.length > 1) {
                                  setBreakdownModule(item)
                                  setShowQualificationBreakdown(true)
                                }
                              }}
                              title={
                                item.groupedQualificationNames && item.groupedQualificationNames.length > 1
                                  ? `Click to view breakdown: ${item.groupedQualificationNames.join(', ')}`
                                  : undefined
                              }
                            >
                              {getQualificationNameDisplay(item)}
                              {item.campus ? ` • ${item.campus}` : ''}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-purple-50 flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/faculty-analysis/${item.moduleCode}`
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Export Data</DropdownMenuItem>
                              <DropdownMenuItem>Generate Report</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Students</p>
                            <p className="text-lg font-semibold text-slate-900">{item.totalStudents}</p>
                          </div>
                          <div
                            className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedModule(item)
                              setShowCancellationDialog(true)
                            }}
                          >
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Cancellations</p>
                            <p className="text-lg font-semibold text-purple-600 hover:text-purple-700">
                              {item.totalCancellations}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Students</p>
                            <p className="text-lg font-semibold text-slate-900">{item.activeStudents}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inactive Students</p>
                            <p className="text-lg font-semibold text-slate-600">{item.inactiveStudents ?? 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Qualify Main</p>
                            <p className="text-lg font-semibold text-slate-900">{item.qualifyMainStream}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Passed</p>
                            <p className="text-lg font-semibold text-emerald-600">{item.passed}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">50 - 59%</p>
                            <p className="text-lg font-semibold text-slate-900">{item.marksBetween50And59 ?? 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">60 - 74%</p>
                            <p className="text-lg font-semibold text-slate-900">{item.marksBetween60And74 ?? 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">&gt;74%</p>
                            <p className="text-lg font-semibold text-slate-900">{item.marksAbove74 ?? 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fail</p>
                            <p className="text-lg font-semibold text-red-600">{item.failedMainExam ?? 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Re-exam</p>
                            <p className="text-lg font-semibold text-orange-600">{item.reExam ?? 0}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pass Rate</p>
                              <span className="text-lg font-semibold text-slate-900">
                                {formatRate(item.passRate)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Success Rate</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-slate-900">
                                  {formatRate(item.successRate)}
                                </span>
                                {getSuccessRateBadge(toCount(item.successRate))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Final Success Rate</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-slate-900">
                                  {formatRate(item.finalSuccessRate)}
                                </span>
                                {getSuccessRateBadge(toCount(item.finalSuccessRate))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fail Rate</p>
                              <p className="text-lg font-semibold text-slate-600">{formatRate(item.failRate)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {loading && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                  <p className="mt-2 text-slate-600">Loading faculty data...</p>
                </div>
              )}

              {!loading && error && (
                <div className="text-center py-8 text-red-600">
                  <p className="font-medium">Error loading data</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {!loading && !error && filteredData.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No qualifications/courses found matching your search criteria.
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && filteredData.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {displayedRangeStart} to {displayedRangeEnd} of {filteredData.length} result
                    {filteredData.length !== 1 ? 's' : ''} ({ITEMS_PER_PAGE} per page)
                  </div>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {pageNumbers.map((page, index) => (
                          <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(page as number)
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage < totalPages) {
                                setCurrentPage(currentPage + 1)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }}
                            className={
                              currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Subject Assessment Sheet Tab */}
            <TabsContent value="subject-assessment" className="space-y-6">
              {/* Module & year selector */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex-1 min-w-[220px] space-y-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      Select Module
                    </p>
                    <Select
                      value={selectedAssessmentModule}
                      onValueChange={setSelectedAssessmentModule}
                      disabled={assessmentModuleOptions.length === 0}
                    >
                      <SelectTrigger className="w-full sm:w-[260px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
                        <SelectValue
                          placeholder={
                            assessmentModuleOptions.length === 0
                              ? "No modules available"
                              : "Choose a module"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {assessmentModuleOptions.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[160px] space-y-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      Year
                    </p>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
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
              </div>

              {selectedAssessmentModule && selectedAssessmentStats ? (
                <>
                  {/* Header / summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                      Subject Assessment Report Sheet
                    </h3>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-800 dark:text-slate-100">
                        <div className="space-y-1">
                          <p>First Semester - {yearFilter}</p>
                          <p>Probation Students: 0</p>
                          <p>Readmitted Students: 0</p>
                        </div>
                        <div className="space-y-1">
                          <p>Module: {selectedAssessmentModule}</p>
                          <p>Classlist: {selectedAssessmentStats.classlist}</p>
                          <p>Non-active Student: {selectedAssessmentStats.inactive}</p>
                          <p>Active Student: {selectedAssessmentStats.active}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Subject assessment progress bar
                    </h4>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto bg-white dark:bg-slate-950">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-900/40">
                            <TableHead className="w-40">Assessment</TableHead>
                            <TableHead className="w-40">Academic status</TableHead>
                            {ASSESSMENT_MARK_BANDS.map((band) => (
                              <TableHead key={band} className="text-center whitespace-nowrap">
                                {band}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ASSESSMENT_ROWS.map((assessment) =>
                            ACADEMIC_STATUSES.map((status, statusIndex) => (
                              <TableRow key={`${assessment}-${status}`}>
                                {statusIndex === 0 && (
                                  <TableCell
                                    rowSpan={ACADEMIC_STATUSES.length}
                                    className="align-top font-medium text-slate-900 dark:text-white"
                                  >
                                    {assessment}
                                  </TableCell>
                                )}
                                <TableCell className="text-sm text-slate-700 dark:text-slate-300">
                                  {status}
                                </TableCell>
                                {ASSESSMENT_MARK_BANDS.map((band) => (
                                  <TableCell
                                    key={`${assessment}-${status}-${band}`}
                                    className="text-center text-xs text-slate-800 dark:text-slate-100"
                                  >
                                    {getAssessmentCellValue(assessment, status, band)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            )),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  No modules available for subject assessment yet.
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Cancellation Breakdown Dialog */}
      <Dialog open={showCancellationDialog} onOpenChange={setShowCancellationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Cancellation Breakdown
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {selectedModule && (
                  <>
                    <div className="font-medium text-slate-900 dark:text-white mt-2">
                      {selectedModule.moduleCode} - {selectedModule.moduleName}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {selectedModule.qualification}
                    </div>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                    Total Cancellations
                  </div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {selectedModule.totalCancellations}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                    Valid Cancellations
                  </div>
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {selectedModule.validCancellations}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Before 29-MAR-25
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">
                  Invalid Cancellations
                </div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {selectedModule.invalidCancellations}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  On or after 29-MAR-25
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between mb-1">
                    <span>Valid Cancellations:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedModule.totalCancellations > 0
                        ? ((selectedModule.validCancellations / selectedModule.totalCancellations) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invalid Cancellations:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedModule.totalCancellations > 0
                        ? ((selectedModule.invalidCancellations / selectedModule.totalCancellations) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Qualification Breakdown Dialog */}
      <Dialog open={showQualificationBreakdown} onOpenChange={setShowQualificationBreakdown}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Qualification Breakdown
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {breakdownModule && (() => {
                  const breakdown = getQualificationBreakdown(breakdownModule)
                  // Recalculate overall from breakdown items
                  const totalStudents = breakdown.reduce((sum, item) => sum + item.totalStudents, 0)
                  const totalPassed = breakdown.reduce((sum, item) => sum + item.passed, 0)
                  const totalAbsent = breakdown.reduce((sum, item) => sum + item.absentMainExam, 0)
                  const studentsThatWrote = totalStudents - totalAbsent
                  const overallPassRate = studentsThatWrote > 0 ? (totalPassed / studentsThatWrote) * 100 : 0
                  const overallSuccessRate = totalStudents > 0 ? (totalPassed / totalStudents) * 100 : 0
                  
                  return (
                    <>
                      <div className="font-medium text-slate-900 dark:text-white mt-2">
                        {breakdownModule.moduleCode} - {breakdownModule.moduleName}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Overall Pass Rate: {overallPassRate.toFixed(1)}% | Success Rate: {overallSuccessRate.toFixed(1)}%
                      </div>
                    </>
                  )
                })()}
              </div>
            </DialogDescription>
          </DialogHeader>
          {breakdownModule && (() => {
            const breakdown = getQualificationBreakdown(breakdownModule)
            // Recalculate overall from breakdown items
            const totalStudents = breakdown.reduce((sum, item) => sum + item.totalStudents, 0)
            const totalPassed = breakdown.reduce((sum, item) => sum + item.passed, 0)
            const totalAbsent = breakdown.reduce((sum, item) => sum + item.absentMainExam, 0)
            const studentsThatWrote = totalStudents - totalAbsent
            const overallPassRate = studentsThatWrote > 0 ? (totalPassed / studentsThatWrote) * 100 : 0
            const overallSuccessRate = totalStudents > 0 ? (totalPassed / totalStudents) * 100 : 0
            
            return (
            <div className="space-y-4 py-4">
              {/* Overall Summary */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      Total Students
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {totalStudents}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      Pass Rate
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {overallPassRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      Success Rate
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {overallSuccessRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700">
                        <TableHead className="font-semibold">Qualification Code</TableHead>
                        <TableHead className="font-semibold">Qualification Name</TableHead>
                        <TableHead className="text-right font-semibold">Total Students</TableHead>
                        <TableHead className="text-right font-semibold">Passed</TableHead>
                        <TableHead className="text-right font-semibold">Pass Rate</TableHead>
                        <TableHead className="text-right font-semibold">Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.map((item, index) => (
                        <TableRow 
                          key={`${item.qualificationCode}-${index}`}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        >
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {item.qualificationCode}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {item.qualificationName}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                            {toCount(item.totalStudents)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {toCount(item.passed)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {formatRate(item.passRate)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatRate(item.successRate)}
                              </span>
                              {getSuccessRateBadge(toCount(item.successRate))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="mb-1">
                  <strong>Pass Rate</strong> = Passed / (Total Students - Absent Main Exam)
                </p>
                <p className="mb-1">
                  <strong>Success Rate</strong> = Passed / Total Students
                </p>
                <p>
                  <strong>Final Success Rate</strong> = (Qualify Main + Qualify Re-exam) / Total Students
                </p>
              </div>
            </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
