"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  GraduationCap,
  UserCheck,
  Award,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
  Trophy,
  Flame,
  Star,
  Zap,
} from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import {
  getStudentAssignments,
  getStudentDashboardSummary,
  getStudentEnrollment,
  getStudentRecentActivity,
  getStudentViewModules,
} from "@/lib/student-view-data"
import { getCurrentUser } from "@/lib/auth"
import { getGamificationStats, getXpProgress } from "@/lib/student-gamification"

function standingVariant(standing: string) {
  if (standing === "Good Standing") return "default"
  if (standing === "Probation") return "destructive"
  return "secondary"
}

function riskVariant(risk: string) {
  if (risk === "Good") return "default"
  if (risk === "At Risk") return "destructive"
  return "secondary"
}

export default function StudentViewDashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [enrollment, setEnrollment] = useState(() => getStudentEnrollment())
  const [gamification, setGamification] = useState(() => getGamificationStats())

  useEffect(() => {
    setUser(getCurrentUser())
    setEnrollment(getStudentEnrollment())
    setGamification(getGamificationStats())
  }, [])

  const modules = useMemo(() => getStudentViewModules(), [enrollment.qualificationCode])
  const summary = useMemo(() => getStudentDashboardSummary(modules), [modules])
  const assignments = useMemo(() => getStudentAssignments(modules), [modules])
  const recentActivity = useMemo(() => getStudentRecentActivity(modules), [modules])
  const pendingAssignments = assignments.filter((a) => a.status === "pending").length
  const featuredModules = modules.slice(0, 6)
  const xpProgress = getXpProgress(gamification.totalXp)

  if (!user) return null

  return (
    <StudentViewLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">
            {summary.academicYear} · {summary.semester} · {enrollment.qualificationName} · {enrollment.department} ·{" "}
            {enrollment.campus}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.aps}</p>
                  <p className="text-xs text-muted-foreground">APS Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.registeredModules}</p>
                  <p className="text-xs text-muted-foreground">Registered Modules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.averageAttendance}%</p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalCredits}</p>
                  <p className="text-xs text-muted-foreground">Credit Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={standingVariant(summary.academicStanding)}>{summary.academicStanding}</Badge>
          <Badge variant="outline">Average Mark: {summary.averageMark}%</Badge>
          {summary.atRiskModules > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summary.atRiskModules} module{summary.atRiskModules !== 1 ? "s" : ""} at risk
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {pendingAssignments} pending assignment{pendingAssignments !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Learning Lab</h2>
            <Badge variant="secondary">Gamification</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xl font-bold">{gamification.totalXp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-secondary" />
                <div>
                  <p className="text-xl font-bold">Level {gamification.level}</p>
                  <p className="text-xs text-muted-foreground">{xpProgress.current}/{xpProgress.next} XP</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Flame className="h-6 w-6 text-accent" />
                <div>
                  <p className="text-xl font-bold">{gamification.streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="h-6 w-6 text-chart-4" />
                <div>
                  <p className="text-xl font-bold">{gamification.badges.length}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/dashboard/student-view/quizzes">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-primary" />
                    Module Quizzes
                  </CardTitle>
                  <CardDescription>
                    Test your knowledge with TUT module quizzes and earn XP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm">Take a Quiz</Button>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/student-view/circuit-lab">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Circuit Lab
                  </CardTitle>
                  <CardDescription>
                    Build electrical circuits with LEDs, resistors, sensors and Arduino
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm">Open Circuit Lab</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Registered Modules</h2>
            <Link href="/dashboard/student-view/modules">
              <Button variant="outline" size="sm">
                View all {modules.length} modules
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {featuredModules.map((mod) => (
              <Card key={mod.code} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-mono">{mod.code}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{mod.name}</CardDescription>
                    </div>
                    <Badge variant={riskVariant(mod.riskLevel)} className="shrink-0 text-xs">
                      {mod.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{mod.department}</span>
                    <span>·</span>
                    <span>{mod.credits} credits</span>
                    <span>·</span>
                    <span>NQF {mod.nqfLevel}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current mark</span>
                      <span className="font-medium">{mod.currentMark}%</span>
                    </div>
                    <Progress value={mod.currentMark ?? 0} className="h-2" />
                  </div>
                  <Link href={`/dashboard/student-view/modules/${mod.code}`}>
                    <Button variant="secondary" className="w-full" size="sm">
                      Open module
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Academic Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                      {activity.moduleCode}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Upcoming Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.slice(0, 4).map((assignment) => (
                  <div key={assignment.id} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignment.moduleCode} · Due {assignment.dueDate.toLocaleDateString("en-ZA")}
                      </p>
                    </div>
                    <Badge variant={assignment.status === "pending" ? "outline" : "secondary"}>
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/student-view/assignments" className="block mt-4">
                <Button variant="outline" className="w-full" size="sm">
                  View all assignments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentViewLayout>
  )
}
