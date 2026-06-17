import { NextRequest } from "next/server"
import { endAttendanceSession } from "@/lib/attendance/store"

export const runtime = "nodejs"

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = (await req.json()) as Partial<{ endedByUserId: string; endedByUserName: string }>
    if (!body.endedByUserId || !body.endedByUserName) return json({ error: "Missing user" }, 400)

    const session = endAttendanceSession({
      sessionId: id,
      endedByUserId: body.endedByUserId,
      endedByUserName: body.endedByUserName,
    })
    return json({ session })
  } catch (err: any) {
    return json({ error: err?.message ?? "Unexpected error" }, 500)
  }
}

