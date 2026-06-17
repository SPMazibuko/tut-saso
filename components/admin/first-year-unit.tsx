"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, AlertTriangle, UserCheck, UserX } from "lucide-react"

interface FirstYearUnitData {
  probationRepeaters: number
  exclusionRepeaters: number
  newProbationFirstTime: number
  newExclusionFirstTime: number
}

interface FirstYearUnitProps {
  data: FirstYearUnitData
}

export function FirstYearUnit({ data }: FirstYearUnitProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Breakdown Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2 text-center">Probation Repeaters</p>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{data.probationRepeaters}</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-100 dark:border-red-800">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <UserX className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2 text-center">Exclusion Repeaters</p>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.exclusionRepeaters}</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2 text-center">New Probation First Time</p>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.newProbationFirstTime}</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <UserCheck className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2 text-center">New Exclusion First Time</p>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data.newExclusionFirstTime}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
