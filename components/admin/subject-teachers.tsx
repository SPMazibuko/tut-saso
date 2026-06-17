"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface SubjectTeachersProps {
  count: number
}

export function SubjectTeachers({ count }: SubjectTeachersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Teachers</CardTitle>
        <CardDescription>Active subject teachers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="rounded-full p-4 bg-blue-100">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold">{count}</p>
            <p className="text-sm text-muted-foreground">Active teachers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

