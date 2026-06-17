"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDistrictsByProvince, getProvinceById } from "@/lib/governance"
import Link from "next/link"

export default function ProvincePage({ params }: { params: { provinceId: string } }) {
  const province = getProvinceById(params.provinceId)
  if (!province) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Province not found.</p>
      </div>
    )
  }

  const districts = getDistrictsByProvince(province.id)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{province.name}</h1>
        <p className="text-muted-foreground">Districts in {province.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Districts</CardTitle>
          <CardDescription>Select a district to view sub-districts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map((d) => (
              <Link key={d.id} href={`/dashboard/governance/${province.id}/${d.id}`} className="p-3 rounded-lg border bg-card hover:bg-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">Schools: {d.schools}</p>
                  </div>
                  <span className="text-sm">At Risk: {d.stats.atRiskStudents}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}