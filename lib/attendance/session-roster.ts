/**
 * Deterministic session roster and per-student stats.
 * Maps attendance-store student IDs (1-60) to Learner records for probation/readmitted flags.
 */

import type { Learner } from "@/lib/types"
import { mockStudents } from "@/lib/mock-data"
import { listAttendanceMarks } from "@/lib/attendance/store"
import { getSessionAnalytics } from "@/lib/classpoint/mock-analytics"

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/** Roster pool size (matches attendance store seeding). */
const ROSTER_SIZE = 60

export interface SessionRosterRow {
  studentId: number
  studentNumber: string
  studentName: string
  attended: boolean
  attemptedQuestions: number
  attemptedPct: number
  participant: boolean
  isOnProbation: boolean
  isReadmitted: boolean
}

export interface SessionRosterResult {
  rows: SessionRosterRow[]
  totals: {
    registeredCount: number
    attendedCount: number
    participantsCount: number
    probationCount: number
    readmittedCount: number
  }
}

/** Get deterministic roster for a session with per-student attempted % and participant flag. */
export function getSessionRoster(sessionId: string): SessionRosterResult {
  const marks = listAttendanceMarks(sessionId)
  const attendedIds = new Set(marks.map((m) => m.studentId))
  const marksByStudent = new Map(marks.map((m) => [m.studentId, m]))

  const analytics = getSessionAnalytics(sessionId)
  const totalQuestions = analytics.totalQuestions

  const learnerById = new Map<number, Learner>()
  for (const s of mockStudents) {
    if (s.id >= 1 && s.id <= ROSTER_SIZE) {
      learnerById.set(s.id, s)
    }
  }

  const rows: SessionRosterRow[] = []
  let participantsCount = 0
  let probationCount = 0
  let readmittedCount = 0

  for (let id = 1; id <= ROSTER_SIZE; id++) {
    const learner = learnerById.get(id)
    const mark = marksByStudent.get(id)
    const attended = !!mark

    let attemptedQuestions = 0
    if (attended) {
      const rng = seededRandom(hashString(`${sessionId}-${id}`))
      const attemptPct = 0.3 + rng() * 0.65
      attemptedQuestions = Math.round(totalQuestions * attemptPct)
      attemptedQuestions = Math.min(attemptedQuestions, totalQuestions)
    }

    const attemptedPct = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0
    const participant = attended && attemptedPct > 50

    const studentNumber = mark?.studentNumber ?? `ST2024${String(id).padStart(3, "0")}`
    const studentName = mark?.studentName ?? (learner ? `${learner.name} ${learner.surname}` : `Student ${id}`)

    const isOnProbation = learner?.isOnProbation === true
    const isReadmitted = learner?.isReadmitted === true

    if (participant) participantsCount++
    if (isOnProbation) probationCount++
    if (isReadmitted) readmittedCount++

    rows.push({
      studentId: id,
      studentNumber,
      studentName,
      attended,
      attemptedQuestions,
      attemptedPct,
      participant,
      isOnProbation,
      isReadmitted,
    })
  }

  return {
    rows,
    totals: {
      registeredCount: ROSTER_SIZE,
      attendedCount: attendedIds.size,
      participantsCount,
      probationCount,
      readmittedCount,
    },
  }
}

/** Compute session stats only (for sessions list). */
export function getSessionStats(sessionId: string): {
  registeredCount: number
  attendedCount: number
  participantsCount: number
  probationCount: number
  readmittedCount: number
  totalQuestions: number
  totalResponses: number
} {
  const { totals } = getSessionRoster(sessionId)
  const analytics = getSessionAnalytics(sessionId)
  return {
    ...totals,
    totalQuestions: analytics.totalQuestions,
    totalResponses: analytics.totalResponses,
  }
}
