/** TUT-style student number: exactly 9 digits (YYYY + 5-digit sequence). */
export function formatStudentNumber(sequence: number, enrollmentYear = 2026): string {
  const year = String(enrollmentYear).replace(/\D/g, "").slice(0, 4).padStart(4, "0")
  const seq = String(Math.max(1, sequence)).padStart(5, "0").slice(-5)
  return `${year}${seq}`
}

export function studentNumberFromId(id: number, enrollmentYear = 2026): string {
  return formatStudentNumber(id, enrollmentYear)
}

export const STUDENT_NUMBER_PLACEHOLDER = "202600001"

export const STUDENT_EMAIL_DOMAIN = "tut4life.ac.za"

export function formatStudentEmail(studentNumber: string): string {
  return `${studentNumber}@${STUDENT_EMAIL_DOMAIN}`
}
