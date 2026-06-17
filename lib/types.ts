// Core data types for the iPASS system

export type UserRole = "admin" | "teacher" | "student" | "parent" | "district-admin" | "provincial-admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
}


export interface Conversation {
  id: string
  participants: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserType
    avatar?: string
    readStatus: ReadStatus
  }[]
  isGroup?: boolean
  name?: string
  lastMessage?: {
    id: string
    conversationId: string
    senderId: string
    content: string
    sentAt: Date
    readBy: string[]
  }
  timestamp?: Date
  unread?: number
  subjectMatter: SubjectMatter
  isViewOnly: boolean
  unreadCount?: number
  readStats: ReadStats
  tags?: string[]
}

// Class List Types
export type SubjectCode = string
export type AcademicStatus = "First-time" | "Academic Warning" | "Repeating Grade" | "Repeating Subject"
export interface AssessmentScore {
  AS: number
  CT: number
  WR: number
  PP: number
}
export interface AttendanceSummary {
  attended: number
  total: number
  percentage: number
}

export interface Learner {
  id: number
  studentNumber: string
  name: string
  surname: string
  email: string
  academicStatus: AcademicStatus
  subjectCode: SubjectCode
  /** Module code for analytics (e.g. ENG101, BUS101). Optional for backward compatibility. */
  moduleCode?: string
  /** SA course/programme code (e.g. ENG, BUS, HRM) – derived from moduleCode or set explicitly. */
  courseCode?: string
  assessments: AssessmentScore
  attendance: AttendanceSummary
  riskLevel: "Good" | "At Risk" | "Satisfactory"
  enrollmentYear: number
  semester: number
  teacherId: number
  previousSubjects: string[]
  group?: string
  // Legacy fields for backward compatibility
  grade?: string
  enrollmentDate?: Date
  avatar?: string
  aps?: number
  attendanceRate?: number
  riskScore?: number
  lastAssessment?: Date
  householdLanguage?: string
  householdIncomeBracket?: "low" | "middle" | "high"
  provinceId?: string
  districtId?: string
  schoolId?: string
  sciBono?: SciBonoPerformance
  gender?: "male" | "female" | "other"
  // Funding and residency fields for dashboard analytics
  fundingType?: "self" | "nsfas"
  residency?: "onCampus" | "offCampus"
  isReadmitted?: boolean
  conditionalLetterSigned?: boolean
  probationFormSigned?: boolean
  // Dropout and financial exclusion tracking
  financiallyExcluded?: boolean
  hasDroppedOut?: boolean
  /** Date when funding was removed/revoked (ISO string) */
  fundingRemovedAt?: string
  /** Date when student was financially excluded (ISO string) */
  financiallyExcludedAt?: string
  /** Date when student dropped out (ISO string) */
  droppedOutAt?: string
  /** Date when student was readmitted after exclusion (ISO string) */
  readmittedAt?: string
  // Probation tracking
  isOnProbation?: boolean
  probationReason?: "module_cancellation" | "low_credits" | "academic_performance" | "other"
  registeredCredits?: number
  requiredCredits?: number
}

// Student Categories (Classlist tabs)
export type StudentCategory = "dropout" | "inactive" | "suspended-risk" | "active"
export type CategoryResponsible = "AD" | "HOD"

export interface TutorialSession {
  date: string
  time: string
  duration: string
}

export interface CategorizedStudent {
  id: number
  name: string
  studentNumber: string
  email: string
  academicStatus: string
  academicProgress: string
  lectureAttendance: number
  individualAssignments: number
  groupWork: number
  s1Score: number
  tutorials: (TutorialSession | null)[]
  onlineStudyDate: string
  contactSmartphone: string
  usageStudyStyle: string
  category: StudentCategory
  moduleCode?: string
}

export interface AcademicRecord {
  id: string
  studentId: string
  subject: string
  grade: number
  semester: string
  year: number
  credits: number
  teacherId: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  date: Date
  status: "present" | "absent" | "late" | "excused"
  courseId?: string
}

// Type alias for backward compatibility with class list view
export type AttendanceRecordSummary = AttendanceSummary

export interface RiskFactor {
  id: string
  studentId: string
  category: "academic" | "attendance" | "behavioral" | "social"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  detectedAt: Date
  resolved: boolean
}

export interface Intervention {
  id: string
  studentId: string
  title: string
  description: string
  type: "tutoring" | "counseling" | "mentoring" | "academic-support" | "other"
  status: "planned" | "in-progress" | "completed" | "cancelled"
  assignedTo: string
  createdBy: string
  createdAt: Date
  startDate: Date
  endDate?: Date
  notes: string
  outcome?: string
  escalationLevel?: "school" | "district" | "province"
}

// AI Chat Assistant Workflow Types
export type SupportType = 
  | "concept-remediation"
  | "study-skills"
  | "content-coaching"
  | "foundational-gap-filling"
  | "wellness-support"
  | "motivation-coaching"
  | "stress-management"
  | "other"

export type RiskLevel = "low" | "moderate" | "high"

export type RolePlayerType = 
  | "counselor"
  | "psychologist"
  | "mentor"
  | "academic-advisor"
  | "student-support-officer"
  | "social-worker"

export interface InterventionCase {
  id: string
  studentId: string
  rootCause: "academic" | "wellness" | "attendance" | "behavioral" | "social"
  supportType: SupportType
  riskLevel: RiskLevel
  timestamp: Date
  aiSummary: string
  conversationContext?: string // Brief summary of the conversation
  diagnosticQuestions?: Array<{ question: string; response: string }>
  consentedRolePlayers?: RolePlayerType[]
  escalated: boolean
  escalatedTo?: string
  escalatedAt?: Date
  closed: boolean
  closedBy?: "ai" | "human"
  closedAt?: Date
  humanRolePlayerAssigned?: string
  assignedRolePlayerType?: RolePlayerType
}

export interface LearnerProfile {
  studentId: string
  grade: string
  attendanceRate: number
  attendancePattern: Array<{ date: Date; status: "present" | "absent" | "late" | "excused" }>
  assessments: Assessment[]
  sbaBreakdowns: SBABreakdown[]
  riskFlags: RiskFactor[]
  historicalGrades?: Array<{ grade: string; aps: number; year: number }>
  currentAPS: number
  overallRiskLevel: Learner["riskLevel"]
  overallRiskScore: number
}

export type ChatWorkflowMode = "academic" | "wellness" | "unknown"

export type ChatWorkflowState = 
  | "intake"
  | "diagnostic-questions"
  | "analyzing"
  | "providing-guidance"
  | "consent-request" // Wellness only
  | "role-player-selection" // Wellness only
  | "completed"
  | "escalated"

export interface Alert {
  id: string
  studentId: string
  type: "risk-increase" | "attendance" | "grade-drop" | "behavioral"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  createdAt: Date
  read: boolean
  actionTaken: boolean
}

export interface DashboardStats {
  totalStudents: number
  atRiskStudents: number
  activeInterventions: number
  averageAttendance: number
  averageAPS: number
  alertsToday: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export interface Course {
  id: string
  name: string
  code: string
  teacher: string
  schedule: string
  room: string
  currentGrade: number
  credits: number
}

export interface Assignment {
  id: string
  courseId: string
  courseName: string
  title: string
  description: string
  dueDate: Date
  status: "pending" | "submitted" | "graded" | "late"
  grade?: number
  maxPoints: number
  submittedAt?: Date
}

// SBA (School-Based Assessment) and Assessment Types
export type AssessmentType = "test" | "assignment" | "project" | "practical" | "oral" | "sba-task"

export interface Assessment {
  id: string
  studentId: string
  subject: string
  type: AssessmentType
  title: string
  date: Date
  marksObtained?: number
  marksTotal: number
  percentage?: number
  status: "pending" | "completed" | "missed" | "absent"
  sbaCategory?: "test" | "assignment" | "project" | "practical" | "oral"
  term: string
  year: number
}

export interface SBABreakdown {
  studentId: string
  subject: string
  term: string
  year: number
  tests: Array<{ id: string; title: string; mark: number; total: number; date: Date }>
  assignments: Array<{ id: string; title: string; mark: number; total: number; date: Date }>
  projects: Array<{ id: string; title: string; mark: number; total: number; date: Date }>
  practicals: Array<{ id: string; title: string; mark: number; total: number; date: Date }>
  orals: Array<{ id: string; title: string; mark: number; total: number; date: Date }>
  overallSBA: number // Percentage
  averageScore: number
  trend: "improving" | "stable" | "declining"
}

export interface StudentActivity {
  id: string
  type: "assignment" | "exam" | "attendance" | "intervention" | "achievement"
  title: string
  description: string
  date: Date
  status: "completed" | "upcoming" | "missed"
  relatedCourse?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: "student" | "bot"
  content: string
  timestamp: Date
  sentiment?: "positive" | "neutral" | "negative" | "concerning"
  topics?: string[]
  language?: SupportedLanguage
}

// export interface Conversation {
//   id: string
//   studentId: string
//   studentName: string
//   startedAt: Date
//   lastMessageAt: Date
//   messageCount: number
//   overallSentiment: "positive" | "neutral" | "negative" | "concerning"
//   topics: string[]
//   flagged: boolean
//   flagReason?: string
// }

export interface CommunicationInsights {
  totalConversations: number
  activeStudents: number
  averageMessagesPerStudent: number
  flaggedConversations: number
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
    concerning: number
  }
  topTopics: Array<{
    topic: string
    count: number
    sentiment: "positive" | "neutral" | "negative" | "concerning"
  }>
  atRiskStudents: Array<{
    studentId: string
    studentName: string
    conversationCount: number
    concerningMessages: number
    lastContact: Date
    riskIndicators: string[]
  }>
}

export interface CommunicationHistory {
  id: string
  studentId: number
  role: string
  name: string
  threadCondition: string
  readStatus: "Read" | "Unread"
  dateSent: string
  dateRead: string
}

// Sci-Bono STEM Learning Platform Types
export interface SciBonoScores {
  robotics: {
    overallScore: number // 0-100
    circuitBuilder: number // 0-100
    robotDesign: number // 0-100
    physicsSimulation: number // 0-100
    activitiesCompleted: number
  }
  math: {
    overallScore: number // 0-100
    challengesCompleted: number
    puzzlesSolved: number
    adaptiveLevel: number // 1-10
    badgesEarned: number
  }
  aiTutor: {
    sessionsCompleted: number
    averageRating: number // 1-5
    topicsCovered: string[]
    helpRequests: number
  }
}

export interface SciBonoImprovements {
  preSciBono: {
    assessments: AssessmentScore
    attendance: AttendanceSummary
    riskLevel: Learner["riskLevel"]
  }
  postSciBono: {
    assessments: AssessmentScore
    attendance: AttendanceSummary
    riskLevel: Learner["riskLevel"]
  }
  improvements: {
    assessmentImprovement: number // Percentage points improvement
    attendanceImprovement: number // Percentage points improvement
    riskLevelChange: string // Description of change
  }
}

export interface SciBonoPerformance {
  isParticipant: boolean
  enrollmentDate?: Date
  completionDate?: Date
  status: "active" | "completed" | "inactive"
  scores: SciBonoScores
  attendance: number // Percentage
  badgesEarned: string[]
  improvements?: SciBonoImprovements
}

// Subject Types
export interface SubjectStats {
  academicWarning: number
  repeatingGrade: number
  repeatingSubjects: {
    first: number
    second: number
    third: number
    fourth: number
  }
  firstTime: number
  total: number
}

export interface Subject {
  id: string
  code: string
  name: string
  department: string
  riskLevel: "low" | "medium" | "high"
  stats: SubjectStats
}

// Group Types
export interface Group {
  id: string
  name: string
  description: string
}

// Governance hierarchy
export interface SchoolSummary {
  id: string
  name: string
  districtId: string
  provinceId: string
  stats: DashboardStats
}

export interface DistrictSummary {
  id: string
  name: string
  provinceId: string
  schools: number
  stats: DashboardStats
}

export interface SubDistrictSummary {
  id: string
  name: string
  districtId: string
  provinceId: string
  schools: number
  stats: DashboardStats
}

export interface ProvinceSummary {
  id: string
  name: string
  districts: number
  stats: DashboardStats
}

// AI/ML model metadata and explainability
export type ModelType = "risk-prediction" | "attendance-forecast" | "grade-forecast"

export interface ModelInfo {
  id: string
  name: string
  type: ModelType
  version: string
  trainedAt: Date
  features: string[]
  fairnessMetrics?: Array<{ group: string; metric: string; value: number }>
  status: "ready" | "training" | "error"
}

export interface PredictionInput {
  studentId: string
  features: Record<string, number | string>
}

export interface PredictionResult {
  studentId: string
  riskScore: number
  riskLevel: Learner["riskLevel"]
  shap?: Array<{ feature: string; contribution: number }>
}

// NLP and multilingual
export type SupportedLanguage =
  | "en"
  | "af"
  | "xh"
  | "zu"
  | "st"
  | "tn"
  | "ts"
  | "nr"
  | "ss"
  | "ve"
  | "nso"

export interface TranslationResult {
  source: SupportedLanguage
  target: SupportedLanguage
  originalText: string
  translatedText: string
}

// IoT schemas
export interface BiometricAttendanceEvent {
  id: string
  studentId: string
  timestamp: Date
  method: "fingerprint" | "rfid" | "facial"
  status: "success" | "failed"
}

export interface EnvSensorReading {
  id: string
  classroomId: string
  timestamp: Date
  temperatureC: number
  humidityPct: number
  co2ppm?: number
}

// Compliance and consent
export interface ConsentRecord {
  id: string
  userId: string
  scope: "analytics" | "communications" | "biometrics"
  granted: boolean
  timestamp: Date
  method: "parental" | "student" | "admin-override"
}

export interface DPIARecord {
  id: string
  process: string
  risksIdentified: string[]
  mitigations: string[]
  owner: string
  lastReviewedAt: Date
}

// Reporting
export interface ReportSpec {
  id: string
  name: string
  audience: "school" | "district" | "province" | "dhet" | "umalusi"
  scheduleCron?: string
  format: "pdf" | "csv" | "xlsx"
}

export interface GeneratedReport {
  id: string
  specId: string
  generatedAt: Date
  location: string
}

// Governance Performance Types (Grades 8-12)
export type PerformanceTrend = "improving" | "stable" | "declining"
export type PerformanceFlag = "green" | "yellow" | "red"
export type PerformanceCategory = "excellent" | "stable" | "declining" | "high-risk"
export type SchoolPhase = "senior-phase" | "fet" // Grades 8-9 vs 10-12

export interface PerformanceCriteria {
  attendance: number // Percentage
  sba: number // School-Based Assessment percentage
  promotionRate: number // Percentage
  curriculumCoverage: number // Percentage
  riskScore: number // Risk/Behavior signals (0-100, lower is better)
}

export interface PerformanceCriteriaTrends {
  attendance: PerformanceTrend
  sba: PerformanceTrend
  promotionRate: PerformanceTrend
  curriculumCoverage: PerformanceTrend
  riskScore: PerformanceTrend
}

export interface PerformanceCriteriaFlags {
  attendance: PerformanceFlag
  sba: PerformanceFlag
  promotionRate: PerformanceFlag
  curriculumCoverage: PerformanceFlag
  riskScore: PerformanceFlag
}

export interface GradeSpecificPerformance {
  grade: "8" | "9" | "10" | "11" | "12"
  sbaTrend: number[] // Historical SBA values
  attendancePattern: number[] // Historical attendance values
  promotionRate: number
  curriculumCoverage: number
  topSubjects: Array<{ subject: string; avgScore: number; trend: PerformanceTrend }>
  highRiskSubjects: Array<{ subject: string; avgScore: number; atRiskCount: number }>
}

export interface SchoolPerformance {
  schoolId: string
  schoolName: string
  districtId: string
  districtName: string
  provinceId: string
  provinceName: string
  phase: SchoolPhase
  performanceScore: number // Weighted score (0-100)
  rank: number // Overall rank
  phaseRank: number // Rank within phase (Senior Phase or FET)
  criteria: PerformanceCriteria
  trends: PerformanceCriteriaTrends
  flags: PerformanceCriteriaFlags
  category: PerformanceCategory
  improvementIndex: number // Year-on-Year improvement (-100 to +100)
  gradeSpecificData: GradeSpecificPerformance[]
  strengths: string[]
  weaknesses: string[]
  rootCauses: Array<{
    type: "academic" | "attendance" | "psycho-social" | "structural" | "administrative"
    description: string
  }>
  recommendations: Array<{
    weaknessType: "academic" | "attendance" | "psycho-social" | "structural" | "administrative"
    recommendation: string
    rolePlayer: string
    timeline: string
    minStandard: string
  }>
  interventionEffectiveness: number // Effectiveness score (0-100)
  predictiveRisk: {
    learnersAtRisk: number
    subjectsAtRisk: string[]
    projectedPromotionImpact: number // If no intervention
  }
}

export interface SchoolPerformanceReport {
  school: SchoolPerformance
  overallSummary: {
    totalStudents: number
    gradeBreakdown: Array<{ grade: string; studentCount: number }>
    combinedScore: number
  }
  detailedAnalysis: {
    strengths: string[]
    weaknesses: string[]
    rootCauses: SchoolPerformance["rootCauses"]
    recommendations: SchoolPerformance["recommendations"]
  }
  interventionGuidance: Array<{
    intervention: string
    rolePlayer: string
    timeline: string
    expectedOutcome: string
  }>
  followUpCycle: {
    monitoring: string[]
    escalation: string[]
    closure: string[]
  }
}

// MEL (Monitoring, Evaluation, Learning) Metrics
export interface MELMetrics {
  schoolId: string
  // Monitoring KPIs
  monitoring: {
    alertToInterventionLatency: number // Median hours/days
    interventionClosureTime: number // Median days
    workflowFidelity: number // Percentage
    rolePlayerResponsiveness: number // SLA compliance percentage
    coverageMetrics: {
      atRiskWithActivePlan: number // Percentage
      classesWithCurriculumCoverage: number // Percentage
    }
    dataQuality: {
      sbaOnTimeUploads: number // Percentage
      attendanceCompleteness: number // Percentage
      exceptionRate: number // Percentage
    }
    popiaCompliance: {
      consentCaptureRate: number // Percentage
      dataAccessTrails: number
      exceptionHandlingLogs: number
    }
  }
  // Tracking KPIs
  tracking: {
    cohortProgression: {
      grade8to9: number // Retention rate
      grade9to10: number
      grade10to11: number
      grade11to12: number
    }
    feederMapping: {
      tvetTransitions: number
      universityTransitions: number
      firstYearReadinessIndex: number // FYRI
    }
    equityTracking: {
      genderGaps: Array<{ subject: string; gap: number }>
      gradeGaps: Array<{ grade: string; gap: number }>
      subjectGaps: Array<{ subject: string; gap: number }>
    }
    subjectJourneys: Array<{
      subject: string
      conceptMastery: number
      repeatedRiskCount: number
    }>
  }
  // Analytics KPIs
  analytics: {
    predictivePrecision: number // Model precision
    predictiveRecall: number // Model recall
    counterfactualForecast: {
      withIntervention: number
      withoutIntervention: number
    }
    interventionUplift: number // Difference-in-Differences style uplift
    teacherImpactSignals: Array<{
      teacherId: string
      subject: string
      termOverTermChange: number
    }>
    thresholdOptimization: {
      falsePositiveRate: number
      falseNegativeRate: number
    }
  }
  // Evaluation KPIs
  evaluation: {
    outcomeKPIs: {
      attendanceChange: number // Change vs baseline
      sbaChange: number
      promotionRateChange: number
      repeatRateChange: number
      dropoutRateChange: number
      timeToSupportChange: number
    }
    attribution: {
      interventionUplift: Array<{
        interventionType: string
        uplift: number
        confidence: number
      }>
      shapExplanations: Array<{
        feature: string
        contribution: number
      }>
    }
    reportingCadence: {
      lastMonthlyReview: Date
      lastQuarterlyReport: Date
      pilotEvaluationDue: Date
    }
  }
}

export interface GovernanceKPIs {
  attendanceCompliance: number // Gr 10-12: ≥ 90% target
  sbaOnTimeUploads: number // ≥ 95% per term
  alertToInterventionMedian: number // ≤ 3 days
  interventionClosureSLA: number // ≥ 80%
  atRiskWithActivePlans: number // ≥ 85%
  promotionRateChange: number // Gr 12: +X pp vs baseline
  interventionUplift: number // Pass: +Y pp for supported learners
  equityGap: Array<{ subject: string; gap: number; target: number }> // ≤ Z pp target
  dataQualityErrors: number // ≤ 1% entries per term
}

export interface TopBottomSchools {
  top15: {
    seniorPhase: SchoolPerformance[] // Top 7 Grades 8-9
    fet: SchoolPerformance[] // Top 8 Grades 10-12
  }
  bottom15: {
    seniorPhase: SchoolPerformance[] // Bottom 7 Grades 8-9
    fet: SchoolPerformance[] // Bottom 8 Grades 10-12
  }
}

///




// Academic Types

export type ModuleRiskLevel = 'Low' | 'Medium' | 'High'
export type EventType = 'Lecture' | 'Tutorial' | 'Lab' | 'Assessment' | 'Meeting'
export type EventStatus = 'scheduled' | 'completed' | 'cancelled'
export type UserType = 'student' | 'tutor' | 'admin' | 'lecturer'
// Solusi University Departments organized by Faculty
export type Department = 
  // Faculty of Education, Humanities, Agriculture, Sciences & Health Professions
  | 'Education' 
  | 'Humanities' 
  | 'Agriculture' 
  | 'Sciences' 
  | 'Health Professions'
  // Faculty of Business Administration
  | 'Management' 
  | 'Accounting' 
  | 'Marketing' 
  | 'Management Information Systems (MIS)'
  // Faculty of Theology and Chaplaincy
  | 'Theology' 
  | 'Chaplaincy / Religious Studies'
export type Campus = 'Brits Campus' | 'Rustenburg Campus' | 'Mankwe Campus'
export type Semester = 1 | 2

export type ModuleCode = 'ENG201' | 'ENG101' | 'ENG102' | 'ENG103' | 
  'BUS101' | 'BUS102' | 'BUS103' |
  'HRM101' | 'HRM102' | 'HRM103' |
  'MED101' | 'MED102' | 'MED103' |
  'LEG101' | 'LEG102'

// Assessment Types
export interface AssessmentScore {
  AS: number // Assignment Score
  CT: number // Class Test
  WR: number // Written Report
  PP: number // Preliminary Predicate
}

export interface AttendanceRecord {
  attended: number
  total: number
  percentage: number
}

// Academic Calendar Types
export interface AcademicYear {
  year: number
  semesters: Semester[]
  startDate: Date
  endDate: Date
}

export interface SemesterInfo {
  number: Semester
  startDate: Date
  endDate: Date
  weeks: number
  assessmentWeeks: number[]
  breakWeeks: number[]
}



export interface Event {
  id: number
  title: string
  moduleCode: ModuleCode
  time: string
  endTime: string
  date: string
  type: EventType
  status: EventStatus
  location: string
  attendees?: number
  notes?: string
  semester: Semester
  academicYear: number
  recurring?: boolean
  recurrencePattern?: 'weekly' | 'biweekly'
}

export type SubjectMatter = 'Risk Note' | 'Communication' | 'Info'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  sentAt: Date
  readBy: string[]
}

export type ReadMethod = 'portal' | 'student_email' | 'personal_email'

export interface ReadStatus {
  hasRead: boolean
  readMethod: ReadMethod | null
  readAt: Date | null
}

export interface ReadStats {
  total: number
  read: number
  unread: number
  readMethods: {
    portal: number
    student_email: number
    personal_email: number
  }
}

export interface Conversation {
  id: string
  participants: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserType
    avatar?: string
    readStatus: ReadStatus
  }[]
  isGroup?: boolean
  name?: string
  lastMessage?: {
    id: string
    conversationId: string
    senderId: string
    content: string
    sentAt: Date
    readBy: string[]
  }
  timestamp?: Date
  unread?: number
  subjectMatter: SubjectMatter
  isViewOnly: boolean
  unreadCount?: number
  readStats: ReadStats
  tags?: string[]
}

export interface Module {
  code: ModuleCode
  name: string
  campus: Campus
  department: Department
  totalStudents: number
  activeStudents: number
  passRate: number
  riskLevel: ModuleRiskLevel
  semester: Semester
  academicYear: number
  prerequisites?: ModuleCode[]
  lecturerId: number
  tutors: number[]
  creditPoints: number
  assessmentWeights: {
    assignments: number
    classTests: number
    writtenReports: number
  }
}

// Staff Types
export interface Faculty {
  id: number
  name: string
  code: string
  departments: Department[]
}

export interface Schedule {
  id: number
  title: string
  grade: "8" | "9" | "10" | "11" | "12"
  term: 1 | 2 | 3 | 4
  year: number
  createdAt: Date
  updatedAt: Date
  events: ScheduleEvent[]
}

export interface ScheduleEvent {
  id: number
  scheduleId: number
  week: number
  startDate: Date
  endDate: Date
  type: 'Classes' | 'Midterms' | 'Finals' | 'Parent-Teacher Conference' | 'Sports Day' | 'Holiday' | 'Orientation'
  description?: string
  highlights?: string
  extendedInfo?: string
}

export interface Staff {
  id: number
  staffNumber: string
  name: string
  surname: string
  email: string
  role: UserType
  department: Department
  modules: ModuleCode[]
  office: string
  contactHours: {
    day: string
    startTime: string
    endTime: string
  }[]
}

// Academic Progress Types
export interface StudentProgress {
  studentId: number
  moduleCode: ModuleCode
  semester: Semester
  year: number
  assessments: AssessmentScore
  attendance: AttendanceRecord
  riskLevel: RiskLevel
  interventions: Intervention[]
}


// Risk Note Types
export type RiskNoteType = 'attendance' | 'participation' | 'performance' | 'tutorial_sessions'
export type RiskNoteStatus = 'new' | 'aeo_review' | 'hod_review' | 'assistant_dean_review' | 'improved' | 'resolved' | 'disengaged'
export type EscalationLevel = 'aeo' | 'hod' | 'assistant_dean'

export interface RiskNoteTrigger {
  type: RiskNoteType
  value: number // percentage
  threshold: number // 70%
  triggered: boolean
}

export interface RiskNote {
  id: string
  studentId: string
  studentNumber: string
  studentName: string
  studentEmail: string
  moduleCode: string
  moduleName: string
  department: Department
  triggers: RiskNoteTrigger[]
  status: RiskNoteStatus
  escalationLevel: EscalationLevel
  createdAt: Date
  escalatedAt?: Date
  lastEscalatedAt?: Date
  improvedAt?: Date
  resolvedAt?: Date
  assignedTo?: string // User ID
  assignedToRole?: EscalationLevel
  communicationId?: string // Link to conversation/message
  notes?: string
  // Metrics
  attendancePercentage?: number
  participationPercentage?: number
  performancePercentage?: number
  tutorialSessionsPercentage?: number
  // Escalation tracking
  daysAtAEO?: number
  daysAtHOD?: number
  daysAtAssistantDean?: number
  workingDaysSinceCreation: number
  workingDaysSinceLastEscalation: number
}

export interface RiskNoteSummary {
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
}

// AI Chat Types
export type RiskLevelType = 'Low' | 'Medium' | 'High'

export interface DiagnosticQuestion {
  id: string
  question: string
  type: 'text' | 'multiple-choice' | 'scale'
  options?: string[]
}

export interface RolePlayer {
  id: number
  name: string
  surname: string
  type: 'Counsellor' | 'Mentor' | 'Academic Advisor' | 'Student Support Officer' | 'Social Worker'
  department?: string
  available: boolean
  email?: string
  phone?: string
}

// Learner Analysis Types
export interface TrendDataPoint {
  date: Date | string
  value: number
  label?: string
  category?: string
}

export interface ComparativeMetrics {
  level: "school" | "district" | "province"
  id: string
  name: string
  totalStudents: number
  averageAttendance: number
  averageAPS: number
  passRate: number
  atRiskPercentage: number
  riskDistribution: {
    good: number
    satisfactory: number
    atRisk: number
  }
}

export interface InterventionOutcome {
  interventionId: string
  studentId: number
  interventionType: Intervention["type"]
  startDate: Date
  endDate?: Date
  status: Intervention["status"]
  beforeMetrics: {
    attendance: number
    averageScore: number
    riskLevel: Learner["riskLevel"]
    riskScore: number
  }
  afterMetrics?: {
    attendance: number
    averageScore: number
    riskLevel: Learner["riskLevel"]
    riskScore: number
  }
  improvement?: {
    attendanceChange: number
    scoreChange: number
    riskLevelChange: string
    riskScoreChange: number
  }
  cost?: number
  duration?: number // in days
}

