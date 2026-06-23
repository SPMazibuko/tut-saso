"use client"

import type { DistrictSummary, ProvinceSummary, SchoolSummary, Learner } from "./types"
import { getProvinceSummaries, getDistrictSummaries, getSchoolSummaries } from "./governance"
import { SOUTH_AFRICAN_PROVINCES } from "./sa-provinces-data"

/**
 * Get student's hierarchy context (province, district/region, school)
 */
export interface StudentHierarchy {
  province: {
    id: string
    name: string
    summary: ProvinceSummary | null
  }
  district: {
    id: string
    name: string
    summary: DistrictSummary | null
  }
  school: {
    id: string
    name: string
    summary: SchoolSummary | null
  }
}

export function getStudentHierarchy(student: Learner): StudentHierarchy | null {
  console.log("student", student)
  if (!student.provinceId || !student.districtId || !student.schoolId) {
    return null
  }
  console.log("student.provinceId", student.provinceId)
  console.log("student.districtId", student.districtId)
  console.log("student.schoolId", student.schoolId)
  console.log(student.provinceId, student.districtId, student.schoolId)
  const provinces = getProvinceSummaries()
  const districts = getDistrictSummaries()
  const schools = getSchoolSummaries()

  // Find province
  const province = SOUTH_AFRICAN_PROVINCES.find((p) => p.id === student.provinceId)
  const provinceSummary = provinces.find((p) => p.id === student.provinceId)

  // Find district
  const district = province?.districts.find((d) => d.id === student.districtId)
  const districtSummary = districts.find((d) => d.id === student.districtId)

  // Find school
  const schoolSummary = schools.find((s) => s.id === student.schoolId)

  return {
    province: {
      id: student.provinceId,
      name: province?.name || "Unknown Province",
      summary: provinceSummary || null,
    },
    district: {
      id: student.districtId,
      name: district?.name || "Unknown District",
      summary: districtSummary || null,
    },
    school: {
      id: student.schoolId,
      name: schoolSummary?.name || "Unknown School",
      summary: schoolSummary || null,
    },
  }
}

/**
 * Comparative analysis comparing student performance against hierarchy
 */
export interface HierarchyComparison {
  student: {
    // aps: number
    attendanceRate: number
    riskLevel: Learner["riskLevel"]
    riskScore: number
  }
  school: {
    // avgAPS: number
    avgAttendance: number
    atRiskPercentage: number
    comparison: {
      // aps: { difference: number; status: "above" | "below" | "equal" }
      attendance: { difference: number; status: "above" | "below" | "equal" }
    }
  }
  district: {
    // avgAPS: number
    avgAttendance: number
    atRiskPercentage: number
    comparison: {
      // aps: { difference: number; status: "above" | "below" | "equal" }
      attendance: { difference: number; status: "above" | "below" | "equal" }
    }
  }
  province: {
    // avgAPS: number
    avgAttendance: number
    atRiskPercentage: number
    comparison: {
      // aps: { difference: number; status: "above" | "below" | "equal" }
      attendance: { difference: number; status: "above" | "below" | "equal" }
    }
  }
}

export function getHierarchyComparison(student: Learner): HierarchyComparison | null {
  const hierarchy = getStudentHierarchy(student)
  if (!hierarchy) return null

  const studentData = {
    // aps: student.aps,
    attendanceRate: student.attendanceRate,
    riskLevel: student.riskLevel,
    riskScore: student.riskScore,
  }

  // School comparison
  const schoolStats = hierarchy.school.summary?.stats
  const schoolData = schoolStats
    ? {
        // avgAPS: schoolStats.averageAPS,
        avgAttendance: schoolStats.averageAttendance,
        atRiskPercentage:
          ((schoolStats.atRiskStudents / schoolStats.totalStudents) * 100) || 0,
        comparison: {
          // aps: compareValues(student.aps, schoolStats.averageAPS),
          attendance: compareValues(student.attendanceRate, schoolStats.averageAttendance),
        },
      }
    : {
        // avgAPS: 0,
        avgAttendance: 0,
        atRiskPercentage: 0,
        comparison: {
          // aps: { difference: 0, status: "equal" as const },
          attendance: { difference: 0, status: "equal" as const },
        },
      }

  // District comparison
  const districtStats = hierarchy.district.summary?.stats
  const districtData = districtStats
    ? {
        // avgAPS: districtStats.averageAPS,
        avgAttendance: districtStats.averageAttendance,
        atRiskPercentage:
          ((districtStats.atRiskStudents / districtStats.totalStudents) * 100) || 0,
        comparison: {
          // aps: compareValues(student.aps, districtStats.averageAPS),
          attendance: compareValues(student.attendanceRate, districtStats.averageAttendance),
        },
      }
    : {
        // avgAPS: 0,
        avgAttendance: 0,
        atRiskPercentage: 0,
        comparison: {
          // aps: { difference: 0, status: "equal" as const },
          attendance: { difference: 0, status: "equal" as const },
        },
      }

  // Province comparison
  const provinceStats = hierarchy.province.summary?.stats
  const provinceData = provinceStats
    ? {
        // avgAPS: provinceStats.averageAPS,
        avgAttendance: provinceStats.averageAttendance,
        atRiskPercentage:
          ((provinceStats.atRiskStudents / provinceStats.totalStudents) * 100) || 0,
        comparison: {
          // aps: compareValues(student.aps, provinceStats.averageAPS),
          attendance: compareValues(student.attendanceRate, provinceStats.averageAttendance),
        },
      }
    : {
        // avgAPS: 0,
        avgAttendance: 0,
        atRiskPercentage: 0,
        comparison: {
          // aps: { difference: 0, status: "equal" as const },
          attendance: { difference: 0, status: "equal" as const },
        },
      }

  return {
    student: studentData,
    school: schoolData,
    district: districtData,
    province: provinceData,
  }
}

/**
 * Compare two values and return difference and status
 */
function compareValues(studentValue: number, averageValue: number): {
  difference: number
  status: "above" | "below" | "equal"
} {
  const diff = studentValue - averageValue
  const threshold = 0.01 // Consider values within 0.01 as equal

  if (Math.abs(diff) < threshold) {
    return { difference: 0, status: "equal" }
  }

  return {
    difference: Math.round(diff * 100) / 100,
    status: diff > 0 ? "above" : "below",
  }
}

/**
 * Get percentile ranking within school/district/province
 */
export interface PercentileRanking {
  schoolPercentile: number // 0-100, where 100 is top performer
  districtPercentile: number
  provincePercentile: number
}

export function getPercentileRanking(
  student: Learner,
  allStudentsInContext: Learner[],
): PercentileRanking {
  // For demo purposes, estimate ranking based on attendance (APS disabled)

  const studentScore = student.attendanceRate

  const sortedScores = allStudentsInContext
    .map((s) => s.attendanceRate)
    .sort((a, b) => b - a)

  const studentIndex = sortedScores.findIndex((score) => score <= studentScore)
  const totalStudents = allStudentsInContext.length

  const percentile = totalStudents > 0 ? ((totalStudents - studentIndex) / totalStudents) * 100 : 50

  // Return same percentile for all levels for demo (in production, calculate separately)
  return {
    schoolPercentile: Math.round(percentile),
    districtPercentile: Math.round(percentile),
    provincePercentile: Math.round(percentile),
  }
}

