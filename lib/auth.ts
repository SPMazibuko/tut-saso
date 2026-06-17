"use client"

import { mockUsers } from "./mock-data"
import type { User } from "./types"
import { mapSelectableRoleToUserRole } from "./role-mapping"

const AUTH_STORAGE_KEY = "ipass_auth_user"

/** Per-user credentials for mock authentication */
const USER_PASSWORDS: Record<string, string> = {
  "admin@ipass.edu": "Test@123",
  "teacher@ipass.edu": "Test@123",
  "student@ipass.edu": "Test@123",
  "parent@ipass.edu": "Test@123",
  "district@ipass.edu": "Test@123",
  "province@ipass.edu": "Test@123",
  "mashilom1@tut.ac.za": "admin@123",
  "spmazibuko07@gmail.com": "pretoria@TT123",
}

function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase()
  return mockUsers.find((u) => u.email.toLowerCase() === normalized)
}

function verifyPassword(email: string, password: string): boolean {
  const expected = USER_PASSWORDS[email.trim().toLowerCase()]
  return expected !== undefined && password === expected
}

export function login(email: string, password: string, selectedRole?: string | null): User | null {
  const user = findUserByEmail(email)

  if (user && verifyPassword(user.email, password)) {
    const toStore = { ...user }
    const mappedRole = mapSelectableRoleToUserRole(selectedRole ?? null)
    // Full-access accounts keep provincial-admin regardless of portal selection
    if (mappedRole && user.role !== "provincial-admin") {
      toStore.role = mappedRole
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(toStore))
    return toStore
  }

  return null
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function hasRole(role: User["role"]): boolean {
  const user = getCurrentUser()
  return user?.role === role
}
