import { NextRequest } from "next/server"
import { getSessionRoster } from "@/lib/attendance/session-roster"

export const runtime = "nodejs"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

/**
 * GET ?sessionId=...
 * Returns registered roster rows with attendance, attempted %, participant flag, probation, readmitted, and totals.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")?.trim()

  if (!sessionId) {
    return json({ error: "Missing sessionId" }, 400)
  }

  try {
    const result = getSessionRoster(sessionId)
    return json({
      registered: result.rows,
      totals: result.totals,
    })
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
}
