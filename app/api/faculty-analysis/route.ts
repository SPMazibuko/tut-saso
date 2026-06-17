import { NextRequest } from "next/server"

export const runtime = "edge"

interface FacultyAnalytics {
  moduleCode: string
  moduleName: string
  qualification: string
  qualificationName?: string
  qualificationCode?: string
  campus?: string
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
  // Some pages expect this field name
  qualifyReExam?: number
  absentMainExam: number
  above70: number
  failedMainExam?: number
  marksBetween50And59?: number
  marksBetween60And74?: number
  marksAbove74?: number
}

const normalize = (value: string) => value.replace(/\s+/g, "").toUpperCase()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get("year") || "2025"
    const qualification = searchParams.get("qualification") || "all"
    const campus = searchParams.get("campus") || "all"
    const moduleCode = searchParams.get("moduleCode")

    // Mock data shaped to mirror the Faculty Analysis screenshot:
    // - Modules can be offered in multiple qualifications (grouped in UI as "Multiple (n)")
    // - Includes per-qualification records so the UI can show a breakdown dialog.
    // In production, replace with a DB query.
    const mockData: FacultyAnalytics[] = [
      // COS211S offered in 2 qualifications
      {
        moduleCode: "COS211S",
        moduleName: "Data Structures and Algorithms",
        qualification: "BSC-CS",
        qualificationName: "BSc (Computer Science)",
        qualificationCode: "BSC-CS",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 152,
        totalCancellations: 5,
        validCancellations: 3,
        invalidCancellations: 2,
        activeStudents: 147,
        inactiveStudents: 5,
        passed: 126,
        qualifyMainStream: 138,
        reExam: 8,
        qualifyReExam: 8,
        absentMainExam: 0,
        above70: 48,
        failedMainExam: 13,
        marksBetween50And59: 25,
        marksBetween60And74: 53,
        marksAbove74: 48,
      },
      {
        moduleCode: "COS211S",
        moduleName: "Data Structures and Algorithms",
        qualification: "BSC-IT",
        qualificationName: "BSc (Information Technology)",
        qualificationCode: "BSC-IT",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 114,
        totalCancellations: 2,
        validCancellations: 2,
        invalidCancellations: 0,
        activeStudents: 112,
        inactiveStudents: 2,
        passed: 93,
        qualifyMainStream: 104,
        reExam: 7,
        qualifyReExam: 7,
        absentMainExam: 0,
        above70: 35,
        failedMainExam: 11,
        marksBetween50And59: 21,
        marksBetween60And74: 37,
        marksAbove74: 35,
      },

      // INF121S single qualification
      {
        moduleCode: "INF121S",
        moduleName: "Introduction to Information Systems",
        qualification: "BINF",
        qualificationName: "Bachelor of Informatics",
        qualificationCode: "BINF",
        campus: "Rundu",
        offering_type_name: "Rundu - Full Time",
        blockCode: "1",
        totalStudents: 89,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 85,
        inactiveStudents: 3,
        passed: 61,
        qualifyMainStream: 72,
        reExam: 5,
        qualifyReExam: 5,
        absentMainExam: 2,
        above70: 27,
        failedMainExam: 21,
        marksBetween50And59: 18,
        marksBetween60And74: 30,
        marksAbove74: 13,
      },

      // ENG211S offered in 3 qualifications
      {
        moduleCode: "ENG211S",
        moduleName: "Engineering Mathematics II",
        qualification: "BENG-EE",
        qualificationName: "BEng (Electrical Engineering)",
        qualificationCode: "BENG-EE",
        campus: "Ongwediva",
        offering_type_name: "Ongwediva - Full Time",
        blockCode: "1",
        totalStudents: 64,
        totalCancellations: 2,
        validCancellations: 2,
        invalidCancellations: 0,
        activeStudents: 62,
        inactiveStudents: 2,
        passed: 49,
        qualifyMainStream: 55,
        reExam: 2,
        qualifyReExam: 2,
        absentMainExam: 1,
        above70: 19,
        failedMainExam: 11,
        marksBetween50And59: 10,
        marksBetween60And74: 20,
        marksAbove74: 19,
      },
      {
        moduleCode: "ENG211S",
        moduleName: "Engineering Mathematics II",
        qualification: "BENG-CE",
        qualificationName: "BEng (Civil Engineering)",
        qualificationCode: "BENG-CE",
        campus: "Ongwediva",
        offering_type_name: "Ongwediva - Full Time",
        blockCode: "1",
        totalStudents: 58,
        totalCancellations: 2,
        validCancellations: 2,
        invalidCancellations: 0,
        activeStudents: 56,
        inactiveStudents: 2,
        passed: 42,
        qualifyMainStream: 49,
        reExam: 1,
        qualifyReExam: 1,
        absentMainExam: 1,
        above70: 16,
        failedMainExam: 13,
        marksBetween50And59: 9,
        marksBetween60And74: 17,
        marksAbove74: 16,
      },
      {
        moduleCode: "ENG211S",
        moduleName: "Engineering Mathematics II",
        qualification: "BSC-APH",
        qualificationName: "BSc (Applied Physics)",
        qualificationCode: "BSC-APH",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 47,
        totalCancellations: 1,
        validCancellations: 1,
        invalidCancellations: 0,
        activeStudents: 46,
        inactiveStudents: 1,
        passed: 37,
        qualifyMainStream: 40,
        reExam: 1,
        qualifyReExam: 1,
        absentMainExam: 1,
        above70: 15,
        failedMainExam: 8,
        marksBetween50And59: 8,
        marksBetween60And74: 14,
        marksAbove74: 15,
      },

      // BUS221S offered in 2 qualifications + a separate offering record
      {
        moduleCode: "BUS221S",
        moduleName: "Business Finance",
        qualification: "BACC",
        qualificationName: "Bachelor of Accounting",
        qualificationCode: "BACC",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 136,
        totalCancellations: 2,
        validCancellations: 2,
        invalidCancellations: 0,
        activeStudents: 134,
        inactiveStudents: 2,
        passed: 112,
        qualifyMainStream: 125,
        reExam: 2,
        qualifyReExam: 2,
        absentMainExam: 0,
        above70: 44,
        failedMainExam: 12,
        marksBetween50And59: 22,
        marksBetween60And74: 46,
        marksAbove74: 44,
      },
      {
        moduleCode: "BUS221S",
        moduleName: "Business Finance",
        qualification: "BBA",
        qualificationName: "Bachelor of Business Administration",
        qualificationCode: "BBA",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 102,
        totalCancellations: 1,
        validCancellations: 1,
        invalidCancellations: 0,
        activeStudents: 101,
        inactiveStudents: 1,
        passed: 82,
        qualifyMainStream: 91,
        reExam: 3,
        qualifyReExam: 3,
        absentMainExam: 0,
        above70: 33,
        failedMainExam: 12,
        marksBetween50And59: 18,
        marksBetween60And74: 31,
        marksAbove74: 33,
      },
      // Separate offering (different offering_type_name)
      {
        moduleCode: "BUS221S",
        moduleName: "Business Finance",
        qualification: "BACC",
        qualificationName: "Bachelor of Accounting",
        qualificationCode: "BACC",
        campus: "Oshakati",
        offering_type_name: "Oshakati - Part Time",
        blockCode: "1",
        totalStudents: 9,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 9,
        inactiveStudents: 0,
        passed: 8,
        qualifyMainStream: 8,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 0,
        above70: 2,
        failedMainExam: 1,
        marksBetween50And59: 2,
        marksBetween60And74: 4,
        marksAbove74: 2,
      },

      // LAW211S offered in 2 qualifications
      {
        moduleCode: "LAW211S",
        moduleName: "Constitutional Law",
        qualification: "LLB",
        qualificationName: "Bachelor of Laws",
        qualificationCode: "LLB",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 124,
        totalCancellations: 3,
        validCancellations: 3,
        invalidCancellations: 0,
        activeStudents: 121,
        inactiveStudents: 3,
        passed: 97,
        qualifyMainStream: 110,
        reExam: 11,
        qualifyReExam: 11,
        absentMainExam: 0,
        above70: 29,
        failedMainExam: 16,
        marksBetween50And59: 22,
        marksBetween60And74: 46,
        marksAbove74: 29,
      },
      {
        moduleCode: "LAW211S",
        moduleName: "Constitutional Law",
        qualification: "BJC",
        qualificationName: "Bachelor of Criminal Justice",
        qualificationCode: "BJC",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 86,
        totalCancellations: 2,
        validCancellations: 2,
        invalidCancellations: 0,
        activeStudents: 84,
        inactiveStudents: 2,
        passed: 66,
        qualifyMainStream: 76,
        reExam: 8,
        qualifyReExam: 8,
        absentMainExam: 0,
        above70: 20,
        failedMainExam: 12,
        marksBetween50And59: 16,
        marksBetween60And74: 30,
        marksAbove74: 20,
      },
      // Evening offering
      {
        moduleCode: "LAW211S",
        moduleName: "Constitutional Law",
        qualification: "LLB",
        qualificationName: "Bachelor of Laws",
        qualificationCode: "LLB",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Evening",
        blockCode: "1",
        totalStudents: 18,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 18,
        inactiveStudents: 0,
        passed: 15,
        qualifyMainStream: 16,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 1,
        above70: 5,
        failedMainExam: 2,
        marksBetween50And59: 4,
        marksBetween60And74: 6,
        marksAbove74: 5,
      },
      {
        moduleCode: "LAW211S",
        moduleName: "Constitutional Law",
        qualification: "BJC",
        qualificationName: "Bachelor of Criminal Justice",
        qualificationCode: "BJC",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Evening",
        blockCode: "1",
        totalStudents: 16,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 16,
        inactiveStudents: 0,
        passed: 13,
        qualifyMainStream: 14,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 1,
        above70: 4,
        failedMainExam: 1,
        marksBetween50And59: 4,
        marksBetween60And74: 5,
        marksAbove74: 4,
      },

      // NUR221S offered in 2 qualifications
      {
        moduleCode: "NUR221S",
        moduleName: "Adult Health Nursing",
        qualification: "BNUR",
        qualificationName: "Bachelor of Nursing Science",
        qualificationCode: "BNUR",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 94,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 94,
        inactiveStudents: 0,
        passed: 79,
        qualifyMainStream: 86,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 0,
        above70: 30,
        failedMainExam: 9,
        marksBetween50And59: 18,
        marksBetween60And74: 31,
        marksAbove74: 30,
      },
      {
        moduleCode: "NUR221S",
        moduleName: "Adult Health Nursing",
        qualification: "BDPH",
        qualificationName: "Bachelor of Public Health",
        qualificationCode: "BDPH",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 52,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 52,
        inactiveStudents: 0,
        passed: 40,
        qualifyMainStream: 47,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 0,
        above70: 16,
        failedMainExam: 8,
        marksBetween50And59: 10,
        marksBetween60And74: 14,
        marksAbove74: 16,
      },

      // EDU212S offered in 2 qualifications
      {
        moduleCode: "EDU212S",
        moduleName: "Curriculum Studies",
        qualification: "BED-SEC",
        qualificationName: "Bachelor of Education (Secondary)",
        qualificationCode: "BED-SEC",
        campus: "Katima Mulilo",
        offering_type_name: "Katima Mulilo - Full Time",
        blockCode: "1",
        totalStudents: 88,
        totalCancellations: 6,
        validCancellations: 9,
        invalidCancellations: 1,
        activeStudents: 82,
        inactiveStudents: 6,
        passed: 68,
        qualifyMainStream: 76,
        reExam: 1,
        qualifyReExam: 1,
        absentMainExam: 0,
        above70: 26,
        failedMainExam: 10,
        marksBetween50And59: 16,
        marksBetween60And74: 26,
        marksAbove74: 26,
      },
      {
        moduleCode: "EDU212S",
        moduleName: "Curriculum Studies",
        qualification: "BED-PRI",
        qualificationName: "Bachelor of Education (Primary)",
        qualificationCode: "BED-PRI",
        campus: "Katima Mulilo",
        offering_type_name: "Katima Mulilo - Full Time",
        blockCode: "1",
        totalStudents: 74,
        totalCancellations: 4,
        validCancellations: 3,
        invalidCancellations: 1,
        activeStudents: 70,
        inactiveStudents: 4,
        passed: 55,
        qualifyMainStream: 64,
        reExam: 2,
        qualifyReExam: 2,
        absentMainExam: 0,
        above70: 19,
        failedMainExam: 12,
        marksBetween50And59: 15,
        marksBetween60And74: 21,
        marksAbove74: 19,
      },

      // INF321S offered in 2 qualifications
      {
        moduleCode: "INF321S",
        moduleName: "Enterprise Systems",
        qualification: "BINF",
        qualificationName: "Bachelor of Informatics",
        qualificationCode: "BINF",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 68,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 68,
        inactiveStudents: 0,
        passed: 61,
        qualifyMainStream: 64,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 0,
        above70: 24,
        failedMainExam: 6,
        marksBetween50And59: 12,
        marksBetween60And74: 25,
        marksAbove74: 24,
      },
      {
        moduleCode: "INF321S",
        moduleName: "Enterprise Systems",
        qualification: "BSC-IT",
        qualificationName: "BSc (Information Technology)",
        qualificationCode: "BSC-IT",
        campus: "Windhoek",
        offering_type_name: "Windhoek - Full Time",
        blockCode: "1",
        totalStudents: 54,
        totalCancellations: 0,
        validCancellations: 0,
        invalidCancellations: 0,
        activeStudents: 54,
        inactiveStudents: 0,
        passed: 47,
        qualifyMainStream: 50,
        reExam: 0,
        qualifyReExam: 0,
        absentMainExam: 0,
        above70: 18,
        failedMainExam: 5,
        marksBetween50And59: 10,
        marksBetween60And74: 19,
        marksAbove74: 18,
      },
    ]

    let data = mockData

    // Filter by moduleCode (case-insensitive, trimmed) if provided.
    if (moduleCode && moduleCode.trim() !== "") {
      const filterCode = normalize(moduleCode.trim())
      data = data.filter((item) => normalize(item.moduleCode) === filterCode)
    }

    // Filter by qualification if not "all"
    if (qualification !== "all") {
      const filterQual = normalize(qualification)
      data = data.filter((item) => {
        const itemQual = normalize(item.qualificationCode || item.qualification || "")
        return itemQual === filterQual
      })
    }

    // Filter by campus if not "all"
    if (campus !== "all") {
      const filterCampus = campus.toLowerCase()
      data = data.filter((item) => {
        const itemCampus = (item.campus || "").toLowerCase()
        const offeringType = (item.offering_type_name || "").toLowerCase()
        return itemCampus.includes(filterCampus) || offeringType.includes(filterCampus)
      })
    }

    // Note: `year` is accepted to match UI query params.
    // This mock API does not vary by year yet.
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
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message ?? "Failed to fetch faculty data",
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

