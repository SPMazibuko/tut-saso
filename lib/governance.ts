"use client"

import type {
  DistrictSummary,
  ProvinceSummary,
  SchoolSummary,
  SchoolPerformance,
  PerformanceCriteria,
  PerformanceTrend,
  PerformanceFlag,
  PerformanceCategory,
  SchoolPhase,
  TopBottomSchools,
  MELMetrics,
  GovernanceKPIs,
  SchoolPerformanceReport,
  GradeSpecificPerformance,
} from "./types"
import { getDashboardStats } from "./data-service"
import { mockSchoolPerformanceData } from "./mock-governance-data"
import {
  generateProvinceSummaries,
  generateDistrictSummaries,
  generateSchoolSummaries,
} from "./sa-provinces-data"


import type {SubDistrictSummary } from "./types"
import {  getStudents } from "./data-service"

// Smart Weighting Model
const WEIGHTS = {
  "senior-phase": {
    attendance: 0.35,
    sba: 0.30,
    promotionRate: 0.20,
    curriculumCoverage: 0.10,
    riskScore: 0.05,
  },
  fet: {
    attendance: 0.20,
    sba: 0.35,
    promotionRate: 0.35,
    curriculumCoverage: 0.05,
    riskScore: 0.05,
  },
}

/**
 * Calculate performance score using smart weighting model
 */
export function calculatePerformanceScore(
  criteria: PerformanceCriteria,
  phase: SchoolPhase,
): number {
  const weights = WEIGHTS[phase]

  // Normalize risk score (0-100, lower is better) to performance score (0-100, higher is better)
  const normalizedRisk = 100 - criteria.riskScore

  // Calculate weighted score
  const score =
    criteria.attendance * weights.attendance +
    criteria.sba * weights.sba +
    criteria.promotionRate * weights.promotionRate +
    criteria.curriculumCoverage * weights.curriculumCoverage +
    normalizedRisk * weights.riskScore

  return Math.round(score * 100) / 100
}

/**
 * Determine performance trend based on historical data
 */
function determineTrend(current: number, previous: number): PerformanceTrend {
  const diff = current - previous
  if (diff > 2) return "improving"
  if (diff < -2) return "declining"
  return "stable"
}

/**
 * Determine performance flag based on value and thresholds
 */
function determineFlag(
  value: number,
  excellent: number,
  moderate: number,
  reverse: boolean = false,
): PerformanceFlag {
  if (reverse) {
    // For risk score (lower is better)
    if (value <= excellent) return "green"
    if (value <= moderate) return "yellow"
    return "red"
  }
  // For other metrics (higher is better)
  if (value >= excellent) return "green"
  if (value >= moderate) return "yellow"
  return "red"
}

/**
 * Determine performance category based on score and trends
 */
function determineCategory(
  score: number,
  trends: { attendance: PerformanceTrend; sba: PerformanceTrend; promotionRate: PerformanceTrend },
): PerformanceCategory {
  if (score >= 80) return "excellent"
  if (score >= 60) {
    const improvingCount = Object.values(trends).filter((t) => t === "improving").length
    if (improvingCount >= 2) return "stable"
    return "declining"
  }
  return "high-risk"
}

/**
 * Get all school performances
 */
export function getAllSchoolPerformances(): SchoolPerformance[] {
  return mockSchoolPerformanceData.map((school) => {
    const phase: SchoolPhase = ["8", "9"].includes(school.gradeSpecificData[0]?.grade || "")
      ? "senior-phase"
      : "fet"

    const criteria: PerformanceCriteria = {
      attendance: school.criteria.attendance,
      sba: school.criteria.sba,
      promotionRate: school.criteria.promotionRate,
      curriculumCoverage: school.criteria.curriculumCoverage,
      riskScore: school.criteria.riskScore,
    }

    const performanceScore = calculatePerformanceScore(criteria, phase)

    // Determine trends (simplified - in production would use historical data)
    const trends = {
      attendance: determineTrend(school.criteria.attendance, school.criteria.attendance - 2),
      sba: determineTrend(school.criteria.sba, school.criteria.sba - 1),
      promotionRate: determineTrend(school.criteria.promotionRate, school.criteria.promotionRate - 1),
      curriculumCoverage: determineTrend(
        school.criteria.curriculumCoverage,
        school.criteria.curriculumCoverage - 1,
      ),
      riskScore: determineTrend(school.criteria.riskScore, school.criteria.riskScore + 5),
    }

    // Determine flags
    const flags = {
      attendance: determineFlag(school.criteria.attendance, 90, 75),
      sba: determineFlag(school.criteria.sba, 75, 60),
      promotionRate: determineFlag(school.criteria.promotionRate, 85, 70),
      curriculumCoverage: determineFlag(school.criteria.curriculumCoverage, 90, 75),
      riskScore: determineFlag(school.criteria.riskScore, 20, 40, true),
    }

    const category = determineCategory(performanceScore, trends)

    return {
      ...school,
      phase,
      performanceScore,
      trends,
      flags,
      category,
    }
  })
}

/**
 * Get Top and Bottom 15 schools split by phase
 */
export function getTopBottomSchools(): TopBottomSchools {
  const allSchools = getAllSchoolPerformances()

  // Separate by phase
  const seniorPhaseSchools = allSchools
    .filter((s) => s.phase === "senior-phase")
    .sort((a, b) => b.performanceScore - a.performanceScore)

  const fetSchools = allSchools
    .filter((s) => s.phase === "fet")
    .sort((a, b) => b.performanceScore - a.performanceScore)

  // Assign ranks
  seniorPhaseSchools.forEach((school, index) => {
    school.phaseRank = index + 1
  })
  fetSchools.forEach((school, index) => {
    school.phaseRank = index + 1
  })

  // Assign overall ranks
  const allRanked = [...seniorPhaseSchools, ...fetSchools]
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .map((school, index) => {
      school.rank = index + 1
      return school
    })

  return {
    top15: {
      seniorPhase: seniorPhaseSchools.slice(0, 7),
      fet: fetSchools.slice(0, 8),
    },
    bottom15: {
      seniorPhase: seniorPhaseSchools.slice(-7).reverse(),
      fet: fetSchools.slice(-8).reverse(),
    },
  }
}

/**
 * Get school performance report
 */
export function getSchoolPerformanceReport(schoolId: string): SchoolPerformanceReport | null {
  const allSchools = getAllSchoolPerformances()
  const school = allSchools.find((s) => s.schoolId === schoolId)

  if (!school) return null

  const totalStudents = school.gradeSpecificData.reduce(
    (sum, grade) => sum + ((grade as any).studentCount || 100),
    0,
  )

  const gradeBreakdown = school.gradeSpecificData.map((grade) => ({
    grade: grade.grade,
    studentCount: (grade as any).studentCount || 100,
  }))

  return {
    school,
    overallSummary: {
      totalStudents,
      gradeBreakdown,
      combinedScore: school.performanceScore,
    },
    detailedAnalysis: {
      strengths: school.strengths,
      weaknesses: school.weaknesses,
      rootCauses: school.rootCauses,
      recommendations: school.recommendations,
    },
    interventionGuidance: school.recommendations.map((rec) => ({
      intervention: rec.recommendation,
      rolePlayer: rec.rolePlayer,
      timeline: rec.timeline,
      expectedOutcome: rec.minStandard,
    })),
    followUpCycle: {
      monitoring: [
        "Weekly progress tracking for at-risk learners",
        "Monthly curriculum coverage review",
        "Quarterly SBA compliance audit",
      ],
      escalation: [
        "Alert district office if performance score drops below 50",
        "Escalate to province if multiple criteria flags turn red",
        "Request intervention support if improvement index remains negative for 2 quarters",
      ],
      closure: [
        "Close intervention when performance score reaches target threshold",
        "Archive case after 1 year of sustained improvement",
        "Update success metrics in quarterly report",
      ],
    },
  }
}

/**
 * Get MEL metrics for a school
 */
export function getMELMetrics(schoolId: string): MELMetrics | null {
  const school = mockSchoolPerformanceData.find((s) => s.schoolId === schoolId)
  if (!school) return null

  // Generate realistic MEL metrics based on school performance
  const baseScore = school.criteria.attendance + school.criteria.sba
  const performanceFactor = baseScore / 200

  return {
    schoolId,
    monitoring: {
      alertToInterventionLatency: Math.max(1, 5 - performanceFactor * 3), // 1-5 days
      interventionClosureTime: Math.max(7, 30 - performanceFactor * 15), // 7-30 days
      workflowFidelity: Math.max(60, 95 + performanceFactor * 5), // 60-100%
      rolePlayerResponsiveness: Math.max(70, 98 + performanceFactor * 2), // 70-100%
      coverageMetrics: {
        atRiskWithActivePlan: Math.max(70, 90 + performanceFactor * 5), // 70-95%
        classesWithCurriculumCoverage: Math.max(75, 95 + performanceFactor * 5), // 75-100%
      },
      dataQuality: {
        sbaOnTimeUploads: Math.max(85, 98 + performanceFactor * 2), // 85-100%
        attendanceCompleteness: Math.max(90, 99 + performanceFactor * 1), // 90-100%
        exceptionRate: Math.max(0.5, 2 - performanceFactor * 1.5), // 0.5-2%
      },
      popiaCompliance: {
        consentCaptureRate: Math.max(85, 98 + performanceFactor * 2), // 85-100%
        dataAccessTrails: Math.floor(Math.random() * 500) + 100,
        exceptionHandlingLogs: Math.floor(Math.random() * 50) + 5,
      },
    },
    tracking: {
      cohortProgression: {
        grade8to9: Math.max(85, 95 + performanceFactor * 5), // 85-100%
        grade9to10: Math.max(80, 92 + performanceFactor * 5), // 80-97%
        grade10to11: Math.max(75, 90 + performanceFactor * 5), // 75-95%
        grade11to12: Math.max(70, 88 + performanceFactor * 5), // 70-93%
      },
      feederMapping: {
        tvetTransitions: Math.floor(Math.random() * 30) + 5,
        universityTransitions: Math.floor(Math.random() * 40) + 10,
        firstYearReadinessIndex: Math.max(60, 85 + performanceFactor * 15), // 60-100%
      },
      equityTracking: {
        genderGaps: [
          { subject: "Mathematics", gap: Math.max(0, 10 - performanceFactor * 8) },
          { subject: "Physical Sciences", gap: Math.max(0, 8 - performanceFactor * 6) },
        ],
        gradeGaps: [
          { grade: "9", gap: Math.max(0, 5 - performanceFactor * 4) },
          { grade: "11", gap: Math.max(0, 7 - performanceFactor * 5) },
        ],
        subjectGaps: [
          { subject: "Mathematics", gap: Math.max(0, 15 - performanceFactor * 10) },
        ],
      },
      subjectJourneys: [
        {
          subject: "Mathematics",
          conceptMastery: Math.max(50, 80 + performanceFactor * 15),
          repeatedRiskCount: Math.floor(Math.random() * 20) + 5,
        },
        {
          subject: "Physical Sciences",
          conceptMastery: Math.max(55, 82 + performanceFactor * 15),
          repeatedRiskCount: Math.floor(Math.random() * 15) + 3,
        },
      ],
    },
    analytics: {
      predictivePrecision: Math.max(0.65, 0.85 + performanceFactor * 0.1), // 65-95%
      predictiveRecall: Math.max(0.70, 0.88 + performanceFactor * 0.1), // 70-98%
      counterfactualForecast: {
        withIntervention: Math.max(75, 90 + performanceFactor * 10),
        withoutIntervention: Math.max(60, 75 + performanceFactor * 10),
      },
      interventionUplift: Math.max(5, 15 + performanceFactor * 10), // 5-25 percentage points
      teacherImpactSignals: [
        {
          teacherId: "t1",
          subject: "Mathematics",
          termOverTermChange: Math.max(-5, 8 + performanceFactor * 5),
        },
      ],
      thresholdOptimization: {
        falsePositiveRate: Math.max(0.05, 0.15 - performanceFactor * 0.08),
        falseNegativeRate: Math.max(0.03, 0.12 - performanceFactor * 0.07),
      },
    },
    evaluation: {
      outcomeKPIs: {
        attendanceChange: Math.max(-5, 5 + performanceFactor * 8), // -5 to +13 pp
        sbaChange: Math.max(-3, 4 + performanceFactor * 6), // -3 to +10 pp
        promotionRateChange: Math.max(-8, 6 + performanceFactor * 10), // -8 to +16 pp
        repeatRateChange: Math.max(-10, -2 - performanceFactor * 6), // -16 to -2 pp (negative is good)
        dropoutRateChange: Math.max(-5, -1 - performanceFactor * 3), // -8 to -1 pp (negative is good)
        timeToSupportChange: Math.max(-10, -2 - performanceFactor * 6), // -16 to -2 days (negative is good)
      },
      attribution: {
        interventionUplift: [
          {
            interventionType: "Targeted Remediation",
            uplift: Math.max(3, 8 + performanceFactor * 5),
            confidence: 0.85,
          },
          {
            interventionType: "Attendance Support",
            uplift: Math.max(2, 6 + performanceFactor * 4),
            confidence: 0.78,
          },
        ],
        shapExplanations: [
          { feature: "Attendance Rate", contribution: 0.25 },
          { feature: "SBA Performance", contribution: 0.30 },
          { feature: "Previous Year Performance", contribution: 0.20 },
        ],
      },
      reportingCadence: {
        lastMonthlyReview: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastQuarterlyReport: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        pilotEvaluationDue: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    },
  }
}

/**
 * Get Governance KPIs
 */
export function getGovernanceKPIs(): GovernanceKPIs {
  const allSchools = getAllSchoolPerformances()
  const fetSchools = allSchools.filter((s) => s.phase === "fet")

  // Calculate aggregate KPIs
  const avgAttendance = fetSchools.reduce((sum, s) => sum + s.criteria.attendance, 0) / fetSchools.length
  const avgSBAUploads = fetSchools.reduce((sum, s) => sum + (s.criteria.sba > 0 ? 98 : 85), 0) / fetSchools.length
  const avgAlertLatency = fetSchools.reduce((sum, s) => sum + (s.criteria.riskScore < 30 ? 2 : 4), 0) / fetSchools.length
  const avgClosureSLA = fetSchools.reduce((sum, s) => sum + (s.performanceScore > 70 ? 85 : 75), 0) / fetSchools.length
  const avgActivePlans = fetSchools.reduce((sum, s) => sum + (s.criteria.riskScore < 30 ? 90 : 80), 0) / fetSchools.length

  const gr12Schools = allSchools.filter((s) =>
    s.gradeSpecificData.some((g) => g.grade === "12"),
  )
  const avgPromotionChange = gr12Schools.reduce(
    (sum, s) => sum + (s.criteria.promotionRate - 75),
    0,
  ) / gr12Schools.length

  const avgUplift = fetSchools.reduce((sum, s) => sum + s.interventionEffectiveness / 10, 0) / fetSchools.length

  return {
    attendanceCompliance: Math.round(avgAttendance), // Gr 10-12: ≥ 90% target
    sbaOnTimeUploads: Math.round(avgSBAUploads), // ≥ 95% per term
    alertToInterventionMedian: Math.round(avgAlertLatency * 10) / 10, // ≤ 3 days
    interventionClosureSLA: Math.round(avgClosureSLA), // ≥ 80%
    atRiskWithActivePlans: Math.round(avgActivePlans), // ≥ 85%
    promotionRateChange: Math.round(avgPromotionChange * 10) / 10, // Gr 12: +X pp vs baseline
    interventionUplift: Math.round(avgUplift * 10) / 10, // Pass: +Y pp for supported learners
    equityGap: [
      { subject: "Mathematics", gap: 8.5, target: 5 },
      { subject: "Physical Sciences", gap: 6.2, target: 5 },
    ],
    dataQualityErrors: 0.8, // ≤ 1% entries per term
  }
}

// Multi-Level Governance Functions
// Cache the generated data
let cachedProvinces: ProvinceSummary[] | null = null
let cachedDistricts: DistrictSummary[] | null = null
let cachedSchools: SchoolSummary[] | null = null

// export function getProvinceSummaries(): ProvinceSummary[] {
//   if (!cachedProvinces) {
//     cachedProvinces = generateProvinceSummaries()
//   }
//   return cachedProvinces
// }

export function getDistrictSummaries(): DistrictSummary[] {
  if (!cachedDistricts) {
    cachedDistricts = generateDistrictSummaries()
  }
  return cachedDistricts
}

export function getSchoolSummaries(): SchoolSummary[] {
  if (!cachedSchools) {
    cachedSchools = generateSchoolSummaries()
  }
  return cachedSchools
}

// export function getSchoolSummary(): SchoolSummary {
//   // Return the first school as the default/sample
//   const schools = getSchoolSummaries()
//   return schools[0] || {
//     id: "school-1",
//     name: "SASO High School",
//     districtId: "dist-gp-1",
//     provinceId: "prov-gp",
//     stats: getDashboardStats(),
//   }
// }



////




// ---- Mocked governance hierarchy ----

const SA_PROVINCES: Array<{ id: string; name: string }> = [
  { id: "prov-gp", name: "Gauteng" },
  { id: "prov-kzn", name: "KwaZulu-Natal" },
  { id: "prov-wc", name: "Western Cape" },
  { id: "prov-ec", name: "Eastern Cape" },
  { id: "prov-nw", name: "North West" },
  { id: "prov-mp", name: "Mpumalanga" },
  { id: "prov-lp", name: "Limpopo" },
  { id: "prov-nc", name: "Northern Cape" },
  { id: "prov-fs", name: "Free State" },
]

// Minimal curated district lists (sampled, not exhaustive)
const PROVINCE_TO_DISTRICTS: Record<string, Array<{ id: string; name: string }>> = {
  "prov-gp": [
    { id: "dist-gp-1", name: "Johannesburg" },
    { id: "dist-gp-2", name: "Tshwane" },
    { id: "dist-gp-3", name: "Ekurhuleni" },
    { id: "dist-gp-4", name: "Sedibeng" },
    { id: "dist-gp-5", name: "West Rand" },
  ],
  "prov-kzn": [
    { id: "dist-kzn-1", name: "eThekwini" },
    { id: "dist-kzn-2", name: "uMgungundlovu" },
    { id: "dist-kzn-3", name: "King Cetshwayo" },
  ],
  "prov-wc": [
    { id: "dist-wc-1", name: "City of Cape Town" },
    { id: "dist-wc-2", name: "Cape Winelands" },
    { id: "dist-wc-3", name: "Garden Route" },
  ],
  "prov-ec": [
    { id: "dist-ec-1", name: "Buffalo City" },
    { id: "dist-ec-2", name: "Nelson Mandela Bay" },
  ],
  "prov-nw": [
    { id: "dist-nw-1", name: "Bojanala" },
    { id: "dist-nw-2", name: "Ngaka Modiri Molema" },
  ],
  "prov-mp": [
    { id: "dist-mp-1", name: "Ehlanzeni" },
    { id: "dist-mp-2", name: "Gert Sibande" },
  ],
  "prov-lp": [
    { id: "dist-lp-1", name: "Capricorn" },
    { id: "dist-lp-2", name: "Vhembe" },
  ],
  "prov-nc": [
    { id: "dist-nc-1", name: "Frances Baard" },
  ],
  "prov-fs": [
    { id: "dist-fs-1", name: "Mangaung" },
    { id: "dist-fs-2", name: "Lejweleputswa" },
  ],
}

// Sample sub-districts per district
const DISTRICT_TO_SUBDISTRICTS: Record<string, Array<{ id: string; name: string }>> = {}
for (const d of Object.values(PROVINCE_TO_DISTRICTS).flat()) {
  // Fallback to 3 sub-districts each
  DISTRICT_TO_SUBDISTRICTS[d.id] = [
    { id: `${d.id}-sd-1`, name: "Sub-district 1" },
    { id: `${d.id}-sd-2`, name: "Sub-district 2" },
    { id: `${d.id}-sd-3`, name: "Sub-district 3" },
  ]
}

// Sample schools per sub-district
const SUBDISTRICT_TO_SCHOOLS: Record<string, Array<{ id: string; name: string }>> = {}
for (const subs of Object.values(DISTRICT_TO_SUBDISTRICTS)) {
  for (const sub of subs) {
    SUBDISTRICT_TO_SCHOOLS[sub.id] = [
      { id: `${sub.id}-sch-1`, name: "Unity Secondary School" },
      { id: `${sub.id}-sch-2`, name: "Ubuntu High School" },
      { id: `${sub.id}-sch-3`, name: "Future Leaders Academy" },
      { id: `${sub.id}-sch-4`, name: "Ikamva Primary" },
      { id: `${sub.id}-sch-5`, name: "Masechaba Secondary" },
    ]
  }
}

// ---------------- Assignment of students to regions (deterministic) ----------------

function stringHash(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

const provinceIds = SA_PROVINCES.map((p) => p.id)
const districtsByProvinceId = PROVINCE_TO_DISTRICTS
const subDistrictsByDistrictId = DISTRICT_TO_SUBDISTRICTS
const schoolsBySubDistrictId = SUBDISTRICT_TO_SCHOOLS

const provinceIdToStudents = new Map<string, ReturnType<typeof getStudents>>()
const districtIdToStudents = new Map<string, ReturnType<typeof getStudents>>()
const subDistrictIdToStudents = new Map<string, ReturnType<typeof getStudents>>()
const schoolIdToStudents = new Map<string, ReturnType<typeof getStudents>>()

;(function assignStudentsDeterministically() {
  const allStudents = getStudents()

  for (const pid of provinceIds) {
    provinceIdToStudents.set(pid, [])
  }
  for (const [pid, dlist] of Object.entries(districtsByProvinceId)) {
    for (const d of dlist) districtIdToStudents.set(d.id, [])
  }
  for (const [did, sdlist] of Object.entries(subDistrictsByDistrictId)) {
    for (const sd of sdlist) subDistrictIdToStudents.set(sd.id, [])
  }
  for (const [sdid, slist] of Object.entries(schoolsBySubDistrictId)) {
    for (const s of slist) schoolIdToStudents.set(s.id, [])
  }

  for (const student of allStudents) {
    // Province
    const pIndex = stringHash(student.id) % provinceIds.length
    const provinceId = provinceIds[pIndex]

    const districts = districtsByProvinceId[provinceId]
    const dIndex = stringHash(student.id + "-d") % Math.max(1, districts.length)
    const districtId = districts[dIndex].id

    const subDistricts = subDistrictsByDistrictId[districtId]
    const sdIndex = stringHash(student.id + "-sd") % Math.max(1, subDistricts.length)
    const subDistrictId = subDistricts[sdIndex].id

    const schools = schoolsBySubDistrictId[subDistrictId]
    const sIndex = stringHash(student.id + "-sc") % Math.max(1, schools.length)
    const schoolId = schools[sIndex].id

    provinceIdToStudents.get(provinceId)!.push(student)
    districtIdToStudents.get(districtId)!.push(student)
    subDistrictIdToStudents.get(subDistrictId)!.push(student)
    schoolIdToStudents.get(schoolId)!.push(student)
  }
})()

// ---------------- Public helpers ----------------

export function getStudentsByProvince(provinceId: string) {
  return provinceIdToStudents.get(provinceId) ?? []
}

export function getStudentsByDistrict(districtId: string) {
  return districtIdToStudents.get(districtId) ?? []
}

export function getStudentsBySubDistrict(subDistrictId: string) {
  return subDistrictIdToStudents.get(subDistrictId) ?? []
}

export function getStudentsBySchool(schoolId: string) {
  return schoolIdToStudents.get(schoolId) ?? []
}

// ---------------- Summaries using subset stats ----------------

export function getSchoolSummary(): SchoolSummary {
  // Use the first school as example for the top card
  const firstSub = Object.values(subDistrictsByDistrictId)[0][0]
  const firstSchool = schoolsBySubDistrictId[firstSub.id][0]
  const students = getStudentsBySchool(firstSchool.id)
  return {
    id: firstSchool.id,
    name: firstSchool.name,
    districtId: Object.keys(subDistrictsByDistrictId)[0],
    provinceId: provinceIds[0],
    stats: getDashboardStats(students),
  }
}

export function getProvinceSummaries(): ProvinceSummary[] {
  return SA_PROVINCES.map((p) => ({
    id: p.id,
    name: p.name,
    districts: PROVINCE_TO_DISTRICTS[p.id]?.length || 0,
    stats: getDashboardStats(getStudentsByProvince(p.id)),
  }))
}

export function getProvinceById(provinceId: string): ProvinceSummary | undefined {
  const province = SA_PROVINCES.find((p) => p.id === provinceId)
  if (!province) return undefined
  return {
    id: province.id,
    name: province.name,
    districts: PROVINCE_TO_DISTRICTS[province.id]?.length || 0,
    stats: getDashboardStats(getStudentsByProvince(province.id)),
  }
}

export function getDistrictsByProvince(provinceId: string): DistrictSummary[] {
  const defs = PROVINCE_TO_DISTRICTS[provinceId] || []
  return defs.map((d) => ({
    id: d.id,
    name: d.name,
    provinceId,
    schools: (DISTRICT_TO_SUBDISTRICTS[d.id] || []).reduce((acc, sd) => acc + (SUBDISTRICT_TO_SCHOOLS[sd.id]?.length || 0), 0),
    stats: getDashboardStats(getStudentsByDistrict(d.id)),
  }))
}

export function getDistrictById(districtId: string): DistrictSummary | undefined {
  const provinceId = Object.entries(PROVINCE_TO_DISTRICTS).find(([, districts]) =>
    districts.some((d) => d.id === districtId)
  )?.[0]
  if (!provinceId) return undefined
  const d = PROVINCE_TO_DISTRICTS[provinceId].find((x) => x.id === districtId)!
  return {
    id: d.id,
    name: d.name,
    provinceId,
    schools: (DISTRICT_TO_SUBDISTRICTS[d.id] || []).reduce((acc, sd) => acc + (SUBDISTRICT_TO_SCHOOLS[sd.id]?.length || 0), 0),
    stats: getDashboardStats(getStudentsByDistrict(d.id)),
  }
}

export function getSubDistrictsByDistrict(districtId: string): SubDistrictSummary[] {
  const provinceId = Object.entries(PROVINCE_TO_DISTRICTS).find(([, districts]) =>
    districts.some((d) => d.id === districtId)
  )?.[0]
  const subs = DISTRICT_TO_SUBDISTRICTS[districtId] || []
  return subs.map((sd) => ({
    id: sd.id,
    name: sd.name,
    districtId,
    provinceId: provinceId || "",
    schools: SUBDISTRICT_TO_SCHOOLS[sd.id]?.length || 0,
    stats: getDashboardStats(getStudentsBySubDistrict(sd.id)),
  }))
}

export function getSubDistrictById(subDistrictId: string): SubDistrictSummary | undefined {
  const distEntry = Object.entries(DISTRICT_TO_SUBDISTRICTS).find(([, subs]) =>
    subs.some((sd) => sd.id === subDistrictId)
  )
  if (!distEntry) return undefined
  const [districtId, subs] = distEntry
  const sd = subs.find((x) => x.id === subDistrictId)!
  const provinceId = Object.entries(PROVINCE_TO_DISTRICTS).find(([, districts]) =>
    districts.some((d) => d.id === districtId)
  )?.[0]
  return {
    id: sd.id,
    name: sd.name,
    districtId,
    provinceId: provinceId || "",
    schools: SUBDISTRICT_TO_SCHOOLS[sd.id]?.length || 0,
    stats: getDashboardStats(getStudentsBySubDistrict(sd.id)),
  }
}

export function getSchoolsBySubDistrict(subDistrictId: string): SchoolSummary[] {
  const distEntry = Object.entries(DISTRICT_TO_SUBDISTRICTS).find(([, subs]) =>
    subs.some((sd) => sd.id === subDistrictId)
  )
  const districtId = distEntry?.[0] || ""
  const provinceId = Object.entries(PROVINCE_TO_DISTRICTS).find(([, districts]) =>
    districts.some((d) => d.id === districtId)
  )?.[0] || ""
  const defs = SUBDISTRICT_TO_SCHOOLS[subDistrictId] || []
  return defs.map((sch) => ({
    id: sch.id,
    name: sch.name,
    districtId,
    provinceId,
    stats: getDashboardStats(getStudentsBySchool(sch.id)),
  }))
}

