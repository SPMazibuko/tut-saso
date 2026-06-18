"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getStudents } from "@/lib/data-service"
import { STUDENT_NUMBER_PLACEHOLDER } from "@/lib/student-numbers"
import type { Learner } from "@/lib/types"
import type { AttendanceMark } from "@/lib/attendance/types"

type ApiResponse<T> = { error?: string } & T

async function apiPost<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return (await res.json()) as ApiResponse<T>
}

export default function AttendanceCheckInPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-10 pt-10">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Class Attendance Check-in</h1>
              <p className="text-sm text-muted-foreground">
                For online/hybrid classes: enter the join code your Lecturer provides.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Check in</CardTitle>
                <CardDescription>Loading…</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-9 w-full rounded-md bg-muted" />
                <div className="h-9 w-full rounded-md bg-muted" />
                <div className="h-9 w-28 rounded-md bg-muted" />
              </CardContent>
            </Card>
          </div>
        </main>
      }
    >
      <AttendanceCheckInInner />
    </Suspense>
  )
}

function AttendanceCheckInInner() {
  const params = useSearchParams()
  const initialCode = params.get("code") ?? ""

  const [joinCode, setJoinCode] = useState(initialCode)
  const [studentNumber, setStudentNumber] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [mark, setMark] = useState<AttendanceMark | null>(null)

  const studentIndex = useMemo(() => {
    const map = new Map<string, Learner>()
    for (const s of getStudents()) map.set(s.studentNumber, s)
    return map
  }, [])

  async function submit() {
    setError(null)
    const code = joinCode.trim()
    const sn = studentNumber.trim()
    if (!code || !sn) {
      setError("Please enter both join code and student number.")
      return
    }

    const learner = studentIndex.get(sn)
    if (!learner) {
      setError("Student number not found.")
      return
    }

    setStatus("submitting")
    const res = await apiPost<{ mark: AttendanceMark }>("/api/attendance/marks", {
      joinCode: code,
      studentId: learner.id,
      studentNumber: learner.studentNumber,
      studentName: `${learner.name} ${learner.surname}`,
      method: "online",
    })
    if (res.error) {
      setStatus("idle")
      setError(res.error)
      return
    }

    setMark(res.mark)
    setStatus("success")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-10 pt-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Class Attendance Check-in</h1>
          <p className="text-sm text-muted-foreground">For online/hybrid classes: enter the join code your Lecturer provides.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Check in</CardTitle>
            <CardDescription>Your attendance will be recorded as present for the active class session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {status === "success" && mark ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Checked in</Badge>
                  <Badge variant="outline">{mark.method}</Badge>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="text-sm font-medium">{mark.studentName}</div>
                  <div className="text-sm text-muted-foreground">{mark.studentNumber}</div>
                  <div className="text-xs text-muted-foreground">Captured at: {new Date(mark.capturedAt).toLocaleString()}</div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submit()
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Join code</div>
                  <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. 123456" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Student number</div>
                  <Input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} placeholder={`e.g. ${STUDENT_NUMBER_PLACEHOLDER}`} />
                </div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                <Button type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? "Submitting…" : "Check in"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

