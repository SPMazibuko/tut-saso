"use client"

import { Building2, Home } from "lucide-react"
import type { Learner } from "@/lib/types"
import {
  StudentBreakdownDrilldownDialog,
  type Segment,
} from "@/components/admin/student-breakdown-drilldown-dialog"

interface AtRiskResidencyDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Learner[]
  data: { onCampus: number; offCampus: number }
}

function renderStudentDetail(learner: Learner) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">At-risk student summary</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Residency</p>
          <p className="font-medium text-foreground">
            {learner.residency === "onCampus" ? "On campus" : learner.residency === "offCampus" ? "Off campus" : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Funding type</p>
          <p className="font-medium text-foreground capitalize">{learner.fundingType ?? "—"}</p>
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

export function AtRiskResidencyDrilldownDialog({
  open,
  onOpenChange,
  students,
  data,
}: AtRiskResidencyDrilldownDialogProps) {
  const atRisk = students.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory")

  const segments: Segment[] = [
    {
      id: "onCampus",
      label: "On Campus",
      count: data.onCampus,
      filter: (s) => s.residency === "onCampus",
    },
    {
      id: "offCampus",
      label: "Off Campus",
      count: data.offCampus,
      filter: (s) => s.residency === "offCampus",
    },
  ]

  return (
    <StudentBreakdownDrilldownDialog
      open={open}
      onOpenChange={onOpenChange}
      title="At-Risk Students Residency"
      subtitle={`${atRisk.length} at-risk students`}
      segments={segments}
      students={atRisk}
      renderStudentDetail={renderStudentDetail}
      segmentIcon={<Building2 className="h-5 w-5 text-primary" />}
    />
  )
}
