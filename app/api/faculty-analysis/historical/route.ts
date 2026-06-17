import { NextRequest } from "next/server"

export const runtime = "edge"

interface HistoricalAnalysis {
  moduleCode: string
  qualification: string
  moduleName: string
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
    const moduleCode = searchParams.get("moduleCode")
    const years = (searchParams.get("years") || "2022,2023,2024")
      .split(",")
      .map((y) => parseInt(y.trim(), 10))
      .filter((y) => Number.isFinite(y))

    const data: HistoricalAnalysis | null = moduleCode
      ? {
          moduleCode,
          qualification: "DPRS20",
          moduleName: "Introduction to Programming",
          yearlyPerformance: years.reduce((acc, y, idx) => {
            // Small deterministic variation for mock charts
            const baseSuccess = 66 + idx * 2
            const basePass = 72 + idx * 2
            acc[y] = {
              passRate: basePass,
              successRate: baseSuccess,
            }
            return acc
          }, {} as HistoricalAnalysis["yearlyPerformance"]),
        }
      : null

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

