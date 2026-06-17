"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, AlertTriangle, UserPlus } from "lucide-react"

interface Grade8UnitProps {
  data: {
    academicWarningRepeaters: number
    failedRepeaters: number
    newAcademicWarningFirstTime: number
    newFailedFirstTime: number
  }
}

export function Grade8Unit({ data }: Grade8UnitProps) {
  const items = [
    {
      label: "Academic Warning Repeaters",
      value: data.academicWarningRepeaters,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Failed Repeaters",
      value: data.failedRepeaters,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      label: "New Academic Warning (First Time)",
      value: data.newAcademicWarningFirstTime,
      icon: UserPlus,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "New Failed (First Time)",
      value: data.newFailedFirstTime,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Unit</CardTitle>
        <CardDescription>Faculty-based student statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className={`rounded-full p-2 ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

