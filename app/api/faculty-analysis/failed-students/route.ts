import { NextRequest } from "next/server"

export const runtime = "edge"

interface FailedStudent {
  id: string
  studentNumber: string
  studentName: string | null
  moduleCode: string
  moduleName: string | null
  qualification: string | null
  qualificationName: string | null
  campus: string | null
  offering_type_name?: string
  fullMark: number | null
  finalMark: number | null
  examMark: number | null
  result: string | null
  academicYear: number | null
}

const normalize = (value: string) => value.replace(/\s+/g, "").toUpperCase()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const qualification = searchParams.get("qualification") || "all"
    const campus = searchParams.get("campus") || "all"

    const mockData: FailedStudent[] = [
      {
        id: "1",
        studentNumber: "STU001",
        studentName: "John Doe",
        moduleCode: "CS101",
        moduleName: "Introduction to Programming",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
        campus: "Capetown",
        offering_type_name: "Capetown - Full Time",
        fullMark: 100,
        finalMark: 45,
        examMark: 40,
        result: "F",
        academicYear: parseInt(year, 10),
      },
      {
        id: "2",
        studentNumber: "STU002",
        studentName: "Jane Smith",
        moduleCode: "CS101",
        moduleName: "Introduction to Programming",
        qualification: "DPIT20",
        qualificationName: "Dip (Information Technology)",
        campus: "Stellenbosch",
        offering_type_name: "Stellenbosch - Full Time",
        fullMark: 100,
        finalMark: 38,
        examMark: 35,
        result: "FA",
        academicYear: parseInt(year, 10),
      },
      {
        id: "3",
        studentNumber: "STU003",
        studentName: "Bob Johnson",
        moduleCode: "ENG150",
        moduleName: "Engineering Fundamentals",
        qualification: "DPYEF0",
        qualificationName: "Dip (Computer Systems Engineering Extended)",
        campus: "Stellenbosch",
        offering_type_name: "Stellenbosch - Extended",
        fullMark: 100,
        finalMark: 42,
        examMark: 38,
        result: "FR",
        academicYear: parseInt(year, 10),
      },
      {
        id: "4",
        studentNumber: "STU004",
        studentName: "Alice Williams",
        moduleCode: "DB201",
        moduleName: "Database Systems",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
          campus: "Durban",
        offering_type_name: "Durban - Full Time",
        fullMark: 100,
        finalMark: 48,
        examMark: 43,
        result: "F",
        academicYear: parseInt(year, 10),
      },
    ]

    let data = mockData

    if (qualification !== "all") {
      const filterQual = normalize(qualification)
      data = data.filter((item) => {
        const itemQual = normalize(item.qualification || "")
        return itemQual === filterQual || itemQual.includes(filterQual) || filterQual.includes(itemQual)
      })
    }

    if (campus !== "all") {
      const filterCampus = campus.toLowerCase()
      data = data.filter((item) => {
        const itemCampus = (item.campus || "").toLowerCase()
        const offeringType = (item.offering_type_name || "").toLowerCase()
        return itemCampus.includes(filterCampus) || offeringType.includes(filterCampus)
      })
    }

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
        error: err?.message ?? "Failed to fetch failed students",
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

