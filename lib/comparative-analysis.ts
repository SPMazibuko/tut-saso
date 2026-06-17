"use client"

import type { Learner, ComparativeMetrics } from "./types"
import { getStudents } from "./data-service"
import { SOUTH_AFRICAN_PROVINCES } from "./sa-provinces-data"
import { getSchools, getSchoolsByDistrict } from "./data-service"

/**
 * Get comparative metrics for a specific level (school, district, or province)
 */
export function getComparativeMetrics(
  level: "school" | "district" | "province",
  id: string,
  students?: Learner[]
): ComparativeMetrics | null {
  const studentList = students || getStudents()
  let filteredStudents: Learner[] = []

  if (level === "province") {
    filteredStudents = studentList.filter((s) => s.provinceId === id)
  } else if (level === "district") {
    filteredStudents = studentList.filter((s) => s.districtId === id)
  } else if (level === "school") {
    filteredStudents = studentList.filter((s) => s.schoolId === id)
  }

  if (filteredStudents.length === 0) return null

  // Get name
  let name = "Unknown"
  if (level === "province") {
    const province = SOUTH_AFRICAN_PROVINCES.find((p) => p.id === id)
    name = province?.name || "Unknown Province"
  } else if (level === "district") {
    const province = SOUTH_AFRICAN_PROVINCES.find((p) => p.districts.some((d) => d.id === id))
    const district = province?.districts.find((d) => d.id === id)
    name = district?.name || "Unknown District"
  } else if (level === "school") {
    const school = getSchools().find((s) => s.id === id)
    name = school?.name || "Unknown School"
  }

  // Calculate metrics
  const totalStudents = filteredStudents.length
  const averageAttendance = filteredStudents.reduce((sum, s) => sum + (s.attendanceRate || s.attendance.percentage), 0) / totalStudents
  const averageAPS = filteredStudents.reduce((sum, s) => sum + (s.aps || 0), 0) / totalStudents
  const passed = filteredStudents.filter((s) => {
    const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
    return avgScore >= 50
  }).length
  const passRate = (passed / totalStudents) * 100
  const atRisk = filteredStudents.filter((s) => s.riskLevel === "At Risk").length
  const atRiskPercentage = (atRisk / totalStudents) * 100

  const riskDistribution = {
    good: filteredStudents.filter((s) => s.riskLevel === "Good").length,
    satisfactory: filteredStudents.filter((s) => s.riskLevel === "Satisfactory").length,
    atRisk: atRisk,
  }

  return {
    level,
    id,
    name,
    totalStudents,
    averageAttendance: Math.round(averageAttendance * 10) / 10,
    averageAPS: Math.round(averageAPS * 10) / 10,
    passRate: Math.round(passRate * 10) / 10,
    atRiskPercentage: Math.round(atRiskPercentage * 10) / 10,
    riskDistribution,
  }
}

/**
 * Get all comparative metrics for a level
 */
export function getAllComparativeMetrics(
  level: "school" | "district" | "province",
  students?: Learner[]
): ComparativeMetrics[] {
  const studentList = students || getStudents()
  const metrics: ComparativeMetrics[] = []

  if (level === "province") {
    SOUTH_AFRICAN_PROVINCES.forEach((province) => {
      const metric = getComparativeMetrics("province", province.id, studentList)
      if (metric) metrics.push(metric)
    })
  } else if (level === "district") {
    SOUTH_AFRICAN_PROVINCES.forEach((province) => {
      province.districts.forEach((district) => {
        const metric = getComparativeMetrics("district", district.id, studentList)
        if (metric) metrics.push(metric)
      })
    })
  } else if (level === "school") {
    const schools = getSchools()
    schools.forEach((school) => {
      const metric = getComparativeMetrics("school", school.id, studentList)
      if (metric) metrics.push(metric)
    })
  }

  return metrics
}

/**
 * Compare student against their school, district, and province
 */
export function getStudentComparison(student: Learner, students?: Learner[]): {
  student: ComparativeMetrics
  school: ComparativeMetrics | null
  district: ComparativeMetrics | null
  province: ComparativeMetrics | null
} {
  const studentList = students || getStudents()

  // Create a single-student metrics object
  const studentMetrics: ComparativeMetrics = {
    level: "school",
    id: student.schoolId || "",
    name: `${student.name} ${student.surname}`,
    totalStudents: 1,
    averageAttendance: student.attendanceRate || student.attendance.percentage,
    averageAPS: student.aps || 0,
    passRate: (() => {
      const avgScore = (student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3
      return avgScore >= 50 ? 100 : 0
    })(),
    atRiskPercentage: student.riskLevel === "At Risk" ? 100 : 0,
    riskDistribution: {
      good: student.riskLevel === "Good" ? 1 : 0,
      satisfactory: student.riskLevel === "Satisfactory" ? 1 : 0,
      atRisk: student.riskLevel === "At Risk" ? 1 : 0,
    },
  }

  const school = student.schoolId ? getComparativeMetrics("school", student.schoolId, studentList) : null
  const district = student.districtId ? getComparativeMetrics("district", student.districtId, studentList) : null
  const province = student.provinceId ? getComparativeMetrics("province", student.provinceId, studentList) : null

  return {
    student: studentMetrics,
    school,
    district,
    province,
  }
}

/**
 * Get percentile ranking for a metric
 */
export function getPercentileRanking(
  value: number,
  allValues: number[]
): number {
  const sorted = [...allValues].sort((a, b) => a - b)
  const rank = sorted.filter((v) => v <= value).length
  return (rank / sorted.length) * 100
}

/**
 * Compare two groups of students
 */
export function compareGroups(
  group1: Learner[],
  group2: Learner[],
  label1: string = "Group 1",
  label2: string = "Group 2"
): {
  label1: string
  label2: string
  metrics: {
    metric: string
    group1: number
    group2: number
    difference: number
    percentageDifference: number
  }[]
} {
  const calculateMetrics = (students: Learner[]) => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        averageAttendance: 0,
        averageAPS: 0,
        passRate: 0,
        atRiskPercentage: 0,
      }
    }

    const avgAttendance = students.reduce((sum, s) => sum + (s.attendanceRate || s.attendance.percentage), 0) / students.length
    const avgAPS = students.reduce((sum, s) => sum + (s.aps || 0), 0) / students.length
    const passed = students.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return avgScore >= 50
    }).length
    const passRate = (passed / students.length) * 100
    const atRisk = students.filter((s) => s.riskLevel === "At Risk").length
    const atRiskPercentage = (atRisk / students.length) * 100

    return {
      totalStudents: students.length,
      averageAttendance: Math.round(avgAttendance * 10) / 10,
      averageAPS: Math.round(avgAPS * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
      atRiskPercentage: Math.round(atRiskPercentage * 10) / 10,
    }
  }

  const m1 = calculateMetrics(group1)
  const m2 = calculateMetrics(group2)

  const metrics = [
    {
      metric: "Total Students",
      group1: m1.totalStudents,
      group2: m2.totalStudents,
      difference: m1.totalStudents - m2.totalStudents,
      percentageDifference: m2.totalStudents > 0 ? ((m1.totalStudents - m2.totalStudents) / m2.totalStudents) * 100 : 0,
    },
    {
      metric: "Average Attendance",
      group1: m1.averageAttendance,
      group2: m2.averageAttendance,
      difference: m1.averageAttendance - m2.averageAttendance,
      percentageDifference: m2.averageAttendance > 0 ? ((m1.averageAttendance - m2.averageAttendance) / m2.averageAttendance) * 100 : 0,
    },
    {
      metric: "Average APS",
      group1: m1.averageAPS,
      group2: m2.averageAPS,
      difference: m1.averageAPS - m2.averageAPS,
      percentageDifference: m2.averageAPS > 0 ? ((m1.averageAPS - m2.averageAPS) / m2.averageAPS) * 100 : 0,
    },
    {
      metric: "Pass Rate",
      group1: m1.passRate,
      group2: m2.passRate,
      difference: m1.passRate - m2.passRate,
      percentageDifference: m2.passRate > 0 ? ((m1.passRate - m2.passRate) / m2.passRate) * 100 : 0,
    },
    {
      metric: "At Risk Percentage",
      group1: m1.atRiskPercentage,
      group2: m2.atRiskPercentage,
      difference: m1.atRiskPercentage - m2.atRiskPercentage,
      percentageDifference: m2.atRiskPercentage > 0 ? ((m1.atRiskPercentage - m2.atRiskPercentage) / m2.atRiskPercentage) * 100 : 0,
    },
  ]

  return {
    label1,
    label2,
    metrics,
  }
}

