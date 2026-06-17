"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX, AlertTriangle } from "lucide-react"

interface FinancialExclusionDropoutMetricProps {
  count: number
}

export function FinancialExclusionDropoutMetric({ count }: FinancialExclusionDropoutMetricProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">Financial Exclusion Dropout</CardTitle>
        <CardDescription className="text-muted-foreground">
          Students who dropped out despite being academically approved but financially excluded
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-r from-red-500 to-rose-500">
            <UserX className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">{count}</p>
            <p className="text-sm text-muted-foreground">
              Dropouts: Financially Excluded + Academically Approved
            </p>
            <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300 text-left">
                  These students met academic requirements but were unable to continue due to financial constraints.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
