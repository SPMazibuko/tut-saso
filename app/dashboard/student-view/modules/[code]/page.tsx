"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, MapPin, GraduationCap, Calendar, FileText } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { getStudentModuleByCode } from "@/lib/student-view-data"

function riskVariant(risk: string) {
  if (risk === "Good") return "default"
  if (risk === "At Risk") return "destructive"
  return "secondary"
}

export default function StudentModuleDetailPage() {
  const params = useParams()
  const code = String(params.code ?? "")
  const mod = useMemo(() => getStudentModuleByCode(code), [code])

  if (!mod) {
    return (
      <StudentViewLayout>
        <div className="space-y-4">
          <Link href="/dashboard/student-view/modules">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to modules
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Module {code} not found.
            </CardContent>
          </Card>
        </div>
      </StudentViewLayout>
    )
  }

  const assessments = [
    { name: "Assignment 1", weight: 15, mark: Math.min(100, (mod.currentMark ?? 0) + 4) },
    { name: "Class Test 1", weight: 20, mark: Math.min(100, (mod.currentMark ?? 0) - 2) },
    { name: "Written Report", weight: 15, mark: Math.min(100, (mod.currentMark ?? 0) + 1) },
    { name: "Examination", weight: 50, mark: mod.currentMark ?? 0 },
  ]

  return (
    <StudentViewLayout>
      <div className="space-y-6 max-w-4xl">
        <Link href="/dashboard/student-view/modules">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to modules
          </Button>
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold font-mono">{mod.code}</h1>
            <Badge variant={riskVariant(mod.riskLevel)}>{mod.riskLevel}</Badge>
            <Badge variant="outline">{mod.status}</Badge>
          </div>
          <p className="text-lg text-muted-foreground">{mod.name}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Module Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{mod.qualificationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{mod.campus}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{mod.lecturer}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{mod.semester} · Block {mod.blockCode}</span>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{mod.department}</Badge>
                <Badge variant="outline">{mod.credits} credit points</Badge>
                <Badge variant="outline">NQF Level {mod.nqfLevel}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Current semester progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Current mark</span>
                  <span className="font-bold text-lg">{mod.currentMark}%</span>
                </div>
                <Progress value={mod.currentMark ?? 0} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Attendance</span>
                  <span className="font-bold text-lg">{mod.attendanceRate}%</span>
                </div>
                <Progress value={mod.attendanceRate} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessment Breakdown
            </CardTitle>
            <CardDescription>TUT standard continuous assessment model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessments.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Weight: {item.weight}%</p>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{item.mark}%</span>
                    </div>
                    <Progress value={item.mark} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentViewLayout>
  )
}
