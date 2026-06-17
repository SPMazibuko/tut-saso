import { NextRequest } from "next/server"
import { getSessionAnalytics } from "@/lib/classpoint/mock-analytics"

export const runtime = "nodejs"

/**
 * GET ?sessionId=...
 * Returns deterministic mock ClassPoint Q&A analytics for the given attendance session ID.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")?.trim()

  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing sessionId" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  try {
    const analytics = getSessionAnalytics(sessionId)
    return new Response(
      JSON.stringify({ success: true, data: analytics }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
