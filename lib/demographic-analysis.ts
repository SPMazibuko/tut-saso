"use client"

import type { Learner } from "./types"
import { getStudents } from "./data-service"

export interface DemographicDistribution {
  gender: {
    male: number
    female: number
    other: number
  }
  language: Record<string, number>
  income: {
    low: number
    middle: number
    high: number
  }
  grade: Record<string, number>
  province: Record<string, number>
  district: Record<string, number>
}

export interface GeographicDistribution {
  provinceId: string
  provinceName: string
  studentCount: number
  districts: Array<{
    districtId: string
    districtName: string
    studentCount: number
    schools: Array<{
      schoolId: string
      schoolName: string
      studentCount: number
    }>
  }>
}

export interface DemographicCorrelation {
  demographic: string
  value: string
  averageAttendance: number
  averageAPS: number
  passRate: number
  atRiskPercentage: number
}

/**
 * Get demographic distribution for all students or filtered subset
 */
export function getDemographicDistribution(students?: Learner[]): DemographicDistribution {
  const studentList = students || getStudents()
  
  const distribution: DemographicDistribution = {
    gender: { male: 0, female: 0, other: 0 },
    language: {},
    income: { low: 0, middle: 0, high: 0 },
    grade: {},
    province: {},
    district: {},
  }

  studentList.forEach((student) => {
    // Gender distribution
    if (student.gender === "male") distribution.gender.male++
    else if (student.gender === "female") distribution.gender.female++
    else if (student.gender === "other") distribution.gender.other++

    // Language distribution
    if (student.householdLanguage) {
      distribution.language[student.householdLanguage] =
        (distribution.language[student.householdLanguage] || 0) + 1
    }

    // Income distribution
    if (student.householdIncomeBracket) {
      distribution.income[student.householdIncomeBracket]++
    }

    // Grade distribution
    if (student.grade) {
      distribution.grade[student.grade] = (distribution.grade[student.grade] || 0) + 1
    }

    // Province distribution
    if (student.provinceId) {
      distribution.province[student.provinceId] =
        (distribution.province[student.provinceId] || 0) + 1
    }

    // District distribution
    if (student.districtId) {
      distribution.district[student.districtId] =
        (distribution.district[student.districtId] || 0) + 1
    }
  })

  return distribution
}

/**
 * Get geographic distribution with hierarchy
 */
export function getGeographicDistribution(students?: Learner[]): GeographicDistribution[] {
  const studentList = students || getStudents()
  const { SOUTH_AFRICAN_PROVINCES } = require("./sa-provinces-data")

  const provinceMap = new Map<string, {
    provinceId: string
    provinceName: string
    studentCount: number
    districts: Map<string, {
      districtId: string
      districtName: string
      studentCount: number
      schools: Map<string, { schoolId: string; schoolName: string; studentCount: number }>
    }>
  }>()

  studentList.forEach((student) => {
    if (!student.provinceId || !student.districtId || !student.schoolId) return

    const province = SOUTH_AFRICAN_PROVINCES.find((p) => p.id === student.provinceId)
    if (!province) return

    const district = province.districts.find((d) => d.id === student.districtId)
    if (!district) return

    // Initialize province if not exists
    if (!provinceMap.has(student.provinceId)) {
      provinceMap.set(student.provinceId, {
        provinceId: student.provinceId,
        provinceName: province.name,
        studentCount: 0,
        districts: new Map(),
      })
    }

    const provinceData = provinceMap.get(student.provinceId)!
    provinceData.studentCount++

    // Initialize district if not exists
    if (!provinceData.districts.has(student.districtId)) {
      provinceData.districts.set(student.districtId, {
        districtId: student.districtId,
        districtName: district.name,
        studentCount: 0,
        schools: new Map(),
      })
    }

    const districtData = provinceData.districts.get(student.districtId)!
    districtData.studentCount++

    // Initialize school if not exists
    if (!districtData.schools.has(student.schoolId)) {
      districtData.schools.set(student.schoolId, {
        schoolId: student.schoolId,
        schoolName: student.schoolId, // You may want to get actual school name
        studentCount: 0,
      })
    }

    const schoolData = districtData.schools.get(student.schoolId)!
    schoolData.studentCount++
  })

  // Convert maps to arrays
  return Array.from(provinceMap.values()).map((province) => ({
    ...province,
    districts: Array.from(province.districts.values()).map((district) => ({
      ...district,
      schools: Array.from(district.schools.values()),
    })),
  }))
}

/**
 * Get correlation between demographics and academic performance
 */
export function getDemographicCorrelations(students?: Learner[]): DemographicCorrelation[] {
  const studentList = students || getStudents()
  const correlations: DemographicCorrelation[] = []

  // Gender correlations
  const genderGroups = {
    male: studentList.filter((s) => s.gender === "male"),
    female: studentList.filter((s) => s.gender === "female"),
    other: studentList.filter((s) => s.gender === "other"),
  }

  Object.entries(genderGroups).forEach(([gender, group]) => {
    if (group.length === 0) return
    const avgAttendance = group.reduce((sum, s) => sum + (s.attendanceRate || s.attendance.percentage), 0) / group.length
    const avgAPS = group.reduce((sum, s) => sum + (s.aps || 0), 0) / group.length
    const passRate = group.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return avgScore >= 50
    }).length / group.length * 100
    const atRisk = group.filter((s) => s.riskLevel === "At Risk").length / group.length * 100

    correlations.push({
      demographic: "gender",
      value: gender,
      averageAttendance: avgAttendance,
      averageAPS: avgAPS,
      passRate,
      atRiskPercentage: atRisk,
    })
  })

  // Income bracket correlations
  const incomeGroups = {
    low: studentList.filter((s) => s.householdIncomeBracket === "low"),
    middle: studentList.filter((s) => s.householdIncomeBracket === "middle"),
    high: studentList.filter((s) => s.householdIncomeBracket === "high"),
  }

  Object.entries(incomeGroups).forEach(([income, group]) => {
    if (group.length === 0) return
    const avgAttendance = group.reduce((sum, s) => sum + (s.attendanceRate || s.attendance.percentage), 0) / group.length
    const avgAPS = group.reduce((sum, s) => sum + (s.aps || 0), 0) / group.length
    const passRate = group.filter((s) => {
      const avgScore = (s.assessments.AS + s.assessments.CT + s.assessments.WR) / 3
      return avgScore >= 50
    }).length / group.length * 100
    const atRisk = group.filter((s) => s.riskLevel === "At Risk").length / group.length * 100

    correlations.push({
      demographic: "income",
      value: income,
      averageAttendance: avgAttendance,
      averageAPS: avgAPS,
      passRate,
      atRiskPercentage: atRisk,
    })
  })

  return correlations
}

