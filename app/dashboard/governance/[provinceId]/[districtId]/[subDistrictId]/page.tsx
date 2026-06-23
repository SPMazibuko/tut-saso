"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSchoolsBySubDistrict, getSubDistrictById } from "@/lib/governance"

export default function SubDistrictPage({ params }: { params: { provinceId: string; districtId: string; subDistrictId: string } }) {
  const subDistrict = getSubDistrictById(params.subDistrictId)
  if (!subDistrict) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Sub-district not found.</p>
      </div>
    )
  }

  const schools = getSchoolsBySubDistrict(subDistrict.id)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{subDistrict.name}</h1>
        <p className="text-muted-foreground">Schools in {subDistrict.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>List of schools in this sub-district</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((s) => (
              <div key={s.id} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    {/* <p className="text-xs text-muted-foreground">APS: {s.stats.averageAPS.toFixed(2)}</p> */}
                  </div>
                  <span className="text-sm">At Risk: {s.stats.atRiskStudents}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
