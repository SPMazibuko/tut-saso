"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockCourses } from "@/lib/mock-data"
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"

interface AttendanceRecord {
  date: Date
  courseId: string
  courseName: string
  status: "present" | "absent" | "late"
}

export default function MyAttendancePage() {
  const [courses, setCourses] = useState(mockCourses)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [overallAttendance, setOverallAttendance] = useState(95)

  useEffect(() => {
    // Generate mock attendance records for the past 30 days
    const records: AttendanceRecord[] = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      courses.forEach((course) => {
        // Randomly generate attendance (95% present, 3% late, 2% absent)
        const rand = Math.random()
        let status: "present" | "absent" | "late"
        if (rand < 0.95) status = "present"
        else if (rand < 0.98) status = "late"
        else status = "absent"

        records.push({
          date,
          courseId: course.id,
          courseName: course.name,
          status,
        })
      })
    }

    setAttendanceRecords(records)
  }, [courses])

  const getCourseAttendance = (courseId: string) => {
    const courseRecords = attendanceRecords.filter((r) => r.courseId === courseId)
    const presentCount = courseRecords.filter((r) => r.status === "present").length
    return courseRecords.length > 0 ? (presentCount / courseRecords.length) * 100 : 0
  }

  const getRecentRecords = () => {
    return attendanceRecords.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "absent":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "late":
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="default" className="bg-green-600">
            Present
          </Badge>
        )
      case "absent":
        return <Badge variant="destructive">Absent</Badge>
      case "late":
        return (
          <Badge variant="secondary" className="bg-yellow-600">
            Late
          </Badge>
        )
      default:
        return null
    }
  }

  const totalPresent = attendanceRecords.filter((r) => r.status === "present").length
  const totalAbsent = attendanceRecords.filter((r) => r.status === "absent").length
  const totalLate = attendanceRecords.filter((r) => r.status === "late").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance across all courses</p>
      </div>

      {/* Attendance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallAttendance}%</div>
            <Progress value={overallAttendance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresent}</div>
            <p className="text-xs text-muted-foreground">Total days present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLate}</div>
            <p className="text-xs text-muted-foreground">Times late</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAbsent}</div>
            <p className="text-xs text-muted-foreground">Days absent</p>
          </CardContent>
        </Card>
      </div>

      {/* Course-by-Course Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance by Course</CardTitle>
          <CardDescription>Your attendance rate for each course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.map((course) => {
            const attendance = getCourseAttendance(course.id)
            return (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                  </div>
                  <span className="text-lg font-bold">{attendance.toFixed(1)}%</span>
                </div>
                <Progress value={attendance} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your attendance records for the past 10 class sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getRecentRecords().map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium">{record.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(record.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
