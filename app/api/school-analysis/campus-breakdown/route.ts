import { NextRequest } from "next/server"

interface SchoolBreakdown {
  school: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const subjectCode = searchParams.get("subjectCode")

    // Mock data for testing
    // In production, this would fetch from your database
    const mockData: SchoolBreakdown[] = [
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
        totalStudents: 185,
        activeStudents: 177,
        passed: 138,
        failed: 39,
      },
      {
        school: "Durban",
        passRate: 82.3,
        successRate: 77.3,
        totalStudents: 150,
        activeStudents: 130,
        passed: 116,
        failed: 14,
      },
      {
        school: "Overall",
        passRate: 78.3,
        successRate: 73.6,
        totalStudents: 535,
        activeStudents: 487,
        passed: 396,
        failed: 91,
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
        error: err?.message ?? "Failed to fetch school breakdown",
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

