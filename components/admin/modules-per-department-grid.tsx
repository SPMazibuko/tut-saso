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

// Mock data aligned to University of Namibia offerings
const departmentsData: DepartmentData[] = [
  {
    name: "Computer Science",
    totalModules: 18,
    byYear: {
      year1: {
        total: 9,
        yearCount: 2,
        yearModules: [
          { code: "UNAM101" },
          { code: "ACS101S" },
        ],
        semester1: [{ code: "COS111S" }, { code: "MAT111S" }, { code: "NIS111S" }, { code: "ENG101S" }],
        semester2: [{ code: "COS121S" }, { code: "DAT121S" }, { code: "STA121S" }],
      },
      year2: {
        total: 9,
        yearCount: 2,
        yearModules: [{ code: "COS201S" }, { code: "CMP202S" }],
        semester1: [{ code: "DSA211S" }, { code: "DBS211S" }, { code: "SEN211S" }],
        semester2: [{ code: "OOP221S" }, { code: "WEB221S" }, { code: "NWT221S" }],
      },
    },
  },
  {
    name: "Informatics",
    totalModules: 16,
    byYear: {
      year1: {
        total: 8,
        yearCount: 1,
        yearModules: [{ code: "INF100Y" }],
        semester1: [{ code: "INF111S" }, { code: "BIS111S" }, { code: "ACC111S" }],
        semester2: [{ code: "INF121S" }, { code: "BIS121S" }, { code: "ECO121S" }],
      },
      year2: {
        total: 8,
        semester1: [{ code: "INF211S" }, { code: "BIS211S" }, { code: "PMT211S" }],
        semester2: [{ code: "INF221S" }, { code: "ERP221S" }, { code: "SYS221S" }],
        bothSemesters: [{ code: "WIL200Y" }, { code: "RES200Y" }],
      },
    },
  },
  {
    name: "Electrical and Computer Engineering",
    totalModules: 14,
    byYear: {
      year1: {
        total: 7,
        semester1: [{ code: "ECE111S" }, { code: "PHY111S" }, { code: "MAT111S" }],
        semester2: [{ code: "ECE121S" }, { code: "CIR121S" }, { code: "PRG121S" }],
        bothSemesters: [{ code: "ENG100Y" }],
      },
      year2: {
        total: 7,
        semester1: [{ code: "ECE211S" }, { code: "DIG211S" }, { code: "MAT211S" }],
        semester2: [{ code: "ECE221S" }, { code: "MIC221S" }, { code: "SIG221S" }],
        bothSemesters: [{ code: "LAB200Y" }],
      },
    },
  },
  {
    name: "Accounting and Finance",
    totalModules: 12,
    byYear: {
      year1: {
        total: 6,
        yearCount: 2,
        yearModules: [{ code: "ACC100Y" }, { code: "ECO100Y" }],
        semester1: [{ code: "ACC111S" }, { code: "BUS111S" }],
        semester2: [{ code: "ACC121S" }, { code: "FIN121S" }],
        bothSemesters: [],
      },
      year2: {
        total: 6,
        semester1: [{ code: "ACC211S" }, { code: "FIN211S" }, { code: "TAX211S" }],
        semester2: [{ code: "ACC221S" }, { code: "FIN221S" }, { code: "AUD221S" }],
      },
    },
  },
  {
    name: "Nursing Science",
    totalModules: 11,
    byYear: {
      year1: {
        total: 6,
        yearCount: 1,
        yearModules: [
          { code: "NUR100Y" },
        ],
        semester1: [{ code: "ANA111S" }, { code: "NUR111S" }, { code: "COM111S" }],
        semester2: [{ code: "NUR121S" }, { code: "HSC121S" }],
      },
      year2: {
        total: 5,
        semester1: [{ code: "NUR211S" }, { code: "PHM211S" }],
        semester2: [{ code: "NUR221S" }, { code: "CHN221S" }],
        bothSemesters: [{ code: "CLN200Y" }],
      },
    },
  },
  {
    name: "Education",
    totalModules: 10,
    byYear: {
      year1: {
        total: 5,
        semester1: [{ code: "EDU111S" }, { code: "PSY111S" }],
        semester2: [{ code: "CUR121S" }, { code: "ICT121S" }],
        bothSemesters: [{ code: "PRC100Y" }],
      },
      year2: {
        total: 5,
        semester1: [{ code: "EDU211S" }, { code: "ASM211S" }],
        semester2: [{ code: "INC221S" }, { code: "CUR221S" }],
        bothSemesters: [{ code: "PRC200Y" }],
      },
    },
  },
  {
    name: "Law",
    totalModules: 8,
    byYear: {
      year1: {
        total: 4,
        semester1: [{ code: "LAW111S" }, { code: "PBL111S" }],
        semester2: [{ code: "LAW121S" }, { code: "LTC121S" }],
      },
      year2: {
        total: 4,
        semester1: [{ code: "LAW211S" }, { code: "LAW212S" }],
        semester2: [{ code: "LAW221S" }, { code: "LAW222S" }],
      },
    },
  },
  {
    name: "Humanities and Social Sciences",
    totalModules: 8,
    byYear: {
      year1: {
        total: 4,
        semester1: [{ code: "SOC111S" }, { code: "HIS111S" }],
        semester2: [{ code: "SOC121S" }, { code: "HIS121S" }],
      },
      year2: {
        total: 4,
        semester1: [{ code: "SOC211S" }, { code: "PSY211S" }],
        semester2: [{ code: "SOC221S" }, { code: "HIS221S" }],
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
