import { NextRequest } from "next/server"

export const runtime = "edge"

interface SchoolAnalytics {
  subjectCode: string
  subjectName: string
  qualification: string
  qualificationName?: string
  qualificationCode?: string
  school?: string
  offering_type_name?: string
  blockCode?: string
  totalStudents: number
  totalCancellations: number
  validCancellations: number
  invalidCancellations: number
  activeStudents: number
  inactiveStudents: number
  passed: number
  qualifyMainStream: number
  reExam: number
  absentMainExam: number
  above70: number
  failed?: number
  failedMainExam?: number
  marksBetween50And59?: number
  marksBetween60And74?: number
  marksAbove74?: number
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const qualification = searchParams.get("qualification") || "all"
    const school = searchParams.get("school") || "all"
    const subjectCode = searchParams.get("subjectCode")

    // Mock data for testing
    // In production, this would fetch from your database
    const mockData: SchoolAnalytics[] = [
      {
        subjectCode: "MATH",
        subjectName: "Mathematics",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
        qualificationCode: "DPRS20",
        school: "Capetown",
        offering_type_name: "Capetown - Full Time",
        blockCode: "1",
        totalStudents: 120,
        totalCancellations: 15,
        validCancellations: 12,
        invalidCancellations: 3,
        activeStudents: 105,
        inactiveStudents: 0,
        passed: 85,
        qualifyMainStream: 82,
        reExam: 8,
        absentMainExam: 7,
        above70: 65,
        failed: 13,
        failedMainExam: 13,
        marksBetween50And59: 20,
        marksBetween60And74: 45,
        marksAbove74: 20,
      },
      {
        subjectCode: "PHY",
        subjectName: "Physical Sciences",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
        qualificationCode: "DPRS20",
        school: "Stellenbosch",
        offering_type_name: "Stellenbosch - Full Time",
        blockCode: "1",
        totalStudents: 95,
        totalCancellations: 8,
        validCancellations: 7,
        invalidCancellations: 1,
        activeStudents: 87,
        inactiveStudents: 0,
        passed: 72,
        qualifyMainStream: 70,
        reExam: 5,
        absentMainExam: 3,
        above70: 55,
        failed: 10,
        failedMainExam: 10,
        marksBetween50And59: 17,
        marksBetween60And74: 40,
        marksAbove74: 15,
      },
      {
        subjectCode: "ECO",
        subjectName: "Economics",
        qualification: "DPIT20",
        qualificationName: "Dip (Information Technology)",
        qualificationCode: "DPIT20",
          school: "Durban",
        offering_type_name: "Durban - Full Time",
        blockCode: "1",
        totalStudents: 150,
        totalCancellations: 20,
        validCancellations: 18,
        invalidCancellations: 2,
        activeStudents: 130,
        inactiveStudents: 0,
        passed: 110,
        qualifyMainStream: 108,
        reExam: 10,
        absentMainExam: 10,
        above70: 85,
        failed: 10,
        failedMainExam: 10,
        marksBetween50And59: 25,
        marksBetween60And74: 60,
        marksAbove74: 25,
      },
      {
        subjectCode: "CS301",
        subjectName: "Advanced Programming",
        qualification: "DPRS20",
        qualificationName: "Dip (Computer Science)",
        qualificationCode: "DPRS20",
        school: "Capetown",
        offering_type_name: "Capetown - Full Time",
        blockCode: "1",
        totalStudents: 80,
        totalCancellations: 5,
        validCancellations: 4,
        invalidCancellations: 1,
        activeStudents: 75,
        inactiveStudents: 0,
        passed: 68,
        qualifyMainStream: 65,
        reExam: 2,
        absentMainExam: 5,
        above70: 50,
        failed: 2,
        failedMainExam: 2,
        marksBetween50And59: 18,
        marksBetween60And74: 35,
        marksAbove74: 15,
      },
      {
        subjectCode: "MATH101",
        subjectName: "Mathematics I",
        qualification: "DPYEF0",
        qualificationName: "Dip (Computer Systems Engineering Extended)",
        qualificationCode: "DPYEF0",
        school: "Stellenbosch",
        offering_type_name: "Stellenbosch - Extended",
        blockCode: "1",
        totalStudents: 110,
        totalCancellations: 18,
        validCancellations: 15,
        invalidCancellations: 3,
        activeStudents: 92,
        inactiveStudents: 0,
        passed: 70,
        qualifyMainStream: 68,
        reExam: 12,
        absentMainExam: 10,
        above70: 45,
        failed: 12,
        failedMainExam: 12,
        marksBetween50And59: 25,
        marksBetween60And74: 35,
        marksAbove74: 10,
      },
    ]

    // Filter by subjectCode if provided
    let data = mockData
    if (subjectCode) {
      data = mockData.filter(item => item.subjectCode === subjectCode)
    }

    // Filter by qualification if not "all"
    if (qualification !== "all") {
      data = data.filter(item => {
        const itemQual = (item.qualificationCode || item.qualification || "").replace(/\s+/g, "").toUpperCase()
        const filterQual = qualification.replace(/\s+/g, "").toUpperCase()
        return itemQual === filterQual
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
        error: err?.message ?? "Failed to fetch school data",
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

