import type {
  SchoolPerformance,
  PerformanceCriteria,
  GradeSpecificPerformance,
} from "./types"

// Mock school performance data for Grades 8-12
export const mockSchoolPerformanceData: Omit<
  SchoolPerformance,
  "phase" | "performanceScore" | "trends" | "flags" | "category"
>[] = [
  // Top Performing Schools (Senior Phase - Grades 8-9)
  {
    schoolId: "school-top-sp-1",
    schoolName: "Mapula Senior Secondary School",
    districtId: "dist-1",
    districtName: "Gauteng West",
    provinceId: "prov-1",
    provinceName: "Gauteng",
    rank: 0,
    phaseRank: 0,
    criteria: {
      attendance: 94.5,
      sba: 82.3,
      promotionRate: 89.2,
      curriculumCoverage: 96.8,
      riskScore: 12.5,
    },
    improvementIndex: 8.5,
      gradeSpecificData: [
        {
          grade: "8",
          sbaTrend: [78, 80, 82, 84],
          attendancePattern: [92, 93, 94, 95],
          promotionRate: 91.5,
          curriculumCoverage: 97.2,
          topSubjects: [
            { subject: "Mathematics", avgScore: 85, trend: "improving" },
            { subject: "English", avgScore: 88, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 120,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "9",
          sbaTrend: [79, 81, 83, 85],
          attendancePattern: [93, 94, 94, 95],
          promotionRate: 87.0,
          curriculumCoverage: 96.5,
          topSubjects: [
            { subject: "Mathematics", avgScore: 83, trend: "improving" },
            { subject: "Natural Sciences", avgScore: 86, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 115,
        } as GradeSpecificPerformance & { studentCount: number },
      ],
    strengths: [
      "Strong attendance rates across all grades",
      "Excellent curriculum coverage",
      "Low behavioral risk indicators",
      "Consistent year-on-year improvement",
    ],
    weaknesses: [],
    rootCauses: [],
    recommendations: [],
    interventionEffectiveness: 92.5,
    predictiveRisk: {
      learnersAtRisk: 8,
      subjectsAtRisk: [],
      projectedPromotionImpact: 89.2,
    },
  },
  {
    schoolId: "school-top-sp-2",
    schoolName: "Khayelitsha High School",
    districtId: "dist-2",
    districtName: "Western Cape Metro",
    provinceId: "prov-2",
    provinceName: "Western Cape",
    rank: 0,
    phaseRank: 0,
    criteria: {
      attendance: 91.2,
      sba: 79.8,
      promotionRate: 86.5,
      curriculumCoverage: 94.5,
      riskScore: 18.2,
    },
    improvementIndex: 6.2,
      gradeSpecificData: [
        {
          grade: "8",
          sbaTrend: [75, 77, 79, 80],
          attendancePattern: [89, 90, 91, 91],
          promotionRate: 88.0,
          curriculumCoverage: 95.0,
          topSubjects: [
            { subject: "English", avgScore: 82, trend: "improving" },
            { subject: "Life Orientation", avgScore: 89, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 110,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "9",
          sbaTrend: [76, 78, 79, 80],
          attendancePattern: [90, 91, 91, 92],
          promotionRate: 85.0,
          curriculumCoverage: 94.0,
          topSubjects: [
            { subject: "English", avgScore: 81, trend: "improving" },
            { subject: "Arts & Culture", avgScore: 84, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 105,
        } as GradeSpecificPerformance & { studentCount: number },
      ],
    strengths: [
      "Good attendance consistency",
      "Strong SBA completion rates",
      "Effective curriculum delivery",
    ],
    weaknesses: ["Mathematics performance could improve"],
    rootCauses: [
      {
        type: "academic",
        description: "Mathematics scores below provincial average",
      },
    ],
    recommendations: [
      {
        weaknessType: "academic",
        recommendation: "Implement targeted Mathematics remediation program",
        rolePlayer: "Subject Teacher, Tutor",
        timeline: "Next semester",
        minStandard: "Mathematics SBA ≥ 70%",
      },
    ],
    interventionEffectiveness: 87.3,
    predictiveRisk: {
      learnersAtRisk: 12,
      subjectsAtRisk: ["Mathematics"],
      projectedPromotionImpact: 86.5,
    },
  },
  // Top Performing Schools (FET - Grades 10-12)
  {
    schoolId: "school-top-fet-1",
    schoolName: "Alexandra High School",
    districtId: "dist-1",
    districtName: "Gauteng West",
    provinceId: "prov-1",
    provinceName: "Gauteng",
    rank: 0,
    phaseRank: 0,
    criteria: {
      attendance: 92.8,
      sba: 88.5,
      promotionRate: 94.2,
      curriculumCoverage: 98.2,
      riskScore: 10.5,
    },
    improvementIndex: 12.3,
      gradeSpecificData: [
        {
          grade: "10",
          sbaTrend: [85, 87, 88, 89],
          attendancePattern: [91, 92, 93, 93],
          promotionRate: 92.5,
          curriculumCoverage: 98.5,
          topSubjects: [
            { subject: "Mathematics", avgScore: 89, trend: "improving" },
            { subject: "Physical Sciences", avgScore: 87, trend: "improving" },
          ],
          highRiskSubjects: [],
          studentCount: 100,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "11",
          sbaTrend: [86, 88, 89, 90],
          attendancePattern: [92, 93, 93, 94],
          promotionRate: 93.5,
          curriculumCoverage: 98.0,
          topSubjects: [
            { subject: "Mathematics", avgScore: 88, trend: "stable" },
            { subject: "Accounting", avgScore: 90, trend: "improving" },
          ],
          highRiskSubjects: [],
          studentCount: 95,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "12",
          sbaTrend: [87, 89, 90, 91],
          attendancePattern: [93, 94, 94, 95],
          promotionRate: 96.5,
          curriculumCoverage: 98.0,
          topSubjects: [
            { subject: "Mathematics", avgScore: 90, trend: "improving" },
            { subject: "Physical Sciences", avgScore: 88, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 90,
        } as GradeSpecificPerformance & { studentCount: number },
      ],
    strengths: [
      "Exceptional promotion rates",
      "Outstanding SBA performance",
      "Excellent curriculum coverage",
      "Strong pass rates in gateway subjects",
      "Low dropout and repetition rates",
    ],
    weaknesses: [],
    rootCauses: [],
    recommendations: [],
    interventionEffectiveness: 95.8,
    predictiveRisk: {
      learnersAtRisk: 5,
      subjectsAtRisk: [],
      projectedPromotionImpact: 94.2,
    },
  },
  {
    schoolId: "school-top-fet-2",
    schoolName: "Soweto Comprehensive High",
    districtId: "dist-1",
    districtName: "Gauteng West",
    provinceId: "prov-1",
    provinceName: "Gauteng",
    rank: 0,
    phaseRank: 0,
    criteria: {
      attendance: 90.5,
      sba: 85.2,
      promotionRate: 91.8,
      curriculumCoverage: 95.5,
      riskScore: 15.8,
    },
    improvementIndex: 9.5,
      gradeSpecificData: [
        {
          grade: "10",
          sbaTrend: [82, 84, 85, 86],
          attendancePattern: [89, 90, 91, 91],
          promotionRate: 90.5,
          curriculumCoverage: 96.0,
          topSubjects: [
            { subject: "English", avgScore: 86, trend: "improving" },
            { subject: "Life Sciences", avgScore: 84, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 98,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "11",
          sbaTrend: [83, 85, 86, 87],
          attendancePattern: [90, 91, 91, 92],
          promotionRate: 91.5,
          curriculumCoverage: 95.5,
          topSubjects: [
            { subject: "English", avgScore: 85, trend: "stable" },
            { subject: "Business Studies", avgScore: 87, trend: "improving" },
          ],
          highRiskSubjects: [],
          studentCount: 92,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "12",
          sbaTrend: [84, 86, 87, 88],
          attendancePattern: [91, 92, 92, 93],
          promotionRate: 93.5,
          curriculumCoverage: 95.0,
          topSubjects: [
            { subject: "English", avgScore: 86, trend: "improving" },
            { subject: "Life Sciences", avgScore: 85, trend: "stable" },
          ],
          highRiskSubjects: [],
          studentCount: 88,
        } as GradeSpecificPerformance & { studentCount: number },
      ],
    strengths: [
      "Strong overall performance",
      "Good promotion rates",
      "Effective intervention strategies",
    ],
    weaknesses: ["Physical Sciences performance below target"],
    rootCauses: [
      {
        type: "academic",
        description: "Physical Sciences needs additional support",
      },
    ],
    recommendations: [
      {
        weaknessType: "academic",
        recommendation: "Strengthen Physical Sciences teaching and resources",
        rolePlayer: "Subject Teacher, HOD",
        timeline: "Immediate",
        minStandard: "Physical Sciences SBA ≥ 75%",
      },
    ],
    interventionEffectiveness: 91.2,
    predictiveRisk: {
      learnersAtRisk: 8,
      subjectsAtRisk: ["Physical Sciences"],
      projectedPromotionImpact: 91.8,
    },
  },
  // Bottom Performing Schools (Senior Phase)
  {
    schoolId: "school-bottom-sp-1",
    schoolName: "Mthatha Secondary School",
    districtId: "dist-3",
    districtName: "OR Tambo",
    provinceId: "prov-3",
    provinceName: "Eastern Cape",
    rank: 0,
    phaseRank: 0,
    criteria: {
      attendance: 68.5,
      sba: 52.3,
      promotionRate: 58.2,
      curriculumCoverage: 72.5,
      riskScore: 65.8,
    },
    improvementIndex: -8.5,
    gradeSpecificData: [
        {
          grade: "8",
          sbaTrend: [55, 53, 52, 51],
          attendancePattern: [70, 69, 68, 68],
          promotionRate: 60.0,
          curriculumCoverage: 73.0,
          topSubjects: [],
          highRiskSubjects: [
            { subject: "Mathematics", avgScore: 42, atRiskCount: 45 },
            { subject: "English", avgScore: 48, atRiskCount: 38 },
          ],
          studentCount: 130,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "9",
          sbaTrend: [54, 53, 52, 50],
          attendancePattern: [69, 68, 68, 67],
          promotionRate: 56.5,
          curriculumCoverage: 72.0,
          topSubjects: [],
          highRiskSubjects: [
            { subject: "Mathematics", avgScore: 40, atRiskCount: 48 },
            { subject: "Natural Sciences", avgScore: 46, atRiskCount: 42 },
          ],
          studentCount: 125,
        } as GradeSpecificPerformance & { studentCount: number },
    ],
    strengths: [],
    weaknesses: [
      "Critical attendance issues",
      "Low SBA completion rates",
      "High failure rates in core subjects",
      "Significant behavioral risk indicators",
      "Inadequate curriculum coverage",
    ],
    rootCauses: [
      {
        type: "attendance",
        description: "Chronic absenteeism affecting 35% of learners",
      },
      {
        type: "academic",
        description: "Mathematics and English scores critically low",
      },
      {
        type: "structural",
        description: "Insufficient teaching resources and infrastructure",
      },
      {
        type: "psycho-social",
        description: "High number of learners with social and emotional challenges",
      },
    ],
    recommendations: [
      {
        weaknessType: "attendance",
        recommendation: "Implement attendance contract system with parent engagement",
        rolePlayer: "SMT, Class Teacher",
        timeline: "Immediate",
        minStandard: "Attendance ≥ 85%",
      },
      {
        weaknessType: "academic",
        recommendation: "Urgent targeted remediation for Mathematics and English",
        rolePlayer: "Subject Teacher, Tutor",
        timeline: "Next week",
        minStandard: "SBA ≥ 60%",
      },
      {
        weaknessType: "psycho-social",
        recommendation: "Deploy wellness referral and counselling support",
        rolePlayer: "Counsellor, Mentor",
        timeline: "Immediate",
        minStandard: "Risk score ≤ 40",
      },
      {
        weaknessType: "structural",
        recommendation: "Review timetable and curriculum pacing",
        rolePlayer: "SMT, HOD",
        timeline: "This semester",
        minStandard: "Curriculum coverage ≥ 85%",
      },
    ],
    interventionEffectiveness: 42.5,
    predictiveRisk: {
      learnersAtRisk: 125,
      subjectsAtRisk: ["Mathematics", "English", "Natural Sciences"],
      projectedPromotionImpact: 45.0,
    },
  },
  // Bottom Performing Schools (FET)
  {
    schoolId: "school-bottom-fet-1",
    schoolName: "Rustenburg High School",
    districtId: "dist-4",
    districtName: "Bojanala",
    provinceId: "prov-4",
    provinceName: "North West",
    rank: 0,
    phaseRank: 0,
    criteria: {
      attendance: 65.2,
      sba: 48.5,
      promotionRate: 52.8,
      curriculumCoverage: 68.5,
      riskScore: 72.5,
    },
    improvementIndex: -12.3,
    gradeSpecificData: [
        {
          grade: "10",
          sbaTrend: [52, 50, 49, 48],
          attendancePattern: [67, 66, 65, 65],
          promotionRate: 55.0,
          curriculumCoverage: 70.0,
          topSubjects: [],
          highRiskSubjects: [
            { subject: "Mathematics", avgScore: 38, atRiskCount: 52 },
            { subject: "Physical Sciences", avgScore: 35, atRiskCount: 58 },
          ],
          studentCount: 140,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "11",
          sbaTrend: [50, 49, 48, 47],
          attendancePattern: [66, 65, 65, 64],
          promotionRate: 52.5,
          curriculumCoverage: 68.5,
          topSubjects: [],
          highRiskSubjects: [
            { subject: "Mathematics", avgScore: 36, atRiskCount: 55 },
            { subject: "English", avgScore: 42, atRiskCount: 48 },
          ],
          studentCount: 135,
        } as GradeSpecificPerformance & { studentCount: number },
        {
          grade: "12",
          sbaTrend: [49, 48, 47, 46],
          attendancePattern: [65, 64, 64, 63],
          promotionRate: 48.5,
          curriculumCoverage: 67.0,
          topSubjects: [],
          highRiskSubjects: [
            { subject: "Mathematics", avgScore: 34, atRiskCount: 60 },
            { subject: "Physical Sciences", avgScore: 32, atRiskCount: 62 },
          ],
          studentCount: 130,
        } as GradeSpecificPerformance & { studentCount: number },
    ],
    strengths: [],
    weaknesses: [
      "Severe attendance crisis",
      "Critical SBA underperformance",
      "Extremely low promotion rates",
      "High dropout risk in Grade 12",
      "Gateway subjects failing",
    ],
    rootCauses: [
      {
        type: "attendance",
        description: "Attendance below 70% affecting academic outcomes",
      },
      {
        type: "academic",
        description: "Mathematics and Physical Sciences scores critically low",
      },
      {
        type: "administrative",
        description: "SBA compliance and CAPS pacing issues",
      },
      {
        type: "structural",
        description: "Resource constraints and infrastructure challenges",
      },
    ],
    recommendations: [
      {
        weaknessType: "attendance",
        recommendation: "Emergency attendance intervention with parent contact",
        rolePlayer: "SMT, Class Teacher",
        timeline: "Immediate",
        minStandard: "Attendance ≥ 80%",
      },
      {
        weaknessType: "academic",
        recommendation: "Urgent Mathematics and Physical Sciences remediation",
        rolePlayer: "Subject Teacher, Tutor, Mentor",
        timeline: "Immediate",
        minStandard: "SBA ≥ 60%, Promotion ≥ 70%",
      },
      {
        weaknessType: "administrative",
        recommendation: "SBA compliance and CAPS pacing controls",
        rolePlayer: "SMT, HOD",
        timeline: "This week",
        minStandard: "SBA uploads ≥ 95%",
      },
      {
        weaknessType: "structural",
        recommendation: "Review timetable and resource allocation",
        rolePlayer: "SMT, HOD",
        timeline: "This semester",
        minStandard: "Curriculum coverage ≥ 80%",
      },
    ],
    interventionEffectiveness: 38.5,
    predictiveRisk: {
      learnersAtRisk: 145,
      subjectsAtRisk: ["Mathematics", "Physical Sciences", "English"],
      projectedPromotionImpact: 38.0,
    },
  },
  // Additional schools for variety (mix of performance levels)
  ...Array.from({ length: 20 }, (_, i) => {
    const isTop = i < 10
    const isSeniorPhase = i % 2 === 0
    const baseAttendance = isTop ? 85 + Math.random() * 10 : 65 + Math.random() * 15
    const baseSBA = isTop ? 70 + Math.random() * 15 : 50 + Math.random() * 15
    const basePromotion = isTop ? 80 + Math.random() * 10 : 55 + Math.random() * 15
    const baseCoverage = isTop ? 88 + Math.random() * 8 : 70 + Math.random() * 12
    const baseRisk = isTop ? 15 + Math.random() * 15 : 50 + Math.random() * 25

    return {
      schoolId: `school-${i + 1}`,
      schoolName: `${isTop ? "Top" : "Mid"} Performing School ${i + 1}`,
      districtId: `dist-${(i % 4) + 1}`,
      districtName: `District ${String.fromCharCode(65 + (i % 4))}`,
      provinceId: `prov-${(i % 3) + 1}`,
      provinceName: ["Gauteng", "Western Cape", "KwaZulu-Natal"][i % 3],
      rank: 0,
      phaseRank: 0,
      criteria: {
        attendance: Math.round(baseAttendance * 10) / 10,
        sba: Math.round(baseSBA * 10) / 10,
        promotionRate: Math.round(basePromotion * 10) / 10,
        curriculumCoverage: Math.round(baseCoverage * 10) / 10,
        riskScore: Math.round(baseRisk * 10) / 10,
      },
      improvementIndex: isTop ? 2 + Math.random() * 8 : -5 - Math.random() * 10,
      gradeSpecificData: isSeniorPhase
        ? [
            {
              grade: "8" as const,
              sbaTrend: [baseSBA - 5, baseSBA - 3, baseSBA - 1, baseSBA],
              attendancePattern: [baseAttendance - 3, baseAttendance - 2, baseAttendance - 1, baseAttendance],
              promotionRate: basePromotion + 2,
              curriculumCoverage: baseCoverage + 1,
              topSubjects: isTop
                ? [
                    { subject: "English", avgScore: Math.round(baseSBA + 5), trend: "improving" as const },
                  ]
                : [],
              highRiskSubjects: isTop
                ? []
                : [
                    {
                      subject: "Mathematics",
                      avgScore: Math.round(baseSBA - 15),
                      atRiskCount: Math.floor(30 + Math.random() * 20),
                    },
                  ],
              studentCount: Math.floor(100 + Math.random() * 30),
            } as GradeSpecificPerformance & { studentCount: number },
            {
              grade: "9" as const,
              sbaTrend: [baseSBA - 4, baseSBA - 2, baseSBA - 1, baseSBA],
              attendancePattern: [baseAttendance - 2, baseAttendance - 1, baseAttendance, baseAttendance],
              promotionRate: basePromotion,
              curriculumCoverage: baseCoverage,
              topSubjects: isTop
                ? [
                    { subject: "Natural Sciences", avgScore: Math.round(baseSBA + 3), trend: "stable" as const },
                  ]
                : [],
              highRiskSubjects: isTop
                ? []
                : [
                    {
                      subject: "English",
                      avgScore: Math.round(baseSBA - 10),
                      atRiskCount: Math.floor(25 + Math.random() * 15),
                    },
                  ],
              studentCount: Math.floor(95 + Math.random() * 25),
            } as GradeSpecificPerformance & { studentCount: number },
          ]
        : [
            {
              grade: "10" as const,
              sbaTrend: [baseSBA - 4, baseSBA - 2, baseSBA - 1, baseSBA],
              attendancePattern: [baseAttendance - 2, baseAttendance - 1, baseAttendance, baseAttendance],
              promotionRate: basePromotion + 1,
              curriculumCoverage: baseCoverage + 1,
              topSubjects: isTop
                ? [
                    { subject: "English", avgScore: Math.round(baseSBA + 5), trend: "improving" as const },
                  ]
                : [],
              highRiskSubjects: isTop
                ? []
                : [
                    {
                      subject: "Mathematics",
                      avgScore: Math.round(baseSBA - 18),
                      atRiskCount: Math.floor(35 + Math.random() * 25),
                    },
                  ],
              studentCount: Math.floor(90 + Math.random() * 30),
            } as GradeSpecificPerformance & { studentCount: number },
            {
              grade: "11" as const,
              sbaTrend: [baseSBA - 3, baseSBA - 1, baseSBA, baseSBA + 1],
              attendancePattern: [baseAttendance - 1, baseAttendance, baseAttendance, baseAttendance + 1],
              promotionRate: basePromotion,
              curriculumCoverage: baseCoverage,
              topSubjects: isTop
                ? [
                    { subject: "Business Studies", avgScore: Math.round(baseSBA + 4), trend: "stable" as const },
                  ]
                : [],
              highRiskSubjects: isTop
                ? []
                : [
                    {
                      subject: "Physical Sciences",
                      avgScore: Math.round(baseSBA - 20),
                      atRiskCount: Math.floor(40 + Math.random() * 20),
                    },
                  ],
              studentCount: Math.floor(85 + Math.random() * 25),
            } as GradeSpecificPerformance & { studentCount: number },
            {
              grade: "12" as const,
              sbaTrend: [baseSBA - 2, baseSBA, baseSBA + 1, baseSBA + 2],
              attendancePattern: [baseAttendance, baseAttendance + 1, baseAttendance + 1, baseAttendance + 2],
              promotionRate: basePromotion - 2,
              curriculumCoverage: baseCoverage - 1,
              topSubjects: isTop
                ? [
                    { subject: "Mathematics", avgScore: Math.round(baseSBA + 6), trend: "improving" as const },
                  ]
                : [],
              highRiskSubjects: isTop
                ? []
                : [
                    {
                      subject: "Mathematics",
                      avgScore: Math.round(baseSBA - 22),
                      atRiskCount: Math.floor(45 + Math.random() * 20),
                    },
                    {
                      subject: "Physical Sciences",
                      avgScore: Math.round(baseSBA - 24),
                      atRiskCount: Math.floor(50 + Math.random() * 15),
                    },
                  ],
              studentCount: Math.floor(80 + Math.random() * 20),
            } as GradeSpecificPerformance & { studentCount: number },
          ],
      strengths: isTop
        ? ["Good attendance", "Strong SBA performance", "Effective curriculum delivery"]
        : [],
      weaknesses: isTop
        ? []
        : [
            "Attendance below target",
            "SBA performance needs improvement",
            "Promotion rates below provincial average",
          ],
      rootCauses: isTop
        ? []
        : [
            {
              type: "academic" as const,
              description: "Core subjects need additional support",
            },
          ],
      recommendations: isTop
        ? []
        : [
            {
              weaknessType: "academic" as const,
              recommendation: "Implement targeted remediation program",
              rolePlayer: "Subject Teacher, Tutor",
              timeline: "Next semester",
              minStandard: "SBA ≥ 65%",
            },
          ],
      interventionEffectiveness: isTop ? 75 + Math.random() * 20 : 40 + Math.random() * 20,
      predictiveRisk: {
        learnersAtRisk: isTop ? Math.floor(10 + Math.random() * 15) : Math.floor(80 + Math.random() * 40),
        subjectsAtRisk: isTop ? [] : ["Mathematics", "English"],
        projectedPromotionImpact: isTop
          ? basePromotion + Math.random() * 5
          : basePromotion - 10 - Math.random() * 10,
      },
    }
  }),
]

