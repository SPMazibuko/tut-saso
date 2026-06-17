"use client"

import type { User, UserRole } from "./types"
import { getCurrentUser } from "./auth"
import { mockStudents } from "./mock-data"

/**
 * User Context Service - Handles role-based data filtering and scope management
 */

export interface UserScope {
  role: UserRole
  provinceIds?: string[]
  districtIds?: string[]
  schoolIds?: string[]
  teacherId?: string
  studentId?: string
}

/**
 * Get user's accessible scope based on their role
 */
export function getUserScope(user?: User): UserScope {
  const currentUser = user || getCurrentUser()
  if (!currentUser) {
    return { role: "student" } // Default fallback
  }

  const scope: UserScope = {
    role: currentUser.role,
  }

  // For students, link to their student record
  if (currentUser.role === "student") {
    const student = mockStudents.find((s) => s.id === currentUser.id || s.email === currentUser.email)
    if (student) {
      scope.studentId = String(student.id)
      if (student.schoolId) scope.schoolIds = [student.schoolId]
      if (student.districtId) scope.districtIds = [student.districtId]
      if (student.provinceId) scope.provinceIds = [student.provinceId]
    }
  }

  // For teachers, we'd typically have assignments - for now use mock logic
  if (currentUser.role === "teacher") {
    // In a real system, this would come from user profile/assignments
    // For now, we'll assume teachers can see all students in their assigned school
    scope.teacherId = currentUser.id
    // Teachers typically have a school assignment
    const teacherStudents = mockStudents.filter((s) => s.teacherId === Number(currentUser.id) || s.teacherId === 1)
    if (teacherStudents.length > 0) {
      const schools = new Set(teacherStudents.map((s) => s.schoolId).filter(Boolean) as string[])
      scope.schoolIds = Array.from(schools)
      const districts = new Set(teacherStudents.map((s) => s.districtId).filter(Boolean) as string[])
      scope.districtIds = Array.from(districts)
      const provinces = new Set(teacherStudents.map((s) => s.provinceId).filter(Boolean) as string[])
      scope.provinceIds = Array.from(provinces)
    }
  }

  // For admin, typically scoped to a single school
  if (currentUser.role === "admin") {
    // In a real system, this would come from user profile
    // For now, assume admins see students from a specific school
    const adminStudents = mockStudents.slice(0, 50) // Sample
    const schools = new Set(adminStudents.map((s) => s.schoolId).filter(Boolean) as string[])
    scope.schoolIds = Array.from(schools).slice(0, 1) // Single school for admin
  }

  // For district-admin, scoped to specific district(s)
  if (currentUser.role === "district-admin") {
    // In a real system, this would come from user profile
    // For now, use a sample district
    const districtStudents = mockStudents.filter((s) => s.districtId?.includes("dist-gp-1"))
    const districts = new Set(districtStudents.map((s) => s.districtId).filter(Boolean) as string[])
    scope.districtIds = Array.from(districts)
    const provinces = new Set(districtStudents.map((s) => s.provinceId).filter(Boolean) as string[])
    scope.provinceIds = Array.from(provinces)
  }

  // For provincial-admin, can see all provinces
  if (currentUser.role === "provincial-admin") {
    // Provincial admins can see all provinces (no restriction in scope)
    // scope.provinceIds = [] // Empty means all
  }

  return scope
}

/**
 * Filter data by user scope
 */
export function filterByUserScope<T extends { provinceId?: string; districtId?: string; schoolId?: string; id?: string | number }>(
  data: T[],
  user?: User,
): T[] {
  const scope = getUserScope(user)
  
  if (!scope.role) return data

  // Provincial admin can see everything
  if (scope.role === "provincial-admin") {
    return data
  }

  // District admin filtered by districts
  if (scope.role === "district-admin" && scope.districtIds && scope.districtIds.length > 0) {
    return data.filter((item) => item.districtId && scope.districtIds!.includes(item.districtId))
  }

  // Admin filtered by schools
  if (scope.role === "admin" && scope.schoolIds && scope.schoolIds.length > 0) {
    return data.filter((item) => item.schoolId && scope.schoolIds!.includes(item.schoolId))
  }

  // Teacher filtered by assigned students (would need student relationship)
  if (scope.role === "teacher" && scope.schoolIds && scope.schoolIds.length > 0) {
    return data.filter((item) => item.schoolId && scope.schoolIds!.includes(item.schoolId))
  }

  // Learner can only see their own data
  if (scope.role === "student" && scope.studentId) {
    return data.filter((item) => String(item.id) === scope.studentId)
  }

  // Default: return empty array if scope cannot be determined
  return []
}

/**
 * Get user's position in hierarchy
 */
export function getUserHierarchy(user?: User): {
  province?: { id: string; name: string }
  district?: { id: string; name: string }
  school?: { id: string; name: string }
} {
  const scope = getUserScope(user)
  const hierarchy: {
    province?: { id: string; name: string }
    district?: { id: string; name: string }
    school?: { id: string; name: string }
  } = {}

  // This is a simplified version - in a real system, you'd look up names from a database
  if (scope.provinceIds && scope.provinceIds.length > 0) {
    hierarchy.province = { id: scope.provinceIds[0], name: "Gauteng" } // Mock
  }
  if (scope.districtIds && scope.districtIds.length > 0) {
    hierarchy.district = { id: scope.districtIds[0], name: "District 1" } // Mock
  }
  if (scope.schoolIds && scope.schoolIds.length > 0) {
    hierarchy.school = { id: scope.schoolIds[0], name: "School 1" } // Mock
  }

  return hierarchy
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  resource: { provinceId?: string; districtId?: string; schoolId?: string; studentId?: string },
  user?: User,
): boolean {
  const scope = getUserScope(user)

  if (scope.role === "provincial-admin") return true

  if (scope.role === "district-admin") {
    if (scope.districtIds && resource.districtId) {
      return scope.districtIds.includes(resource.districtId)
    }
    return false
  }

  if (scope.role === "admin") {
    if (scope.schoolIds && resource.schoolId) {
      return scope.schoolIds.includes(resource.schoolId)
    }
    return false
  }

  if (scope.role === "teacher") {
    if (scope.schoolIds && resource.schoolId) {
      return scope.schoolIds.includes(resource.schoolId)
    }
    return false
  }

  if (scope.role === "student") {
    if (scope.studentId && resource.studentId) {
      return scope.studentId === resource.studentId
    }
    return false
  }

  return false
}

/**
 * Get scope description for display
 */
export function getScopeDescription(user?: User): string {
  const scope = getUserScope(user)
  const hierarchy = getUserHierarchy(user)

  switch (scope.role) {
    case "provincial-admin":
      return "All Provinces"
    case "district-admin":
      return hierarchy.district ? `District: ${hierarchy.district.name}` : "District Level"
    case "admin":
      return hierarchy.school ? `School: ${hierarchy.school.name}` : "School Level"
    case "teacher":
      return hierarchy.school ? `School: ${hierarchy.school.name}` : "Teacher"
    case "student":
      return "My Profile"
    case "parent":
      return "My Children"
    default:
      return "Limited Access"
  }
}

