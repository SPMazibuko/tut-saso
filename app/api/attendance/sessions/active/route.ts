import { getActiveAttendanceSession } from "@/lib/attendance/store"

export const runtime = "nodejs"

export async function GET() {
  return new Response(JSON.stringify({ session: getActiveAttendanceSession() }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

