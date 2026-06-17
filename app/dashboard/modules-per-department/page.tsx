import { ModulesPerDepartmentGrid } from "@/components/admin/modules-per-department-grid"
import { PageHeader } from "@/components/page-header"


export default function ModulesPerDepartmentPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Modules Per Department"
        description="View and manage modules organized by department"
      />
      
      <ModulesPerDepartmentGrid />
    </div>
  )
}
