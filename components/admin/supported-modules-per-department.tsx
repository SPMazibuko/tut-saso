"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpenCheck, Shield, Building, X } from "lucide-react"

interface SupportedDepartmentModuleData {
  name: string
  count: number
}

interface ModuleBreakdown {
  supportedBySOLUSI: number
  supportedByDepartment: number
  notSupported: number
}

export type BreakdownCategory = "solusi" | "department" | "none"

interface SupportedModulesPerDepartmentProps {
  data: SupportedDepartmentModuleData[]
  selectedDepartment?: string
  breakdown?: ModuleBreakdown
  onBreakdownSelect?: (category: BreakdownCategory) => void
}

const breakdownRowBase =
  "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors hover:opacity-90"

export function SupportedModulesPerDepartment({ data, selectedDepartment, breakdown, onBreakdownSelect }: SupportedModulesPerDepartmentProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Supported Modules Per Department</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {selectedDepartment && breakdown ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Module Breakdown for {selectedDepartment}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total modules: {breakdown.supportedBySOLUSI + breakdown.supportedByDepartment + breakdown.notSupported}
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Supported by SOLUSI-IPASS */}
              <div
                className={`${breakdownRowBase} bg-gradient-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800`}
                onClick={() => onBreakdownSelect?.("solusi")}
                role={onBreakdownSelect ? "button" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Supported by SASO</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">SASO-funded support</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{breakdown.supportedBySOLUSI}</div>
                </div>
              </div>

              {/* Supported by Department */}
              <div
                className={`${breakdownRowBase} bg-gradient-to-r from-green-50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800`}
                onClick={() => onBreakdownSelect?.("department")}
                role={onBreakdownSelect ? "button" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Supported by Department</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Department-funded support</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{breakdown.supportedByDepartment}</div>
                </div>
              </div>

              {/* Not Supported */}
              <div
                className={`${breakdownRowBase} bg-gradient-to-r from-red-50 to-rose-50/30 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800`}
                onClick={() => onBreakdownSelect?.("none")}
                role={onBreakdownSelect ? "button" : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <X className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Not Supported</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">No support available</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{breakdown.notSupported}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((department, index) => (
              <div key={department.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                    <BookOpenCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{department.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{department.count}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
