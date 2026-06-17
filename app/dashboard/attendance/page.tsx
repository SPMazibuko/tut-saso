"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import { getGroups, getStudents, getSubjects } from "@/lib/data-service"
import type { Learner } from "@/lib/types"
import type { AttendanceMark, AttendanceSession, AttendanceSessionSettings, ClassDeliveryMode, ClassType } from "@/lib/attendance/types"

type ApiResponse<T> = { error?: string } & T

const CLASS_TYPES: ClassType[] = [
  "Tutorial Session",
  "Mentor Session",
  "Studython",
  "Lecture Session",
  "Orientation",
  "Other",
]
const DELIVERY_MODES: Array<{ value: ClassDeliveryMode; label: string }> = [
  { value: "physical", label: "Physical (Fingerprint scanner)" },
  { value: "hybrid", label: "Hybrid (Fingerprint + Online)" },
  { value: "online", label: "Online (Join code)" },
]

async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url, { cache: "no-store" })
  return (await res.json()) as ApiResponse<T>
}

async function apiPost<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return (await res.json()) as ApiResponse<T>
}

function formatClassType(session: AttendanceSession): string {
  if (session.classType !== "Other") return session.classType
  return session.otherClassTypeLabel?.trim() ? `Other (${session.otherClassTypeLabel.trim()})` : "Other"
}

function formatOrientationSlot(session: AttendanceSession): string | null {
  if (session.classType !== "Orientation") return null
  if (session.orientationSession === "morning") return "Morning Session Register"
  if (session.orientationSession === "late") return "Late Session Register"
  return null
}

function computeArrivalLabel(session: AttendanceSession, mark: AttendanceMark): "Early" | "Late" {
  const scheduled = new Date(session.scheduledStartAt).getTime()
  const captured = new Date(mark.capturedAt).getTime()
  const diffMinutes = Math.floor((captured - scheduled) / 60000)
  return diffMinutes > 15 ? "Late" : "Early"
}

function toLocalDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString()
}

function toLocalTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function DemoCaptureTable() {
  const now = new Date()
  const scheduled = new Date(now)
  scheduled.setHours(9, 0, 0, 0)

  const demoSession: AttendanceSession = {
    id: "demo-session",
    status: "active",
    startedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    startedByUserId: "1",
    startedByUserName: "Demo Starter",
    groupId: "10A",
    department: "Education",
    qualificationCode: "BEd",
    qualificationName: "Bachelor of Education",
    moduleCode: "ENG101",
    classType: "Lecture Session",
    scheduledStartAt: scheduled.toISOString(),
    classDurationMinutes: 90,
    deliveryMode: "physical",
  }

  const demoMarks: AttendanceMark[] = [
    {
      id: "demo-1",
      sessionId: demoSession.id,
      studentId: 1,
      studentNumber: "ST2024001",
      studentName: "Sifiso Mazibuko",
      capturedAt: new Date(scheduled.getTime() - 5 * 60 * 1000).toISOString(),
      method: "fingerprint",
      studentDurationMinutes: 90,
      knowledgeObtained: "Introduced course outline and assessment plan.",
    },
    {
      id: "demo-2",
      sessionId: demoSession.id,
      studentId: 2,
      studentNumber: "ST2024002",
      studentName: "Michael Chen",
      capturedAt: new Date(scheduled.getTime() + 10 * 60 * 1000).toISOString(),
      method: "manual",
      studentDurationMinutes: 80,
      knowledgeObtained: "Participated in Q&A and note-taking.",
    },
    {
      id: "demo-3",
      sessionId: demoSession.id,
      studentId: 3,
      studentNumber: "ST2024003",
      studentName: "Sophia Martinez",
      capturedAt: new Date(scheduled.getTime() + 22 * 60 * 1000).toISOString(),
      method: "fingerprint",
      studentDurationMinutes: 60,
      knowledgeObtained: "Arrived late; covered recap only.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dummy capture data</CardTitle>
        <CardDescription>
          This is sample data shown when there is no active class, so you can see the required table layout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student no</TableHead>
                <TableHead>Name and Surname</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Qualification Code</TableHead>
                <TableHead>Qualification Name</TableHead>
                <TableHead>Class Type</TableHead>
                <TableHead>Module Code</TableHead>
                <TableHead>Class Duration</TableHead>
                <TableHead>Student&apos;s Duration</TableHead>
                <TableHead>Knowledge obtained</TableHead>
                <TableHead>Early / Late Arrival</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoMarks.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.studentNumber}</TableCell>
                  <TableCell className="font-medium">{m.studentName}</TableCell>
                  <TableCell>{demoSession.department}</TableCell>
                  <TableCell>{demoSession.qualificationCode}</TableCell>
                  <TableCell>{demoSession.qualificationName}</TableCell>
                  <TableCell>{formatClassType(demoSession)}</TableCell>
                  <TableCell>{demoSession.moduleCode}</TableCell>
                  <TableCell>{demoSession.classDurationMinutes} min</TableCell>
                  <TableCell>{m.studentDurationMinutes ?? "—"}</TableCell>
                  <TableCell className="max-w-[260px] whitespace-pre-wrap">{m.knowledgeObtained ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={computeArrivalLabel(demoSession, m) === "Late" ? "destructive" : "secondary"}>
                      {computeArrivalLabel(demoSession, m)}
                    </Badge>
                  </TableCell>
                  <TableCell>{toLocalDate(demoSession.scheduledStartAt)}</TableCell>
                  <TableCell>{toLocalTime(demoSession.scheduledStartAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AttendanceCapturePage() {
  const user = getCurrentUser()
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [marks, setMarks] = useState<AttendanceMark[]>([])
  const [loading, setLoading] = useState(true)

  // Start form state
  const groups = useMemo(() => getGroups(), [])
  const subjects = useMemo(() => getSubjects(), [])
  const [groupId, setGroupId] = useState<string>(groups[0]?.id ?? "")
  const [subjectCode, setSubjectCode] = useState<string>(subjects[0]?.code ?? "")

  // Session metadata requested
  const [department, setDepartment] = useState("")
  const [qualificationCode, setQualificationCode] = useState("")
  const [qualificationName, setQualificationName] = useState("")
  const [moduleCode, setModuleCode] = useState(subjectCode || "")
  const [scheduledDate, setScheduledDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  })
  const [classDurationMinutes, setClassDurationMinutes] = useState<number>(60)

  const [classType, setClassType] = useState<ClassType>("Lecture Session")
  const [orientationSession, setOrientationSession] = useState<"morning" | "late">("morning")
  const [otherClassTypeLabel, setOtherClassTypeLabel] = useState("")
  const [deliveryMode, setDeliveryMode] = useState<ClassDeliveryMode>("physical")

  const isStarter = !!(user && activeSession && activeSession.startedByUserId === user.id)

  const roster = useMemo(() => {
    if (!activeSession) return [] as Learner[]
    const all = getStudents()
    return all.filter((s) => s.group === activeSession.groupId && s.subjectCode === activeSession.moduleCode)
  }, [activeSession])

  const rosterByStudentNumber = useMemo(() => {
    const map = new Map<string, Learner>()
    for (const s of roster) map.set(s.studentNumber, s)
    return map
  }, [roster])

  const presentCount = useMemo(() => {
    const uniq = new Set(marks.map((m) => m.studentId))
    return uniq.size
  }, [marks])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [active, list] = await Promise.all([
        apiGet<{ session: AttendanceSession | null }>("/api/attendance/sessions/active"),
        apiGet<{ sessions: AttendanceSession[] }>("/api/attendance/sessions"),
      ])
      if (cancelled) return
      setActiveSession(active.session ?? null)
      setSessions(list.sessions ?? [])

      if (active.session?.id) {
        const m = await apiGet<{ marks: AttendanceMark[] }>(`/api/attendance/marks?sessionId=${encodeURIComponent(active.session.id)}`)
        if (cancelled) return
        setMarks(m.marks ?? [])
      } else {
        setMarks([])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function refreshActiveAndMarks() {
    const active = await apiGet<{ session: AttendanceSession | null }>("/api/attendance/sessions/active")
    setActiveSession(active.session ?? null)
    if (active.session?.id) {
      const m = await apiGet<{ marks: AttendanceMark[] }>(`/api/attendance/marks?sessionId=${encodeURIComponent(active.session.id)}`)
      setMarks(m.marks ?? [])
    } else {
      setMarks([])
    }
  }

  async function handleStartSession() {
    if (!user) return
    if (!department.trim() || !qualificationCode.trim() || !qualificationName.trim() || !moduleCode.trim()) {
      toast({
        title: "Missing required details",
        description: "Department, Qualification Code/Name, and Module Code are required.",
        variant: "destructive",
      })
      return
    }
    if (classType === "Other" && !otherClassTypeLabel.trim()) {
      toast({ title: "Other description required", description: "Please describe the 'Other' class type.", variant: "destructive" })
      return
    }

    const scheduledStartAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
    const settings: AttendanceSessionSettings = {
      groupId,
      department: department.trim(),
      qualificationCode: qualificationCode.trim(),
      qualificationName: qualificationName.trim(),
      moduleCode: moduleCode.trim(),
      classType,
      orientationSession: classType === "Orientation" ? orientationSession : undefined,
      otherClassTypeLabel: classType === "Other" ? otherClassTypeLabel : undefined,
      scheduledStartAt,
      classDurationMinutes,
      deliveryMode,
    }

    const res = await apiPost<{ session: AttendanceSession }>("/api/attendance/sessions", {
      ...settings,
      startedByUserId: user.id,
      startedByUserName: user.name,
    })
    if (res.error) {
      toast({ title: "Could not start class", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Class started", description: "Attendance can now be captured." })
    setActiveSession(res.session)
    await refreshActiveAndMarks()
  }

  async function handleEndSession() {
    if (!user || !activeSession) return
    const res = await apiPost<{ session: AttendanceSession }>(`/api/attendance/sessions/${encodeURIComponent(activeSession.id)}/end`, {
      endedByUserId: user.id,
      endedByUserName: user.name,
    })
    if (res.error) {
      toast({ title: "Could not end class", description: res.error, variant: "destructive" })
      return
    }
    toast({ title: "Class ended", description: "Attendance capturing is closed." })
    setActiveSession(null)
    await refreshActiveAndMarks()
  }

  const [scanValue, setScanValue] = useState("")
  const [studentDurationMinutes, setStudentDurationMinutes] = useState<number>(60)
  const [knowledgeObtained, setKnowledgeObtained] = useState("")
  async function captureByStudentNumber(method: "fingerprint" | "manual") {
    if (!user || !activeSession) return
    const key = scanValue.trim()
    if (!key) return
    const learner = rosterByStudentNumber.get(key)
    if (!learner) {
      toast({
        title: "Student not found",
        description: "Make sure you scanned/typed the student's student number for this class group + subject.",
        variant: "destructive",
      })
      return
    }

    const res = await apiPost<{ mark: AttendanceMark }>("/api/attendance/marks", {
      sessionId: activeSession.id,
      studentId: learner.id,
      studentNumber: learner.studentNumber,
      studentName: `${learner.name} ${learner.surname}`,
      method,
      capturedByUserId: user.id,
      capturedByUserName: user.name,
      studentDurationMinutes,
      knowledgeObtained,
    })
    if (res.error) {
      toast({ title: "Could not capture attendance", description: res.error, variant: "destructive" })
      return
    }
    setScanValue("")
    setKnowledgeObtained("")
    await refreshActiveAndMarks()
  }

  const joinUrl = useMemo(() => {
    if (!activeSession?.onlineJoinCode) return null
    if (typeof window === "undefined") return `/attendance/check-in?code=${activeSession.onlineJoinCode}`
    return `${window.location.origin}/attendance/check-in?code=${activeSession.onlineJoinCode}`
  }, [activeSession?.onlineJoinCode])

  async function copyJoinLink() {
    if (!joinUrl) return
    try {
      await navigator.clipboard.writeText(joinUrl)
      toast({ title: "Copied join link" })
    } catch {
      toast({ title: "Copy failed", description: "Please copy the link manually.", variant: "destructive" })
    }
  }

  if (!user) return null
  if (user.role === "student") {
    return (
      <div className="p-6 space-y-4">
        <PageHeader title="Attendance" description="Students should use the join link/code provided by the teacher." />
        <Card>
          <CardHeader>
            <CardTitle>Student check-in</CardTitle>
            <CardDescription>Use the join code your teacher provides.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/attendance/check-in">Go to check-in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Attendance Capture"
        description="Start a class, set its type/mode, then capture attendance (fingerprint, hybrid, or online)."
      />

      <Tabs defaultValue="manage">
        <TabsList>
          <TabsTrigger value="manage">Start / Manage</TabsTrigger>
          <TabsTrigger value="capture">Capture</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active class</CardTitle>
              <CardDescription>
                The user who starts the class must set the class type and delivery mode before attendance can be captured.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : activeSession ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <Badge variant="outline">Group: {activeSession.groupId}</Badge>
                    <Badge variant="outline">Module: {activeSession.moduleCode}</Badge>
                    <Badge variant="outline">Type: {formatClassType(activeSession)}</Badge>
                    {formatOrientationSlot(activeSession) && (
                      <Badge variant="outline">{formatOrientationSlot(activeSession)}</Badge>
                    )}
                    <Badge variant="outline">Mode: {activeSession.deliveryMode}</Badge>
                    <Badge variant="outline">Started by: {activeSession.startedByUserName}</Badge>
                  </div>

                  {activeSession.onlineJoinCode && (
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Online / Hybrid join</div>
                          <div className="text-sm text-muted-foreground">
                            Join code: <span className="font-mono font-semibold">{activeSession.onlineJoinCode}</span>
                          </div>
                        </div>
                        {joinUrl && (
                          <Button variant="outline" onClick={copyJoinLink}>
                            Copy join link
                          </Button>
                        )}
                      </div>
                      {joinUrl && <div className="text-xs text-muted-foreground break-all">{joinUrl}</div>}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button onClick={refreshActiveAndMarks} variant="outline">
                      Refresh
                    </Button>
                    <Button onClick={handleEndSession} disabled={!isStarter} variant={isStarter ? "default" : "outline"}>
                      End class
                    </Button>
                    {!isStarter && (
                      <span className="text-xs text-muted-foreground">
                        Only <strong>{activeSession.startedByUserName}</strong> can end/capture for this class.
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Class settings</div>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Group</div>
                        <Select value={groupId} onValueChange={setGroupId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((g) => (
                              <SelectItem key={g.id} value={g.id}>
                                {g.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Subject</div>
                        <Select value={subjectCode} onValueChange={setSubjectCode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s.code} value={s.code}>
                                {s.code} — {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Department</div>
                          <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Education" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Module Code</div>
                          <Input
                            value={moduleCode}
                            onChange={(e) => setModuleCode(e.target.value)}
                            placeholder="e.g. ENG101"
                          />
                          <div className="text-[11px] text-muted-foreground">
                            Tip: you can copy from Subject above if you use the same codes.
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Qualification Code</div>
                          <Input value={qualificationCode} onChange={(e) => setQualificationCode(e.target.value)} placeholder="e.g. BEd" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Qualification Name</div>
                          <Input value={qualificationName} onChange={(e) => setQualificationName(e.target.value)} placeholder="e.g. Bachelor of Education" />
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Date</div>
                          <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Time</div>
                          <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Class Duration (min)</div>
                          <Input
                            type="number"
                            min={1}
                            value={classDurationMinutes}
                            onChange={(e) => setClassDurationMinutes(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Class type</div>
                        <Select value={classType} onValueChange={(v) => setClassType(v as ClassType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASS_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {classType === "Orientation" && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Orientation register</div>
                          <Select value={orientationSession} onValueChange={(v) => setOrientationSession(v as "morning" | "late")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning Session Register</SelectItem>
                              <SelectItem value="late">Late Session Register</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {classType === "Other" && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Other description (required)</div>
                          <Input value={otherClassTypeLabel} onChange={(e) => setOtherClassTypeLabel(e.target.value)} />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Delivery mode</div>
                        <Select value={deliveryMode} onValueChange={(v) => setDeliveryMode(v as ClassDeliveryMode)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_MODES.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Start class</div>
                    <div className="text-sm text-muted-foreground">
                      Starting a class locks these settings. Attendance capture (fingerprint/manual) is only allowed for the starter.
                    </div>
                    <Button onClick={handleStartSession}>Start class</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capture" className="space-y-4">
          {!activeSession ? (
            <DemoCaptureTable />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Capture attendance</CardTitle>
                  <CardDescription>
                    Physical classes can use the fingerprint scanner (most scanners send a student number as keyboard input).
                    Hybrid/online classes can use the join code.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline">Roster: {roster.length}</Badge>
                    <Badge variant="secondary">Present: {presentCount}</Badge>
                    <Badge variant="outline">Missing: {Math.max(0, roster.length - presentCount)}</Badge>
                  </div>

                  {activeSession.onlineJoinCode && (
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          Join code: <span className="font-mono font-semibold">{activeSession.onlineJoinCode}</span>
                        </div>
                        {joinUrl && (
                          <Button variant="outline" onClick={copyJoinLink}>
                            Copy join link
                          </Button>
                        )}
                      </div>
                      {joinUrl && <div className="text-xs text-muted-foreground break-all">{joinUrl}</div>}
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Fingerprint scan</CardTitle>
                        <CardDescription>Scan a fingerprint (or type the student number) then press Enter.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            captureByStudentNumber("fingerprint")
                          }}
                          className="flex gap-2"
                        >
                          <Input
                            value={scanValue}
                            onChange={(e) => setScanValue(e.target.value)}
                            placeholder="e.g. ST2024001"
                            disabled={!isStarter}
                          />
                          <Button type="submit" disabled={!isStarter}>
                            Capture
                          </Button>
                        </form>
                        {!isStarter && (
                          <div className="text-xs text-muted-foreground">
                            Only <strong>{activeSession.startedByUserName}</strong> can capture fingerprint/manual attendance for this class.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Manual mark</CardTitle>
                        <CardDescription>Type the student number and press Enter.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            captureByStudentNumber("manual")
                          }}
                          className="flex gap-2"
                        >
                          <Input
                            value={scanValue}
                            onChange={(e) => setScanValue(e.target.value)}
                            placeholder="e.g. ST2024001"
                            disabled={!isStarter}
                          />
                          <Button type="submit" variant="outline" disabled={!isStarter}>
                            Mark present
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Student's Duration (minutes)</div>
                      <Input
                        type="number"
                        min={1}
                        value={studentDurationMinutes}
                        onChange={(e) => setStudentDurationMinutes(Number(e.target.value))}
                        disabled={!isStarter}
                      />
                      <div className="text-[11px] text-muted-foreground">If unsure, use the class duration.</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Knowledge obtained</div>
                      <Textarea
                        value={knowledgeObtained}
                        onChange={(e) => setKnowledgeObtained(e.target.value)}
                        placeholder="Optional notes"
                        disabled={!isStarter}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Captured marks</CardTitle>
                  <CardDescription>Table format with required fields. Most recent first.</CardDescription>
                </CardHeader>
                <CardContent>
                  {marks.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No attendance captured yet.</div>
                  ) : (
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student no</TableHead>
                            <TableHead>Name and Surname</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Qualification Code</TableHead>
                            <TableHead>Qualification Name</TableHead>
                            <TableHead>Class Type</TableHead>
                            <TableHead>Module Code</TableHead>
                            <TableHead>Class Duration</TableHead>
                            <TableHead>Student&apos;s Duration</TableHead>
                            <TableHead>Knowledge obtained</TableHead>
                            <TableHead>Early / Late Arrival</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {marks.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell className="font-mono text-xs">{m.studentNumber}</TableCell>
                              <TableCell className="font-medium">{m.studentName}</TableCell>
                              <TableCell>{activeSession.department}</TableCell>
                              <TableCell>{activeSession.qualificationCode}</TableCell>
                              <TableCell>{activeSession.qualificationName}</TableCell>
                              <TableCell>
                                {formatClassType(activeSession)}
                                {formatOrientationSlot(activeSession) ? (
                                  <span className="ml-2 text-xs text-muted-foreground">({formatOrientationSlot(activeSession)})</span>
                                ) : null}
                              </TableCell>
                              <TableCell>{activeSession.moduleCode}</TableCell>
                              <TableCell>{activeSession.classDurationMinutes} min</TableCell>
                              <TableCell>{m.studentDurationMinutes ?? "—"}</TableCell>
                              <TableCell className="max-w-[260px] whitespace-pre-wrap">{m.knowledgeObtained ?? "—"}</TableCell>
                              <TableCell>
                                <Badge variant={computeArrivalLabel(activeSession, m) === "Late" ? "destructive" : "secondary"}>
                                  {computeArrivalLabel(activeSession, m)}
                                </Badge>
                              </TableCell>
                              <TableCell>{toLocalDate(activeSession.scheduledStartAt)}</TableCell>
                              <TableCell>{toLocalTime(activeSession.scheduledStartAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session history</CardTitle>
              <CardDescription>Most recent first.</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No sessions yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Started by</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Badge variant={s.status === "active" ? "secondary" : "outline"}>{s.status}</Badge>
                        </TableCell>
                        <TableCell>{s.groupId}</TableCell>
                        <TableCell>{s.moduleCode}</TableCell>
                        <TableCell>
                          {formatClassType(s)}
                          {formatOrientationSlot(s) ? (
                            <span className="ml-2 text-xs text-muted-foreground">({formatOrientationSlot(s)})</span>
                          ) : null}
                        </TableCell>
                        <TableCell>{s.deliveryMode}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(s.startedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.startedByUserName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

