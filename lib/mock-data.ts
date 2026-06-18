import type {
  Learner,
  RiskFactor,
  Intervention,
  Alert,
  User,
  Course,
  Assignment,
  StudentActivity,
  ChatMessage,
  Conversation,
  CommunicationInsights,
  Assessment,
  SBABreakdown,
  AttendanceRecord,
  InterventionCase,
  Subject,
  Group,
  CommunicationHistory,
  SciBonoPerformance,
  SciBonoImprovements,
} from "./types"
import { SOUTH_AFRICAN_PROVINCES } from "./sa-provinces-data"
import { getQualificationCodeFromModule, SASO_MODULE_CODES, TUT_CAMPUSES } from "./tut-saso-data"
import { getCourseCodeFromModule } from "./sa-courses"
import { formatStudentNumber } from "./student-numbers"

// -----------------------------
// Generators & random utilities
// -----------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickWeighted<T>(items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((s, i) => s + i.weight, 0)
  let r = Math.random() * total
  for (const item of items) {
    if ((r -= item.weight) <= 0) return item.value
  }
  return items[items.length - 1].value
}

// Box-Muller transform for normal-like distribution
function randomNormal(mean = 0, sd = 1): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return num * sd + mean
}

function dateBetween(from: Date, to: Date): Date {
  const start = from.getTime()
  const end = to.getTime()
  const t = start + Math.random() * (end - start)
  return new Date(t)
}

function recentDate(days = 30): Date {
  const now = new Date()
  const past = new Date(now.getTime() - Math.floor(Math.random() * days) * 24 * 60 * 60 * 1000)
  return past
}

/** Deterministic seed from string (same string => same seed). */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Seeded pseudo-random in [0, 1). */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

/** Generate a deterministic date in the past (daysAgoMin to daysAgoMax) from seed. */
function deterministicPastDate(seed: number, daysAgoMin: number, daysAgoMax: number): string {
  const rng = seededRandom(seed)
  const daysAgo = daysAgoMin + Math.floor(rng() * (daysAgoMax - daysAgoMin + 1))
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID()
  }
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

const firstNamesMale = [
  "Sifiso",
  "Michael",
  "James",
  "Ethan",
  "Thabo",
  "Sipho",
  "Liam",
  "Noah",
  "Anele",
  "Kabelo",
  "Arjun",
  "David",
  "Jacob",
  "Luis",
  "Chen",
  "Ahmed",
  "Tariq",
  "Jabu",
  "Andile",
  "Peter",
  "Daniel",
]

const firstNamesFemale = [
  "Emma",
  "Sophia",
  "Olivia",
  "Emily",
  "Molebogeng",
  "Nomfundo",
  "Lerato",
  "Aisha",
  "Amara",
  "Naledi",
  "Isabella",
  "Mia",
  "Zanele",
  "Chloe",
  "Grace",
  "Fatima",
  "Hannah",
  "Sarah",
  "Chenxi",
  "Mei",
]

const lastNames = [
  "Mazibuko",
  "Johnson",
  "Chen",
  "Martinez",
  "Wilson",
  "Davis",
  "Moshabane",
  "Brown",
  "Williams",
  "Khumalo",
  "Naidoo",
  "Pillay",
  "Nkosi",
  "Mokoena",
  "Botha",
  "Patel",
  "Singh",
  "Garcia",
  "Lee",
  "Smith",
]

const householdLanguages = ["en", "af", "xh", "zu", "st", "tn", "ts", "nr", "ss", "ve", "nso"] as const

function buildEmail(first: string, last: string): string {
  const base = `${first}.${last}`.toLowerCase().replace(/[^a-z]+/g, ".")
  return `${base}@tut.ac.za`
}

function generateStudents(count: number): Learner[] {
  const out: Learner[] = []
  
  // Available subjects and groups (these will be defined later in the file, but we reference them here)
  const subjectCodes = ["MATH", "ENG", "PHY", "LIF", "GEO", "HIS", "ECO", "ACC", "BUS", "LO"]
  const moduleCodes = [...SASO_MODULE_CODES]
  const groups = ["8A", "8B", "9A", "9B", "10A", "10B", "11A", "11B", "12A", "12B"]
  
  for (let i = 0; i < count; i++) {
    const isFemale = Math.random() < 0.5
    const first = isFemale ? pickOne(firstNamesFemale) : pickOne(firstNamesMale)
    const last = pickOne(lastNames)
    const gender: "male" | "female" | "other" = isFemale ? "female" : "male"

    // Grades distribution with slight weight toward 10–11
    const grade = pickWeighted([
      { value: 8, weight: 1 },
      { value: 9, weight: 1.1 },
      { value: 10, weight: 1.3 },
      { value: 11, weight: 1.3 },
      { value: 12, weight: 1.0 },
    ])

    const apsRaw = clamp(randomNormal(2.7, 0.7), 0, 4)
    const aps = Math.round(apsRaw * 10) / 10

    const attendanceRaw = clamp(randomNormal(90, 8), 60, 100)
    const attendanceRate = Math.round(attendanceRaw)

    // Derive risk from APS and attendance with noise
    const apsComponent = (1 - aps / 4) * 55 // up to 55 points
    const attendanceComponent = (1 - (attendanceRate - 60) / 40) * 35 // up to 35 points
    const noise = clamp(randomNormal(0, 8), -10, 10)
    const riskScore = clamp(Math.round(apsComponent + attendanceComponent + noise), 5, 95)
    const oldRiskLevel =
      riskScore > 80 ? "critical" : riskScore > 60 ? "high" : riskScore > 35 ? "medium" : "low"
    
    // Map old riskLevel to new format: "low"/"medium" → "Good", "high" → "Satisfactory", "critical" → "At Risk"
    const riskLevel: "Good" | "At Risk" | "Satisfactory" =
      oldRiskLevel === "critical" ? "At Risk" : oldRiskLevel === "high" ? "Satisfactory" : "Good"

    const enrollmentDate = dateBetween(new Date("2021-01-01"), new Date("2024-09-01"))
    const lastAssessment = dateBetween(new Date("2025-01-01"), new Date())

    // Assign governance hierarchy
    const province = pickOne(SOUTH_AFRICAN_PROVINCES)
    const district = pickOne(province.districts)
    const campus = pickOne(TUT_CAMPUSES)
    const schoolIndex = Math.floor(Math.random() * 5) + 1

    // Determine number of previous subjects (affects academicStatus)
    const previousSubjectsCount = pickWeighted([
      { value: 0, weight: 0.6 }, // First-time students
      { value: 1, weight: 0.25 }, // First-time repeaters
      { value: 2, weight: 0.1 }, // Second-time repeaters (Academic Warning)
      { value: 3, weight: 0.04 }, // Third-time repeaters (Repeating Grade)
      { value: 4, weight: 0.01 }, // Fourth-time repeaters
    ])
    
    // Generate previousSubjects array
    const previousSubjects: string[] = []
    for (let j = 0; j < previousSubjectsCount; j++) {
      previousSubjects.push(pickOne(subjectCodes))
    }
    
    // Determine academicStatus based on previousSubjects count
    const academicStatus: "First-time" | "Academic Warning" | "Repeating Grade" | "Repeating Subject" =
      previousSubjectsCount === 0
        ? "First-time"
        : previousSubjectsCount === 1
        ? "Repeating Subject"
        : previousSubjectsCount === 2
        ? "Academic Warning"
        : "Repeating Grade"

    // Generate assessments based on risk level and academic status
    // Lower scores for higher risk and repeaters
    const baseScore = riskLevel === "Good" ? 75 : riskLevel === "Satisfactory" ? 60 : 45
    const repeaterPenalty = previousSubjectsCount > 0 ? (previousSubjectsCount * 5) : 0
    const scoreVariation = clamp(randomNormal(0, 10), -15, 15)
    
    const AS = Math.round(clamp(baseScore - repeaterPenalty + scoreVariation, 30, 100))
    const CT = Math.round(clamp(baseScore - repeaterPenalty + scoreVariation + clamp(randomNormal(0, 5), -10, 10), 30, 100))
    const WR = Math.round(clamp(baseScore - repeaterPenalty + scoreVariation + clamp(randomNormal(0, 5), -10, 10), 30, 100))
    const PP = Math.round((AS + CT + WR) / 3)

    // Generate attendance (32 total sessions)
    const totalSessions = 32
    const attendancePercentage = Math.round(attendanceRate)
    const attended = Math.round((attendancePercentage / 100) * totalSessions)

    // Assign subject, module, and group (course derived from module)
    const subjectCode = pickOne(subjectCodes)
    const moduleCode = pickOne(moduleCodes)
    const qualificationCode = getQualificationCodeFromModule(moduleCode)
    const courseCode = getCourseCodeFromModule(moduleCode)
    const group = pickOne(groups)
    
    // Assign teacher (1-3)
    const teacherId = Math.floor(Math.random() * 3) + 1

    // Generate funding and residency fields
    // ~75% NSFAS/Bursary, ~25% self-funded (typical for South African context)
    const fundingType: "self" | "nsfas" = Math.random() < 0.75 ? "nsfas" : "self"
    
    // ~60% on-campus, ~40% off-campus
    const residency: "onCampus" | "offCampus" = Math.random() < 0.6 ? "onCampus" : "offCampus"
    
    // ~12% of students are readmitted (those who were excluded/probation and came back)
    const isReadmitted = Math.random() < 0.12

    // Spread enrollment years 2016–2024 for cohort analysis (more weight on recent years)
    const yearIndex = pickWeighted([
      { value: 0, weight: 0.5 }, // 2024
      { value: 1, weight: 0.2 }, // 2023
      { value: 2, weight: 0.12 }, // 2022
      { value: 3, weight: 0.08 }, // 2021
      { value: 4, weight: 0.05 }, // 2020
      { value: 5, weight: 0.03 }, // 2019
      { value: 6, weight: 0.01 }, // 2018
      { value: 7, weight: 0.005 }, // 2017
      { value: 8, weight: 0.005 }, // 2016
    ])
    const enrollmentYear = 2024 - yearIndex
    
    // Conditional letter and probation form signing (more likely for at-risk students)
    // Conditional letters: ~40% of at-risk students, ~10% of good students
    const conditionalLetterSigned = riskLevel === "At Risk" || riskLevel === "Satisfactory" 
      ? Math.random() < 0.4 
      : Math.random() < 0.1
    
    // Probation forms: ~30% of at-risk students, ~5% of good students
    const probationFormSigned = riskLevel === "At Risk" || riskLevel === "Satisfactory"
      ? Math.random() < 0.3
      : Math.random() < 0.05

    // Financial exclusion: ~8-12% of learners, higher probability for self-funded with low income
    const householdIncomeBracket = pickWeighted([
      { value: "low", weight: 0.4 },
      { value: "middle", weight: 0.5 },
      { value: "high", weight: 0.1 },
    ])
    const financiallyExcludedProbability = fundingType === "self" && householdIncomeBracket === "low"
      ? 0.15 // Higher for self-funded with low income
      : fundingType === "self"
      ? 0.10 // Medium for self-funded
      : 0.08 // Lower for NSFAS
    const financiallyExcluded = Math.random() < financiallyExcludedProbability

    // Dropout: ~5-8% of learners, higher probability for financially excluded, at-risk, or low attendance
    let dropoutProbability = 0.05 // Base probability
    if (financiallyExcluded) {
      dropoutProbability += 0.15 // Much higher if financially excluded
      // Ensure financially excluded + academically approved (Good/Satisfactory) have significant dropout rate
      if (riskLevel === "Good" || riskLevel === "Satisfactory") {
        dropoutProbability += 0.25 // Very high dropout for financially excluded but academically approved
      }
    }
    if (riskLevel === "At Risk") dropoutProbability += 0.10 // Higher for at-risk
    if (riskLevel === "Satisfactory") dropoutProbability += 0.05 // Slightly higher for satisfactory
    if (attendancePercentage < 70) dropoutProbability += 0.08 // Higher for low attendance
    const hasDroppedOut = Math.random() < Math.min(dropoutProbability, 0.50) // Cap at 50% (increased from 35%)

    // Deterministic A/B/C dates for drilldown (seeded by student index)
    const dateSeed = hashString(`student-${i}-dates`)
    let fundingRemovedAt: string | undefined
    let financiallyExcludedAt: string | undefined
    let readmittedAt: string | undefined
    let droppedOutAt: string | undefined
    if (isReadmitted) {
      fundingRemovedAt = deterministicPastDate(dateSeed, 30, 730) // 1–24 months ago
    }
    if (financiallyExcluded) {
      financiallyExcludedAt = deterministicPastDate(dateSeed + 1, 14, 365) // 2 weeks–1 year ago
    }
    if (isReadmitted && financiallyExcludedAt) {
      // Re-entry date: 1–18 months after exclusion
      const exclDate = new Date(financiallyExcludedAt)
      const daysAfter = 30 + (hashString(`readmit-${i}`) % 500) // ~1–17 months
      const reentry = new Date(exclDate)
      reentry.setDate(reentry.getDate() + daysAfter)
      readmittedAt = reentry.toISOString()
    }
    if (hasDroppedOut) {
      droppedOutAt = deterministicPastDate(dateSeed + 2, 7, 180) // 1 week–6 months ago
    }

    // Generate credit information
    // Required credits: typically 120-180 for a full program
    const requiredCredits = pickWeighted([
      { value: 120, weight: 0.3 },
      { value: 144, weight: 0.4 },
      { value: 180, weight: 0.3 },
    ])
    
    // Registered credits: 60-180, but some students register less than required
    const registeredCredits = Math.floor(Math.random() * 121) + 60 // 60-180 credits

    // Probation: ~15-20% of learners, higher for at-risk students
    let probationProbability = riskLevel === "At Risk" ? 0.30 : riskLevel === "Satisfactory" ? 0.20 : 0.10
    const isOnProbation = Math.random() < probationProbability

    // Assign probation reason if on probation
    let probationReason: "module_cancellation" | "low_credits" | "academic_performance" | "other" | undefined
    if (isOnProbation) {
      const reasonRand = Math.random()
      if (reasonRand < 0.25) {
        probationReason = "module_cancellation"
      } else if (reasonRand < 0.55) {
        // Low credits: 30% of probation students
        probationReason = "low_credits"
        // Ensure registered credits are less than required for low credits probation
        if (registeredCredits >= requiredCredits) {
          // Adjust registered credits to be less than required
          const adjustedCredits = Math.max(60, Math.floor(requiredCredits * (0.5 + Math.random() * 0.3))) // 50-80% of required
          // We'll set this later in the student object
        }
      } else if (reasonRand < 0.95) {
        probationReason = "academic_performance"
      } else {
        probationReason = "other"
      }
    }

    // For low credits probation, ensure registeredCredits < requiredCredits
    let finalRegisteredCredits = registeredCredits
    if (probationReason === "low_credits" && registeredCredits >= requiredCredits) {
      finalRegisteredCredits = Math.max(60, Math.floor(requiredCredits * (0.5 + Math.random() * 0.3))) // 50-80% of required
    }

    const student: Learner = {
      // Required fields matching type definition
      id: i + 1, // Numeric ID
      studentNumber: formatStudentNumber(i + 1, enrollmentYear),
      name: first,
      surname: last,
      email: buildEmail(first, last),
      academicStatus,
      subjectCode,
      moduleCode,
      courseCode,
      qualificationCode,
      assessments: {
        AS,
        CT,
        WR,
        PP,
      },
      attendance: {
        attended,
        total: totalSessions,
        percentage: attendancePercentage,
      },
      riskLevel,
      enrollmentYear,
      semester: 1,
      teacherId,
      previousSubjects,
      group,
      
      // Legacy fields for backward compatibility
      grade: String(grade),
      enrollmentDate,
      aps,
      attendanceRate,
      riskScore,
      lastAssessment,
      householdLanguage: pickOne(householdLanguages),
      householdIncomeBracket,
      provinceId: province.id,
      districtId: district.id,
      schoolId: `campus-${campus.id}`,
      // Legacy studentId for backward compatibility
      studentId: formatStudentNumber(i + 1, enrollmentYear),
      gender,
      // Funding and residency fields
      fundingType,
      residency,
      isReadmitted,
      conditionalLetterSigned,
      probationFormSigned,
      // Dropout and financial exclusion tracking
      financiallyExcluded,
      hasDroppedOut,
      fundingRemovedAt,
      financiallyExcludedAt,
      droppedOutAt,
      readmittedAt,
      // Probation tracking
      isOnProbation,
      probationReason,
      registeredCredits: finalRegisteredCredits,
      requiredCredits,
    }

    out.push(student)
  }

  // Ensure first few IDs align with communications realism
  if (out[0]) {
    out[0].riskLevel = "Good"
    out[0].riskScore = clamp(out[0].riskScore, 5, 25)
  }
  if (out[1]) {
    out[1].riskLevel = "Satisfactory"
    out[1].riskScore = clamp(out[1].riskScore, 65, 85)
  }
  if (out[2]) {
    out[2].riskLevel = "Good"
    out[2].riskScore = clamp(out[2].riskScore, 40, 55)
  }

  // Pin student 1 as Sibusiso Mazibuko at TUT Soshanguve (South)
  if (out[0]) {
    out[0].id = 1
    out[0].name = "Sibusiso"
    out[0].surname = "Mazibuko"
    out[0].email = "spmazibuko07@gmail.com"
    out[0].studentNumber = "221234567"
    out[0].studentId = "221234567"
    out[0].provinceId = "prov-gp"
    out[0].districtId = "dist-gp-2"
    out[0].schoolId = "campus-soshanguve-south"
    out[0].fundingType = "nsfas"
    out[0].residency = "onCampus"
    out[0].isReadmitted = false
    out[0].conditionalLetterSigned = false
    out[0].probationFormSigned = false
    out[0].financiallyExcluded = false
    out[0].hasDroppedOut = false
    out[0].fundingRemovedAt = undefined
    out[0].financiallyExcludedAt = undefined
    out[0].droppedOutAt = undefined
    out[0].readmittedAt = undefined
    out[0].enrollmentYear = 2024
    out[0].moduleCode = "SYA216D"
    out[0].isOnProbation = false
    out[0].probationReason = undefined
    out[0].registeredCredits = 144
    out[0].requiredCredits = 144
  }

  // Ensure we have at least a few students matching the financial exclusion dropout criteria
  // (financially excluded + academically approved + dropped out)
  const financialExclusionDropoutCount = out.filter(
    (s) =>
      s.financiallyExcluded === true &&
      (s.riskLevel === "Good" || s.riskLevel === "Satisfactory") &&
      s.hasDroppedOut === true
  ).length

  // If we have fewer than 5 matching students, explicitly set some to match
  if (financialExclusionDropoutCount < 5) {
    const candidates = out.filter(
      (s) =>
        s.financiallyExcluded === true &&
        (s.riskLevel === "Good" || s.riskLevel === "Satisfactory") &&
        s.hasDroppedOut === false
    )
    
    // Set at least 5 candidates (or all available if less than 5) to have dropped out
    const needed = Math.min(5 - financialExclusionDropoutCount, candidates.length)
    for (let i = 0; i < needed; i++) {
      const c = candidates[i]
      if (c) {
        c.hasDroppedOut = true
        c.droppedOutAt = deterministicPastDate(hashString(`fex-dropout-${c.id}`), 7, 180)
      }
    }
  }

  // Ensure we have a good distribution of probation reasons
  const probationStudents = out.filter((s) => s.isOnProbation === true)
  const probationReasonCounts = probationStudents.reduce(
    (acc, s) => {
      const reason = s.probationReason || "other"
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Ensure we have at least some students in each probation reason category
  const minPerCategory = Math.max(10, Math.floor(probationStudents.length * 0.05)) // At least 5% per category or 10 students
  const categories: Array<"module_cancellation" | "low_credits" | "academic_performance" | "other"> = [
    "module_cancellation",
    "low_credits",
    "academic_performance",
    "other",
  ]

  for (const category of categories) {
    const currentCount = probationReasonCounts[category] || 0
    if (currentCount < minPerCategory) {
      // Find probation students without a reason or with a different reason that we can change
      const candidates = probationStudents.filter(
        (s) => !s.probationReason || (s.probationReason !== category && (probationReasonCounts[s.probationReason] || 0) > minPerCategory)
      )
      
      const needed = Math.min(minPerCategory - currentCount, candidates.length)
      for (let i = 0; i < needed; i++) {
        if (candidates[i]) {
          candidates[i].probationReason = category
          // For low_credits, ensure registeredCredits < requiredCredits
          if (category === "low_credits" && candidates[i].registeredCredits && candidates[i].requiredCredits) {
            if (candidates[i].registeredCredits >= candidates[i].requiredCredits) {
              candidates[i].registeredCredits = Math.max(60, Math.floor((candidates[i].requiredCredits || 144) * (0.5 + Math.random() * 0.3)))
            }
          }
        }
      }
    }
  }

  return out
}

function generateRiskFactors(students: Learner[]): RiskFactor[] {
  const factors: RiskFactor[] = []
  for (const s of students) {
    // Skip students with low risk (Good risk level)
    if (s.riskLevel === "Good") continue
    
    const attendancePercent = s.attendance?.percentage || s.attendanceRate || 0
    const riskScore = s.riskScore || 0
    const assessmentPP = s.assessments?.PP || 0
    
    // Map new risk levels to factor severities
    // "At Risk" → "critical", "Satisfactory" → "high"
    const getSeverityFromRiskLevel = (riskLevel: Learner["riskLevel"], score: number): "critical" | "high" | "medium" => {
      if (riskLevel === "At Risk") return "critical"
      if (riskLevel === "Satisfactory") return score > 70 ? "high" : "medium"
      return "medium"
    }
    
    if (attendancePercent < 80) {
      factors.push({
        id: uuid(),
        studentId: String(s.id),
        category: "attendance",
        severity: getSeverityFromRiskLevel(s.riskLevel, riskScore),
        description: "Low attendance impacting performance",
        detectedAt: recentDate(20),
        resolved: false,
      })
    }
    if (assessmentPP < 50 || (s.aps !== undefined && s.aps < 2.5)) {
      factors.push({
        id: uuid(),
        studentId: String(s.id),
        category: "academic",
        severity: getSeverityFromRiskLevel(s.riskLevel, riskScore),
        description: "Underperforming in multiple subjects",
        detectedAt: recentDate(25),
        resolved: false,
      })
    }
    // Add occasional behavioral/social factor for at risk students
    if (s.riskLevel === "At Risk" && Math.random() < 0.3) {
      factors.push({
        id: uuid(),
        studentId: String(s.id),
        category: Math.random() < 0.5 ? "behavioral" : "social",
        severity: riskScore > 85 ? "critical" : "high",
        description: pickOne([
          "Reduced participation and disengagement noted",
          "Peer conflict reported by teacher",
          "Signs of stress and burnout",
        ]),
        detectedAt: recentDate(10),
        resolved: false,
      })
    }
  }
  return factors
}

function generateInterventions(students: Learner[], risk: RiskFactor[]): Intervention[] {
  const out: Intervention[] = []
  const byStudent = new Map<string, RiskFactor[]>(
    students.map((s) => [String(s.id), risk.filter((r) => r.studentId === String(s.id))])
  )

  for (const s of students) {
    // Skip students with low risk (Good risk level)
    if (s.riskLevel === "Good") continue
    const sRisk = byStudent.get(String(s.id)) || []
    // Skip some Satisfactory students if they have no risk factors
    if (sRisk.length === 0 && s.riskLevel === "Satisfactory" && Math.random() < 0.5) continue

    const type = pickWeighted([
      { value: "tutoring" as const, weight: 0.45 },
      { value: "counseling" as const, weight: 0.25 },
      { value: "mentoring" as const, weight: 0.2 },
      { value: "academic-support" as const, weight: 0.1 },
    ])

    const status = pickWeighted([
      { value: "planned" as const, weight: 0.3 },
      { value: "in-progress" as const, weight: 0.55 },
      { value: "completed" as const, weight: 0.1 },
      { value: "cancelled" as const, weight: 0.05 },
    ])

    out.push({
      id: uuid(),
      studentId: String(s.id),
      title: type === "tutoring" ? "Targeted Tutoring" : type === "counseling" ? "Student Counseling" : type === "mentoring" ? "Peer Mentoring" : "Academic Support Plan",
      description: "Program initiated based on risk indicators",
      type,
      status,
      assignedTo: "teacher@tut.ac.za",
      createdBy: "admin@tut.ac.za",
      createdAt: recentDate(30),
      startDate: recentDate(25),
      notes: "Auto-generated intervention for mock data",
    })
  }
  return out
}

function generateAlerts(students: Learner[], risk: RiskFactor[]): Alert[] {
  const out: Alert[] = []
  for (const s of students) {
    // Map new risk levels to alert severities: "At Risk" → "critical", "Satisfactory" → "high"
    if (s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory") {
      const severity: "critical" | "high" = s.riskLevel === "At Risk" ? "critical" : "high"
      const type = pickOne(["risk-increase", "attendance", "grade-drop", "behavioral"] as const)
      const fullName = `${s.name} ${s.surname}`
      const attendancePercent = s.attendance?.percentage || s.attendanceRate || 0
      const assessmentPP = s.assessments?.PP || 0
      const riskScore = s.riskScore || 0
      
      out.push({
        id: uuid(),
        studentId: String(s.id),
        type,
        severity,
        message:
          type === "attendance"
            ? `${fullName} attendance dropped to ${attendancePercent}%`
            : type === "grade-drop"
            ? `${fullName} assessment score at ${assessmentPP}%, review academic progress`
            : type === "behavioral"
            ? `${fullName} behavioral concern flagged`
            : `${fullName} risk score ${riskScore} (${severity})`,
        createdAt: recentDate(14),
        read: Math.random() < 0.4,
        actionTaken: Math.random() < 0.3,
      })
    } else if (s.riskLevel === "Good" && Math.random() < 0.1) {
      // Occasional alerts for Good students (low severity)
      const fullName = `${s.name} ${s.surname}`
      const attendancePercent = s.attendance?.percentage || s.attendanceRate || 0
      
      out.push({
        id: uuid(),
        studentId: String(s.id),
        type: "attendance",
        severity: "low",
        message: `${fullName} attendance monitoring at ${attendancePercent}%`,
        createdAt: recentDate(7),
        read: false,
        actionTaken: false,
      })
    }
  }
  return out
}

// Mock users for authentication
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@tut.ac.za",
    name: "Molebogeng Mashilo",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "teacher@tut.ac.za",
    name: "Tshepo Moshabane",
    role: "teacher",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "s1",
    email: "student@tut.ac.za",
    name: "Sibusiso Mazibuko",
    role: "student",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "p1",
    email: "parent@tut.ac.za",
    name: "Nomfundo Mazibuko",
    role: "parent",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "d1",
    email: "district@tut.ac.za",
    name: "District Admin",
    role: "district-admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "pr1",
    email: "province@tut.ac.za",
    name: "Provincial Admin",
    role: "provincial-admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "sa1",
    email: "mashilom1@tut.ac.za",
    name: "Molebogeng Mashilo",
    role: "provincial-admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "sa2",
    email: "spmazibuko07@gmail.com",
    name: "Sibusiso Mazibuko",
    role: "provincial-admin",
    createdAt: new Date("2024-01-01"),
  },
]

// Mock students data - generated
export const mockStudents: Learner[] = generateStudents(16230)
// Mock students data


// Mock risk factors - generated from students
export const mockRiskFactors: RiskFactor[] = generateRiskFactors(mockStudents)

// Mock interventions - generated for medium+ risk
export const mockInterventions: Intervention[] = generateInterventions(mockStudents, mockRiskFactors)

// Mock alerts - generated aligned to risk levels
export const mockAlerts: Alert[] = generateAlerts(mockStudents, mockRiskFactors)

// Mock courses
export const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Advanced Mathematics",
    code: "MATH301",
    teacher: "Dr. Sarah Williams",
    schedule: "Mon, Wed, Fri 9:00 AM",
    room: "Room 204",
    currentGrade: 92,
    credits: 4,
  },
  {
    id: "c2",
    name: "English Literature",
    code: "ENG201",
    teacher: "Prof. Michael Brown",
    schedule: "Tue, Thu 10:30 AM",
    room: "Room 105",
    currentGrade: 88,
    credits: 3,
  },
  {
    id: "c3",
    name: "Physics",
    code: "PHY202",
    teacher: "Dr. James Chen",
    schedule: "Mon, Wed 2:00 PM",
    room: "Lab 301",
    currentGrade: 85,
    credits: 4,
  },
  {
    id: "c4",
    name: "World History",
    code: "HIST101",
    teacher: "Ms. Emily Davis",
    schedule: "Tue, Thu 1:00 PM",
    room: "Room 210",
    currentGrade: 94,
    credits: 3,
  },
  {
    id: "c5",
    name: "Computer Science",
    code: "CS150",
    teacher: "Mr. David Lee",
    schedule: "Wed, Fri 11:00 AM",
    room: "Lab 102",
    currentGrade: 96,
    credits: 4,
  },
]

// Mock assignments
export const mockAssignments: Assignment[] = [
  {
    id: "a1",
    courseId: "c1",
    courseName: "Advanced Mathematics",
    title: "Calculus Problem Set 5",
    description: "Complete problems 1-20 from Chapter 8",
    dueDate: new Date("2025-01-20"),
    status: "pending",
    maxPoints: 100,
  },
  {
    id: "a2",
    courseId: "c2",
    courseName: "English Literature",
    title: "Essay: Shakespeare Analysis",
    description: "Write a 5-page analysis of Hamlet",
    dueDate: new Date("2025-01-18"),
    status: "submitted",
    grade: 88,
    maxPoints: 100,
    submittedAt: new Date("2025-01-17"),
  },
  {
    id: "a3",
    courseId: "c3",
    courseName: "Physics",
    title: "Lab Report: Motion Experiments",
    description: "Submit lab report with data analysis",
    dueDate: new Date("2025-01-22"),
    status: "pending",
    maxPoints: 50,
  },
  {
    id: "a4",
    courseId: "c5",
    courseName: "Computer Science",
    title: "Programming Project: Sorting Algorithms",
    description: "Implement and compare sorting algorithms",
    dueDate: new Date("2025-01-25"),
    status: "pending",
    maxPoints: 150,
  },
  {
    id: "a5",
    courseId: "c4",
    courseName: "World History",
    title: "Research Paper: Industrial Revolution",
    description: "10-page research paper on industrial revolution impacts",
    dueDate: new Date("2025-01-15"),
    status: "graded",
    grade: 94,
    maxPoints: 100,
    submittedAt: new Date("2025-01-14"),
  },
  {
    id: "a6",
    courseId: "c1",
    courseName: "Advanced Mathematics",
    title: "Midterm Exam",
    description: "Comprehensive midterm covering chapters 1-8",
    dueDate: new Date("2025-01-28"),
    status: "pending",
    maxPoints: 200,
  },
]

// Mock assessments (SBA, tests, assignments, etc.)
export const mockAssessments: Assessment[] = [
  {
    id: "assess1",
    studentId: "s1",
    subject: "Mathematics",
    type: "test",
    title: "Semester 1 Test 1 - Algebra",
    date: new Date("2025-01-10"),
    marksObtained: 85,
    marksTotal: 100,
    percentage: 85,
    status: "completed",
    sbaCategory: "test",
    term: "Semester 1",
    year: 2025,
  },
  {
    id: "assess2",
    studentId: "s1",
    subject: "Mathematics",
    type: "assignment",
    title: "Quadratic Equations Assignment",
    date: new Date("2025-01-08"),
    marksObtained: 92,
    marksTotal: 100,
    percentage: 92,
    status: "completed",
    sbaCategory: "assignment",
    term: "Semester 1",
    year: 2025,
  },
  {
    id: "assess3",
    studentId: "s2",
    subject: "Mathematics",
    type: "test",
    title: "Semester 1 Test 1 - Calculus",
    date: new Date("2025-01-12"),
    marksObtained: 45,
    marksTotal: 100,
    percentage: 45,
    status: "completed",
    sbaCategory: "test",
    term: "Semester 1",
    year: 2025,
  },
  {
    id: "assess4",
    studentId: "s2",
    subject: "Mathematics",
    type: "test",
    title: "Semester 1 Test 2 - Integration",
    date: new Date("2025-01-20"),
    marksObtained: 38,
    marksTotal: 100,
    percentage: 38,
    status: "completed",
    sbaCategory: "test",
    term: "Semester 1",
    year: 2025,
  },
  {
    id: "assess5",
    studentId: "s2",
    subject: "Physical Sciences",
    type: "practical",
    title: "Semester 1 Practical - Mechanics",
    date: new Date("2025-01-15"),
    marksObtained: 42,
    marksTotal: 100,
    percentage: 42,
    status: "completed",
    sbaCategory: "practical",
    term: "Semester 1",
    year: 2025,
  },
  {
    id: "assess6",
    studentId: "s4",
    subject: "Mathematics",
    type: "test",
    title: "Semester 1 Test 1",
    date: new Date("2025-01-13"),
    marksObtained: 28,
    marksTotal: 100,
    percentage: 28,
    status: "completed",
    sbaCategory: "test",
    term: "Semester 1",
    year: 2025,
  },
  {
    id: "assess7",
    studentId: "s4",
    subject: "English",
    type: "oral",
    title: "Semester 1 Oral Presentation",
    date: new Date("2025-01-18"),
    status: "missed",
    marksTotal: 50,
    sbaCategory: "oral",
    term: "Semester 1",
    year: 2025,
  },
]

// Mock SBA Breakdowns
export const mockSBABreakdowns: SBABreakdown[] = [
  {
    studentId: "s1",
    subject: "Mathematics",
    term: "Semester 1",
    year: 2025,
    tests: [
      { id: "assess1", title: "Semester 1 Test 1 - Algebra", mark: 85, total: 100, date: new Date("2025-01-10") },
    ],
    assignments: [
      { id: "assess2", title: "Quadratic Equations Assignment", mark: 92, total: 100, date: new Date("2025-01-08") },
    ],
    projects: [],
    practicals: [],
    orals: [],
    overallSBA: 88.5,
    averageScore: 88.5,
    trend: "stable",
  },
  {
    studentId: "s2",
    subject: "Mathematics",
    term: "Semester 1",
    year: 2025,
    tests: [
      { id: "assess3", title: "Semester 1 Test 1 - Calculus", mark: 45, total: 100, date: new Date("2025-01-12") },
      { id: "assess4", title: "Semester 1 Test 2 - Integration", mark: 38, total: 100, date: new Date("2025-01-20") },
    ],
    assignments: [],
    projects: [],
    practicals: [],
    orals: [],
    overallSBA: 41.5,
    averageScore: 41.5,
    trend: "declining",
  },
  {
    studentId: "s2",
    subject: "Physical Sciences",
    term: "Semester 1",
    year: 2025,
    tests: [],
    assignments: [],
    projects: [],
    practicals: [
      { id: "assess5", title: "Semester 1 Practical - Mechanics", mark: 42, total: 100, date: new Date("2025-01-15") },
    ],
    orals: [],
    overallSBA: 42,
    averageScore: 42,
    trend: "stable",
  },
  {
    studentId: "s4",
    subject: "Mathematics",
    term: "Semester 1",
    year: 2025,
    tests: [
      { id: "assess6", title: "Semester 1 Test 1", mark: 28, total: 100, date: new Date("2025-01-13") },
    ],
    assignments: [],
    projects: [],
    practicals: [],
    orals: [
      { id: "assess7", title: "Semester 1 Oral Presentation", mark: 0, total: 50, date: new Date("2025-01-18") },
    ],
    overallSBA: 18.67,
    averageScore: 28,
    trend: "declining",
  },
]

// Mock attendance records
export const mockAttendanceRecords: AttendanceRecord[] = [
  { id: "att1", studentId: "s1", date: new Date("2025-01-15"), status: "present" },
  { id: "att2", studentId: "s1", date: new Date("2025-01-16"), status: "present" },
  { id: "att3", studentId: "s1", date: new Date("2025-01-17"), status: "present" },
  { id: "att4", studentId: "s2", date: new Date("2025-01-15"), status: "absent" },
  { id: "att5", studentId: "s2", date: new Date("2025-01-16"), status: "late" },
  { id: "att6", studentId: "s2", date: new Date("2025-01-17"), status: "present" },
  { id: "att7", studentId: "s4", date: new Date("2025-01-15"), status: "absent" },
  { id: "att8", studentId: "s4", date: new Date("2025-01-16"), status: "absent" },
  { id: "att9", studentId: "s4", date: new Date("2025-01-17"), status: "late" },
]

// Generate mock intervention cases
function generateInterventionCases(students: Learner[]): InterventionCase[] {
  const cases: InterventionCase[] = []
  const rootCauses: Array<"academic" | "wellness" | "attendance" | "behavioral" | "social"> = [
    "academic",
    "wellness",
    "attendance",
    "behavioral",
    "social",
  ]
  const supportTypes: Array<"concept-remediation" | "study-skills" | "content-coaching" | "foundational-gap-filling" | "wellness-support" | "motivation-coaching" | "stress-management" | "other"> = [
    "concept-remediation",
    "study-skills",
    "content-coaching",
    "foundational-gap-filling",
    "wellness-support",
    "motivation-coaching",
    "stress-management",
    "other",
  ]
  const rolePlayerTypes: Array<"counselor" | "psychologist" | "mentor" | "academic-advisor" | "student-support-officer" | "social-worker"> = [
    "counselor",
    "psychologist",
    "mentor",
    "academic-advisor",
    "student-support-officer",
    "social-worker",
  ]

  // Generate cases for at-risk students
  const atRiskStudents = students.filter((s) => s.riskLevel === "At Risk" || s.riskLevel === "Satisfactory")
  
  for (let i = 0; i < Math.min(Math.max(30, atRiskStudents.length * 0.4), 60); i++) {
    const student = pickOne(atRiskStudents)
    const rootCause = pickOne(rootCauses)
    const riskLevel = pickWeighted([
      { value: "high" as const, weight: 0.4 },
      { value: "moderate" as const, weight: 0.4 },
      { value: "low" as const, weight: 0.2 },
    ])
    
    // Match support type to root cause
    let supportType: typeof supportTypes[number] = "other"
    if (rootCause === "academic") {
      supportType = pickOne(["concept-remediation", "study-skills", "content-coaching", "foundational-gap-filling"])
    } else if (rootCause === "wellness") {
      supportType = pickOne(["wellness-support", "stress-management", "motivation-coaching"])
    } else {
      supportType = pickOne(supportTypes)
    }

    const timestamp = recentDate(60) // Within last 60 days
    const escalated = riskLevel === "high" && Math.random() > 0.3
    const closed = !escalated && Math.random() > 0.45
    
    let escalatedAt: Date | undefined
    let closedAt: Date | undefined
    
    if (escalated) {
      escalatedAt = new Date(timestamp.getTime() + Math.random() * 48 * 60 * 60 * 1000) // Within 48 hours
    }
    
    if (closed) {
      closedAt = new Date(timestamp.getTime() + (5 + Math.random() * 14) * 24 * 60 * 60 * 1000) // 5-19 days
    }

    const caseItem: InterventionCase = {
      id: `case-${timestamp.getTime()}-${i}-${Math.random().toString(36).substring(7)}`,
      studentId: String(student.id),
      rootCause,
      supportType,
      riskLevel,
      timestamp,
      aiSummary: `AI-generated intervention case for ${student.name} ${student.surname}. Root cause: ${rootCause}. Support type: ${supportType}.`,
      conversationContext: `Student requested help with ${rootCause} issues. Initial assessment indicates ${riskLevel} risk level. Student is in Grade ${student.grade}.`,
      diagnosticQuestions: riskLevel === "high" ? [
        { question: "What specific challenges are you facing?", response: "Struggling with understanding concepts" },
        { question: "How long have you been experiencing this?", response: "Past few weeks" },
      ] : undefined,
      escalated,
      escalatedTo: escalated ? pickOne(["counselor@tut.ac.za", "academic-advisor@tut.ac.za", "mentor@tut.ac.za"]) : undefined,
      escalatedAt,
      closed,
      closedBy: closed ? (Math.random() > 0.5 ? "human" : "ai") : undefined,
      closedAt,
      humanRolePlayerAssigned: escalated ? pickOne(["counselor@tut.ac.za", "academic-advisor@tut.ac.za"]) : undefined,
      assignedRolePlayerType: escalated ? pickOne(rolePlayerTypes) : undefined,
    }

    cases.push(caseItem)
  }

  return cases
}

// Mock intervention cases
export const mockInterventionCases: InterventionCase[] = generateInterventionCases(mockStudents)

// Mock student activities
export const mockStudentActivities: StudentActivity[] = [
  {
    id: "act1",
    type: "assignment",
    title: "Submitted Shakespeare Essay",
    description: "Completed and submitted essay for English Literature",
    date: new Date("2025-01-17"),
    status: "completed",
    relatedCourse: "English Literature",
  },
  {
    id: "act2",
    type: "exam",
    title: "History Midterm",
    description: "Scored 94% on World History midterm exam",
    date: new Date("2025-01-15"),
    status: "completed",
    relatedCourse: "World History",
  },
  {
    id: "act3",
    type: "assignment",
    title: "Math Problem Set Due",
    description: "Calculus Problem Set 5 due in 4 days",
    date: new Date("2025-01-20"),
    status: "upcoming",
    relatedCourse: "Advanced Mathematics",
  },
  {
    id: "act4",
    type: "achievement",
    title: "Perfect Attendance - January",
    description: "Maintained 100% attendance for the month",
    date: new Date("2025-01-16"),
    status: "completed",
  },
  {
    id: "act5",
    type: "assignment",
    title: "Physics Lab Report Due",
    description: "Motion experiments lab report due soon",
    date: new Date("2025-01-22"),
    status: "upcoming",
    relatedCourse: "Physics",
  },
]

// Mock chat messages for the communications system
export const mockChatMessages: ChatMessage[] = [
  // Emma Johnson's conversation
  {
    id: "msg1",
    conversationId: "conv1",
    senderId: "s1",
    senderType: "student",
    content: "Hi, I'm feeling really stressed about my upcoming calculus exam. I don't know if I'm prepared enough.",
    timestamp: new Date("2025-01-16T10:30:00"),
    sentiment: "negative",
    topics: ["stress", "academic", "exam"],
  },
  {
    id: "msg2",
    conversationId: "conv1",
    senderId: "bot",
    senderType: "bot",
    content:
      "I understand exam stress can feel overwhelming, Emma. It's completely normal to feel this way. Let's work through this together. First, can you tell me what specific topics in calculus are giving you the most trouble?",
    timestamp: new Date("2025-01-16T10:30:30"),
    sentiment: "positive",
    topics: ["support", "academic"],
  },
  {
    id: "msg3",
    conversationId: "conv1",
    senderId: "s1",
    senderType: "student",
    content:
      "I'm struggling with integration by parts. I understand the concept but I keep making mistakes in the problems.",
    timestamp: new Date("2025-01-16T10:32:00"),
    sentiment: "neutral",
    topics: ["academic", "math"],
  },
  {
    id: "msg4",
    conversationId: "conv1",
    senderId: "bot",
    senderType: "bot",
    content:
      "Integration by parts can be tricky! Let me help you with a step-by-step approach. Remember the formula: ∫u dv = uv - ∫v du. The key is choosing the right u and dv. Try using the LIATE rule: Logarithmic, Inverse trig, Algebraic, Trig, Exponential - that's the priority order for choosing u. Would you like to work through a practice problem together?",
    timestamp: new Date("2025-01-16T10:33:00"),
    sentiment: "positive",
    topics: ["academic", "tutoring", "math"],
  },
  {
    id: "msg5",
    conversationId: "conv1",
    senderId: "s1",
    senderType: "student",
    content: "Yes please! That would really help. Thank you so much!",
    timestamp: new Date("2025-01-16T10:34:00"),
    sentiment: "positive",
    topics: ["academic", "gratitude"],
  },
  // Michael Chen's concerning conversation
  {
    id: "msg6",
    conversationId: "conv2",
    senderId: "s2",
    senderType: "student",
    content: "I don't think I can do this anymore. Everything feels pointless.",
    timestamp: new Date("2025-01-15T14:20:00"),
    sentiment: "concerning",
    topics: ["mental-health", "hopelessness"],
  },
  {
    id: "msg7",
    conversationId: "conv2",
    senderId: "bot",
    senderType: "bot",
    content:
      "Michael, I'm really concerned about what you're sharing. These feelings are important and you deserve support. You're not alone in this. I want to make sure you get the help you need. Would you be comfortable talking to a school counselor? I can help arrange that. In the meantime, please know that what you're feeling is temporary, even though it doesn't feel that way right now.",
    timestamp: new Date("2025-01-15T14:20:45"),
    sentiment: "concerning",
    topics: ["mental-health", "crisis-support"],
  },
  {
    id: "msg8",
    conversationId: "conv2",
    senderId: "s2",
    senderType: "student",
    content: "I'm just failing everything. My parents are going to be so disappointed.",
    timestamp: new Date("2025-01-15T14:22:00"),
    sentiment: "concerning",
    topics: ["academic", "family", "failure"],
  },
  {
    id: "msg9",
    conversationId: "conv2",
    senderId: "bot",
    senderType: "bot",
    content:
      "I hear how much pressure you're feeling, and that's really hard. But please know that grades don't define your worth. You're going through a difficult time, and that's okay. Let's focus on getting you support first, then we can work on academics together. I've flagged this conversation for our counseling team - someone will reach out to you today. Would you like to talk about what's been making school difficult lately?",
    timestamp: new Date("2025-01-15T14:23:00"),
    sentiment: "concerning",
    topics: ["mental-health", "support", "academic"],
  },
  // Sophia Martinez's conversation
  {
    id: "msg10",
    conversationId: "conv3",
    senderId: "s3",
    senderType: "student",
    content: "Can you help me understand photosynthesis? I have a biology test tomorrow.",
    timestamp: new Date("2025-01-17T16:00:00"),
    sentiment: "neutral",
    topics: ["academic", "biology"],
  },
  {
    id: "msg11",
    conversationId: "conv3",
    senderId: "bot",
    senderType: "bot",
    content:
      "Of course! Photosynthesis is how plants convert light energy into chemical energy. The basic equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. It happens in two stages: the light-dependent reactions (in the thylakoid) and the light-independent reactions or Calvin cycle (in the stroma). What specific part would you like me to explain in more detail?",
    timestamp: new Date("2025-01-17T16:01:00"),
    sentiment: "positive",
    topics: ["academic", "biology", "tutoring"],
  },
  {
    id: "msg12",
    conversationId: "conv3",
    senderId: "s3",
    senderType: "student",
    content: "The Calvin cycle is confusing. Can you break it down?",
    timestamp: new Date("2025-01-17T16:03:00"),
    sentiment: "neutral",
    topics: ["academic", "biology"],
  },
]

// Mock conversations for the communications dashboard
export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    studentId: "s1",
    studentName: "Sifiso Mazibuko",
    startedAt: new Date("2025-01-16T10:30:00"),
    lastMessageAt: new Date("2025-01-16T10:34:00"),
    messageCount: 5,
    overallSentiment: "positive",
    topics: ["stress", "academic", "exam", "math", "tutoring"],
    flagged: false,
  },
  {
    id: "conv2",
    studentId: "s2",
    studentName: "Michael Chen",
    startedAt: new Date("2025-01-15T14:20:00"),
    lastMessageAt: new Date("2025-01-15T14:23:00"),
    messageCount: 4,
    overallSentiment: "concerning",
    topics: ["mental-health", "hopelessness", "crisis-support", "academic", "family"],
    flagged: true,
    flagReason: "Expressions of hopelessness and distress detected",
  },
  {
    id: "conv3",
    studentId: "s3",
    studentName: "Sophia Martinez",
    startedAt: new Date("2025-01-17T16:00:00"),
    lastMessageAt: new Date("2025-01-17T16:03:00"),
    messageCount: 3,
    overallSentiment: "neutral",
    topics: ["academic", "biology", "tutoring"],
    flagged: false,
  },
]

// Mock communication insights for the admin dashboard
export const mockCommunicationInsights: CommunicationInsights = {
  totalConversations: 47,
  activeStudents: 23,
  averageMessagesPerStudent: 8.5,
  flaggedConversations: 3,
  sentimentDistribution: {
    positive: 28,
    neutral: 15,
    negative: 1,
    concerning: 3,
  },
  topTopics: [
    { topic: "Academic Support", count: 32, sentiment: "neutral" },
    { topic: "Exam Stress", count: 18, sentiment: "negative" },
    { topic: "Math Help", count: 15, sentiment: "neutral" },
    { topic: "Mental Health", count: 8, sentiment: "concerning" },
    { topic: "Assignment Help", count: 12, sentiment: "neutral" },
    { topic: "Motivation", count: 10, sentiment: "positive" },
  ],
  atRiskStudents: [
    {
      studentId: "s2",
      studentName: "Michael Chen",
      conversationCount: 6,
      concerningMessages: 4,
      lastContact: new Date("2025-01-15T14:23:00"),
      riskIndicators: ["Expressions of hopelessness", "Academic failure concerns", "Family pressure"],
    },
    {
      studentId: "s4",
      studentName: "James Wilson",
      conversationCount: 3,
      concerningMessages: 2,
      lastContact: new Date("2025-01-14T11:30:00"),
      riskIndicators: ["Repeated mentions of giving up", "Low self-esteem"],
    },
  ],
}

// Mock subjects
export const mockSubjects: Subject[] = [
  {
    id: "1",
    code: "MATH",
    name: "Mathematics",
    department: "Mathematics & Sciences",
    riskLevel: "low",
    stats: {
      academicWarning: 2,
      repeatingGrade: 1,
      repeatingSubjects: { first: 0, second: 2, third: 1, fourth: 0 },
      firstTime: 1,
      total: 1,
    },
  },
  {
    id: "2",
    code: "PHY",
    name: "Physical Sciences",
    department: "Mathematics & Sciences",
    riskLevel: "medium",
    stats: {
      academicWarning: 1,
      repeatingGrade: 0,
      repeatingSubjects: { first: 2, second: 1, third: 0, fourth: 0 },
      firstTime: 0,
      total: 3,
    },
  },
  {
    id: "3",
    code: "ECO",
    name: "Economics",
    department: "Commerce & Economics",
    riskLevel: "low",
    stats: {
      academicWarning: 0,
      repeatingGrade: 0,
      repeatingSubjects: { first: 1, second: 0, third: 0, fourth: 0 },
      firstTime: 2,
      total: 3,
    },
  },
  {
    id: "4",
    code: "ENG",
    name: "English Home Language",
    department: "Languages",
    riskLevel: "low",
    stats: {
      academicWarning: 0,
      repeatingGrade: 1,
      repeatingSubjects: { first: 1, second: 0, third: 1, fourth: 0 },
      firstTime: 2,
      total: 3,
    },
  },
  {
    id: "5",
    code: "LIF",
    name: "Life Sciences",
    department: "Mathematics & Sciences",
    riskLevel: "low",
    stats: {
      academicWarning: 1,
      repeatingGrade: 0,
      repeatingSubjects: { first: 0, second: 1, third: 0, fourth: 0 },
      firstTime: 3,
      total: 4,
    },
  },
  {
    id: "6",
    code: "GEO",
    name: "Geography",
    department: "Humanities",
    riskLevel: "low",
    stats: {
      academicWarning: 0,
      repeatingGrade: 0,
      repeatingSubjects: { first: 0, second: 0, third: 0, fourth: 0 },
      firstTime: 5,
      total: 5,
    },
  },
]

// Mock groups
export const mockGroups: Group[] = [
  {
    id: "8A",
    name: "8A",
    description: "Grade 8 Class A",
  },
  {
    id: "8B",
    name: "8B",
    description: "Grade 8 Class B",
  },
  {
    id: "9A",
    name: "9A",
    description: "Grade 9 Class A",
  },
  {
    id: "9B",
    name: "9B",
    description: "Grade 9 Class B",
  },
  {
    id: "10A",
    name: "10A",
    description: "Grade 10 Class A",
  },
  {
    id: "10B",
    name: "10B",
    description: "Grade 10 Class B",
  },
  {
    id: "11A",
    name: "11A",
    description: "Grade 11 Class A",
  },
  {
    id: "11B",
    name: "11B",
    description: "Grade 11 Class B",
  },
  {
    id: "12A",
    name: "12A",
    description: "Grade 12 Class A",
  },
  {
    id: "12B",
    name: "12B",
    description: "Grade 12 Class B",
  },
]

// Mock communication history
export const mockCommunicationHistory: CommunicationHistory[] = [
  {
    id: "156",
    studentId: 1,
    role: "TEACHER",
    name: "Mr. Mazibuko",
    threadCondition: "MATH - Mathematics Assignment",
    readStatus: "Unread",
    dateSent: "2025-03-12 16:45:12",
    dateRead: "-",
  },
  {
    id: "262",
    studentId: 2,
    role: "TEACHER",
    name: "Ms Nkosi",
    threadCondition: "MATH - Mathematics Assignment",
    readStatus: "Read",
    dateSent: "2025-03-12 18:04:36",
    dateRead: "2025-04-02 07:11:21",
  },
  {
    id: "567",
    studentId: 3,
    role: "TEACHER",
    name: "Mr SEKHITLA",
    threadCondition: "PHY - Physical Sciences Study Session",
    readStatus: "Read",
    dateSent: "2025-03-28 14:37:20",
    dateRead: "2025-04-02 07:11:21",
  },
  {
    id: "606",
    studentId: 4,
    role: "TEACHER",
    name: "Mr SEKHITLA",
    threadCondition: "PHY - Break Catch-up Plan",
    readStatus: "Read",
    dateSent: "2025-03-31 06:12:50",
    dateRead: "2025-04-02 07:11:21",
  },
  {
    id: "791",
    studentId: 5,
    role: "TEACHER",
    name: "Mr SEKHITLA",
    threadCondition: "PHY - Physical Sciences Study Session",
    readStatus: "Unread",
    dateSent: "2025-04-09 11:52:47",
    dateRead: "-",
  },
  {
    id: "812",
    studentId: 6,
    role: "AEO",
    name: "Ms M Mashile",
    threadCondition: "IMPORTANT SECOND TERM INFORMATION AND SCHEDULE",
    readStatus: "Unread",
    dateSent: "2025-04-10 09:15:30",
    dateRead: "-",
  },
  {
    id: "913",
    studentId: 7,
    role: "TEACHER",
    name: "Ms Nkosi",
    threadCondition: "ENG - English Literature Assignment",
    readStatus: "Read",
    dateSent: "2025-03-15 10:20:00",
    dateRead: "2025-03-16 08:30:00",
  },
  {
    id: "1024",
    studentId: 8,
    role: "TEACHER",
    name: "Mr. Mazibuko",
    threadCondition: "MATH - Weekly Progress Check",
    readStatus: "Unread",
    dateSent: "2025-04-08 14:15:00",
    dateRead: "-",
  },
  {
    id: "1135",
    studentId: 9,
    role: "TEACHER",
    name: "Mr SEKHITLA",
    threadCondition: "PHY - Laboratory Safety Reminder",
    readStatus: "Read",
    dateSent: "2025-03-20 09:00:00",
    dateRead: "2025-03-20 15:45:00",
  },
  {
    id: "1246",
    studentId: 10,
    role: "AEO",
    name: "Ms M Mashile",
    threadCondition: "ATTENDANCE WARNING - Multiple Absences",
    readStatus: "Unread",
    dateSent: "2025-04-11 11:00:00",
    dateRead: "-",
  },
  {
    id: "1357",
    studentId: 11,
    role: "TEACHER",
    name: "Ms Nkosi",
    threadCondition: "ENG - Essay Submission Reminder",
    readStatus: "Read",
    dateSent: "2025-03-25 13:30:00",
    dateRead: "2025-03-26 09:15:00",
  },
  {
    id: "1468",
    studentId: 12,
    role: "TEACHER",
    name: "Mr. Mazibuko",
    threadCondition: "MATH - Exam Preparation Guide",
    readStatus: "Read",
    dateSent: "2025-04-01 08:00:00",
    dateRead: "2025-04-01 12:30:00",
  },
  {
    id: "1579",
    studentId: 13,
    role: "TEACHER",
    name: "Mr SEKHITLA",
    threadCondition: "PHY - Project Deadline Extension",
    readStatus: "Unread",
    dateSent: "2025-04-12 16:00:00",
    dateRead: "-",
  },
  {
    id: "1680",
    studentId: 14,
    role: "AEO",
    name: "Ms M Mashile",
    threadCondition: "ACADEMIC WARNING - Low Performance",
    readStatus: "Read",
    dateSent: "2025-03-18 10:00:00",
    dateRead: "2025-03-19 14:20:00",
  },
  {
    id: "1791",
    studentId: 15,
    role: "TEACHER",
    name: "Ms Nkosi",
    threadCondition: "ENG - Reading Comprehension Assignment",
    readStatus: "Read",
    dateSent: "2025-03-22 11:15:00",
    dateRead: "2025-03-23 10:00:00",
  },
]

// Sci-Bono data generation
function generateSciBonoData(student: Learner, studentIndex: number): SciBonoPerformance | undefined {
  // 25% of students participate in Sci-Bono
  if (Math.random() > 0.25 && studentIndex > 10) return undefined

  const enrollmentDate = dateBetween(new Date("2024-06-01"), new Date("2024-12-01"))
  const isCompleted = Math.random() > 0.4
  const completionDate = isCompleted ? dateBetween(enrollmentDate, new Date()) : undefined
  const status: "active" | "completed" | "inactive" = isCompleted
    ? "completed"
    : Math.random() > 0.1
    ? "active"
    : "inactive"

  // Generate scores
  const roboticsScore = clamp(randomNormal(75, 12), 50, 100)
  const mathScore = clamp(randomNormal(78, 10), 55, 100)
  const aiTutorRating = clamp(randomNormal(4.2, 0.6), 3, 5)

  // Generate badges
  const allBadges = [
    "Robotics Master",
    "Math Champion",
    "Circuit Builder",
    "Problem Solver",
    "AI Explorer",
    "3D Designer",
    "Physics Expert",
    "Code Master",
    "Team Player",
    "Innovation Leader",
  ]
  const badgesEarned = allBadges
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 5) + 2)

  // Calculate pre/post improvements if completed
  let improvements: SciBonoImprovements | undefined
  if (isCompleted && student.assessments && student.attendance) {
    const preAS = Math.max(40, (student.assessments?.AS || 50) - Math.floor(Math.random() * 15) - 5)
    const preCT = Math.max(40, (student.assessments?.CT || 50) - Math.floor(Math.random() * 15) - 5)
    const preWR = Math.max(40, (student.assessments?.WR || 50) - Math.floor(Math.random() * 15) - 5)
    const prePP = Math.round((preAS + preCT + preWR) / 3)

    const postAS = student.assessments?.AS || 50
    const postCT = student.assessments?.CT || 50
    const postWR = student.assessments?.WR || 50
    const postPP = student.assessments?.PP || prePP

    const preAttendance = Math.max(60, (student.attendance?.percentage || 75) - Math.floor(Math.random() * 10) - 5)
    const postAttendance = student.attendance?.percentage || 75

    improvements = {
      preSciBono: {
        assessments: { AS: preAS, CT: preCT, WR: preWR, PP: prePP },
        attendance: {
          attended: Math.round((preAttendance / 100) * (student.attendance?.total || 32)),
          total: student.attendance?.total || 32,
          percentage: preAttendance,
        },
        riskLevel: student.riskLevel === "Good" ? "Satisfactory" : student.riskLevel === "Satisfactory" ? "At Risk" : "At Risk",
      },
      postSciBono: {
        assessments: student.assessments || { AS: postAS, CT: postCT, WR: postWR, PP: postPP },
        attendance: student.attendance || { attended: Math.round((postAttendance / 100) * 32), total: 32, percentage: postAttendance },
        riskLevel: student.riskLevel,
      },
      improvements: {
        assessmentImprovement: postPP - prePP,
        attendanceImprovement: postAttendance - preAttendance,
        riskLevelChange:
          student.riskLevel === "Good"
            ? "Improved from Satisfactory to Good"
            : student.riskLevel === "Satisfactory"
            ? "Improved from At Risk to Satisfactory"
            : "Maintained At Risk status",
      },
    }
  }

  return {
    isParticipant: true,
    enrollmentDate,
    completionDate,
    status,
    scores: {
      robotics: {
        overallScore: Math.round(roboticsScore),
        circuitBuilder: Math.round(clamp(randomNormal(roboticsScore, 8), 45, 100)),
        robotDesign: Math.round(clamp(randomNormal(roboticsScore, 8), 45, 100)),
        physicsSimulation: Math.round(clamp(randomNormal(roboticsScore, 8), 45, 100)),
        activitiesCompleted: Math.floor(Math.random() * 15) + 8,
      },
      math: {
        overallScore: Math.round(mathScore),
        challengesCompleted: Math.floor(Math.random() * 30) + 15,
        puzzlesSolved: Math.floor(Math.random() * 50) + 25,
        adaptiveLevel: Math.floor(Math.random() * 5) + 5,
        badgesEarned: badgesEarned.length,
      },
      aiTutor: {
        sessionsCompleted: Math.floor(Math.random() * 20) + 10,
        averageRating: Math.round(aiTutorRating * 10) / 10,
        topicsCovered: [
          "Algebra",
          "Geometry",
          "Calculus",
          "Physics",
          "Programming",
          "Robotics",
        ].slice(0, Math.floor(Math.random() * 4) + 2),
        helpRequests: Math.floor(Math.random() * 15) + 5,
      },
    },
    attendance: clamp(randomNormal(85, 8), 70, 100),
    badgesEarned,
    improvements,
  }
}

// Add Sci-Bono data to students
mockStudents.forEach((student, index) => {
  const sciBonoData = generateSciBonoData(student, index)
  if (sciBonoData) {
    ;(student as Learner & { sciBono?: SciBonoPerformance }).sciBono = sciBonoData
  }
})
