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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, BookOpen, Calendar, BarChart3, Loader2, User, Users, GraduationCap, HelpCircle, Search } from "lucide-react"
import {
  getModulesByDepartment,
  type MockIdentifiedModule,
  type ModuleSupport,
} from "@/lib/mock/module-identification"
import type { AttendanceSession } from "@/lib/attendance/types"
import { cn } from "@/lib/utils"

type View = "modules" | "module-detail" | "session-analytics"

interface SessionAnalyticsData {
  sessionId: string
  totalQuestions: number
  totalResponses: number
  answerRatios: {
    correctPercentage: number
    incorrectPercentage: number
    byOption: Array<{
      option: string
      label?: string
      count: number
      percentage: number
      correct: boolean
    }>
  }
  mostMissedQuestions: Array<{
    questionIndex: number
    questionText: string
    correctOption: string
    totalAnswered: number
    correctCount: number
    incorrectCount: number
    correctPercentage: number
    topWrongOption: string
    topWrongCount: number
  }>
  questions: Array<{
    questionIndex: number
    questionText: string
    correctOption: string
    totalAnswered: number
    correctCount: number
    incorrectCount: number
    correctPercentage: number
    options: Array<{
      option: string
      label?: string
      count: number
      percentage: number
      correct: boolean
    }>
  }>
}

interface SessionStats {
  attendedCount: number
  totalQuestions: number
  totalResponses: number
  registeredCount: number
  participantsCount: number
  probationCount: number
  readmittedCount: number
}

interface SessionRosterRow {
  studentId: number
  studentNumber: string
  studentName: string
  attended: boolean
  attemptedQuestions: number
  attemptedPct: number
  participant: boolean
  isOnProbation: boolean
  isReadmitted: boolean
}

interface ModuleSupportDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: string
  category: ModuleSupport
}

const CATEGORY_LABELS: Record<ModuleSupport, string> = {
  saso: "Supported by SASO",
  department: "Supported by Department",
  none: "Not Supported",
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

export function ModuleSupportDrilldownDialog({
  open,
  onOpenChange,
  department,
  category,
}: ModuleSupportDrilldownDialogProps) {
  const [view, setView] = useState<View>("modules")
  const [selectedModule, setSelectedModule] = useState<MockIdentifiedModule | null>(null)
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionStatsById, setSessionStatsById] = useState<Record<string, SessionStats>>({})
  const [analytics, setAnalytics] = useState<SessionAnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [roster, setRoster] = useState<SessionRosterRow[]>([])
  const [rosterTotals, setRosterTotals] = useState<{
    registeredCount: number
    attendedCount: number
    participantsCount: number
    probationCount: number
    readmittedCount: number
  } | null>(null)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [sessionTab, setSessionTab] = useState<"questions" | "students">("questions")
  const [rosterFilterAttendance, setRosterFilterAttendance] = useState<"all" | "attended" | "absent">("all")
  const [rosterFilterParticipant, setRosterFilterParticipant] = useState<"all" | "participants" | "non-participants">("all")
  const [rosterFilterProbation, setRosterFilterProbation] = useState<"all" | "probation">("all")
  const [rosterFilterReadmitted, setRosterFilterReadmitted] = useState<"all" | "readmitted">("all")
  const [rosterSearch, setRosterSearch] = useState("")

  const allModules = getModulesByDepartment(department)
  const modules = allModules.filter((m) => m.support === category)

  const resetView = useCallback(() => {
    setView("modules")
    setSelectedModule(null)
    setSelectedSession(null)
    setSessions([])
    setSessionStatsById({})
    setAnalytics(null)
    setExpandedQuestion(null)
    setRoster([])
    setRosterTotals(null)
    setSessionTab("questions")
    setRosterFilterAttendance("all")
    setRosterFilterParticipant("all")
    setRosterFilterProbation("all")
    setRosterFilterReadmitted("all")
    setRosterSearch("")
  }, [])

  useEffect(() => {
    if (!open) resetView()
  }, [open, resetView])

  const handleModuleClick = useCallback((mod: MockIdentifiedModule) => {
    setSelectedModule(mod)
    setView("module-detail")
    setSessions([])
    setSelectedSession(null)
    setSessionStatsById({})
    setAnalytics(null)
    setExpandedQuestion(null)
    setRoster([])
    setRosterTotals(null)
    setSessionsLoading(true)
    fetch(
      `/api/attendance/sessions?includeStats=1&department=${encodeURIComponent(department)}&moduleCode=${encodeURIComponent(mod.moduleCode)}`,
      { cache: "no-store" }
    )
      .then((res) => res.json())
      .then((data: { sessions?: AttendanceSession[]; statsBySessionId?: Record<string, SessionStats> }) => {
        setSessions(data.sessions ?? [])
        setSessionStatsById(data.statsBySessionId ?? {})
      })
      .finally(() => setSessionsLoading(false))
  }, [department])

  const handleSessionClick = useCallback((session: AttendanceSession) => {
    setSelectedSession(session)
    setView("session-analytics")
    setAnalytics(null)
    setRoster([])
    setRosterTotals(null)
    setSessionTab("questions")
    setAnalyticsLoading(true)
    setRosterLoading(true)
    setExpandedQuestion(null)
    Promise.all([
      fetch(`/api/classpoint/session-analytics?sessionId=${encodeURIComponent(session.id)}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: { success?: boolean; data?: SessionAnalyticsData }) => {
          if (data.success && data.data) setAnalytics(data.data)
        })
        .finally(() => setAnalyticsLoading(false)),
      fetch(`/api/attendance/session-roster?sessionId=${encodeURIComponent(session.id)}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data: { registered?: SessionRosterRow[]; totals?: { registeredCount: number; attendedCount: number; participantsCount: number; probationCount: number; readmittedCount: number } }) => {
          setRoster(data.registered ?? [])
          setRosterTotals(data.totals ?? null)
        })
        .finally(() => setRosterLoading(false)),
    ])
  }, [])

  const goBack = useCallback(() => {
    if (view === "session-analytics") {
      setView("module-detail")
      setSelectedSession(null)
      setAnalytics(null)
      setRoster([])
      setRosterTotals(null)
      setExpandedQuestion(null)
    } else if (view === "module-detail") {
      setView("modules")
      setSelectedModule(null)
      setSessions([])
      setSessionStatsById({})
    }
  }, [view])

  const breadcrumbSteps =
    view === "modules"
      ? [{ label: department }, { label: CATEGORY_LABELS[category] }]
      : view === "module-detail" && selectedModule
        ? [
            { label: department, short: department.length > 12 ? department.slice(0, 10) + "…" : department },
            { label: CATEGORY_LABELS[category], short: "Modules" },
            { label: selectedModule.moduleName },
          ]
        : view === "session-analytics" && selectedSession
          ? [
              { label: department, short: department.length > 12 ? department.slice(0, 10) + "…" : department },
              { label: selectedModule?.moduleName ?? "", short: selectedModule?.moduleCode ?? "" },
              { label: `Session — ${new Date(selectedSession.startedAt).toLocaleDateString()}` },
            ]
          : [{ label: department }, { label: CATEGORY_LABELS[category] }]

  const title =
    view === "modules"
      ? CATEGORY_LABELS[category]
      : view === "module-detail" && selectedModule
        ? selectedModule.moduleName
        : view === "session-analytics" && selectedSession
          ? `ClassPoint Q&A — ${selectedSession.moduleCode}`
          : CATEGORY_LABELS[category]

  const subtitle =
    view === "modules"
      ? `${department} · ${modules.length} module${modules.length !== 1 ? "s" : ""}`
      : view === "module-detail" && selectedModule
        ? `${selectedModule.moduleCode} · Semester ${selectedModule.semester}, ${selectedModule.year}`
        : view === "session-analytics" && selectedSession
          ? "Session · " + new Date(selectedSession.startedAt).toLocaleDateString()
          : department

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[88vh] overflow-hidden flex flex-col gap-4 p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b bg-muted/30 space-y-1">
          <div className="flex items-start gap-3">
            {(view === "module-detail" || view === "session-analytics") && (
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
              <DialogTitle className="text-lg mt-1.5 font-semibold truncate">{title}</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">{subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
          {view === "modules" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a module to view lecturer details and attendance sessions.
              </p>
              {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed bg-muted/20 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No modules in this category</p>
                  <p className="text-xs text-muted-foreground mt-1">There are no modules for this support type in {department}.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {modules.map((mod) => (
                    <li key={mod.moduleCode}>
                      <button
                        type="button"
                        onClick={() => handleModuleClick(mod)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                          "bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                        )}
                      >
                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-foreground">{mod.moduleCode}</span>
                          <span className="text-muted-foreground mx-2">·</span>
                          <span className="text-foreground">{mod.moduleName}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {view === "module-detail" && selectedModule && (
            <div className="space-y-6">
              <section className="rounded-xl border bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Module details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lecturer</p>
                      <p className="font-medium text-foreground">{selectedModule.lecturer.name}</p>
                    </div>
                  </div>
                  {selectedModule.tutors.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tutors</p>
                        <p className="text-sm text-foreground">{selectedModule.tutors.map((t) => t.name).join(", ")}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground pt-1">
                  Semester {selectedModule.semester}, {selectedModule.year}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  Attendance sessions
                </h3>
                {sessionsLoading ? (
                  <div className="flex items-center gap-3 py-10 rounded-xl border border-dashed bg-muted/20 justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading sessions…</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed bg-muted/20 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">No sessions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Sessions for this module will appear here once created.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {sessions.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => handleSessionClick(s)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                            "bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                          )}
                        >
                          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BarChart3 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-foreground block">
                              {new Date(s.startedAt).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                              <span>{sessionStatsById[s.id]?.registeredCount ?? 0} registered</span>
                              <span className="opacity-60">·</span>
                              <span>{sessionStatsById[s.id]?.attendedCount ?? 0} attended</span>
                              <span className="opacity-60">·</span>
                              <span>{sessionStatsById[s.id]?.participantsCount ?? 0} participants</span>
                              <span className="opacity-60">·</span>
                              <span>{sessionStatsById[s.id]?.probationCount ?? 0} probation</span>
                              <span className="opacity-60">·</span>
                              <span>{sessionStatsById[s.id]?.readmittedCount ?? 0} readmitted</span>
                              <span className="opacity-60">·</span>
                              <span>{sessionStatsById[s.id]?.totalQuestions ?? 0} questions</span>
                              <span className="opacity-60">·</span>
                              <span className="capitalize">{s.status}</span>
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {view === "session-analytics" && (
            <div className="space-y-6">
              {analyticsLoading && rosterLoading ? (
                <div className="flex items-center gap-3 py-16 rounded-xl border border-dashed bg-muted/20 justify-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading session data…</span>
                </div>
              ) : (
                <Tabs value={sessionTab} onValueChange={(v) => setSessionTab(v as "questions" | "students")} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                  </TabsList>

                  <TabsContent value="questions" className="space-y-6 mt-4">
                    {!analytics ? (
                      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed bg-muted/20 text-center">
                        <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium text-foreground">No analytics data</p>
                        <p className="text-xs text-muted-foreground mt-1">ClassPoint Q&A data is not available for this session.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-xl border bg-card p-5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total questions</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{analytics.totalQuestions}</p>
                          </div>
                          <div className="rounded-xl border bg-card p-5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total responses</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{analytics.totalResponses}</p>
                          </div>
                        </div>

                        <section className="rounded-xl border bg-card p-5">
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Answer ratio
                          </h3>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Correct: {analytics.answerRatios.correctPercentage.toFixed(1)}%
                            </span>
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              Incorrect: {analytics.answerRatios.incorrectPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            Questions
                          </h3>
                          {analytics.questions.length === 0 ? (
                            <div className="rounded-xl border border-dashed bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                              No question data for this session.
                            </div>
                          ) : (
                            <ul className="space-y-3">
                              {analytics.questions.map((q) => {
                                const open = expandedQuestion === q.questionIndex
                                return (
                                  <li key={q.questionIndex} className="rounded-xl border bg-card overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedQuestion(open ? null : q.questionIndex)}
                                      className={cn(
                                        "w-full text-left p-4 transition-colors",
                                        "hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Question {q.questionIndex}
                                          </p>
                                          <p className="mt-1.5 text-foreground">{q.questionText}</p>
                                          <p className="mt-2 text-sm text-muted-foreground">
                                            {q.totalAnswered} answers ·{" "}
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                              {q.correctPercentage.toFixed(0)}% correct
                                            </span>{" "}
                                            · Correct option:{" "}
                                            <span className="font-medium">{q.correctOption}</span>
                                          </p>
                                        </div>
                                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground shrink-0 mt-1 transition-transform", open && "rotate-90")} />
                                      </div>
                                    </button>

                                    {open && (
                                      <div className="border-t bg-muted/10 p-4">
                                        <div className="space-y-2">
                                          {q.options.map((opt) => (
                                            <div key={opt.option} className="flex items-center gap-3">
                                              <div
                                                className={cn(
                                                  "w-8 shrink-0 text-xs font-semibold rounded-md px-2 py-1 text-center",
                                                  opt.correct
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                    : "bg-background text-muted-foreground border"
                                                )}
                                              >
                                                {opt.option}
                                              </div>
                                              <div className="flex-1">
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                  <div
                                                    className={cn(
                                                      "h-full rounded-full",
                                                      opt.correct ? "bg-green-500" : "bg-primary/40"
                                                    )}
                                                    style={{ width: `${Math.min(100, Math.max(0, opt.percentage))}%` }}
                                                  />
                                                </div>
                                              </div>
                                              <div className="w-20 text-right text-xs text-muted-foreground tabular-nums">
                                                {opt.count} ({opt.percentage.toFixed(1)}%)
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </section>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="students" className="space-y-4 mt-4">
                    {rosterLoading ? (
                      <div className="flex items-center gap-3 py-16 rounded-xl border border-dashed bg-muted/20 justify-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading roster…</span>
                      </div>
                    ) : rosterTotals ? (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="rounded-xl border bg-card p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered</p>
                            <p className="text-xl font-bold text-foreground mt-1">{rosterTotals.registeredCount}</p>
                          </div>
                          <div className="rounded-xl border bg-card p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Attended</p>
                            <p className="text-xl font-bold text-foreground mt-1">{rosterTotals.attendedCount}</p>
                          </div>
                          <div className="rounded-xl border bg-card p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Participants</p>
                            <p className="text-xl font-bold text-foreground mt-1">{rosterTotals.participantsCount}</p>
                          </div>
                          <div className="rounded-xl border bg-card p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Probation</p>
                            <p className="text-xl font-bold text-foreground mt-1">{rosterTotals.probationCount}</p>
                          </div>
                          <div className="rounded-xl border bg-card p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Re-admitted</p>
                            <p className="text-xl font-bold text-foreground mt-1">{rosterTotals.readmittedCount}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative flex-1 min-w-[180px] max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by name or number…"
                              value={rosterSearch}
                              onChange={(e) => setRosterSearch(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={rosterFilterAttendance}
                              onChange={(e) => setRosterFilterAttendance(e.target.value as typeof rosterFilterAttendance)}
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="all">All attendance</option>
                              <option value="attended">Attended</option>
                              <option value="absent">Absent</option>
                            </select>
                            <select
                              value={rosterFilterParticipant}
                              onChange={(e) => setRosterFilterParticipant(e.target.value as typeof rosterFilterParticipant)}
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="all">All participants</option>
                              <option value="participants">Participants (&gt;50%)</option>
                              <option value="non-participants">Non-participants</option>
                            </select>
                            <select
                              value={rosterFilterProbation}
                              onChange={(e) => setRosterFilterProbation(e.target.value as typeof rosterFilterProbation)}
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="all">All</option>
                              <option value="probation">On probation</option>
                            </select>
                            <select
                              value={rosterFilterReadmitted}
                              onChange={(e) => setRosterFilterReadmitted(e.target.value as typeof rosterFilterReadmitted)}
                              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="all">All</option>
                              <option value="readmitted">Re-admitted</option>
                            </select>
                          </div>
                        </div>

                        {(() => {
                          const q = rosterSearch.trim().toLowerCase()
                          const filtered = roster.filter((r) => {
                            if (rosterFilterAttendance === "attended" && !r.attended) return false
                            if (rosterFilterAttendance === "absent" && r.attended) return false
                            if (rosterFilterParticipant === "participants" && !r.participant) return false
                            if (rosterFilterParticipant === "non-participants" && r.participant) return false
                            if (rosterFilterProbation === "probation" && !r.isOnProbation) return false
                            if (rosterFilterReadmitted === "readmitted" && !r.isReadmitted) return false
                            if (q && !r.studentName.toLowerCase().includes(q) && !r.studentNumber.toLowerCase().includes(q)) return false
                            return true
                          })
                          return (
                            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                              {filtered.map((r) => (
                                <li
                                  key={r.studentId}
                                  className="flex items-center gap-4 p-4 rounded-xl border bg-card text-left"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-foreground">{r.studentName}</p>
                                    <p className="text-sm text-muted-foreground">{r.studentNumber}</p>
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className={cn("rounded-md px-2 py-1", r.attended ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : "bg-muted text-muted-foreground")}>
                                      {r.attended ? "Attended" : "Absent"}
                                    </span>
                                    <span className={cn("rounded-md px-2 py-1", r.participant ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                                      {r.participant ? "Participant" : "Non-participant"}
                                    </span>
                                    {r.isOnProbation && <span className="rounded-md px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Probation</span>}
                                    {r.isReadmitted && <span className="rounded-md px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Re-admitted</span>}
                                    <span className="text-muted-foreground tabular-nums">
                                      {r.attended ? `${r.attemptedQuestions} attempted (${Math.round(r.attemptedPct)}%)` : "—"}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )
                        })()}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed bg-muted/20 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-sm font-medium text-foreground">No roster data</p>
                        <p className="text-xs text-muted-foreground mt-1">Roster is not available for this session.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
