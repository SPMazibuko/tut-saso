import { NextRequest } from "next/server"
import { createAttendanceMark, findSessionByJoinCode, getAttendanceSession, listAttendanceMarks } from "@/lib/attendance/store"
import type { AttendanceCaptureMethod } from "@/lib/attendance/types"

export const runtime = "nodejs"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

function isMethod(value: unknown): value is AttendanceCaptureMethod {
  return value === "fingerprint" || value === "manual" || value === "online"
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) return json({ error: "Missing sessionId" }, 400)
  return json({ marks: listAttendanceMarks(sessionId) })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<{
      sessionId: string
      joinCode: string
      studentId: number
      studentNumber: string
      studentName: string
      method: AttendanceCaptureMethod
      capturedByUserId?: string
      capturedByUserName?: string
      studentDurationMinutes?: number
      knowledgeObtained?: string
    }>

    if (!isMethod(body.method)) return json({ error: "Invalid method" }, 400)
    if (typeof body.studentId !== "number") return json({ error: "Missing studentId" }, 400)
    if (!body.studentNumber) return json({ error: "Missing studentNumber" }, 400)
    if (!body.studentName) return json({ error: "Missing studentName" }, 400)

    const studentDurationMinutes =
      typeof body.studentDurationMinutes === "number" && body.studentDurationMinutes > 0 ? body.studentDurationMinutes : undefined
    const knowledgeObtained = body.knowledgeObtained?.trim() ? body.knowledgeObtained.trim() : undefined

    // Online check-in uses joinCode (public)
    if (body.method === "online") {
      if (!body.joinCode) return json({ error: "Missing joinCode" }, 400)
      const session = findSessionByJoinCode(body.joinCode)
      if (!session) return json({ error: "Invalid/expired join code" }, 404)

      const mark = createAttendanceMark({
        sessionId: session.id,
        studentId: body.studentId,
        studentNumber: body.studentNumber,
        studentName: body.studentName,
        method: "online",
        studentDurationMinutes,
        knowledgeObtained,
      })
      return json({ mark }, 201)
    }

    // Fingerprint/manual capture requires the starter user (settings must be set by starter)
    if (!body.sessionId) return json({ error: "Missing sessionId" }, 400)
    if (!body.capturedByUserId || !body.capturedByUserName) return json({ error: "Missing user" }, 400)

    const session = getAttendanceSession(body.sessionId)
    if (!session) return json({ error: "Session not found" }, 404)
    if (session.startedByUserId !== body.capturedByUserId) {
      return json({ error: "Only the user who started the class can capture attendance" }, 403)
    }

    const mark = createAttendanceMark({
      sessionId: session.id,
      studentId: body.studentId,
      studentNumber: body.studentNumber,
      studentName: body.studentName,
      method: body.method,
      capturedByUserId: body.capturedByUserId,
      capturedByUserName: body.capturedByUserName,
      studentDurationMinutes,
      knowledgeObtained,
    })

    return json({ mark }, 201)
  } catch (err: any) {
    return json({ error: err?.message ?? "Unexpected error" }, 500)
  }
}

