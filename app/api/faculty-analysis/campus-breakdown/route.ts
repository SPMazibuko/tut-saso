import { NextRequest } from "next/server"

export const runtime = "edge"

interface CampusBreakdown {
  campus: string
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
    const moduleCode = searchParams.get("moduleCode")

    // Mock data for testing (optionally filter by moduleCode).
    // In production, replace with a DB query.
    const mockData: CampusBreakdown[] = [
      {
        campus: "Capetown",
        passRate: 76.5,
        successRate: 68.3,
        totalStudents: 120,
        activeStudents: 106,
        passed: 82,
        failed: 18,
      },
      {
        campus: "Stellenbosch",
        passRate: 72.6,
        successRate: 64.2,
        totalStudents: 95,
        activeStudents: 86,
        passed: 61,
        failed: 20,
      },
      {
        campus: "Durban",
        passRate: 80.2,
        successRate: 74.7,
        totalStudents: 150,
        activeStudents: 128,
        passed: 112,
        failed: 16,
      },
      {
        campus: "Module Overall - All Campuses",
        passRate: 77.9,
        successRate: 70.6,
        totalStudents: 365,
        activeStudents: 320,
        passed: 255,
        failed: 54,
      },
    ]

    // Accepted for compatibility with UI query params (not used in mock).
    void year
    void moduleCode

    return new Response(
      JSON.stringify({
        success: true,
        data: mockData,
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
        error: err?.message ?? "Failed to fetch campus breakdown",
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

