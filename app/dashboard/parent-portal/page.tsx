"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudents } from "@/lib/data-service"
import type { Learner } from "@/lib/types"

export default function ParentPortalPage() {
  const [students, setStudents] = useState<Learner[]>([])
  useEffect(() => setStudents(getStudents()), [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parent Portal</h1>
        <p className="text-muted-foreground">View your child's progress, attendance, and support</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {students.slice(0, 2).map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              <CardDescription>Faculty {s.grade} • Student ID {s.studentId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <p className="text-sm text-muted-foreground">APS</p>
                  <p className="text-2xl font-semibold">{s.aps.toFixed(2)}</p>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-2xl font-semibold">{s.attendanceRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk</p>
                  <p className="text-2xl font-semibold capitalize">{s.riskLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


