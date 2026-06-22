"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trophy, Flame, Star, Zap, CheckCircle2, ArrowLeft, Award } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { getStudentEnrollment } from "@/lib/student-view-data"
import {
  completeQuiz,
  getGamificationStats,
  getQuizzesForDepartment,
  getXpProgress,
  type GamificationStats,
  type ModuleQuiz,
} from "@/lib/student-gamification"
import { useToast } from "@/hooks/use-toast"

function difficultyVariant(d: string) {
  if (d === "Beginner") return "secondary"
  if (d === "Advanced") return "destructive"
  return "default"
}

export default function StudentQuizzesPage() {
  const { toast } = useToast()
  const [enrollment, setEnrollment] = useState(() => getStudentEnrollment())
  const [stats, setStats] = useState<GamificationStats>(() => getGamificationStats())
  const [activeQuiz, setActiveQuiz] = useState<ModuleQuiz | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    setEnrollment(getStudentEnrollment())
    setStats(getGamificationStats())
  }, [])

  const quizzes = useMemo(() => getQuizzesForDepartment(enrollment.department), [enrollment.department])
  const xpProgress = getXpProgress(stats.totalXp)

  const startQuiz = (quiz: ModuleQuiz) => {
    if (stats.completedQuizIds.includes(quiz.id)) {
      toast({ title: "Already completed", description: "You've already earned XP for this quiz." })
      return
    }
    setActiveQuiz(quiz)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  const submitQuiz = () => {
    if (!activeQuiz) return
    let correct = 0
    activeQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++
    })
    const percent = Math.round((correct / activeQuiz.questions.length) * 100)
    setScore(percent)
    setSubmitted(true)
    const updated = completeQuiz(activeQuiz.id, percent, activeQuiz.xpReward)
    setStats(updated)
    toast({
      title: "Quiz complete!",
      description: `You scored ${percent}% and earned XP. ${correct}/${activeQuiz.questions.length} correct.`,
    })
  }

  if (activeQuiz) {
    return (
      <StudentViewLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" onClick={() => setActiveQuiz(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to quizzes
          </Button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono">{activeQuiz.moduleCode}</Badge>
              <Badge variant={difficultyVariant(activeQuiz.difficulty)}>{activeQuiz.difficulty}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{activeQuiz.title}</h1>
            <p className="text-muted-foreground">{activeQuiz.description}</p>
          </div>

          {!submitted ? (
            <div className="space-y-6">
              {activeQuiz.questions.map((q, idx) => (
                <Card key={q.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Question {idx + 1} of {activeQuiz.questions.length}
                    </CardTitle>
                    <CardDescription className="text-foreground font-medium">{q.prompt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[q.id]?.toString()}
                      onValueChange={(v) => setAnswers({ ...answers, [q.id]: Number(v) })}
                    >
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2 py-2">
                          <RadioGroupItem value={String(i)} id={`${q.id}-${i}`} />
                          <Label htmlFor={`${q.id}-${i}`} className="cursor-pointer">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
              <Button
                className="w-full"
                disabled={Object.keys(answers).length < activeQuiz.questions.length}
                onClick={submitQuiz}
              >
                Submit Quiz · +{activeQuiz.xpReward} XP
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Results: {score}%
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeQuiz.questions.map((q) => {
                  const selected = answers[q.id]
                  const isCorrect = selected === q.correctIndex
                  return (
                    <div key={q.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-sm">{q.prompt}</p>
                      <p className={`text-sm mt-1 ${isCorrect ? "text-green-600" : "text-destructive"}`}>
                        Your answer: {q.options[selected]} {isCorrect ? "✓" : `✗ (${q.options[q.correctIndex]})`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                    </div>
                  )
                })}
                <Button onClick={() => setActiveQuiz(null)}>Back to quizzes</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </StudentViewLayout>
    )
  }

  return (
    <StudentViewLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Module Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge, earn XP and climb the leaderboard · {enrollment.department}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Star className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalXp}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">Level {stats.level}</p>
                <p className="text-xs text-muted-foreground">Current Level</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Flame className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="h-8 w-8 text-chart-4" />
              <div>
                <p className="text-2xl font-bold">{stats.badges.length}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>{xpProgress.current} / {xpProgress.next} XP</span>
              <span>Level {stats.level}</span>
            </div>
            <Progress value={xpProgress.progress} className="h-2" />
          </CardContent>
        </Card>

        {stats.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => {
            const done = stats.completedQuizIds.includes(quiz.id)
            return (
              <Card key={quiz.id} className={done ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="font-mono mb-2">{quiz.moduleCode}</Badge>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </div>
                    <Badge variant={difficultyVariant(quiz.difficulty)}>{quiz.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    +{quiz.xpReward} XP · {quiz.questions.length} questions
                  </span>
                  <Button size="sm" variant={done ? "outline" : "default"} onClick={() => startQuiz(quiz)}>
                    {done ? "Completed" : "Start Quiz"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </StudentViewLayout>
  )
}
