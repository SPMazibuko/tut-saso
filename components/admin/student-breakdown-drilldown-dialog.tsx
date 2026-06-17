"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, User } from "lucide-react"
import type { Learner } from "@/lib/types"
import { cn } from "@/lib/utils"

export type View = "segments" | "students" | "student-detail"

export interface Segment {
  id: string
  label: string
  count: number
  filter: (s: Learner) => boolean
}

export interface StudentBreakdownDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  segments: Segment[]
  students: Learner[]
  renderStudentDetail: (learner: Learner) => React.ReactNode
  segmentIcon?: React.ReactNode
  /** If set, dialog will preselect this segment when opened. */
  initialSegmentId?: string
  /** If set with `initialSegmentId`, dialog will start in this view (defaults to "students"). */
  initialView?: View
}

function Breadcrumb({ steps }: { steps: { label: string; short?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
          <span className={i === steps.length - 1 ? "font-medium text-foreground" : ""}>
            {step.short ?? step.label}
          </span>
        </span>
      ))}
    </nav>
  )
}

export function StudentBreakdownDrilldownDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  segments,
  students,
  renderStudentDetail,
  segmentIcon,
  initialSegmentId,
  initialView,
}: StudentBreakdownDrilldownDialogProps) {
  const [view, setView] = useState<View>("segments")
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Learner | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStudents = selectedSegment
    ? students.filter((s) => selectedSegment.filter(s))
    : []
  const searchedStudents = searchQuery.trim()
    ? filteredStudents.filter((s) => {
        const q = searchQuery.toLowerCase()
        const full = `${s.name} ${s.surname} ${s.studentNumber} ${s.email}`.toLowerCase()
        return full.includes(q)
      })
    : filteredStudents

  const resetView = useCallback(() => {
    setView("segments")
    setSelectedSegment(null)
    setSelectedStudent(null)
    setSearchQuery("")
  }, [])

  useEffect(() => {
    if (!open) resetView()
  }, [open, resetView])

  useEffect(() => {
    if (!open) return
    if (!initialSegmentId) return

    const seg = segments.find((s) => s.id === initialSegmentId)
    if (!seg) return

    setSelectedSegment(seg)
    setSelectedStudent(null)
    setSearchQuery("")
    setView(initialView ?? "students")
  }, [open, initialSegmentId, initialView, segments])

  const handleSegmentClick = useCallback((seg: Segment) => {
    setSelectedSegment(seg)
    setView("students")
    setSelectedStudent(null)
    setSearchQuery("")
  }, [])

  const handleStudentClick = useCallback((s: Learner) => {
    setSelectedStudent(s)
    setView("student-detail")
  }, [])

  const goBack = useCallback(() => {
    if (view === "student-detail") {
      setView("students")
      setSelectedStudent(null)
    } else if (view === "students") {
      setView("segments")
      setSelectedSegment(null)
    }
  }, [view])

  const breadcrumbSteps =
    view === "segments"
      ? [{ label: title }]
      : view === "students" && selectedSegment
        ? [{ label: title, short: title }, { label: selectedSegment.label }]
        : view === "student-detail" && selectedStudent
          ? [
              { label: title, short: title },
              { label: selectedSegment?.label ?? "", short: selectedSegment?.label ?? "" },
              { label: `${selectedStudent.name} ${selectedStudent.surname}` },
            ]
          : [{ label: title }]

  const displayTitle =
    view === "segments"
      ? title
      : view === "students" && selectedSegment
        ? selectedSegment.label
        : view === "student-detail" && selectedStudent
          ? `${selectedStudent.name} ${selectedStudent.surname}`
          : title

  const displaySubtitle =
    view === "segments"
      ? subtitle
      : view === "students" && selectedSegment
        ? `${selectedSegment.count} student${selectedSegment.count !== 1 ? "s" : ""}`
        : view === "student-detail" && selectedStudent
          ? selectedStudent.studentNumber
          : subtitle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[88vh] overflow-hidden flex flex-col gap-4 p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b bg-muted/30 space-y-1">
          <div className="flex items-start gap-3">
            {(view === "students" || view === "student-detail") && (
              <Button
                variant="outline"
                size="icon"
                onClick={goBack}
                aria-label="Back"
                className="shrink-0 mt-0.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <Breadcrumb steps={breadcrumbSteps} />
              <DialogTitle className="text-lg mt-1.5 font-semibold truncate">{displayTitle}</DialogTitle>
              {displaySubtitle && (
                <DialogDescription className="text-sm mt-0.5">{displaySubtitle}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
          {view === "segments" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a category to view the student list.
              </p>
              <ul className="space-y-2">
                {segments.map((seg) => (
                  <li key={seg.id}>
                    <button
                      type="button"
                      onClick={() => handleSegmentClick(seg)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                        "bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                      )}
                    >
                      {segmentIcon ? (
                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {segmentIcon}
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground">{seg.label}</span>
                      </div>
                      <span className="text-lg font-bold text-foreground">{seg.count}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === "students" && selectedSegment && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, student number, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed bg-muted/20 text-center">
                  <User className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No students found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery.trim() ? "Try a different search." : "No students in this category."}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {searchedStudents.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => handleStudentClick(s)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                          "bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                        )}
                      >
                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-foreground block">
                            {s.name} {s.surname}
                          </span>
                          <span className="text-sm text-muted-foreground">{s.studentNumber}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {view === "student-detail" && selectedStudent && (
            <div className="space-y-4">{renderStudentDetail(selectedStudent)}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
