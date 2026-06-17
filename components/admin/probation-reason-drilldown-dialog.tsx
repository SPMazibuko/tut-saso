"use client"

import { AlertTriangle, XCircle, BookOpen, FileQuestion } from "lucide-react"
import type { Learner } from "@/lib/types"
import {
  StudentBreakdownDrilldownDialog,
  type Segment,
} from "@/components/admin/student-breakdown-drilldown-dialog"

const REASON_LABELS: Record<string, string> = {
  module_cancellation: "Module Cancellation",
  low_credits: "Few modules registered",
  academic_performance: "Academic Performance",
  other: "Other",
}

const REASON_ICONS: Record<string, typeof AlertTriangle> = {
  module_cancellation: XCircle,
  low_credits: BookOpen,
  academic_performance: AlertTriangle,
  other: FileQuestion,
}

interface ProbationReasonDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Learner[]
  data: {
    module_cancellation: number
    low_credits: number
    academic_performance: number
    other: number
  }
}

function renderStudentDetail(learner: Learner) {
  const reason = learner.probationReason ?? "other"
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Probation details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reason</p>
          <p className="font-medium text-foreground">{REASON_LABELS[reason] ?? reason}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Credits registered</p>
          <p className="font-medium text-foreground">{learner.registeredCredits ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Required credits</p>
          <p className="font-medium text-foreground">{learner.requiredCredits ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk level</p>
          <p className="font-medium text-foreground">{learner.riskLevel ?? "—"}</p>
        </div>
      </div>
    </div>
  )
}

export function ProbationReasonDrilldownDialog({
  open,
  onOpenChange,
  students,
  data,
}: ProbationReasonDrilldownDialogProps) {
  const probationStudents = students.filter((s) => s.isOnProbation === true)

  const segments: Segment[] = [
    { id: "module_cancellation", label: REASON_LABELS.module_cancellation, count: data.module_cancellation, filter: (s) => (s.probationReason ?? "other") === "module_cancellation" },
    { id: "low_credits", label: REASON_LABELS.low_credits, count: data.low_credits, filter: (s) => (s.probationReason ?? "other") === "low_credits" },
    { id: "academic_performance", label: REASON_LABELS.academic_performance, count: data.academic_performance, filter: (s) => (s.probationReason ?? "other") === "academic_performance" },
    { id: "other", label: REASON_LABELS.other, count: data.other, filter: (s) => (s.probationReason ?? "other") === "other" },
  ]

  return (
    <StudentBreakdownDrilldownDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Probation by Reason"
      subtitle={`${probationStudents.length} students on probation`}
      segments={segments}
      students={probationStudents}
      renderStudentDetail={renderStudentDetail}
      segmentIcon={<AlertTriangle className="h-5 w-5 text-primary" />}
    />
  )
}
