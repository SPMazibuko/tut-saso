import { NextRequest } from "next/server"

export const runtime = "edge"

interface HistoricalAnalysis {
  subjectCode: string
  qualification: string
  subjectName: string
  yearlyPerformance: {
    [year: number]: {
      passRate: number
      successRate: number
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subjectCode = searchParams.get("subjectCode")
    const years = searchParams.get("years") || "2022,2023,2024"

    // Mock data for testing
    // In production, this would fetch from your database
    const data: HistoricalAnalysis | null = subjectCode ? {
      subjectCode: subjectCode,
      qualification: "DPRS20",
      subjectName: "Engineering Fundamentals",
      yearlyPerformance: {
        2022: {
          passRate: 72.5,
          successRate: 68.2,
        },
        2023: {
          passRate: 74.8,
          successRate: 70.1,
        },
        2024: {
          passRate: 76.2,
          successRate: 71.5,
        },
      },
    } : null

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
        error: err?.message ?? "Failed to fetch historical data",
        data: null,
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

