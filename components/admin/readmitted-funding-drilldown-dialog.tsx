"use client"

import { GraduationCap, AlertTriangle, LogOut } from "lucide-react"
import type { Learner } from "@/lib/types"
import {
  StudentBreakdownDrilldownDialog,
  type Segment,
} from "@/components/admin/student-breakdown-drilldown-dialog"

interface ReadmittedFundingDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Learner[]
  data: { selfFunded: number; nsfas: number }
}

const EVENT_LABELS = {
  fundingRemovedAt: "A. Funding removed/revoked",
  financiallyExcludedAt: "B. Financially excluded",
  droppedOutAt: "C. Dropped out",
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

function renderStudentDetail(learner: Learner) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Event timeline (A/B/C)</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <LogOut className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {EVENT_LABELS.fundingRemovedAt}
            </p>
            <p className="font-medium text-foreground">{formatDate(learner.fundingRemovedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {EVENT_LABELS.financiallyExcludedAt}
            </p>
            <p className="font-medium text-foreground">
              {learner.financiallyExcluded ? formatDate(learner.financiallyExcludedAt) : "Not applicable"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {EVENT_LABELS.droppedOutAt}
            </p>
            <p className="font-medium text-foreground">
              {learner.hasDroppedOut ? formatDate(learner.droppedOutAt) : "Not applicable"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReadmittedFundingDrilldownDialog({
  open,
  onOpenChange,
  students,
  data,
}: ReadmittedFundingDrilldownDialogProps) {
  const readmitted = students.filter((s) => s.isReadmitted === true)

  const segments: Segment[] = [
    {
      id: "self",
      label: "Self Funded",
      count: data.selfFunded,
      filter: (s) => s.fundingType === "self",
    },
    {
      id: "nsfas",
      label: "NSFAS/Bursary",
      count: data.nsfas,
      filter: (s) => s.fundingType === "nsfas",
    },
  ]

  return (
    <StudentBreakdownDrilldownDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Readmitted Students Funding"
      subtitle={`${readmitted.length} readmitted students`}
      segments={segments}
      students={readmitted}
      renderStudentDetail={renderStudentDetail}
      segmentIcon={<GraduationCap className="h-5 w-5 text-primary" />}
    />
  )
}
