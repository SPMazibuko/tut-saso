"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockCourses, mockAssignments } from "@/lib/mock-data"
import { Target, BookOpen, CheckCircle2 } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function MyProgressPage() {
  const [courses] = useState(mockCourses)
  const [assignments] = useState(mockAssignments)

  // Mock APS trend data over semesters
  // const apsData = [
  //   { semester: "Fall 2023", aps: 3.6 },
  //   { semester: "Spring 2024", aps: 3.7 },
  //   { semester: "Fall 2024", aps: 3.8 },
  //   { semester: "Spring 2025", aps: 3.9 },
  // ]

  // Mock grade distribution
  const gradeDistribution = [
    { grade: "A", count: 8 },
    { grade: "B", count: 5 },
    { grade: "C", count: 2 },
    { grade: "D", count: 0 },
    { grade: "F", count: 0 },
  ]

  // Calculate statistics
  // const currentAPS = 3.8
  // const previousAPS = 3.7
  // const apsChange = currentAPS - previousAPS
  const completedAssignments = assignments.filter((a) => a.status === "graded").length
  const totalAssignments = assignments.length
  const completionRate = (completedAssignments / totalAssignments) * 100

  const averageGrade = courses.reduce((sum, c) => sum + c.currentGrade, 0) / courses.length
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)
  const earnedCredits = Math.floor(totalCredits * 0.85) // Mock earned credits

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your academic progress and achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current APS</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAPS.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {apsChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{apsChange.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{apsChange.toFixed(2)}</span>
                </>
              )}
              <span className="ml-1">from last semester</span>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earnedCredits}/{totalCredits}
            </div>
            <Progress value={(earnedCredits / totalCredits) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedAssignments} of {totalAssignments} assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* APS Trend Chart */}
      {/* <Card>
        <CardHeader>
          <CardTitle>APS Trend</CardTitle>
          <CardDescription>Your APS progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              aps: {
                label: "APS",
                color: "hsl(220, 70%, 50%)",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apsData}>
                <defs>
                  <linearGradient id="apsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="semester" 
                  className="text-foreground"
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  domain={[0, 4.0]} 
                  className="text-foreground"
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="aps" 
                  stroke="hsl(220, 70%, 50%)" 
                  fill="url(#apsGradient)"
                  strokeWidth={3} 
                  dot={{ r: 5, fill: 'hsl(220, 70%, 50%)', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card> */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Faculty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Distribution</CardTitle>
            <CardDescription>Your completed courses grouped by faculty</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Courses",
                  color: "hsl(160, 60%, 50%)",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="grade" 
                    className="text-foreground"
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    className="text-foreground"
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(160, 60%, 50%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Current Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Current Course Performance</CardTitle>
            <CardDescription>Your grades in active courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.code}</p>
                  </div>
                  <Badge
                    variant={
                      course.currentGrade >= 90 ? "default" : course.currentGrade >= 80 ? "secondary" : "outline"
                    }
                  >
                    {course.currentGrade}%
                  </Badge>
                </div>
                <Progress value={course.currentGrade} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Academic Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Goals</CardTitle>
          <CardDescription>Track your progress towards your academic goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintain 3.8+ APS</span>
              <Badge variant="default">On Track</Badge>
            </div>
            <Progress value={95} className="h-2" />
          </div> */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Complete all assignments on time</span>
              <Badge variant="default">On Track</Badge>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Earn 18 credits this semester</span>
              <Badge variant="secondary">In Progress</Badge>
            </div>
            <Progress value={(earnedCredits / 18) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
