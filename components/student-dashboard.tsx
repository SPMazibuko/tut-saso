"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Calendar, CheckCircle2, Clock, GraduationCap, TrendingUp, AlertCircle, MapPin, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { mockCourses, mockAssignments, mockStudentActivities, mockStudents } from "@/lib/mock-data"
import { getCurrentUser } from "@/lib/auth"
import { getStudentHierarchy, getHierarchyComparison } from "@/lib/hierarchy-analysis"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function StudentDashboard() {
  const [studentData, setStudentData] = useState<any>(null)
  const [userName, setUserName] = useState<string>("")
  const [hierarchy, setHierarchy] = useState<any>(null)
  const [comparison, setComparison] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return

    setUserName(user.name)

    // Get student data based on user ID
    const student = mockStudents.find((s) => s.id === user.id)
    if (student) {
      setStudentData({
        student,
        courses: mockCourses,
        assignments: mockAssignments,
        activities: mockStudentActivities,
      })

      // Get hierarchy and comparison data
      console.log(student)
      const hierarchyData = getStudentHierarchy(student)

      const comparisonData = getHierarchyComparison(student)
      setHierarchy(hierarchyData)
      setComparison(comparisonData)
    }
  }, [])

  if (!studentData) return null

  const { student, courses, assignments, activities } = studentData

  // Calculate stats
  const pendingAssignments = assignments.filter((a: any) => a.status === "pending").length
  const upcomingDeadlines = assignments
    .filter((a: any) => a.status === "pending")
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  const recentActivities = activities.slice(0, 5)

  const averageGrade = courses.reduce((sum: number, course: any) => sum + course.currentGrade, 0) / courses.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Here's your academic overview</p>
        {hierarchy && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{hierarchy.school.name}</span>
            <span>•</span>
            <span>{hierarchy.district.name}</span>
            <span>•</span>
            <span>{hierarchy.province.name}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current APS</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.aps.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Faculty {student.grade}</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.attendanceRate}%</div>
            <Progress value={student.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.reduce((sum: number, c: any) => sum + c.credits, 0)} total credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Assignments due soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Current semester courses and grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.code} • {course.teacher}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{course.schedule}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{course.currentGrade}%</div>
                    <Badge
                      variant={
                        course.currentGrade >= 90 ? "default" : course.currentGrade >= 80 ? "secondary" : "outline"
                      }
                    >
                      {course.currentGrade >= 90 ? "A" : course.currentGrade >= 80 ? "B" : "C"}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard/my-courses">View All Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Assignments and tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                upcomingDeadlines.map((assignment: any) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )
                  const isUrgent = daysUntilDue <= 2

                  return (
                    <div
                      key={assignment.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        isUrgent && "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
                      )}
                    >
                      {isUrgent ? (
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">{assignment.courseName}</p>
                        <p className="text-xs font-medium">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} ({daysUntilDue} days)
                        </p>
                      </div>
                      <Badge variant={isUrgent ? "destructive" : "secondary"}>{assignment.maxPoints} pts</Badge>
                    </div>
                  )
                })
              )}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard/my-assignments">View All Assignments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchy Analysis */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Your performance compared to School, District, and Province averages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* School Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">School: {hierarchy?.school.name}</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">APS</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.aps.toFixed(2)}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-muted-foreground">{comparison.school.avgAPS.toFixed(2)}</span>
                        {comparison.school.comparison.aps.status === "above" && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.school.comparison.aps.status === "below" && (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.school.comparison.aps.status === "equal" && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attendance</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.attendanceRate}%</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-muted-foreground">{comparison.school.avgAttendance.toFixed(1)}%</span>
                        {comparison.school.comparison.attendance.status === "above" && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.school.comparison.attendance.status === "below" && (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.school.comparison.attendance.status === "equal" && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {/* <p>
                      {comparison.school.comparison.aps.difference !== 0 && (
                        <span>
                          {comparison.school.comparison.aps.status === "above" ? "+" : ""}
                          {comparison.school.comparison.aps.difference.toFixed(2)} APS difference
                        </span>
                      )}
                    </p> */}
                    <p>
                      {comparison.school.comparison.attendance.difference !== 0 && (
                        <span>
                          {comparison.school.comparison.attendance.status === "above" ? "+" : ""}
                          {comparison.school.comparison.attendance.difference.toFixed(1)}% attendance difference
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* District Comparison */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">District/Region: {hierarchy?.district.name}</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">APS</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.aps.toFixed(2)}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-muted-foreground">{comparison.district.avgAPS.toFixed(2)}</span>
                        {comparison.district.comparison.aps.status === "above" && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.district.comparison.aps.status === "below" && (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.district.comparison.aps.status === "equal" && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attendance</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.attendanceRate}%</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-muted-foreground">{comparison.district.avgAttendance.toFixed(1)}%</span>
                        {comparison.district.comparison.attendance.status === "above" && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.district.comparison.attendance.status === "below" && (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.district.comparison.attendance.status === "equal" && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {/* <p>
                      {comparison.district.comparison.aps.difference !== 0 && (
                        <span>
                          {comparison.district.comparison.aps.status === "above" ? "+" : ""}
                          {comparison.district.comparison.aps.difference.toFixed(2)} APS difference
                        </span>
                      )}
                    </p> */}
                    <p>
                      {comparison.district.comparison.attendance.difference !== 0 && (
                        <span>
                          {comparison.district.comparison.attendance.status === "above" ? "+" : ""}
                          {comparison.district.comparison.attendance.difference.toFixed(1)}% attendance difference
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Province Comparison */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Province: {hierarchy?.province.name}</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">APS</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.aps.toFixed(2)}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-muted-foreground">{comparison.province.avgAPS.toFixed(2)}</span>
                        {comparison.province.comparison.aps.status === "above" && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.province.comparison.aps.status === "below" && (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.province.comparison.aps.status === "equal" && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attendance</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.attendanceRate}%</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-muted-foreground">{comparison.province.avgAttendance.toFixed(1)}%</span>
                        {comparison.province.comparison.attendance.status === "above" && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {comparison.province.comparison.attendance.status === "below" && (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        {comparison.province.comparison.attendance.status === "equal" && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {/* <p>
                      {comparison.province.comparison.aps.difference !== 0 && (
                        <span>
                          {comparison.province.comparison.aps.status === "above" ? "+" : ""}
                          {comparison.province.comparison.aps.difference.toFixed(2)} APS difference
                        </span>
                      )}
                    </p> */}
                    <p>
                      {comparison.province.comparison.attendance.difference !== 0 && (
                        <span>
                          {comparison.province.comparison.attendance.status === "above" ? "+" : ""}
                          {comparison.province.comparison.attendance.difference.toFixed(1)}% attendance difference
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest academic activities and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity: any) => {
              const icons = {
                assignment: BookOpen,
                exam: GraduationCap,
                attendance: Calendar,
                achievement: TrendingUp,
                intervention: AlertCircle,
              }
              const Icon = icons[activity.type as keyof typeof icons]

              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="rounded-full p-2 bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    {activity.relatedCourse && (
                      <Badge variant="outline" className="text-xs">
                        {activity.relatedCourse}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}