"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpenCheck, BookOpen, X } from "lucide-react"

interface SupportedSubjectsPerDepartmentProps {
  data: Array<{ name: string; count: number }>
  selectedDepartment?: string
  breakdown?: {
    supportedBySchool: number
    supportedByDepartment: number
    notSupported: number
  }
}

export function SupportedSubjectsPerDepartment({
  data,
  selectedDepartment,
  breakdown,
}: SupportedSubjectsPerDepartmentProps) {
  if (selectedDepartment && breakdown) {
    const total =
      breakdown.supportedBySchool +
      breakdown.supportedByDepartment +
      breakdown.notSupported

    return (
      <Card>
        <CardHeader>
          <CardTitle>Supported Subjects - {selectedDepartment}</CardTitle>
          <CardDescription>Subject support breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Supported by School</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">
                    {breakdown.supportedBySchool}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({total > 0 ? ((breakdown.supportedBySchool / total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <Progress
                value={total > 0 ? (breakdown.supportedBySchool / total) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Supported by Department</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">
                    {breakdown.supportedByDepartment}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({total > 0 ? ((breakdown.supportedByDepartment / total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <Progress
                value={total > 0 ? (breakdown.supportedByDepartment / total) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Not Supported</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{breakdown.notSupported}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({total > 0 ? ((breakdown.notSupported / total) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              </div>
              <Progress
                value={total > 0 ? (breakdown.notSupported / total) * 100 : 0}
                className="h-2"
              />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Subjects</span>
                <span className="text-lg font-bold">{total}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supported Subjects Per Department</CardTitle>
        <CardDescription>Select a department to view breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-lg font-bold">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

