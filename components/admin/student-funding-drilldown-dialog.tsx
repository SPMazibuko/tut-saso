"use client"

import { GraduationCap, DollarSign } from "lucide-react"
import type { Learner } from "@/lib/types"
import {
  StudentBreakdownDrilldownDialog,
  type Segment,
} from "@/components/admin/student-breakdown-drilldown-dialog"

interface StudentFundingDrilldownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Learner[]
  data: { nsfas: number; selfFunded: number }
}

function renderStudentDetail(learner: Learner) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Student summary</h3>
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Credits</p>
          <p className="font-medium text-foreground">
            {learner.registeredCredits != null && learner.requiredCredits != null
              ? `${learner.registeredCredits} / ${learner.requiredCredits}`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  )
}

export function StudentFundingDrilldownDialog({
  open,
  onOpenChange,
  students,
  data,
}: StudentFundingDrilldownDialogProps) {
  const segments: Segment[] = [
    {
      id: "nsfas",
      label: "Bursary/NSFAS",
      count: data.nsfas,
      filter: (s) => s.fundingType === "nsfas",
    },
    {
      id: "self",
      label: "Self Funded",
      count: data.selfFunded,
      filter: (s) => s.fundingType === "self",
    },
  ]

  return (
    <StudentBreakdownDrilldownDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Student Funding"
      subtitle={`${students.length} total students`}
      segments={segments}
      students={students}
      renderStudentDetail={renderStudentDetail}
      segmentIcon={<GraduationCap className="h-5 w-5 text-primary" />}
    />
  )
}
