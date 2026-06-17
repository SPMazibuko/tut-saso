import { NextRequest } from "next/server"
import { SASO_DEPARTMENTAL_BREAKDOWN } from "@/lib/tut-saso-data"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2026"
    const moduleCode = searchParams.get("moduleCode")
    const includeCampus = searchParams.get("includeCampus") === "true"

    const data = SASO_DEPARTMENTAL_BREAKDOWN.map((item) => ({
      ...item,
      campuses: includeCampus ? item.campuses : undefined,
    }))

    void year
    void moduleCode

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch departmental breakdown"
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
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
