"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockCourses, mockAssignments } from "@/lib/mock-data"
import { BookOpen, Calendar, MapPin, User, Award } from "lucide-react"
import type { Course, Assignment } from "@/lib/types"

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    setCourses(mockCourses)
    setAssignments(mockAssignments)
  }, [])

  const getUpcomingAssignments = (courseId: string) => {
    return assignments.filter((a) => a.courseId === courseId && (a.status === "pending" || a.status === "submitted"))
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Subjects</h1>
        <p className="text-muted-foreground">View all your enrolled courses and current grades</p>
      </div>

      {/* Course Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.reduce((sum, c) => sum + c.credits, 0)} total credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(courses.reduce((sum, c) => sum + c.currentGrade, 0) / courses.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => {
          const upcomingAssignments = getUpcomingAssignments(course.id)
          return (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription className="font-mono text-sm">{course.code}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      course.currentGrade >= 90 ? "default" : course.currentGrade >= 80 ? "secondary" : "outline"
                    }
                  >
                    {course.credits} Credits
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Current Grade */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Grade</span>
                    <span className={`text-2xl font-bold ${getGradeColor(course.currentGrade)}`}>
                      {course.currentGrade}%
                    </span>
                  </div>
                  <Progress value={course.currentGrade} className="h-2" />
                </div>

                {/* Course Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{course.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{course.room}</span>
                  </div>
                </div>

                {/* Upcoming Assignments */}
                {upcomingAssignments.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Upcoming Assignments</h4>
                    <div className="space-y-2">
                      {upcomingAssignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1">{assignment.title}</span>
                          <Badge variant={assignment.status === "submitted" ? "secondary" : "outline"} className="ml-2">
                            {assignment.status === "submitted"
                              ? "Submitted"
                              : new Date(assignment.dueDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
