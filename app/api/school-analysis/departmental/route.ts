import { NextRequest } from "next/server"

export const runtime = "edge"

interface DepartmentBreakdown {
  department: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
  schools?: Array<{
    school: string
    passRate: number
    successRate: number
    totalStudents: number
    activeStudents: number
    passed: number
    failed: number
  }>
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const subjectCode = searchParams.get("subjectCode")
    const includeSchool = searchParams.get("includeSchool") === "true"

    // Mock data for testing
    // In production, this would fetch from your database
    const mockData: DepartmentBreakdown[] = [
      {
        department: "Engineering Studies",
        passRate: 76.8,
        successRate: 72.1,
        totalStudents: 295,
        activeStudents: 272,
        passed: 217,
        failed: 55,
        schools: includeSchool ? [
          {
            school: "Capetown",
            passRate: 75.5,
            successRate: 70.8,
            totalStudents: 200,
            activeStudents: 180,
            passed: 142,
            failed: 38,
          },
          {
            school: "Stellenbosch",
            passRate: 78.2,
            successRate: 73.7,
            totalStudents: 95,
            activeStudents: 92,
            passed: 75,
            failed: 17,
          },
        ] : undefined,
      },
      {
        department: "Business Studies",
        passRate: 82.3,
        successRate: 77.3,
        totalStudents: 150,
        activeStudents: 130,
        passed: 116,
        failed: 14,
        schools: includeSchool ? [
          {
            school: "Durban",
            passRate: 82.3,
            successRate: 77.3,
            totalStudents: 150,
            activeStudents: 130,
            passed: 116,
            failed: 14,
          },
        ] : undefined,
      },
      {
        department: "Overall",
        passRate: 78.3,
        successRate: 73.6,
        totalStudents: 445,
        activeStudents: 402,
        passed: 333,
        failed: 69,
      },
    ]

    const data = mockData

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message ?? "Failed to fetch departmental breakdown",
        data: [],
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

