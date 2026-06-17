"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDistrictById, getSubDistrictsByDistrict } from "@/lib/governance"
import Link from "next/link"

export default function DistrictPage({ params }: { params: { provinceId: string; districtId: string } }) {
  const district = getDistrictById(params.districtId)
  if (!district) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">District not found.</p>
      </div>
    )
  }

  const subDistricts = getSubDistrictsByDistrict(district.id)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{district.name}</h1>
        <p className="text-muted-foreground">Sub-districts in {district.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sub-districts</CardTitle>
          <CardDescription>Select a sub-district to view schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subDistricts.map((sd) => (
              <Link key={sd.id} href={`/dashboard/governance/${district.provinceId}/${district.id}/${sd.id}`} className="p-3 rounded-lg border bg-card hover:bg-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sd.name}</p>
                    <p className="text-xs text-muted-foreground">Schools: {sd.schools}</p>
                  </div>
                  <span className="text-sm">At Risk: {sd.stats.atRiskStudents}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
