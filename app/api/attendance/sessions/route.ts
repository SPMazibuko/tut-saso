import { NextRequest } from "next/server"
import { createAttendanceSession, ensureSessionsSeeded, listAttendanceSessions } from "@/lib/attendance/store"
import { getSessionStats } from "@/lib/attendance/session-roster"
import type { AttendanceSessionSettings, ClassDeliveryMode, ClassType, OrientationSessionSlot } from "@/lib/attendance/types"
import { mockIdentifiedModules } from "@/lib/mock/module-identification"

export const runtime = "nodejs"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

function isClassType(value: unknown): value is ClassType {
  return (
    value === "Tutorial Session" ||
    value === "Mentor Session" ||
    value === "Studython" ||
    value === "Lecture Session" ||
    value === "Orientation" ||
    value === "Other"
  )
}

function isDeliveryMode(value: unknown): value is ClassDeliveryMode {
  return value === "physical" || value === "hybrid" || value === "online"
}

function isOrientationSlot(value: unknown): value is OrientationSessionSlot {
  return value === "morning" || value === "late"
}

export async function GET(req: NextRequest) {
  // Seed from same module list as client so drilldown filter (department + moduleCode) always matches
  ensureSessionsSeeded(
    mockIdentifiedModules.map((m) => ({ department: m.department, moduleCode: m.moduleCode }))
  )

  const { searchParams } = new URL(req.url)
  const department = searchParams.get("department")?.trim() || undefined
  const moduleCode = searchParams.get("moduleCode")?.trim() || undefined
  const includeStats = searchParams.get("includeStats") === "1"

  const sessions = listAttendanceSessions().filter((s) => {
    if (department && s.department !== department) return false
    if (moduleCode && s.moduleCode !== moduleCode) return false
    return true
  })

  if (!includeStats) return json({ sessions })

  const statsBySessionId: Record<
    string,
    {
      attendedCount: number
      totalQuestions: number
      totalResponses: number
      registeredCount: number
      participantsCount: number
      probationCount: number
      readmittedCount: number
    }
  > = {}

  for (const s of sessions) {
    statsBySessionId[s.id] = getSessionStats(s.id)
  }

  return json({ sessions, statsBySessionId })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<
      AttendanceSessionSettings & { startedByUserId: string; startedByUserName: string }
    >

    if (!body.startedByUserId || !body.startedByUserName) return json({ error: "Missing user" }, 400)
    if (!body.groupId) return json({ error: "Missing groupId" }, 400)
    if (!body.department) return json({ error: "Missing department" }, 400)
    if (!body.qualificationCode) return json({ error: "Missing qualificationCode" }, 400)
    if (!body.qualificationName) return json({ error: "Missing qualificationName" }, 400)
    if (!body.moduleCode) return json({ error: "Missing moduleCode" }, 400)
    if (!isClassType(body.classType)) return json({ error: "Invalid classType" }, 400)
    if (!isDeliveryMode(body.deliveryMode)) return json({ error: "Invalid deliveryMode" }, 400)
    if (!body.scheduledStartAt) return json({ error: "Missing scheduledStartAt" }, 400)
    if (typeof body.classDurationMinutes !== "number" || body.classDurationMinutes <= 0) {
      return json({ error: "Missing/invalid classDurationMinutes" }, 400)
    }
    if (body.classType === "Other" && !body.otherClassTypeLabel?.trim()) {
      return json({ error: "Please provide a description for class type: Other" }, 400)
    }
    if (body.classType === "Orientation" && !isOrientationSlot(body.orientationSession)) {
      return json({ error: "Missing/invalid orientation register (morning/late)" }, 400)
    }

    const session = createAttendanceSession({
      startedByUserId: body.startedByUserId,
      startedByUserName: body.startedByUserName,
      groupId: body.groupId,
      department: body.department,
      qualificationCode: body.qualificationCode,
      qualificationName: body.qualificationName,
      moduleCode: body.moduleCode,
      classType: body.classType,
      orientationSession: body.orientationSession,
      otherClassTypeLabel: body.otherClassTypeLabel,
      scheduledStartAt: body.scheduledStartAt,
      classDurationMinutes: body.classDurationMinutes,
      deliveryMode: body.deliveryMode,
    })

    return json({ session }, 201)
  } catch (err: any) {
    return json({ error: err?.message ?? "Unexpected error" }, 500)
  }
}

