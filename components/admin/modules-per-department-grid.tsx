"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ModuleData = {
  code: string
  name?: string
}

type YearBucket = {
  total: number
  yearCount?: number
  yearModules?: ModuleData[]
  semester1?: ModuleData[]
  semester2?: ModuleData[]
  bothSemesters?: ModuleData[]
  emptyText?: string
}

type DepartmentData = {
  name: string
  totalModules: number
  byYear: Record<"year1" | "year2", YearBucket>
}

const yearRows: Array<{ key: "year1" | "year2"; label: string }> = [
  { key: "year1", label: "1st Year" },
  { key: "year2", label: "2nd Year" },
]

// Mock data aligned to TUT SASO ICT offerings (saso-system.vercel.app)
const departmentsData: DepartmentData[] = [
  {
    name: "Computer Science",
    totalModules: 33,
    byYear: {
      year1: {
        total: 6,
        semester1: [{ code: "CFA115D", name: "COMPUTING FUNDAMENTALS A" }],
        semester2: [
          { code: "CFB115D", name: "COMPUTING FUNDAMENTALS B" },
          { code: "DCT115D", name: "DISCRETE STRUCTURES" },
          { code: "WEB115D", name: "WEB COMPUTING" },
        ],
        bothSemesters: [{ code: "PPA115D", name: "PRINCIPLES OF PROGRAMMING A" }],
      },
      year2: {
        total: 10,
        semester1: [
          { code: "CAO216D", name: "COMPUTER ARCHITECTURE AND ORGANISATION" },
          { code: "DTP216D", name: "DATABASE PRINCIPLES" },
          { code: "MTE216D", name: "MULTIMEDIA TECHNOLOGY" },
        ],
        semester2: [
          { code: "AOP216D", name: "ADVANCED OBJECT-ORIENTED PROGRAMMING" },
          { code: "ISC216D", name: "INFORMATION SECURITY" },
          { code: "ORS216D", name: "OPERATING SYSTEMS" },
        ],
        bothSemesters: [{ code: "PPBF15D", name: "PRINCIPLES OF PROGRAMMING B" }],
      },
    },
  },
  {
    name: "Informatics",
    totalModules: 22,
    byYear: {
      year1: {
        total: 6,
        semester1: [{ code: "COH115D", name: "COMPUTATIONAL MATHEMATICS" }],
        semester2: [
          { code: "BCM115D", name: "BUSINESS COST MANAGEMENT" },
          { code: "BFS115D", name: "BUSINESS FUNDAMENTALS" },
          { code: "CGB115D", name: "COMPUTING FUNDAMENTALS B" },
        ],
        bothSemesters: [{ code: "PPB115D", name: "PRINCIPLES OF PROGRAMMING B" }],
      },
      year2: {
        total: 5,
        semester1: [
          { code: "BUA216D", name: "BUSINESS ANALYSIS A" },
          { code: "SYA216D", name: "SYSTEM ANALYSIS A" },
        ],
        semester2: [
          { code: "BCMF15D", name: "BUSINESS COST MANAGEMENT" },
          { code: "BFSF15D", name: "BUSINESS FUNDAMENTALS" },
        ],
      },
    },
  },
  {
    name: "Computer Systems Engineering",
    totalModules: 41,
    byYear: {
      year1: {
        total: 15,
        semester1: [
          { code: "DE1115D", name: "DIGITAL ELECTRONICS 115" },
          { code: "EIP115D", name: "ELECTRICAL PRINCIPLES 115" },
          { code: "EL1115D", name: "ELECTRONICS 115" },
          { code: "PG1115D", name: "PROGRAMMING 115" },
        ],
        semester2: [
          { code: "DE2116D", name: "DIGITAL ELECTRONICS 126" },
          { code: "NWS115D", name: "NETWORK SYSTEMS 125" },
          { code: "PG2116D", name: "PROGRAMMING 126" },
        ],
      },
      year2: {
        total: 9,
        semester1: [{ code: "DAB215D", name: "DATABASES 215" }],
        semester2: [{ code: "LOD216D", name: "LOGIC DESIGN 226" }],
        bothSemesters: [
          { code: "DE2F06D", name: "DIGITAL ELECTRONICS 126" },
          { code: "PG2F06D", name: "PROGRAMMING 126" },
        ],
      },
    },
  },
  {
    name: "Information Technology",
    totalModules: 22,
    byYear: {
      year1: {
        total: 5,
        semester1: [
          { code: "CHO115D", name: "COMPUTATIONAL MATHEMATICS" },
          { code: "CN1115D", name: "COMPUTER NETWORKS 115R" },
        ],
        bothSemesters: [{ code: "TRO115D", name: "INTRODUCTION TO PROGRAMMING 115R" }],
      },
      year2: {
        total: 6,
        semester1: [{ code: "DSMF16D", name: "DISCRETE MATHEMATICS 115R" }],
        semester2: [
          { code: "CN2115D", name: "COMPUTER NETWORKS 125R" },
          { code: "VMA216D", name: "VISUAL MULTIMEDIA APPLICATIONS" },
        ],
        bothSemesters: [{ code: "PPGF15D", name: "PRINCIPLES OF PROGRAMMING 125R" }],
      },
    },
  },
]

function ModuleChips({ modules }: { modules: ModuleData[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {modules.map((m) => (
        <span
          key={m.code}
          className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/25 dark:bg-primary/20 dark:text-primary-foreground/90"
        >
          {m.code}
        </span>
      ))}
    </div>
  )
}

function YearBucketCell({ bucket }: { bucket: YearBucket }) {
  if (!bucket.total) {
    return <div className="text-sm text-muted-foreground">{bucket.emptyText ?? "No modules in this year"}</div>
  }

  const s1 = bucket.semester1 ?? []
  const s2 = bucket.semester2 ?? []
  const both = bucket.bothSemesters ?? []
  const yearMods = bucket.yearModules ?? []

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-foreground">Number of Modules: {bucket.total}</div>

      {typeof bucket.yearCount === "number" && (
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Year: {bucket.yearCount}</div>
          {yearMods.length > 0 && <ModuleChips modules={yearMods} />}
        </div>
      )}

      <div className="space-y-2">
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Semester 1: {s1.length}</div>
          {s1.length > 0 && <ModuleChips modules={s1} />}
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Semester 2: {s2.length}</div>
          {s2.length > 0 && <ModuleChips modules={s2} />}
        </div>

        {both.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Both Semester 1 and Semester 2: {both.length}</div>
            <ModuleChips modules={both} />
          </div>
        )}
      </div>
    </div>
  )
}

export function ModulesPerDepartmentGrid() {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-lg font-semibold text-foreground">Modules Per Department</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          <table className="min-w-[1200px] w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              <tr className="border-b border-border/60">
                <th className="sticky left-0 z-20 min-w-[160px] bg-card/95 backdrop-blur p-4 text-left text-sm font-semibold text-foreground border-b border-border/60">
                  Year
                </th>
                {departmentsData.map((dept) => (
                  <th
                    key={dept.name}
                    className="min-w-[240px] p-4 text-center text-sm font-semibold text-foreground border-b border-border/60"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{dept.name}</div>
                      <div className="text-xs text-muted-foreground">Total Modules: {dept.totalModules}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yearRows.map((row) => (
                <tr key={row.key} className="border-b border-border/60">
                  <td className="sticky left-0 z-10 bg-card/95 backdrop-blur p-4 align-top font-semibold text-foreground border-b border-border/60">
                    {row.label}
                  </td>
                  {departmentsData.map((dept) => (
                    <td key={`${row.key}-${dept.name}`} className="p-4 align-top text-center border-b border-border/60">
                      <YearBucketCell bucket={dept.byYear[row.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
