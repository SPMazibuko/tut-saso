"use client"

import type { BiometricAttendanceEvent, EnvSensorReading } from "./types"

const biometricEvents: BiometricAttendanceEvent[] = []
const envReadings: EnvSensorReading[] = []

export function recordBiometricEvent(event: BiometricAttendanceEvent): void {
  biometricEvents.push(event)
}

export function listBiometricEvents(studentId?: string): BiometricAttendanceEvent[] {
  return studentId ? biometricEvents.filter((e) => e.studentId === studentId) : biometricEvents
}

export function recordEnvReading(reading: EnvSensorReading): void {
  envReadings.push(reading)
}

export function listEnvReadings(classroomId?: string): EnvSensorReading[] {
  return classroomId ? envReadings.filter((r) => r.classroomId === classroomId) : envReadings
}

