"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAssignments } from "@/lib/mock-data"
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle, Upload } from "lucide-react"
import type { Assignment } from "@/lib/types"

export default function MyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    setAssignments(mockAssignments)
  }, [])

  const pendingAssignments = assignments.filter((a) => a.status === "pending")
  const submittedAssignments = assignments.filter((a) => a.status === "submitted")
  const gradedAssignments = assignments.filter((a) => a.status === "graded")

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (assignment: Assignment) => {
    switch (assignment.status) {
      case "pending":
        const daysLeft = getDaysUntilDue(assignment.dueDate)
        if (daysLeft < 0) return <Badge variant="destructive">Overdue</Badge>
        if (daysLeft <= 2) return <Badge variant="destructive">Due Soon</Badge>
        return <Badge variant="outline">Pending</Badge>
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>
      case "graded":
        return <Badge variant="default">Graded</Badge>
      default:
        return null
    }
  }

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
    const daysLeft = getDaysUntilDue(assignment.dueDate)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <CardDescription>{assignment.courseName}</CardDescription>
            </div>
            {getStatusBadge(assignment)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{assignment.description}</p>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
              {assignment.status === "pending" && daysLeft >= 0 && (
                <span className="text-muted-foreground">({daysLeft} days left)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Points:</span>
              <span className="font-medium">{assignment.maxPoints}</span>
            </div>

            {assignment.submittedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{new Date(assignment.submittedAt).toLocaleDateString()}</span>
              </div>
            )}

            {assignment.grade !== undefined && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Grade:</span>
                <span className="font-bold text-lg">
                  {assignment.grade}/{assignment.maxPoints} (
                  {((assignment.grade / assignment.maxPoints) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          {assignment.status === "pending" && (
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Submit Assignment
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground">Track and manage all your course assignments</p>
      </div>

      {/* Assignment Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedAssignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedAssignments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending assignments</p>
              </CardContent>
            </Card>
          ) : (
            pendingAssignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No submitted assignments</p>
              </CardContent>
            </Card>
          ) : (
            submittedAssignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {gradedAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No graded assignments yet</p>
              </CardContent>
            </Card>
          ) : (
            gradedAssignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
