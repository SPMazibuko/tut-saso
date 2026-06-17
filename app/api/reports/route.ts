import { NextRequest } from "next/server"
import { buildReportContent } from "@/lib/reports"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const specId = searchParams.get("specId")
    const format = searchParams.get("format") as "csv" | "json" | null

    if (!specId) {
      return new Response(JSON.stringify({ error: "Missing specId" }), { status: 400 })
    }

    const { filename, mime, content } = buildReportContent(specId, format ?? undefined)

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename=${filename}`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unexpected error" }), { status: 500 })
  }
}


