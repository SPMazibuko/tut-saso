import { ProbationExclusionAnalysis } from "@/components/admin/probation-exclusion-analysis"
import { PageHeader } from "@/components/page-header"


export default function ProbationExclusionAnalysisPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Probation & Exclusion Analysis"
        description="Comprehensive analysis of student probation and exclusion data with interactive visualizations and filtering"
      />
      
      <ProbationExclusionAnalysis />
    </div>
  )
}
