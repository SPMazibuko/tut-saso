export type AttendanceSessionStatus = "active" | "ended"

export type ClassDeliveryMode = "physical" | "hybrid" | "online"

export type ClassType =
  | "Tutorial Session"
  | "Mentor Session"
  | "Studython"
  | "Lecture Session"
  | "Orientation"
  | "Other"

export type OrientationSessionSlot = "morning" | "late"

export type AttendanceCaptureMethod = "fingerprint" | "manual" | "online"

export interface AttendanceSessionSettings {
  // Student cohort/group (kept for compatibility with existing mock data)
  groupId: string

  department: string

  qualificationCode: string
  qualificationName: string

  moduleCode: string

  classType: ClassType
  /**
   * Required when classType === "Orientation"
   */
  orientationSession?: OrientationSessionSlot

  /**
   * Required when classType === "Other"
   */
  otherClassTypeLabel?: string

  /**
   * Scheduled start (used for early/late arrival)
   */
  scheduledStartAt: string

  /**
   * Class duration in minutes
   */
  classDurationMinutes: number

  deliveryMode: ClassDeliveryMode
}

export interface AttendanceSession extends AttendanceSessionSettings {
  id: string
  status: AttendanceSessionStatus
  startedAt: string
  startedByUserId: string
  startedByUserName: string
  endedAt?: string
  endedByUserId?: string
  endedByUserName?: string
  onlineJoinCode?: string
}

export interface AttendanceMark {
  id: string
  sessionId: string
  studentId: number
  studentNumber: string
  studentName: string
  capturedAt: string
  capturedByUserId?: string
  capturedByUserName?: string
  method: AttendanceCaptureMethod

  /**
   * Student duration in minutes (optional; can default to class duration)
   */
  studentDurationMinutes?: number

  /**
   * Free text notes/feedback about knowledge obtained
   */
  knowledgeObtained?: string
}

