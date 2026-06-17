"use client"

// Alert escalation workflows

type EscalationEvent = {
  id: string
  studentId: string
  level: "school" | "district" | "province"
  reason: string
  at: Date
}

const events: EscalationEvent[] = []

export function escalate(studentId: string, level: EscalationEvent["level"], reason: string): EscalationEvent {
  const e: EscalationEvent = { id: `esc-${Date.now()}`, studentId, level, reason, at: new Date() }
  events.unshift(e)
  return e
}

export function listEscalations(studentId?: string): EscalationEvent[] {
  return studentId ? events.filter((e) => e.studentId === studentId) : events
}

