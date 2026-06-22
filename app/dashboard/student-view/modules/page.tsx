"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Search, MapPin, Building2 } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { getStudentEnrollment, getStudentViewModules } from "@/lib/student-view-data"

function riskVariant(risk: string) {
  if (risk === "Good") return "default"
  if (risk === "At Risk") return "destructive"
  return "secondary"
}

export default function StudentModulesPage() {
  const [enrollment, setEnrollment] = useState(() => getStudentEnrollment())
  const [search, setSearch] = useState("")

  useEffect(() => {
    setEnrollment(getStudentEnrollment())
  }, [])

  const modules = useMemo(() => getStudentViewModules(), [enrollment.qualificationCode])
  const filtered = modules.filter((mod) => {
    const query = search.toLowerCase()
    return mod.code.toLowerCase().includes(query) || mod.name.toLowerCase().includes(query)
  })

  return (
    <StudentViewLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Modules</h1>
          <p className="text-muted-foreground">
            {modules.length} registered modules · {enrollment.department} · {enrollment.qualificationName} ·{" "}
            {new Date().getFullYear()} academic year
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold leading-tight">{enrollment.department}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.reduce((sum, m) => sum + m.credits, 0)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by module code or name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((mod) => (
            <Link key={mod.code} href={`/dashboard/student-view/modules/${mod.code}`}>
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="font-mono text-lg">{mod.code}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{mod.name}</CardDescription>
                    </div>
                    <Badge variant={riskVariant(mod.riskLevel)}>{mod.riskLevel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{mod.campus}</p>
                    <p>{mod.qualificationName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{mod.semester}</Badge>
                    <Badge variant="outline">{mod.credits} credits</Badge>
                    <Badge variant="outline">NQF {mod.nqfLevel}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Mark</span>
                      <span className="font-medium">{mod.currentMark}%</span>
                    </div>
                    <Progress value={mod.currentMark ?? 0} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No modules match your search criteria.
            </CardContent>
          </Card>
        )}
      </div>
    </StudentViewLayout>
  )
}
