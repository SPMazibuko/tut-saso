import type {
  LearnerProfile,
  RiskLevel,
  SupportType,
  InterventionCase,
  RolePlayerType,
  ChatWorkflowMode,
  Intervention,
} from "./types"
import {
  mockStudents,
  mockRiskFactors,
  mockAssessments,
  mockSBABreakdowns,
  mockAttendanceRecords,
  mockInterventionCases,
  mockInterventions,
} from "./mock-data"

/**
 * Retrieve learner profile from system data
 */
export function getLearnerProfile(studentId: string): LearnerProfile | null {
  const student = mockStudents.find((s) => s.id === studentId)
  if (!student) return null

  const assessments = mockAssessments.filter((a) => a.studentId === studentId)
  const sbaBreakdowns = mockSBABreakdowns.filter((sba) => sba.studentId === studentId)
  const riskFlags = mockRiskFactors.filter((rf) => rf.studentId === studentId)
  const attendancePattern = mockAttendanceRecords
    .filter((a) => a.studentId === studentId)
    .slice(-30) // Last 30 records
    .map((a) => ({
      date: a.date,
      status: a.status,
    }))

  return {
    studentId,
    grade: student.grade,
    attendanceRate: student.attendanceRate,
    attendancePattern,
    assessments,
    sbaBreakdowns,
    riskFlags,
    // currentAPS: student.aps,
    overallRiskLevel: student.riskLevel,
    overallRiskScore: student.riskScore,
  }
}

/**
 * Detect workflow mode from learner's message
 */
export function detectWorkflowMode(message: string, history: any[]): ChatWorkflowMode {
  const lowerMessage = message.toLowerCase()
  const fullConversation = [...history.map((h) => h.content.toLowerCase()), lowerMessage].join(" ")

  // Wellness indicators
  const wellnessKeywords = [
    "stress",
    "anxiety",
    "depressed",
    "sad",
    "upset",
    "worried",
    "overwhelmed",
    "feel",
    "emotion",
    "motivation",
    "tired",
    "exhausted",
    "help me",
    "struggling emotionally",
    "mental health",
    "counselor",
    "therapy",
  ]

  // Academic indicators
  const academicKeywords = [
    "homework",
    "test",
    "exam",
    "assignment",
    "study",
    "learn",
    "understand",
    "explain",
    "question",
    "problem",
    "solve",
    "math",
    "science",
    "subject",
    "grade",
    "marks",
    "formula",
    "concept",
  ]

  const wellnessScore = wellnessKeywords.filter((kw) => fullConversation.includes(kw)).length
  const academicScore = academicKeywords.filter((kw) => fullConversation.includes(kw)).length

  if (wellnessScore > academicScore && wellnessScore > 0) {
    return "wellness"
  }
  if (academicScore > 0) {
    return "academic"
  }
  return "unknown"
}

/**
 * Determine risk level based on learner profile and conversation context
 */
export function determineRiskLevel(
  profile: LearnerProfile,
  workflowMode: ChatWorkflowMode,
  conversationContext?: string,
): RiskLevel {
  let riskScore = 0

  // Attendance factors
  if (profile.attendanceRate < 70) riskScore += 30
  else if (profile.attendanceRate < 85) riskScore += 15

  // Academic performance factors
  const avgScore = profile.assessments
    .filter((a) => a.percentage !== undefined)
    .reduce((sum, a) => sum + (a.percentage || 0), 0) / profile.assessments.length || 0

  if (avgScore < 40) riskScore += 35
  else if (avgScore < 50) riskScore += 20
  else if (avgScore < 60) riskScore += 10

  // Risk flags
  const highRiskFlags = profile.riskFlags.filter((rf) => rf.severity === "high" || rf.severity === "critical").length
  riskScore += highRiskFlags * 15

  // Missing assessments
  const missingAssessments = profile.assessments.filter((a) => a.status === "missed" || a.status === "absent").length
  riskScore += missingAssessments * 10

  // Context analysis for wellness
  if (workflowMode === "wellness" && conversationContext) {
    const lowerContext = conversationContext.toLowerCase()
    if (lowerContext.includes("crisis") || lowerContext.includes("harm")) {
      riskScore = 100 // Immediate high risk
    } else if (
      lowerContext.includes("suicide") ||
      lowerContext.includes("end it") ||
      lowerContext.includes("kill myself")
    ) {
      riskScore = 100 // Critical
    } else if (
      lowerContext.includes("very") ||
      lowerContext.includes("extremely") ||
      lowerContext.includes("always") ||
      lowerContext.includes("never")
    ) {
      riskScore += 20
    }
  }

  // Determine risk level
  if (riskScore >= 70) return "high"
  if (riskScore >= 40) return "moderate"
  return "low"
}

/**
 * Determine support type based on workflow and context
 */
export function determineSupportType(
  workflowMode: ChatWorkflowMode,
  message: string,
  profile: LearnerProfile,
): SupportType {
  if (workflowMode === "wellness") {
    const lower = message.toLowerCase()
    if (lower.includes("stress") || lower.includes("anxiety")) return "stress-management"
    if (lower.includes("motivation") || lower.includes("motivated")) return "motivation-coaching"
    return "wellness-support"
  }

  // Academic workflow
  const lower = message.toLowerCase()
  if (lower.includes("study") || lower.includes("prep") || lower.includes("prepare")) return "study-skills"
  if (lower.includes("understand") || lower.includes("concept") || lower.includes("explain")) {
    // Check if there are foundational gaps
    const lowScores = profile.assessments.filter((a) => (a.percentage || 0) < 50)
    if (lowScores.length > 2) return "foundational-gap-filling"
    return "concept-remediation"
  }
  return "content-coaching"
}

/**
 * Create diagnostic questions for academic workflow
 */
export function generateDiagnosticQuestions(
  subject: string | null,
  topic: string | null,
  grade: string,
): Array<{ question: string; purpose: string }> {
  const questions: Array<{ question: string; purpose: string }> = []

  // Detect prerequisite concepts based on grade and topic
  if (subject && topic) {
    // Grade 12 example - check Grade 10-11 foundations
    if (grade === "12") {
      questions.push({
        question: `Before we tackle ${topic} at Grade 12 level, let me check your foundational understanding. Can you solve: x² - 5x + 6 = 0?`,
        purpose: "test_quadratic_equations",
      })
    }

    // General diagnostic
    questions.push({
      question: `What is your current understanding of ${topic}? Can you explain it in your own words?`,
      purpose: "assess_current_knowledge",
    })
  } else {
    // General questions if subject/topic not detected
    questions.push({
      question: "What specific concept or topic would you like help with?",
      purpose: "identify_topic",
    })
    questions.push({
      question: "On a scale of 1-10, how confident do you feel about this topic?",
      purpose: "assess_confidence",
    })
  }

  return questions.slice(0, 3) // Limit to 3 questions
}

/**
 * Log intervention case
 */
export function logInterventionCase(caseData: Omit<InterventionCase, "id" | "timestamp">): InterventionCase {
  const newCase: InterventionCase = {
    ...caseData,
    id: `case-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date(),
    escalated: false,
    closed: false,
  }

  mockInterventionCases.push(newCase)

  // If high risk, automatically create intervention task
  if (caseData.riskLevel === "high" && caseData.rootCause === "academic") {
    const newIntervention: Intervention = {
      id: `int${mockInterventions.length + 1}`,
      studentId: caseData.studentId,
      title: `AI-Generated Academic Support: ${caseData.supportType}`,
      description: caseData.aiSummary,
      type: "academic-support",
      status: "planned",
      assignedTo: "teacher@tut.ac.za", // Default assignment
      createdBy: "ai-system",
      createdAt: new Date(),
      startDate: new Date(),
      notes: `Risk Level: ${caseData.riskLevel}. Generated from AI Chat Assistant.`,
    }
    mockInterventions.push(newIntervention)
  }

  return newCase
}

/**
 * Escalate intervention case to human role player
 */
export function escalateInterventionCase(
  caseId: string,
  rolePlayerType: RolePlayerType,
  assignedTo?: string,
): boolean {
  const interventionCase = mockInterventionCases.find((c) => c.id === caseId)
  if (!interventionCase) return false

  interventionCase.escalated = true
  interventionCase.escalatedAt = new Date()
  interventionCase.assignedRolePlayerType = rolePlayerType
  if (assignedTo) {
    interventionCase.humanRolePlayerAssigned = assignedTo
  }

  // Create intervention entry
  const newIntervention: Intervention = {
    id: `int${mockInterventions.length + 1}`,
    studentId: interventionCase.studentId,
    title: `AI Escalation: ${rolePlayerType}`,
    description: interventionCase.aiSummary,
    type: rolePlayerType === "counselor" || rolePlayerType === "psychologist" ? "counseling" : "mentoring",
    status: "planned",
    assignedTo: assignedTo || "admin@tut.ac.za",
    createdBy: "ai-system",
    createdAt: new Date(),
    startDate: new Date(),
    notes: `Escalated from AI Chat. Risk Level: ${interventionCase.riskLevel}. Context: ${interventionCase.conversationContext || "N/A"}`,
  }
  mockInterventions.push(newIntervention)

  return true
}

/**
 * Get available role players for wellness workflow
 */
export function getAvailableRolePlayers(): Array<{ type: RolePlayerType; name: string; description: string }> {
  return [
    {
      type: "counselor",
      name: "School Counselor",
      description: "Professional counseling support for emotional and social challenges",
    },
    {
      type: "psychologist",
      name: "Educational Psychologist",
      description: "Specialized psychological support for deeper mental health concerns",
    },
    {
      type: "mentor",
      name: "Peer Mentor",
      description: "Supportive peer guidance and mentorship",
    },
    {
      type: "academic-advisor",
      name: "Academic Advisor",
      description: "Guidance on academic planning and study strategies",
    },
    {
      type: "student-support-officer",
      name: "Student Support Officer",
      description: "General student support and advocacy",
    },
    {
      type: "social-worker",
      name: "Social Worker",
      description: "Support for social and family-related challenges",
    },
  ]
}

/**
 * Get intervention case by ID
 */
export function getInterventionCase(caseId: string): InterventionCase | undefined {
  return mockInterventionCases.find((c) => c.id === caseId)
}

/**
 * Update intervention case
 */
export function updateInterventionCase(
  caseId: string,
  updates: Partial<Omit<InterventionCase, "id" | "timestamp">>,
): InterventionCase | null {
  const interventionCase = mockInterventionCases.find((c) => c.id === caseId)
  if (!interventionCase) return null

  Object.assign(interventionCase, updates)
  if (updates.closed && !interventionCase.closedAt) {
    interventionCase.closedAt = new Date()
  }
  if (updates.escalated && !interventionCase.escalatedAt) {
    interventionCase.escalatedAt = new Date()
  }

  return interventionCase
}

/**
 * Get intervention cases by student ID
 */
export function getInterventionCasesByStudent(studentId: string): InterventionCase[] {
  return mockInterventionCases.filter((c) => c.studentId === studentId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

/**
 * Get intervention cases by status (open/closed/escalated)
 */
export function getInterventionCasesByStatus(status: "open" | "closed" | "escalated" | "all"): InterventionCase[] {
  if (status === "all") return mockInterventionCases
  if (status === "closed") return mockInterventionCases.filter((c) => c.closed)
  if (status === "escalated") return mockInterventionCases.filter((c) => c.escalated && !c.closed)
  return mockInterventionCases.filter((c) => !c.closed)
}

/**
 * Get intervention case analytics
 */
export interface InterventionCaseAnalytics {
  totalCases: number
  openCases: number
  closedCases: number
  escalatedCases: number
  averageResponseTime: number // in hours
  averageResolutionTime: number // in hours
  casesByRootCause: Record<string, number>
  casesByRiskLevel: Record<string, number>
  casesBySupportType: Record<string, number>
  resolutionRate: number // percentage
}

/**
 * Get intervention case analytics
 */
export function getInterventionCaseAnalytics(studentId?: string): InterventionCaseAnalytics {
  const cases = studentId ? getInterventionCasesByStudent(studentId) : mockInterventionCases

  const openCases = cases.filter((c) => !c.closed).length
  const closedCases = cases.filter((c) => c.closed).length
  const escalatedCases = cases.filter((c) => c.escalated && !c.closed).length

  // Calculate response times (time from case creation to escalation or first action)
  const responseTimes: number[] = []
  cases.forEach((c) => {
    if (c.escalatedAt) {
      const hours = (c.escalatedAt.getTime() - c.timestamp.getTime()) / (1000 * 60 * 60)
      responseTimes.push(hours)
    }
  })
  const averageResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

  // Calculate resolution times (time from case creation to closure)
  const resolutionTimes: number[] = []
  cases.forEach((c) => {
    if (c.closed && c.closedAt) {
      const hours = (c.closedAt.getTime() - c.timestamp.getTime()) / (1000 * 60 * 60)
      resolutionTimes.push(hours)
    }
  })
  const averageResolutionTime = resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0

  // Cases by root cause
  const casesByRootCause: Record<string, number> = {}
  cases.forEach((c) => {
    casesByRootCause[c.rootCause] = (casesByRootCause[c.rootCause] || 0) + 1
  })

  // Cases by risk level
  const casesByRiskLevel: Record<string, number> = {}
  cases.forEach((c) => {
    casesByRiskLevel[c.riskLevel] = (casesByRiskLevel[c.riskLevel] || 0) + 1
  })

  // Cases by support type
  const casesBySupportType: Record<string, number> = {}
  cases.forEach((c) => {
    casesBySupportType[c.supportType] = (casesBySupportType[c.supportType] || 0) + 1
  })

  const resolutionRate = cases.length > 0 ? (closedCases / cases.length) * 100 : 0

  return {
    totalCases: cases.length,
    openCases,
    closedCases,
    escalatedCases,
    averageResponseTime: Math.round(averageResponseTime * 10) / 10,
    averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
    casesByRootCause,
    casesByRiskLevel,
    casesBySupportType,
    resolutionRate: Math.round(resolutionRate * 10) / 10,
  }
}

/**
 * Get recent intervention cases
 */
export function getRecentInterventionCases(limit: number = 50): InterventionCase[] {
  return mockInterventionCases
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

/**
 * Close intervention case
 */
export function closeInterventionCase(caseId: string, closedBy: "ai" | "human" = "human"): boolean {
  const interventionCase = mockInterventionCases.find((c) => c.id === caseId)
  if (!interventionCase) return false

  interventionCase.closed = true
  interventionCase.closedBy = closedBy
  interventionCase.closedAt = new Date()

  return true
}

