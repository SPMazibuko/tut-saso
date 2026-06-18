/**
 * TUT / SASO institutional data sourced from saso-system.vercel.app (2026 ICT uploads).
 */

import {
  getIdentifiedModulesTotals,
  getModuleBreakdownByDepartment,
  getModulesPerDepartment,
  getSupportedModulesPerDepartment,
} from "@/lib/mock/module-identification"

export const TUT_CAMPUSES = [
  { id: "soshanguve-south", name: "SOSHANGUVE (SOUTH)", slug: "soshanguve-south" },
  { id: "soshanguve-north", name: "SOSHANGUVE (NORTH)", slug: "soshanguve-north" },
  { id: "emalahleni", name: "eMALAHLENI", slug: "emalahleni" },
  { id: "polokwane", name: "POLOKWANE", slug: "polokwane" },
  { id: "mbombela", name: "MBOMBELA", slug: "mbombela" },
  { id: "arts", name: "ARTS CAMPUS", slug: "arts" },
  { id: "pretoria-west", name: "PRETORIA WEST", slug: "pretoria-west" },
] as const

export type TutCampus = (typeof TUT_CAMPUSES)[number]

export const TUT_QUALIFICATIONS: Record<string, string> = {
  DPRS20: "Dip (Computer Science)",
  DPRSF0: "Dip (Computer Science Extended)",
  DPIF20: "Dip (Informatics)",
  DPIFF0: "Dip (Informatics Extended)",
  DPIT20: "Dip (Information Technology)",
  DPITF0: "Dip (Information Technology Extended)",
  DPMC20: "Dip (Multimedia Computing)",
  DPMCF0: "Dip (Multimedia Computing Extended)",
  DPYEF0: "Dip (Computer Systems Engineering Extended)",
  DPYE20_NP6602: "Dip (Computer Systems Engineering)",
}

export const TUT_ICT_DEPARTMENTS = [
  "Computer Science",
  "Computer Systems Engineering",
  "Informatics",
  "Information Technology",
  "ICT 1st Year & Foundation Unit",
  "End User Computing Unit",
  "Mathematics And Statistics",
  "Library",
  "SDS",
] as const

export const SASO_MODULE_CODES = [
  "PPA115D",
  "PG1115D",
  "SYA216D",
  "TMO216D",
  "WNE316D",
  "SIS216D",
  "PPB115D",
  "ADS216D",
  "BUA216D",
  "DBA216D",
  "CNT316D",
  "CN1115D",
  "CN1216D",
  "CFA115D",
  "DTP216D",
  "MTE216D",
  "ITP316D",
  "DE1115D",
  "EL1115D",
  "DP1216D",
  "16E105X",
  "CAPF05X",
  "NMG316D",
  "IVE316D",
  "CHOF05D",
] as const

/** Dashboard metrics — live SASO totals where available; mock values fill gaps. */
export const SASO_DASHBOARD_STATS = {
  academicYear: 2026,
  studentStatus: {
    probation: 533,
    exclusion: 390,
    readmitted: 118,
    excluded: 272,
    probationPercent: 57.7,
    exclusionPercent: 42.3,
  },
  breakdown: {
    probationRepeaters: 281,
    exclusionRepeaters: 198,
    newProbationFirstTime: 252,
    newExclusionFirstTime: 192,
  },
  moduleTutors: 14,
  creditsExclusion: 287,
  creditsProbation: 308,
  identifiedModules: getIdentifiedModulesTotals(),
  totalStudents: 4599,
  pendingImports: 11,
  conditionalLetters: {
    lettersSigned: 387,
    lettersNotSigned: 146,
  },
  probationForm: {
    lettersSigned: 418,
    lettersNotSigned: 115,
  },
  modulesPerDepartment: getModulesPerDepartment(),
  supportedModulesPerDepartment: getSupportedModulesPerDepartment(),
  exclusionPerDepartment: [
    { name: "Computer Science", count: 133 },
    { name: "Informatics", count: 101 },
    { name: "Computer Systems Engineering", count: 87 },
    { name: "Information Technology", count: 69 },
  ],
  readmissionPerDepartment: [
    { name: "Computer Science", count: 38 },
    { name: "Computer Systems Engineering", count: 32 },
    { name: "Informatics", count: 28 },
    { name: "Information Technology", count: 20 },
  ],
  probationPerDepartment: [
    { name: "Computer Science", count: 197 },
    { name: "Informatics", count: 131 },
    { name: "Information Technology", count: 115 },
    { name: "Computer Systems Engineering", count: 90 },
  ],
  atRiskAnalytics: {
    funding: { nsfas: 412, selfFunded: 186 },
    residency: { onCampus: 318, offCampus: 280 },
    readmittedFunding: { nsfas: 74, selfFunded: 44 },
    studentFunding: { nsfas: 2847, selfFunded: 1752 },
    probationReasons: {
      module_cancellation: 142,
      low_credits: 168,
      academic_performance: 156,
      other: 67,
    },
    financialExclusionDropout: 23,
  },
}

export function getSasoModuleBreakdownByDepartment(department: string) {
  return getModuleBreakdownByDepartment(department)
}

/** Campus pass/success rates for dashboard performance cards. */
export const SASO_CAMPUS_PERFORMANCE = {
  soshanguveSouth: {
    campus: "Soshanguve (South)",
    departments: [
      { name: "Computer Science", passRate: 78, successRate: 76 },
      { name: "Informatics", passRate: 81, successRate: 79 },
      { name: "Information Technology", passRate: 74, successRate: 72 },
      { name: "Computer Systems Engineering", passRate: 76, successRate: 74 },
    ],
    overall: { passRate: 77, successRate: 75 },
  },
  polokwane: {
    campus: "Polokwane",
    departments: [
      { name: "Computer Science", passRate: 80, successRate: 78 },
      { name: "Informatics", passRate: 83, successRate: 81 },
      { name: "Information Technology", passRate: 77, successRate: 75 },
    ],
    overall: { passRate: 80, successRate: 78 },
  },
  emalahleni: {
    campus: "eMalahleni",
    departments: [
      { name: "Computer Science", passRate: 75, successRate: 73 },
      { name: "Computer Systems Engineering", passRate: 73, successRate: 71 },
    ],
    overall: { passRate: 74, successRate: 72 },
  },
}

export interface SasofacultyRecord {
  moduleCode: string
  moduleName: string
  qualification: string
  qualificationName: string
  qualificationCode: string
  campus: string
  departmentName: string
  offering_type_name: string
  blockCode: string
  totalStudents: number
  totalCancellations: number
  validCancellations: number
  invalidCancellations: number
  activeStudents: number
  inactiveStudents: number
  passed: number
  qualifyMainStream: number
  reExam: number
  qualifyReExam: number
  absentMainExam: number
  above70: number
  failedMainExam: number
  marksBetween50And59: number
  marksBetween60And74: number
  marksAbove74: number
}

/** Base records from SASO live system (Soshanguve South, 2026). */
const SASO_FACULTY_BASE: SasofacultyRecord[] = [
  { moduleCode: "16E105X", moduleName: "COMMUNICATION FOR ACADEMIC PURPOSE", qualification: "DPIF20", qualificationName: "Dip (Informatics)", qualificationCode: "DPIF20", campus: "SOSHANGUVE (SOUTH)", departmentName: "ICT 1ST YEAR & FOUNDATION UNIT", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "0", totalStudents: 73, totalCancellations: 1, validCancellations: 0, invalidCancellations: 1, activeStudents: 72, inactiveStudents: 72, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "ADS216D", moduleName: "ADVANCED DISCRETE STRUCTURES", qualification: "DPRS20", qualificationName: "Dip (Computer Science)", qualificationCode: "DPRS20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SCIENCE", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 102, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 102, inactiveStudents: 102, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "BUA216D", moduleName: "BUSINESS ANALYSIS A", qualification: "DPIF20", qualificationName: "Dip (Informatics)", qualificationCode: "DPIF20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATICS", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 87, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 87, inactiveStudents: 87, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "CAPF05X", moduleName: "COMMUNICATION FOR ACADEMIC PURPOSES", qualification: "DPMCF0", qualificationName: "Dip (Multimedia Computing Extended)", qualificationCode: "DPMCF0", campus: "SOSHANGUVE (SOUTH)", departmentName: "ICT 1ST YEAR & FOUNDATION UNIT", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "0", totalStudents: 59, totalCancellations: 1, validCancellations: 0, invalidCancellations: 1, activeStudents: 58, inactiveStudents: 58, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "CFA115D", moduleName: "COMPUTING FUNDAMENTALS A", qualification: "DPMC20", qualificationName: "Dip (Multimedia Computing)", qualificationCode: "DPMC20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SYSTEMS ENGINEERING", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 54, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 54, inactiveStudents: 54, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "CGA115D", moduleName: "COMPUTING FUNDAMENTALS A", qualification: "DPIF20", qualificationName: "Dip (Informatics)", qualificationCode: "DPIF20", campus: "SOSHANGUVE (SOUTH)", departmentName: "END USER COMPUTING UNIT", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 17, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 17, inactiveStudents: 17, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "CHOF05D", moduleName: "COMPUTATIONAL MATHEMATICS", qualification: "DPITF0", qualificationName: "Dip (Information Technology Extended)", qualificationCode: "DPITF0", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATION TECHNOLOGY", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "0", totalStudents: 39, totalCancellations: 1, validCancellations: 0, invalidCancellations: 1, activeStudents: 38, inactiveStudents: 38, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "CN1115D", moduleName: "COMPUTER NETWORKS 115R", qualification: "DPIT20", qualificationName: "Dip (Information Technology)", qualificationCode: "DPIT20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATION TECHNOLOGY", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 38, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 38, inactiveStudents: 38, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "CNT316D", moduleName: "COMPUTER NETWORKS 316R", qualification: "DPIT20", qualificationName: "Dip (Information Technology)", qualificationCode: "DPIT20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATION TECHNOLOGY", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 33, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 33, inactiveStudents: 33, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "DBA216D", moduleName: "DATABASE MANAGEMENT SYSTEMS A", qualification: "DPIF20", qualificationName: "Dip (Informatics)", qualificationCode: "DPIF20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATICS", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 44, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 44, inactiveStudents: 44, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "DE2F06D", moduleName: "DIGITAL ELECTRONICS 126", qualification: "DPYEF0", qualificationName: "Dip (Computer Systems Engineering Extended)", qualificationCode: "DPYEF0", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SYSTEMS ENGINEERING", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "0", totalStudents: 38, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 38, inactiveStudents: 38, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "DP1216D", moduleName: "DIGITAL PROCESS CONTROL 216", qualification: "DPYE20_NP6602", qualificationName: "Dip (Computer Systems Engineering)", qualificationCode: "DPYE20_NP6602", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SYSTEMS ENGINEERING", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 70, totalCancellations: 1, validCancellations: 0, invalidCancellations: 1, activeStudents: 69, inactiveStudents: 69, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "DTP216D", moduleName: "DATABASE PRINCIPLES", qualification: "DPMC20", qualificationName: "Dip (Multimedia Computing)", qualificationCode: "DPMC20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SCIENCE", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 52, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 52, inactiveStudents: 52, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "EL1115D", moduleName: "ELECTRONICS 115", qualification: "DPYE20_NP6602", qualificationName: "Dip (Computer Systems Engineering)", qualificationCode: "DPYE20_NP6602", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SYSTEMS ENGINEERING", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 33, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 33, inactiveStudents: 33, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "ITP316D", moduleName: "IT PROJECT MANAGEMENT B", qualification: "DPIF20", qualificationName: "Dip (Informatics)", qualificationCode: "DPIF20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATICS", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 46, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 46, inactiveStudents: 46, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "IVE316D", moduleName: "INTERACTIVE VIRTUAL ENVIRONMENTS", qualification: "DPMC20", qualificationName: "Dip (Multimedia Computing)", qualificationCode: "DPMC20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SCIENCE", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 23, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 23, inactiveStudents: 23, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "MTE216D", moduleName: "MULTIMEDIA TECHNOLOGY", qualification: "DPMC20", qualificationName: "Dip (Multimedia Computing)", qualificationCode: "DPMC20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SCIENCE", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 45, totalCancellations: 1, validCancellations: 0, invalidCancellations: 1, activeStudents: 44, inactiveStudents: 44, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "NMG316D", moduleName: "NETWORK MANAGEMENT 316R", qualification: "DPIT20", qualificationName: "Dip (Information Technology)", qualificationCode: "DPIT20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATION TECHNOLOGY", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 16, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 13, inactiveStudents: 16, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "PPA115D", moduleName: "PRINCIPLES OF PROGRAMMING A", qualification: "DPRS20", qualificationName: "Dip (Computer Science)", qualificationCode: "DPRS20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SCIENCE", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 194, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 194, inactiveStudents: 194, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "SYA216D", moduleName: "SYSTEM ANALYSIS A", qualification: "DPIF20", qualificationName: "Dip (Informatics)", qualificationCode: "DPIF20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATICS", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 144, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 144, inactiveStudents: 144, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "TMO216D", moduleName: "3D MODELLING", qualification: "DPMC20", qualificationName: "Dip (Multimedia Computing)", qualificationCode: "DPMC20", campus: "SOSHANGUVE (SOUTH)", departmentName: "COMPUTER SCIENCE", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 13, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 13, inactiveStudents: 13, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
  { moduleCode: "WNE316D", moduleName: "WIRELESS NETWORKS 316R", qualification: "DPIT20", qualificationName: "Dip (Information Technology)", qualificationCode: "DPIT20", campus: "SOSHANGUVE (SOUTH)", departmentName: "INFORMATION TECHNOLOGY", offering_type_name: "SOSHANGUVE (SOUTH) - FULL TIME", blockCode: "1", totalStudents: 24, totalCancellations: 0, validCancellations: 0, invalidCancellations: 0, activeStudents: 24, inactiveStudents: 24, passed: 0, qualifyMainStream: 0, reExam: 0, qualifyReExam: 0, absentMainExam: 0, above70: 0, failedMainExam: 0, marksBetween50And59: 0, marksBetween60And74: 0, marksAbove74: 0 },
]

const EXTRA_MODULE_QUALIFICATION_CODES: Record<string, string> = {
  PG1115D: "DPRS20",
  PPB115D: "DPRS20",
  SIS216D: "DPIF20",
  CN1216D: "DPIT20",
  DE1115D: "DPYE20_NP6602",
}

const MODULE_QUALIFICATION_CODE_MAP: Record<string, string> = {
  ...EXTRA_MODULE_QUALIFICATION_CODES,
  ...Object.fromEntries(SASO_FACULTY_BASE.map((record) => [record.moduleCode, record.qualificationCode])),
}

function inferQualificationCodeFromModule(moduleCode: string): string {
  const upper = moduleCode.toUpperCase()
  if (upper.startsWith("PPA") || upper.startsWith("PG") || upper.startsWith("PPB") || upper.startsWith("ADS")) return "DPRS20"
  if (upper.startsWith("BU") || upper.startsWith("SY") || upper.startsWith("DB") || upper.startsWith("ITP") || upper.startsWith("SIS")) return "DPIF20"
  if (upper.startsWith("CN") || upper.startsWith("CH") || upper.startsWith("WN") || upper.startsWith("NM")) {
    return upper.includes("F0") || upper.startsWith("CHOF") ? "DPITF0" : "DPIT20"
  }
  if (upper.startsWith("TM") || upper.startsWith("IV") || upper.startsWith("MT") || upper.startsWith("CFA") || upper.startsWith("DTP")) return "DPMC20"
  if (upper.startsWith("DE") || upper.startsWith("EL") || upper.startsWith("DP")) return "DPYE20_NP6602"
  if (upper.startsWith("16") || upper.startsWith("CAP")) return "DPIF20"
  return "DPIF20"
}

export function getQualificationCodeFromModule(moduleCode: string): string {
  const normalized = moduleCode.replace(/\s+/g, "").toUpperCase()
  return MODULE_QUALIFICATION_CODE_MAP[normalized] ?? inferQualificationCodeFromModule(normalized)
}

export function getQualificationName(code: string): string {
  const normalized = code.replace(/\s+/g, "").toUpperCase()
  return TUT_QUALIFICATIONS[normalized] ?? code
}

function enrichWithMockOutcomes(record: SasofacultyRecord): SasofacultyRecord {
  const active = Math.max(record.activeStudents, 1)
  const hash = record.moduleCode.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0)
  const passRate = 0.68 + (hash % 14) / 100
  const passed = Math.round(active * passRate)
  const absentMainExam = Math.max(1, Math.round(active * 0.04))
  const failedMainExam = Math.max(0, active - passed - absentMainExam)
  const qualifyMainStream = passed
  const reExam = failedMainExam > 0 ? Math.max(1, Math.round(failedMainExam * 0.42)) : 0
  const qualifyReExam = reExam > 0 ? Math.max(1, Math.round(reExam * 0.58)) : 0
  const above70 = Math.round(passed * 0.4)
  const marksAbove74 = Math.round(passed * 0.26)
  const marksBetween60And74 = Math.round(passed * 0.36)
  const marksBetween50And59 = Math.round(failedMainExam * 0.32)

  return {
    ...record,
    passed,
    qualifyMainStream,
    reExam,
    qualifyReExam,
    absentMainExam,
    above70,
    failedMainExam,
    marksBetween50And59,
    marksBetween60And74,
    marksAbove74,
  }
}

function scaleRecord(record: SasofacultyRecord, factor: number, campus: TutCampus): SasofacultyRecord {
  const scale = (n: number) => Math.max(1, Math.round(n * factor))
  const offering = `${campus.name} - FULL TIME`
  return {
    ...record,
    campus: campus.name,
    offering_type_name: offering,
    totalStudents: scale(record.totalStudents),
    activeStudents: scale(record.activeStudents),
    inactiveStudents: scale(record.inactiveStudents),
    totalCancellations: scale(record.totalCancellations),
    validCancellations: scale(record.validCancellations),
    invalidCancellations: scale(record.invalidCancellations),
    passed: scale(record.passed),
    qualifyMainStream: scale(record.qualifyMainStream),
    reExam: scale(record.reExam),
    qualifyReExam: scale(record.qualifyReExam),
    absentMainExam: scale(record.absentMainExam),
    above70: scale(record.above70),
    failedMainExam: scale(record.failedMainExam),
    marksBetween50And59: scale(record.marksBetween50And59),
    marksBetween60And74: scale(record.marksBetween60And74),
    marksAbove74: scale(record.marksAbove74),
  }
}

/** Faculty analysis dataset across TUT campuses (Soshanguve South = live SASO data). */
export function getSasoFacultyAnalysisData(): SasofacultyRecord[] {
  const extraCampuses: Array<{ campus: TutCampus; factor: number }> = [
    { campus: TUT_CAMPUSES[3], factor: 0.85 }, // Polokwane
    { campus: TUT_CAMPUSES[2], factor: 0.55 }, // eMalahleni
  ]

  const expanded: SasofacultyRecord[] = [...SASO_FACULTY_BASE]
  for (const { campus, factor } of extraCampuses) {
    for (const record of SASO_FACULTY_BASE) {
      expanded.push(scaleRecord(record, factor, campus))
    }
  }
  return expanded.map(enrichWithMockOutcomes)
}

export const SASO_DEPARTMENTAL_BREAKDOWN = [
  {
    department: "Computer Science",
    passRate: 78,
    successRate: 76,
    totalStudents: 355,
    activeStudents: 349,
    passed: 277,
    failed: 78,
    campuses: [
      { campus: "SOSHANGUVE (SOUTH)", passRate: 77, successRate: 75, totalStudents: 355, activeStudents: 349, passed: 273, failed: 82 },
      { campus: "POLOKWANE", passRate: 80, successRate: 78, totalStudents: 302, activeStudents: 302, passed: 242, failed: 60 },
      { campus: "eMALAHLENI", passRate: 75, successRate: 73, totalStudents: 195, activeStudents: 195, passed: 146, failed: 49 },
    ],
  },
  {
    department: "Informatics",
    passRate: 81,
    successRate: 79,
    totalStudents: 283,
    activeStudents: 283,
    passed: 229,
    failed: 54,
    campuses: [
      { campus: "SOSHANGUVE (SOUTH)", passRate: 81, successRate: 79, totalStudents: 283, activeStudents: 283, passed: 229, failed: 54 },
      { campus: "POLOKWANE", passRate: 83, successRate: 81, totalStudents: 241, activeStudents: 242, passed: 201, failed: 40 },
    ],
  },
  {
    department: "Information Technology",
    passRate: 74,
    successRate: 72,
    totalStudents: 259,
    activeStudents: 245,
    passed: 192,
    failed: 67,
    campuses: [
      { campus: "SOSHANGUVE (SOUTH)", passRate: 74, successRate: 72, totalStudents: 259, activeStudents: 245, passed: 192, failed: 67 },
      { campus: "eMALAHLENI", passRate: 72, successRate: 70, totalStudents: 91, activeStudents: 91, passed: 66, failed: 25 },
    ],
  },
  {
    department: "Computer Systems Engineering",
    passRate: 76,
    successRate: 74,
    totalStudents: 249,
    activeStudents: 242,
    passed: 189,
    failed: 60,
    campuses: [
      { campus: "SOSHANGUVE (SOUTH)", passRate: 76, successRate: 74, totalStudents: 249, activeStudents: 242, passed: 189, failed: 60 },
      { campus: "POLOKWANE", passRate: 73, successRate: 71, totalStudents: 87, activeStudents: 87, passed: 64, failed: 23 },
    ],
  },
  {
    department: "Overall",
    passRate: 77,
    successRate: 75,
    totalStudents: 1146,
    activeStudents: 1119,
    passed: 887,
    failed: 259,
  },
]

export function getSasoDepartmentPerformance(): Array<{
  department: string
  passRate: number
  successRate: number
  trend: "up" | "down" | "stable"
}> {
  return SASO_DEPARTMENTAL_BREAKDOWN.filter((d) => d.department !== "Overall").map((d) => ({
    department: d.department,
    passRate: d.passRate,
    successRate: d.successRate,
    trend: d.passRate >= 80 ? ("up" as const) : d.passRate < 75 ? ("down" as const) : ("stable" as const),
  }))
}

export interface CampusBreakdownRecord {
  campus: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
}

const CAMPUS_DISPLAY_NAMES: Record<string, string> = {
  "SOSHANGUVE (SOUTH)": "Soshanguve (South)",
  "SOSHANGUVE (NORTH)": "Soshanguve (North)",
  eMALAHLENI: "eMalahleni",
  POLOKWANE: "Polokwane",
  MBOMBELA: "Mbombela",
  "ARTS CAMPUS": "Arts Campus",
  "PRETORIA WEST": "Pretoria West",
}

function formatCampusDisplayName(campus: string): string {
  return CAMPUS_DISPLAY_NAMES[campus] ?? campus
}

const normalizeModuleCode = (value: string) => value.replace(/\s+/g, "").toUpperCase()

/** Campus-level pass/success breakdown for a single module across TUT campuses. */
export function getModuleCampusBreakdown(moduleCode: string): CampusBreakdownRecord[] {
  const filterCode = normalizeModuleCode(moduleCode.trim())
  const records = getSasoFacultyAnalysisData().filter(
    (item) => normalizeModuleCode(item.moduleCode) === filterCode,
  )

  if (records.length === 0) return []

  const byCampus = new Map<string, SasofacultyRecord[]>()
  for (const record of records) {
    const campus = record.campus || "Unknown"
    const group = byCampus.get(campus) ?? []
    group.push(record)
    byCampus.set(campus, group)
  }

  const campusRows: CampusBreakdownRecord[] = []
  let overallTotal = 0
  let overallActive = 0
  let overallPassed = 0
  let overallFailed = 0
  let overallQualify = 0

  for (const [campus, items] of byCampus.entries()) {
    const totals = items.reduce(
      (acc, item) => ({
        totalStudents: acc.totalStudents + item.totalStudents,
        activeStudents: acc.activeStudents + item.activeStudents,
        passed: acc.passed + item.passed,
        failed: acc.failed + item.failedMainExam,
        qualifyMainStream: acc.qualifyMainStream + item.qualifyMainStream,
      }),
      { totalStudents: 0, activeStudents: 0, passed: 0, failed: 0, qualifyMainStream: 0 },
    )

    const passRate = totals.totalStudents > 0 ? (totals.passed / totals.totalStudents) * 100 : 0
    const successRate =
      totals.totalStudents > 0 ? (totals.qualifyMainStream / totals.totalStudents) * 100 : 0

    campusRows.push({
      campus: formatCampusDisplayName(campus),
      passRate: Math.round(passRate * 10) / 10,
      successRate: Math.round(successRate * 10) / 10,
      totalStudents: totals.totalStudents,
      activeStudents: totals.activeStudents,
      passed: totals.passed,
      failed: totals.failed,
    })

    overallTotal += totals.totalStudents
    overallActive += totals.activeStudents
    overallPassed += totals.passed
    overallFailed += totals.failed
    overallQualify += totals.qualifyMainStream
  }

  campusRows.sort((a, b) => a.campus.localeCompare(b.campus))

  const overallPassRate = overallTotal > 0 ? (overallPassed / overallTotal) * 100 : 0
  const overallSuccessRate = overallTotal > 0 ? (overallQualify / overallTotal) * 100 : 0

  campusRows.push({
    campus: "Module Overall - All Campuses",
    passRate: Math.round(overallPassRate * 10) / 10,
    successRate: Math.round(overallSuccessRate * 10) / 10,
    totalStudents: overallTotal,
    activeStudents: overallActive,
    passed: overallPassed,
    failed: overallFailed,
  })

  return campusRows
}
