import { NextRequest } from "next/server"
import { getModuleCampusBreakdown } from "@/lib/tut-saso-data"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2026"
    const moduleCode = searchParams.get("moduleCode")

    void year

    if (!moduleCode || moduleCode.trim() === "") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "moduleCode is required",
          data: [],
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const data = getModuleCampusBreakdown(moduleCode)

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch campus breakdown"
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        data: [],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
