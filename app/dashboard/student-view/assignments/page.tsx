"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, FileText, Upload } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { getStudentAssignments, getStudentViewModules } from "@/lib/student-view-data"

function getDaysUntilDue(dueDate: Date) {
  const today = new Date()
  const diff = dueDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function statusBadge(status: string, dueDate: Date) {
  if (status === "graded") return <Badge>Graded</Badge>
  if (status === "submitted") return <Badge variant="secondary">Submitted</Badge>
  const days = getDaysUntilDue(dueDate)
  if (days < 0) return <Badge variant="destructive">Overdue</Badge>
  if (days <= 3) return <Badge variant="destructive">Due Soon</Badge>
  return <Badge variant="outline">Pending</Badge>
}

export default function StudentAssignmentsPage() {
  const modules = useMemo(() => getStudentViewModules(), [])
  const assignments = useMemo(() => getStudentAssignments(modules), [modules])

  const pending = assignments.filter((a) => a.status === "pending")
  const submitted = assignments.filter((a) => a.status === "submitted")
  const graded = assignments.filter((a) => a.status === "graded")

  const AssignmentCard = ({ assignment }: { assignment: (typeof assignments)[0] }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <CardDescription>
              {assignment.moduleCode} — {assignment.moduleName}
            </CardDescription>
          </div>
          {statusBadge(assignment.status, assignment.dueDate)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {assignment.type}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Due {assignment.dueDate.toLocaleDateString("en-ZA")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {assignment.maxMarks} marks
          </span>
        </div>
        {assignment.status === "graded" && assignment.obtainedMarks !== undefined && (
          <p className="text-sm font-medium">Obtained: {assignment.obtainedMarks}%</p>
        )}
        {assignment.status === "pending" && (
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Submit Assignment
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <StudentViewLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assignments & Assessments</h1>
          <p className="text-muted-foreground">
            Continuous assessment tasks across your registered TUT modules
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submitted.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-4 mt-4">
            {pending.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </TabsContent>
          <TabsContent value="submitted" className="space-y-4 mt-4">
            {submitted.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </TabsContent>
          <TabsContent value="graded" className="space-y-4 mt-4">
            {graded.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </StudentViewLayout>
  )
}
