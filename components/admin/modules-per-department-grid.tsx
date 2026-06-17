"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSasoDepartmentGridData, type SasoModuleRef, type SasoYearBucket } from "@/lib/saso-modules-per-department"

const departmentsData = getSasoDepartmentGridData()

const yearRows: Array<{ key: keyof (typeof departmentsData)[number]["byYear"]; label: string }> = [
  { key: "year1", label: "1st Year" },
  { key: "year2", label: "2nd Year" },
  { key: "year3", label: "3rd Year" },
  { key: "year4", label: "4th Year" },
]

function ModuleChips({ modules }: { modules: SasoModuleRef[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {modules.map((m) => (
        <span
          key={m.code}
          className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/25 dark:bg-primary/20 dark:text-primary-foreground/90"
          title={m.name}
        >
          {m.code}
        </span>
      ))}
    </div>
  )
}

function YearBucketCell({ bucket }: { bucket: SasoYearBucket }) {
  if (!bucket.total) {
    return <div className="text-sm text-muted-foreground">No modules in this year</div>
  }

  const s1 = bucket.semester1 ?? []
  const s2 = bucket.semester2 ?? []
  const both = bucket.bothSemesters ?? []
  const yearMods = bucket.yearModules ?? []
  const unknown = bucket.unknownSemester ?? []

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-foreground">Number of Modules: {bucket.total}</div>

      {yearMods.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Year: {yearMods.length}</div>
          <ModuleChips modules={yearMods} />
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

        {unknown.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Other: {unknown.length}</div>
            <ModuleChips modules={unknown} />
          </div>
        )}
      </div>
    </div>
  )
}

export function ModulesPerDepartmentGrid() {
  const visibleDepartments = departmentsData.filter((dept) =>
    Object.values(dept.byYear).some((bucket) => bucket.total > 0)
  )

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
                {visibleDepartments.map((dept) => (
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
                  {visibleDepartments.map((dept) => (
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
