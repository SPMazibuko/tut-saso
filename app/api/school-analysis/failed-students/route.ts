import { NextRequest } from "next/server"

export const runtime = "edge"

interface FailedStudent {
  id: string
  studentNumber: string
  studentName: string | null
  subjectCode: string
  subjectName: string | null
  qualification: string | null
  qualificationName: string | null
  qualificationCode?: string
  school: string | null
  offering_type_name?: string
  fullMark: number | null
  finalMark: number | null
  examMark: number | null
  result: string | null
  academicYear: number | null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const qualification = searchParams.get("qualification") || "all"
    const school = searchParams.get("school") || "all"

    // Mock data for testing
    // In production, this would fetch from your database
    const mockData: FailedStudent[] = [
      {
        id: "1",
        studentNumber: "STU001",
        studentName: "John Doe",
        subjectCode: "MATH",
        subjectName: "Mathematics",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
        school: "Capetown",
        offering_type_name: "Capetown - Full Time",
        fullMark: 100,
        finalMark: 45,
        examMark: 40,
        result: "F",
        academicYear: parseInt(year),
      },
      {
        id: "2",
        studentNumber: "STU002",
        studentName: "Jane Smith",
        subjectCode: "PHY",
        subjectName: "Physical Sciences",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
        school: "Stellenbosch",
        offering_type_name: "Stellenbosch - Full Time",
        fullMark: 100,
        finalMark: 38,
        examMark: 35,
        result: "FA",
        academicYear: parseInt(year),
      },
      {
        id: "3",
        studentNumber: "STU003",
        studentName: "Bob Johnson",
        subjectCode: "MATH",
        subjectName: "Mathematics",
        qualification: "DPYEF0",
        qualificationName: "Dip (Computer Systems Engineering Extended)",
        school: "Stellenbosch",
        offering_type_name: "Stellenbosch - Extended",
        fullMark: 100,
        finalMark: 42,
        examMark: 38,
        result: "FR",
        academicYear: parseInt(year),
      },
      {
        id: "4",
        studentNumber: "STU004",
        studentName: "Alice Williams",
        subjectCode: "ECO",
        subjectName: "Economics",
        qualification: "DPIT20",
        qualificationName: "Dip (Information Technology)",
        school: "Durban",
        offering_type_name: "Durban - Full Time",
        fullMark: 100,
        finalMark: 48,
        examMark: 43,
        result: "F",
        academicYear: parseInt(year),
      },
    ]

    // Filter by qualification if not "all"
    let data = mockData
    if (qualification !== "all") {
      data = data.filter(item => {
        const itemQual = (item.qualification || "").replace(/\s+/g, "").toUpperCase()
        const filterQual = qualification.replace(/\s+/g, "").toUpperCase()
        return itemQual === filterQual || itemQual.includes(filterQual) || filterQual.includes(itemQual)
      })
    }

    // Filter by school if not "all"
    if (school !== "all") {
      data = data.filter(item => {
        const itemSchool = (item.school || "").toLowerCase()
        const offeringType = (item.offering_type_name || "").toLowerCase()
        return itemSchool.includes(school.toLowerCase()) || offeringType.includes(school.toLowerCase())
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

