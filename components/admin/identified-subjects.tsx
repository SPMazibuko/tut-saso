"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, BookOpenCheck, GraduationCap } from "lucide-react"

interface IdentifiedSubjectsProps {
  data: {
    departmentSubjects: number
    supportedSubjects: number
    totalSubjects: number
  }
}

export function IdentifiedSubjects({ data }: IdentifiedSubjectsProps) {
  const items = [
    {
      label: "Department Subjects",
      value: data.departmentSubjects,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Supported Subjects",
      value: data.supportedSubjects,
      icon: BookOpenCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Subjects",
      value: data.totalSubjects,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identified Subjects</CardTitle>
        <CardDescription>Subject identification statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${item.bgColor}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-2xl font-bold">{item.value}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

