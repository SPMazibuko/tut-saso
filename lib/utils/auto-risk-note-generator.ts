import type { RiskNote, RiskNoteTrigger } from "@/lib/types"
import { shouldTriggerRiskNote, generateRiskNoteMessage } from "./risk-notes"

/**
 * Student performance data interface for risk note generation
 */
export interface StudentPerformanceData {
  studentId: string
  studentNumber: string
  studentName: string
  studentEmail: string
  moduleCode: string
  moduleName: string
  department: string
  attendance?: number
  participation?: number
  performance?: number
  tutorialSessions?: number
}

/**
 * Automatically generate risk notes for students with metrics below 70%
 */
export function generateAutoRiskNotes(
  students: StudentPerformanceData[]
): RiskNote[] {
  const riskNotes: RiskNote[] = []
  const now = new Date()
  
  students.forEach(student => {
    // Check if student should trigger a risk note
    const triggers = shouldTriggerRiskNote(
      student.attendance,
      student.participation,
      student.performance,
      student.tutorialSessions
    )
    
    // Only create risk note if there are triggers
    if (triggers.length > 0) {
      const riskNote: RiskNote = {
        id: `rn-${student.studentId}-${student.moduleCode}-${now.getTime()}`,
        studentId: student.studentId,
        studentNumber: student.studentNumber,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        moduleCode: student.moduleCode,
        moduleName: student.moduleName,
        department: student.department as any,
        triggers,
        status: 'new',
        escalationLevel: 'aeo',
        createdAt: now,
        attendancePercentage: student.attendance,
        participationPercentage: student.participation,
        performancePercentage: student.performance,
        tutorialSessionsPercentage: student.tutorialSessions,
        workingDaysSinceCreation: 0,
        workingDaysSinceLastEscalation: 0,
        communicationId: `conv-${student.studentId}-${now.getTime()}`,
      }
      
      riskNotes.push(riskNote)
    }
  })
  
  return riskNotes
}

/**
 * Check if a student needs a risk note based on current metrics
 */
export function needsRiskNote(
  attendance?: number,
  participation?: number,
  performance?: number,
  tutorialSessions?: number
): boolean {
  const triggers = shouldTriggerRiskNote(attendance, participation, performance, tutorialSessions)
  return triggers.length > 0
}

/**
 * Get the risk note message for a student
 */
export function getRiskNoteMessage(
  studentName: string,
  triggers: RiskNoteTrigger[],
  escalationLevel: 'aeo' | 'hod' | 'assistant_dean' = 'aeo'
): string {
  return generateRiskNoteMessage(studentName, triggers, escalationLevel)
}

