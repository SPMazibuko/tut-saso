"use client"

import type { ConsentRecord, DPIARecord } from "./types"

const consentStore: ConsentRecord[] = []
const dpiaStore: DPIARecord[] = [
  {
    id: "dpia-1",
    process: "Risk Prediction",
    risksIdentified: ["Potential bias across grades", "Unauthorized data access"],
    mitigations: ["Fairness monitoring", "Role-based access", "Encryption at rest/in transit"],
    owner: "Data Protection Officer",
    lastReviewedAt: new Date("2025-01-10"),
  },
]

export function recordConsent(record: ConsentRecord): void {
  consentStore.push(record)
}

export function listConsent(userId?: string): ConsentRecord[] {
  return userId ? consentStore.filter((c) => c.userId === userId) : consentStore
}

export function listDPIA(): DPIARecord[] {
  return dpiaStore
}

