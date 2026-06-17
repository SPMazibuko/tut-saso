"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, AlertTriangle, UserCheck, UserX } from "lucide-react"

interface StudentStatusData {
  probation: number
  exclusion: number
  readmitted: number
  excluded: number
}

interface StudentStatusOverviewProps {
  data: StudentStatusData
}

export function StudentStatusOverview({ data }: StudentStatusOverviewProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Student Status Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2">Probation</p>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{data.probation}</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-100 dark:border-red-800">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <UserX className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2">Exclusion</p>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.exclusion}</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <UserCheck className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2">Readmitted</p>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{data.readmitted}</div>
          </div>

          <div className="flex flex-col items-center p-4 bg-gradient-to-r from-slate-50 to-gray-50/50 dark:from-slate-800/20 dark:to-gray-800/20 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center text-white shadow-lg mb-3">
              <Users className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mb-2">Excluded</p>
            <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">{data.excluded}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
