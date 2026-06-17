"use client"

import { GraduationCap } from "lucide-react"
import type { Learner } from "@/lib/types"
import {
  StudentBreakdownDrilldownDialog,
  type Segment,
} from "@/components/admin/student-breakdown-drilldown-dialog"

interface AtRiskFundingDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Learner[]
  data: { selfFunded: number; nsfas: number }
}

function renderStudentDetail(learner: Learner) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">At-risk student summary</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Funding type</p>
          <p className="font-medium text-foreground capitalize">{learner.fundingType ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Residency</p>
          <p className="font-medium text-foreground">
            {learner.residency === "onCampus" ? "On campus" : learner.residency === "offCampus" ? "Off campus" : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk level</p>
          <p className="font-medium text-foreground">{learner.riskLevel ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Probation</p>
          <p className="font-medium text-foreground">{learner.isOnProbation ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  )
}

export function AtRiskFundingDrilldownDialog({
  open,
  onOpenChange,
  students,
  data,
}: AtRiskFundingDrilldownDialogProps) {
  const atRisk = students.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory")

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
      title="At-Risk Students Funding"
      subtitle={`${atRisk.length} at-risk students`}
      segments={segments}
      students={atRisk}
      renderStudentDetail={renderStudentDetail}
      segmentIcon={<GraduationCap className="h-5 w-5 text-primary" />}
    />
  )
}
