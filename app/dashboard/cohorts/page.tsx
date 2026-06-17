"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudents } from "@/lib/data-service"
import type { Learner } from "@/lib/types"

export default function CohortsPage() {
  const [students, setStudents] = useState<Learner[]>([])
  useEffect(() => setStudents(getStudents()), [])

  const byGrade = students.reduce<Record<string, Learner[]>>((acc, s) => {
    acc[s.grade] = acc[s.grade] || []
    acc[s.grade].push(s)
    return acc
  }, {})

  // Identify bottleneck subjects placeholder (using APS as proxy)
  const bottlenecks = Object.entries(byGrade)
    .map(([grade, list]) => ({ grade, lowApsPct: Math.round((list.filter((s) => s.aps < 2.5).length / list.length) * 100) }))
    .sort((a, b) => b.lowApsPct - a.lowApsPct)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cohorts & Bottlenecks</h1>
        <p className="text-muted-foreground">Track cohorts and identify risk hot-spots</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculties Overview</CardTitle>
          <CardDescription>Students per faculty and low-APS share</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(byGrade)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([grade, list]) => {
                const lowAps = Math.round((list.filter((s) => s.aps < 2.5).length / list.length) * 100)
                return (
                  <div key={grade} className="p-3 rounded-lg border bg-card">
                    <p className="font-medium">Faculty {grade}</p>
                    <p className="text-sm text-muted-foreground">Students: {list.length}</p>
                    <p className="text-sm">Low APS: {lowAps}%</p>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Potential Bottlenecks</CardTitle>
          <CardDescription>Faculties with higher concentration of low APS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bottlenecks.map((b) => (
              <div key={b.grade} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <span className="text-sm">Faculty {b.grade}</span>
                <span className="text-sm">Low APS: {b.lowApsPct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


