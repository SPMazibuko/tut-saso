/**
 * Probation & Exclusion Analysis from saso-system.vercel.app (2026 ICT uploads).
 */

import sasoProbationExclusionJson from "@/lib/data/saso-probation-exclusion-analysis.json"

export interface SasoProbationExclusionModule {
  qualificationCode: string
  qualificationName: string
  code: string
  name: string
  department: string
  level: string
  semester: number | null
  probationCount: number
  exclusionBeforeProcessing: number
  readmitted: number
  excluded: number
  totalStudents: number
  probationRate: number
  exclusionRate: number
  readmissionRate: number
}

export interface SasoProbationExclusionSummary {
  totalProbation: number
  totalExclusion: number
  totalReadmitted: number
  totalExcluded: number
  totalStudents: number
}

export interface SasoProbationExclusionReport {
  facultyName: string
  departmentName: string
  registrationYear: number
  qualification: string
  qualificationName: string
}

const raw = sasoProbationExclusionJson as {
  report: {
    faculty_name: string
    department_name: string
    registration_year: number
    qualification: string
    qualification_name: string
  }
  summary: SasoProbationExclusionSummary
  modules: Array<{
    qualificationCode: string
    qualificationName: string
    code: string
    name: string
    department: string
    level: string
    semester: number | null
    probationCount: number
    exclusionBeforeProcessing: number
    readmitted: number
    excluded: number
    totalStudents: number
    probationRate: number
    exclusionRate: number
    readmissionRate: number
  }>
}

const DEPARTMENT_ALIASES: Record<string, string> = {
  "COMPUTER SCIENCE": "Computer Science",
  "COMPUTER SYSTEMS ENGINEERING": "Computer Systems Engineering",
  INFORMATICS: "Informatics",
  "INFORMATION TECHNOLOGY": "Information Technology",
}

export function normalizeProbationExclusionDepartment(name: string): string {
  return DEPARTMENT_ALIASES[name] ?? name
}

export function getSasoProbationExclusionReport(): SasoProbationExclusionReport {
  return {
    facultyName: raw.report.faculty_name,
    departmentName: raw.report.department_name,
    registrationYear: raw.report.registration_year,
    qualification: raw.report.qualification,
    qualificationName: raw.report.qualification_name,
  }
}

export function getSasoProbationExclusionSummary(): SasoProbationExclusionSummary {
  return { ...raw.summary }
}

export function getSasoProbationExclusionModules(): SasoProbationExclusionModule[] {
  return raw.modules.map((module) => ({
    qualificationCode: module.qualificationCode,
    qualificationName: module.qualificationName,
    code: module.code,
    name: module.name,
    department: normalizeProbationExclusionDepartment(module.department),
    level: module.level,
    semester: module.semester,
    probationCount: module.probationCount,
    exclusionBeforeProcessing: module.exclusionBeforeProcessing,
    readmitted: module.readmitted,
    excluded: module.excluded,
    totalStudents: module.totalStudents,
    probationRate: module.probationRate,
    exclusionRate: module.exclusionRate,
    readmissionRate: module.readmissionRate,
  }))
}
