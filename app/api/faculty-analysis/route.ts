import { NextRequest } from "next/server"
import { getSasoFacultyAnalysisData } from "@/lib/tut-saso-data"

export const runtime = "edge"

const normalize = (value: string) => value.replace(/\s+/g, "").toUpperCase()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2026"
    const qualification = searchParams.get("qualification") || "all"
    const campus = searchParams.get("campus") || "all"
    const moduleCode = searchParams.get("moduleCode")

    let data = getSasoFacultyAnalysisData()

    if (moduleCode && moduleCode.trim() !== "") {
      const filterCode = normalize(moduleCode.trim())
      data = data.filter((item) => normalize(item.moduleCode) === filterCode)
    }

    if (qualification !== "all") {
      const filterQual = normalize(qualification)
      data = data.filter((item) => {
        const itemQual = normalize(item.qualificationCode || item.qualification || "")
        return itemQual === filterQual
      })
    }

    if (campus !== "all") {
      const filterCampus = campus.toLowerCase().replace(/-/g, " ")
      data = data.filter((item) => {
        const itemCampus = (item.campus || "").toLowerCase()
        const offeringType = (item.offering_type_name || "").toLowerCase()
        return itemCampus.includes(filterCampus) || offeringType.includes(filterCampus)
      })
    }

    void year

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
    const message = err instanceof Error ? err.message : "Failed to fetch faculty data"
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
