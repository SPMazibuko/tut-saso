"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX } from "lucide-react"

interface ExclusionDepartmentData {
  name: string
  count: number
}

interface ExclusionPerDepartmentProps {
  data: ExclusionDepartmentData[]
}

export function ExclusionPerDepartment({ data }: ExclusionPerDepartmentProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">Exclusion Per Department</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {data.length > 0 ? (
            data.map((department) => (
              <div
                key={department.name}
                className="flex items-center justify-between rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50/30 p-3 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg">
                    <UserX className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{department.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{department.count}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <UserX className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No exclusion data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
