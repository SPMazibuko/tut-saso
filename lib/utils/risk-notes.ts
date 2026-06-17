import type { RiskNote, RiskNoteTrigger, RiskNoteType, EscalationLevel, RiskNoteStatus } from "@/lib/types"

const RISK_THRESHOLD = 70 // 70% threshold
const ESCALATION_DAYS = 5 // 5 working days

/**
 * Calculate working days between two dates (excluding weekends)
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

/**
 * Add a specified number of working days to a date (excluding weekends)
 */
export function addWorkingDays(startDate: Date, workingDays: number): Date {
  const result = new Date(startDate)
  let daysAdded = 0
  
  while (daysAdded < workingDays) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    // Only count weekdays (Monday-Friday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++
    }
  }
  
  return result
}

/**
 * Check if a student should trigger a risk note based on metrics
 */
export function shouldTriggerRiskNote(
  attendance?: number,
  participation?: number,
  performance?: number,
  tutorialSessions?: number
): RiskNoteTrigger[] {
  const triggers: RiskNoteTrigger[] = []
  
  if (attendance !== undefined && attendance < RISK_THRESHOLD) {
    triggers.push({
      type: 'attendance',
      value: attendance,
      threshold: RISK_THRESHOLD,
      triggered: true
    })
  }
  
  if (participation !== undefined && participation < RISK_THRESHOLD) {
    triggers.push({
      type: 'participation',
      value: participation,
      threshold: RISK_THRESHOLD,
      triggered: true
    })
  }
  
  if (performance !== undefined && performance < RISK_THRESHOLD) {
    triggers.push({
      type: 'performance',
      value: performance,
      threshold: RISK_THRESHOLD,
      triggered: true
    })
  }
  
  if (tutorialSessions !== undefined && tutorialSessions < RISK_THRESHOLD) {
    triggers.push({
      type: 'tutorial_sessions',
      value: tutorialSessions,
      threshold: RISK_THRESHOLD,
      triggered: true
    })
  }
  
  return triggers
}

/**
 * Determine if a risk note should be escalated
 */
export function shouldEscalate(riskNote: RiskNote): boolean {
  const now = new Date()
  const lastEscalationDate = riskNote.lastEscalatedAt || riskNote.createdAt
  const workingDaysSinceLastEscalation = calculateWorkingDays(lastEscalationDate, now)
  
  return workingDaysSinceLastEscalation >= ESCALATION_DAYS
}

/**
 * Get the next escalation level
 */
export function getNextEscalationLevel(currentLevel: EscalationLevel): EscalationLevel | null {
  switch (currentLevel) {
    case 'aeo':
      return 'hod'
    case 'hod':
      return 'assistant_dean'
    case 'assistant_dean':
      return null // Already at highest level
    default:
      return 'aeo'
  }
}

/**
 * Get the status based on escalation level
 */
export function getStatusFromEscalationLevel(level: EscalationLevel): RiskNoteStatus {
  switch (level) {
    case 'aeo':
      return 'aeo_review'
    case 'hod':
      return 'hod_review'
    case 'assistant_dean':
      return 'assistant_dean_review'
    default:
      return 'new'
  }
}

/**
 * Check if a risk note has improved (all metrics above threshold)
 */
export function hasImproved(
  attendance?: number,
  participation?: number,
  performance?: number,
  tutorialSessions?: number
): boolean {
  const checks = [
    attendance === undefined || attendance >= RISK_THRESHOLD,
    participation === undefined || participation >= RISK_THRESHOLD,
    performance === undefined || performance >= RISK_THRESHOLD,
    tutorialSessions === undefined || tutorialSessions >= RISK_THRESHOLD
  ]
  
  return checks.every(check => check === true)
}

/**
 * Generate risk note summary from a list of risk notes
 */
export function generateRiskNoteSummary(riskNotes: RiskNote[]): {
  total: number
  new: number
  improved: number
  stillDisengaged: number
  byEscalationLevel: {
    aeo: number
    hod: number
    assistant_dean: number
  }
  byType: {
    attendance: number
    participation: number
    performance: number
    tutorial_sessions: number
  }
  byStatus: {
    new: number
    aeo_review: number
    hod_review: number
    assistant_dean_review: number
    improved: number
    resolved: number
    disengaged: number
  }
} {
  const summary = {
    total: riskNotes.length,
    new: 0,
    improved: 0,
    stillDisengaged: 0,
    byEscalationLevel: {
      aeo: 0,
      hod: 0,
      assistant_dean: 0
    },
    byType: {
      attendance: 0,
      participation: 0,
      performance: 0,
      tutorial_sessions: 0
    },
    byStatus: {
      new: 0,
      aeo_review: 0,
      hod_review: 0,
      assistant_dean_review: 0,
      improved: 0,
      resolved: 0,
      disengaged: 0
    }
  }
  
  riskNotes.forEach(note => {
    // Count by status
    summary.byStatus[note.status]++
    
    // Count by escalation level
    summary.byEscalationLevel[note.escalationLevel]++
    
    // Count by trigger types
    note.triggers.forEach(trigger => {
      summary.byType[trigger.type]++
    })
    
    // Count new, improved, and disengaged
    if (note.status === 'new' || note.status === 'aeo_review') {
      summary.new++
    }
    if (note.status === 'improved') {
      summary.improved++
    }
    if (note.status === 'disengaged') {
      summary.stillDisengaged++
    }
  })
  
  return summary
}

/**
 * Generate a risk note message for a student
 */
export function generateRiskNoteMessage(
  studentName: string,
  triggers: RiskNoteTrigger[],
  escalationLevel: EscalationLevel
): string {
  const triggerDescriptions = triggers.map(t => {
    switch (t.type) {
      case 'attendance':
        return `Your attendance is currently at ${t.value}%, which is below the required 70% threshold.`
      case 'participation':
        return `Your participation rate is currently at ${t.value}%, which is below the required 70% threshold.`
      case 'performance':
        return `Your academic performance is currently at ${t.value}%, which is below the required 70% threshold.`
      case 'tutorial_sessions':
        return `Your tutorial session attendance is currently at ${t.value}%, which is below the required 70% threshold.`
      default:
        return ''
    }
  }).filter(Boolean)
  
  const levelMessage = escalationLevel === 'aeo' 
    ? 'This risk note has been sent to the Academic Excellence Office (AEO) for review.'
    : escalationLevel === 'hod'
    ? 'This risk note has been escalated to the Head of Department (HOD) for review.'
    : 'This risk note has been escalated to the Assistant Dean for review.'
  
  return `Dear ${studentName},

This is an automated risk note to inform you that your academic performance requires attention.

${triggerDescriptions.join('\n\n')}

${levelMessage}

Please contact your lecturer or academic advisor to discuss your progress and available support options. We are here to help you succeed in your studies.

Best regards,
Academic Support Team`
}

