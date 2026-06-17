"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Download,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Copy,
  FileText,
  Printer,
} from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface FailedStudent {
  id: string
  studentNumber: string
  studentName: string | null
  subjectCode: string
  subjectName: string | null
  qualification: string | null
  qualificationName: string | null
  school: string | null
  offering_type_name?: string
  fullMark: number | null
  finalMark: number | null
  examMark: number | null
  result: string | null
  academicYear: number | null
}

const ITEMS_PER_PAGE = 10

export default function FailedStudentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("2025")
  const [schoolFilter, setSchoolFilter] = useState("all")
  const [qualificationFilter, setQualificationFilter] = useState("all")
  const [failedStudents, setFailedStudents] = useState<FailedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch failed students from API
  useEffect(() => {
    const fetchFailedStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/school-analysis/failed-students?year=${yearFilter}&qualification=${qualificationFilter}&school=${schoolFilter}`
        )
        const result = await response.json()
        
        if (result.success) {
          setFailedStudents(result.data || [])
        } else {
          setError(result.error || 'Failed to fetch failed students')
          setFailedStudents([])
        }
      } catch (err) {
        console.error('Error fetching failed students:', err)
        setError('Failed to fetch failed students')
        setFailedStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchFailedStudents()
  }, [yearFilter, qualificationFilter, schoolFilter])

  // Filter data based on search
  const filteredStudents = useMemo(() => {
    return failedStudents.filter((student) => {
      const matchesSearch =
        student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentName && student.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.subjectName && student.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.qualification && student.qualification.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.qualificationName && student.qualificationName.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })
  }, [failedStudents, searchTerm])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, yearFilter, schoolFilter, qualificationFilter])

  // Ensure current page is valid when filtered data changes
  useEffect(() => {
    const computedTotalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE))
    if (currentPage > computedTotalPages && computedTotalPages > 0) {
      setCurrentPage(computedTotalPages)
    }
  }, [filteredStudents.length, currentPage])

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredStudents.slice(start, end)
  }, [filteredStudents, currentPage])

  const displayedRangeStart = failedStudents.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const displayedRangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)

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

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Student Number',
      'Student Name',
      'Module Code',
      'Module Name',
      'Qualification',
      'School',
      'Full Mark',
      'Final Mark',
      'Exam Mark',
      'Result',
      'Academic Year'
    ]
    const csvRows = [
      headers.join(','),
      ...filteredStudents.map((student) =>
        [
          student.studentNumber,
          `"${(student.studentName || 'N/A').replace(/"/g, '""')}"`,
          student.subjectCode,
          `"${(student.subjectName || 'N/A').replace(/"/g, '""')}"`,
          `"${(student.qualificationName || student.qualification || 'N/A').replace(/"/g, '""')}"`,
          `"${(student.school || 'N/A').replace(/"/g, '""')}"`,
          student.fullMark ?? 'N/A',
          student.finalMark ?? 'N/A',
          student.examMark ?? 'N/A',
          student.result || 'N/A',
          student.academicYear ?? yearFilter
        ].join(',')
      )
    ]
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `failed-students-${yearFilter}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #fee2e2;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Name</th>
                <th>Module Code</th>
                <th>Module Name</th>
                <th>Qualification</th>
                <th>School</th>
                <th>Full Mark</th>
                <th>Final Mark</th>
                <th>Exam Mark</th>
                <th>Result</th>
                <th>Academic Year</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map((student) => `
                <tr>
                  <td>${student.studentNumber}</td>
                  <td>${student.studentName || 'N/A'}</td>
                  <td>${student.subjectCode}</td>
                  <td>${student.subjectName || 'N/A'}</td>
                  <td>${student.qualificationName || student.qualification || 'N/A'}</td>
                  <td>${student.school || 'N/A'}</td>
                  <td>${student.fullMark ?? 'N/A'}</td>
                  <td>${student.finalMark ?? 'N/A'}</td>
                  <td>${student.examMark ?? 'N/A'}</td>
                  <td>${student.result || 'N/A'}</td>
                  <td>${student.academicYear ?? yearFilter}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `failed-students-${yearFilter}-${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Failed Students Report - ${yearFilter}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              color: #dc2626;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #fee2e2;
              color: #991b1b;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            @media print {
              body { margin: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>Failed Students Details</h1>
          <div class="meta">
            <p><strong>Academic Year:</strong> ${yearFilter}</p>
            <p><strong>Total Students:</strong> ${filteredStudents.length}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Name</th>
                <th>Module Code</th>
                <th>Module Name</th>
                <th>Qualification</th>
                <th>School</th>
                <th>Full Mark</th>
                <th>Final Mark</th>
                <th>Exam Mark</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map((student) => `
                <tr>
                  <td>${student.studentNumber}</td>
                  <td>${student.studentName || 'N/A'}</td>
                  <td>${student.subjectCode }</td>
                  <td>${student.subjectName || 'N/A'}</td>
                  <td>${student.qualificationName || student.qualification || 'N/A'}</td>
                  <td>${student.school || 'N/A'}</td>
                  <td>${student.fullMark ?? 'N/A'}</td>
                  <td>${student.finalMark ?? 'N/A'}</td>
                  <td>${student.examMark ?? 'N/A'}</td>
                  <td>${student.result || 'N/A'}</td>
                </tr>
              `).join('')}
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

  const copyToClipboard = async () => {
    const headers = [
      'Student Number',
      'Student Name',
      'Module Code',
      'Module Name',
      'Qualification',
      'School',
      'Full Mark',
      'Final Mark',
      'Exam Mark',
      'Result'
    ]
    const csvRows = [
      headers.join('\t'),
      ...filteredStudents.map((student) =>
        [
          student.studentNumber,
          student.studentName || 'N/A',
          student.subjectCode,
          student.subjectName || 'N/A',
          student.qualificationName || student.qualification || 'N/A',
          student.school || 'N/A',
          student.fullMark ?? 'N/A',
          student.finalMark ?? 'N/A',
          student.examMark ?? 'N/A',
          student.result || 'N/A'
        ].join('\t')
      )
    ]
    const textContent = csvRows.join('\n')
    
    try {
      await navigator.clipboard.writeText(textContent)
      alert('Data copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      alert('Failed to copy to clipboard')
    }
  }

  const handlePrint = () => {
    exportToPDF()
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-purple-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Failed Students
              </h1>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-1 dark:text-slate-400">
                Students with result codes F, FA, or FR
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                Failed Students Details
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Total: {filteredStudents.length} students
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students, modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-slate-200 focus:border-red-300 focus:ring-red-200"
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
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-white border-slate-200">
                  <SelectValue placeholder="School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="capetown">Capetown</SelectItem>
                  <SelectItem value="stellenbosch">Stellenbosch</SelectItem>
                  <SelectItem value="durban">Durban</SelectItem>
                </SelectContent>
              </Select>
              <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200">
                  <SelectValue placeholder="Qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualifications</SelectItem>
                  <SelectItem value="Engineering">Engineering Studies</SelectItem>
                  <SelectItem value="Business">Business Studies</SelectItem>
                  <SelectItem value="HRM">Human Resource Management</SelectItem>
                  <SelectItem value="Medical">Medical Secretary</SelectItem>
                  <SelectItem value="Legal">Legal Secretary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table - Desktop View */}
          <div className="hidden lg:block rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-red-50 to-red-100/50 border-b dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/50 border-slate-200">
                    <TableHead className="whitespace-normal break-words">Student Number</TableHead>
                    <TableHead className="whitespace-normal break-words">Student Name</TableHead>
                    <TableHead className="whitespace-normal break-words">Module Code</TableHead>
                    <TableHead className="whitespace-normal break-words">Module Name</TableHead>
                    <TableHead className="whitespace-normal break-words">Qualification</TableHead>
                    <TableHead className="whitespace-normal break-words">School</TableHead>
                    <TableHead className="text-right whitespace-normal break-words">Full Mark</TableHead>
                    <TableHead className="text-right whitespace-normal break-words">Final Mark</TableHead>
                    <TableHead className="text-right whitespace-normal break-words">Exam Mark</TableHead>
                    <TableHead className="text-center whitespace-normal break-words">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="hover:bg-gradient-to-r hover:from-red-50/30 hover:to-red-50/30 dark:hover:from-slate-800 dark:hover:to-slate-900/50"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {student.studentNumber}
                      </TableCell>
                      <TableCell className="text-slate-900 dark:text-white">
                        {student.studentName || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {student.subjectCode}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-900 dark:text-white">
                        {student.subjectName || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {student.qualificationName || student.qualification || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {student.school || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                        {student.fullMark ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                        {student.finalMark ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                        {student.examMark ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {student.result || 'N/A'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedData.map((student) => (
              <Card key={student.id} className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {student.studentNumber}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 mt-1">
                    {student.studentName || 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Module Code</p>
                      <p className="text-base font-semibold text-slate-900">{student.subjectCode}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Module Name</p>
                      <p className="text-base font-semibold text-slate-900 truncate">{student.subjectName || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Qualification</p>
                      <p className="text-base font-semibold text-slate-900">{student.qualificationName || student.qualification || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">School</p>
                      <p className="text-base font-semibold text-slate-600">{student.school || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Mark</p>
                      <p className="text-base font-semibold text-slate-900">{student.fullMark ?? 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Final Mark</p>
                      <p className="text-base font-semibold text-slate-900">{student.finalMark ?? 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Exam Mark</p>
                      <p className="text-base font-semibold text-slate-900">{student.examMark ?? 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Result</p>
                      <p className="text-base font-semibold text-red-600">{student.result || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-red-600" />
              <p className="mt-2 text-slate-600">Loading failed students...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-8 text-red-600">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && filteredStudents.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="font-medium">No failed students found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && filteredStudents.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {displayedRangeStart} to {displayedRangeEnd} of {filteredStudents.length} result{filteredStudents.length !== 1 ? 's' : ''} ({ITEMS_PER_PAGE} per page)
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
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

