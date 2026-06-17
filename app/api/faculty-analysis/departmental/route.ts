import { NextRequest } from "next/server"

export const runtime = "edge"

interface CampusDepartmentBreakdown {
  campus: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
}

interface DepartmentBreakdown {
  department: string
  passRate: number
  successRate: number
  totalStudents: number
  activeStudents: number
  passed: number
  failed: number
  campuses?: CampusDepartmentBreakdown[]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const moduleCode = searchParams.get("moduleCode")
    const includeCampus = searchParams.get("includeCampus") === "true"

    const mockData: DepartmentBreakdown[] = [
      {
        department: "Computing and Informatics",
        passRate: 74.6,
        successRate: 69.1,
        totalStudents: 241,
        activeStudents: 219,
        passed: 166,
        failed: 44,
        campuses: includeCampus
          ? [
              {
                campus: "Windhoek",
                passRate: 75.2,
                successRate: 69.7,
                totalStudents: 154,
                activeStudents: 139,
                passed: 104,
                failed: 28,
              },
              {
                campus: "Rundu",
                passRate: 73.5,
                successRate: 67.9,
                totalStudents: 87,
                activeStudents: 80,
                passed: 62,
                failed: 16,
              },
            ]
          : undefined,
      },
      {
        department: "Education and Health Sciences",
        passRate: 78.4,
        successRate: 72.8,
        totalStudents: 162,
        activeStudents: 145,
        passed: 117,
        failed: 23,
        campuses: includeCampus
          ? [
              {
                campus: "Ongwediva",
                passRate: 79.1,
                successRate: 73.3,
                totalStudents: 93,
                activeStudents: 82,
                passed: 68,
                failed: 12,
              },
              {
                campus: "Katima Mulilo",
                passRate: 77.2,
                successRate: 72.1,
                totalStudents: 69,
                activeStudents: 63,
                passed: 49,
                failed: 11,
              },
            ]
          : undefined,
      },
      {
        department: "Overall",
        passRate: 76.1,
        successRate: 70.6,
        totalStudents: 403,
        activeStudents: 364,
        passed: 283,
        failed: 67,
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

