import type { GeneratedReport, ReportSpec } from "./types"
import { mockStudents, mockAlerts, mockRiskFactors, mockInterventions } from "./mock-data"

let reportSpecs: ReportSpec[] = [
  { id: "r1", name: "DHET Quarterly Performance", audience: "dhet", format: "csv", scheduleCron: "0 0 1 */3 *" },
  { id: "r2", name: "Umalusi Accreditation Summary", audience: "umalusi", format: "pdf" },
]

const generated: GeneratedReport[] = []

export function listReportSpecs(): ReportSpec[] {
  return reportSpecs
}

export function addReportSpec(spec: ReportSpec): void {
  reportSpecs = [spec, ...reportSpecs]
}

// Utilities
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes("\"") || str.includes(",") || str.includes("\n")) {
    return `"${str.replaceAll("\"", "\"\"")}` + `"`
  }
  return str
}

function toCSV(headers: string[], rows: Array<Array<unknown>>): string {
  const head = headers.map(csvEscape).join(",")
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\n")
  return [head, body].filter(Boolean).join("\n")
}

// Builders per audience
function buildDHETCSV(): string {
  const headers = [
    "studentId",
    "name",
    "grade",
    "attendanceRate",
    "aps",
    "riskLevel",
    "riskScore",
    "lastAssessment",
  ]
  const rows = mockStudents.map((s) => [
    s.studentId,
    s.name,
    s.grade,
    s.attendanceRate,
    s.aps,
    s.riskLevel,
    s.riskScore,
    s.lastAssessment.toISOString(),
  ])
  return toCSV(headers, rows)
}

function buildUmalusiCSV(): string {
  const total = mockStudents.length
  const low = mockStudents.filter((s) => s.riskLevel === "low").length
  const medium = mockStudents.filter((s) => s.riskLevel === "medium").length
  const high = mockStudents.filter((s) => s.riskLevel === "high").length
  const critical = mockStudents.filter((s) => s.riskLevel === "critical").length
  const headers = [
    "metric",
    "value",
  ]
  const rows: Array<Array<unknown>> = [
    ["totalStudents", total],
    ["risk.low", low],
    ["risk.medium", medium],
    ["risk.high", high],
    ["risk.critical", critical],
    ["alerts.total", mockAlerts.length],
    ["riskFactors.total", mockRiskFactors.length],
    ["interventions.total", mockInterventions.length],
  ]
  return toCSV(headers, rows)
}

function buildJSON(audience: ReportSpec["audience"]): string {
  if (audience === "dhet") {
    return JSON.stringify(
      mockStudents.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        grade: s.grade,
        attendanceRate: s.attendanceRate,
        aps: s.aps,
        riskLevel: s.riskLevel,
        riskScore: s.riskScore,
        lastAssessment: s.lastAssessment,
      })),
      null,
      2,
    )
  }
  if (audience === "umalusi") {
    const summary = {
      totals: {
        students: mockStudents.length,
        alerts: mockAlerts.length,
        riskFactors: mockRiskFactors.length,
        interventions: mockInterventions.length,
      },
      distribution: mockStudents.reduce(
        (acc, s) => {
          acc[s.riskLevel]++
          return acc
        },
        { low: 0, medium: 0, high: 0, critical: 0 } as Record<string, number>,
      ),
    }
    return JSON.stringify(summary, null, 2)
  }
  // default: pass-through for internal audiences
  return JSON.stringify({ students: mockStudents }, null, 2)
}

export function buildReportContent(
  specId: string,
  overrideFormat?: "csv" | "json",
): { filename: string; mime: string; content: string } {
  const spec = reportSpecs.find((s) => s.id === specId)
  if (!spec) {
    throw new Error("Report spec not found")
  }
  const format = overrideFormat ?? (spec.format === "xlsx" ? "csv" : spec.format === "pdf" ? "csv" : spec.format)
  if (format !== "csv" && format !== "json") {
    throw new Error("Unsupported format")
  }

  if (format === "csv") {
    const csv = spec.audience === "dhet" ? buildDHETCSV() : buildUmalusiCSV()
    return {
      filename: `${spec.audience}-${Date.now()}.csv`,
      mime: "text/csv; charset=utf-8",
      content: csv,
    }
  }

  const json = buildJSON(spec.audience)
  return {
    filename: `${spec.audience}-${Date.now()}.json`,
    mime: "application/json; charset=utf-8",
    content: json,
  }
}

export function generateReport(specId: string): GeneratedReport {
  const report: GeneratedReport = {
    id: `gen-${Date.now()}`,
    specId,
    generatedAt: new Date(),
    location: `/api/reports?specId=${encodeURIComponent(specId)}`,
  }
  generated.unshift(report)
  return report
}

export function listGeneratedReports(): GeneratedReport[] {
  return generated
}

