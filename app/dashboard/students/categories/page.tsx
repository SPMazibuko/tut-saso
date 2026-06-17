"use client"

import { useState, useMemo, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, LogOut, UserMinus, ShieldAlert, UserCog, ChevronLeft, ChevronRight, MessageSquare, AlertTriangle } from "lucide-react"
import type { StudentCategory, Learner } from "@/lib/types"
import { getCategorizedStudents, getCategoryCounts, CATEGORY_CONFIG, TUTORIAL_DATES, getAvailableModules } from "@/lib/categorized-students-data"
import SendMessageDialog from "@/components/admin/send-message-dialog"
import SendRiskNoteDialog from "@/components/admin/send-risk-note-dialog"

const CATEGORY_ICONS: Record<StudentCategory, React.ReactNode> = {
  dropout: <LogOut className="h-5 w-5" />,
  inactive: <UserMinus className="h-5 w-5" />,
  "suspended-risk": <ShieldAlert className="h-5 w-5" />,
  active: <UserCog className="h-5 w-5" />,
}

export default function StudentCategoriesPage() {
  const [activeCategory, setActiveCategory] = useState<StudentCategory>("dropout")
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState<string>("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showSendMessage, setShowSendMessage] = useState(false)
  const [showSendRiskNote, setShowSendRiskNote] = useState(false)
  const itemsPerPage = 20

  const availableModules = useMemo(() => getAvailableModules(), [])
  const categoryCounts = useMemo(() => getCategoryCounts(selectedModule), [selectedModule])

  const categorizedStudents = useMemo(() => {
    const students = getCategorizedStudents(activeCategory, selectedModule)
    if (!categorySearchTerm) return students
    const term = categorySearchTerm.toLowerCase()
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.studentNumber.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
    )
  }, [activeCategory, categorySearchTerm, selectedModule])

  const totalPages = Math.ceil(categorizedStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = categorizedStudents.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()) }, [activeCategory, categorySearchTerm, selectedModule])

  const allPageIds = paginatedStudents.map((s) => s.id)
  const allPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id))
  const somePageSelected = allPageIds.some((id) => selectedIds.has(id))

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) { allPageIds.forEach((id) => next.add(id)) }
      else { allPageIds.forEach((id) => next.delete(id)) }
      return next
    })
  }

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id); else next.delete(id)
      return next
    })
  }

  const selectedAsLearners: Learner[] = categorizedStudents
    .filter((s) => selectedIds.has(s.id))
    .map((s) => ({
      id: s.id,
      studentNumber: s.studentNumber,
      name: s.name.split(" ")[0] || s.name,
      surname: s.name.split(" ").slice(1).join(" ") || "",
      email: s.email,
      academicStatus: "First-time" as const,
      subjectCode: s.moduleCode || "",
      assessments: { AS: 0, CT: 0, WR: 0, PP: 0 },
      attendance: { attended: 0, total: 0, percentage: 0 },
      riskLevel: "Good" as const,
      enrollmentYear: 2024,
      semester: 1,
      teacherId: 1,
      previousSubjects: [],
    }))

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-background">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <AppHeader
          title="Student Categories"
          subtitle="Students grouped by status — Dropout, Inactive, Suspended-Risk, Active"
        />
        <Select value={selectedModule} onValueChange={(val) => { setSelectedModule(val); setCategorySearchTerm("") }}>
          <SelectTrigger className="w-[260px] h-12">
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {availableModules.map((mod) => (
              <SelectItem key={mod} value={mod}>{mod}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(CATEGORY_CONFIG) as StudentCategory[]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat]
          const count = categoryCounts[cat]
          const isActive = activeCategory === cat
          return (
            <Card
              key={cat}
              className={`cursor-pointer transition-all ${isActive ? "ring-2 ring-primary shadow-md" : "hover:bg-muted"}`}
              onClick={() => { setActiveCategory(cat); setCategorySearchTerm("") }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className={`p-2 rounded-full ${cfg.bgColor}`}>
                    {CATEGORY_ICONS[cat]}
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {cfg.responsible}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {cfg.label}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{cfg.description}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabbed table */}
      <Card className="border bg-card rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-xl font-semibold">Category Details</CardTitle>
          <CardDescription>
            AD = Academic Director &middot; HOD = Head of Department
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs
            value={activeCategory}
            onValueChange={(val) => { setActiveCategory(val as StudentCategory); setCategorySearchTerm("") }}
          >
            <TabsList className="mb-4 w-full justify-start flex-wrap h-auto gap-1 p-1">
              {(Object.keys(CATEGORY_CONFIG) as StudentCategory[]).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat]
                return (
                  <TabsTrigger key={cat} value={cat} className="gap-2">
                    <span>{cfg.label}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {cfg.responsible}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 ml-1">
                      {categoryCounts[cat]}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {(Object.keys(CATEGORY_CONFIG) as StudentCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat]
              return (
                <TabsContent key={cat} value={cat}>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, number, or email..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {categorizedStudents.length} student{categorizedStudents.length !== 1 ? "s" : ""}
                    </div>
                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm font-medium">{selectedIds.size} selected</span>
                        <Button size="sm" onClick={() => setShowSendMessage(true)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setShowSendRiskNote(true)}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Send Risk Note
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto max-h-[70vh]">
                      <Table>
                        <TableHeader>
                          <TableRow className={cfg.headerBg}>
                            <TableHead className="w-10 sticky left-0 z-10 bg-inherit">
                              <Checkbox
                                checked={allPageSelected}
                                onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                aria-label="Select all on page"
                                {...(somePageSelected && !allPageSelected ? { "data-state": "indeterminate" } : {})}
                              />
                            </TableHead>
                            <TableHead className="font-semibold min-w-[180px]">Registered Student</TableHead>
                            <TableHead className="font-semibold min-w-[120px]">Student No.</TableHead>
                            <TableHead className="font-semibold min-w-[220px]">Student Email</TableHead>
                            <TableHead className="font-semibold min-w-[220px]">Academic Status / SODS</TableHead>
                            <TableHead className="font-semibold min-w-[280px]">Academic Progress</TableHead>
                            <TableHead className="font-semibold min-w-[80px] text-center">Lect. Att. %</TableHead>
                            <TableHead className="font-semibold min-w-[80px] text-center">Ind. Assign.</TableHead>
                            <TableHead className="font-semibold min-w-[80px] text-center">Group Work</TableHead>
                            <TableHead className="font-semibold min-w-[60px] text-center">S1</TableHead>
                            {TUTORIAL_DATES.map((td, i) => (
                              <TableHead key={i} className="font-semibold min-w-[130px] text-center">
                                <div className="text-xs leading-tight">Tutorial {i + 1}</div>
                                <div className="text-[10px] text-muted-foreground leading-tight">{td.date}</div>
                                <div className="text-[10px] text-muted-foreground leading-tight">{td.time}</div>
                              </TableHead>
                            ))}
                            <TableHead className="font-semibold min-w-[140px] text-center bg-orange-100 dark:bg-orange-900/40">
                              <div className="text-xs leading-tight">Online Study/Tutor</div>
                            </TableHead>
                            <TableHead className="font-semibold min-w-[140px] text-center bg-orange-100 dark:bg-orange-900/40">
                              <div className="text-xs leading-tight">Contact Smartphone</div>
                            </TableHead>
                            <TableHead className="font-semibold min-w-[160px] text-center bg-sky-100 dark:bg-sky-900/40">
                              <div className="text-xs leading-tight">Usage Study Style</div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={21} className="text-center py-8 text-muted-foreground">
                                No students found
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedStudents.map((student, idx) => (
                              <TableRow
                                key={student.id}
                                className={`transition-colors ${selectedIds.has(student.id) ? "bg-primary/5" : idx % 2 === 0 ? cfg.bgColor + "/30" : "bg-background"}`}
                              >
                                <TableCell className="sticky left-0 z-10 bg-inherit">
                                  <Checkbox
                                    checked={selectedIds.has(student.id)}
                                    onCheckedChange={(checked) => toggleSelect(student.id, !!checked)}
                                    aria-label={`Select ${student.name}`}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell className="font-mono text-sm">{student.studentNumber}</TableCell>
                                <TableCell className="text-sm">{student.email}</TableCell>
                                <TableCell>
                                  {student.academicStatus ? (
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                      {student.academicStatus}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">--</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs">{student.academicProgress}</TableCell>
                                <TableCell className="text-center">
                                  {student.lectureAttendance > 0 ? (
                                    <span className={`font-medium ${student.lectureAttendance < 50 ? "text-red-600 dark:text-red-400" : student.lectureAttendance < 75 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                                      {student.lectureAttendance}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {student.individualAssignments > 0 ? student.individualAssignments : <span className="text-muted-foreground">0</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                  {student.groupWork > 0 ? student.groupWork : <span className="text-muted-foreground">0</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                  {student.s1Score > 0 ? student.s1Score : <span className="text-muted-foreground">0</span>}
                                </TableCell>
                                {student.tutorials.map((tut, i) => (
                                  <TableCell key={i} className="text-center text-xs">
                                    {tut ? (
                                      <span className={`px-1.5 py-0.5 rounded ${tut.duration === "Present" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                                        {tut.duration}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">--</span>
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell className="text-center text-xs bg-orange-50/50 dark:bg-orange-900/10">
                                  {student.onlineStudyDate ? (
                                    <span className={`px-1.5 py-0.5 rounded ${student.onlineStudyDate === "Present" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : ""}`}>
                                      {student.onlineStudyDate}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">--</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center text-xs bg-orange-50/50 dark:bg-orange-900/10">
                                  {student.contactSmartphone || <span className="text-muted-foreground">--</span>}
                                </TableCell>
                                <TableCell className="text-center text-xs bg-sky-50/50 dark:bg-sky-900/10">
                                  {student.usageStudyStyle ? (
                                    <span className={`px-1.5 py-0.5 rounded ${student.usageStudyStyle.startsWith("Pres") ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : ""}`}>
                                      {student.usageStudyStyle}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">--</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, categorizedStudents.length)} of {categorizedStudents.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            if (totalPages <= 7) return true
                            if (p === 1 || p === totalPages) return true
                            return Math.abs(p - currentPage) <= 2
                          })
                          .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis")
                            acc.push(p)
                            return acc
                          }, [])
                          .map((item, i) =>
                            item === "ellipsis" ? (
                              <span key={`e${i}`} className="px-1 text-muted-foreground text-sm">...</span>
                            ) : (
                              <Button
                                key={item}
                                variant={currentPage === item ? "default" : "outline"}
                                size="icon"
                                className="h-8 w-8 text-xs"
                                onClick={() => setCurrentPage(item as number)}
                              >
                                {item}
                              </Button>
                            )
                          )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      <SendMessageDialog
        open={showSendMessage}
        onOpenChange={setShowSendMessage}
        selectedStudents={selectedAsLearners}
      />
      <SendRiskNoteDialog
        open={showSendRiskNote}
        onOpenChange={setShowSendRiskNote}
        selectedStudents={selectedAsLearners}
      />
    </div>
  )
}
