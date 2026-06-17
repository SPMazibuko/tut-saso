"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck, FileX, AlertTriangle } from "lucide-react"
import type { Learner } from "@/lib/types"

interface ConditionalLetterWithoutProbationProps {
  learners: Learner[]
}

export function ConditionalLetterWithoutProbation({ learners }: ConditionalLetterWithoutProbationProps) {
  const count = learners.length

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">Conditional Letter Without Probation Form</CardTitle>
        <CardDescription className="text-muted-foreground">Students who signed conditional letter but not probation form</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Total Count</p>
                <p className="text-sm text-muted-foreground">Requires attention</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{count}</div>
            </div>
          </div>

          {count > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {learners.map((learner) => (
                <div
                  key={learner.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {learner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {learner.name} {learner.surname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {learner.studentNumber} • Faculty {learner.grade || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 dark:border-green-800 dark:bg-green-900/20">
                      <FileCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-700 dark:text-green-300">Conditional</span>
                    </div>
                    <div className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 dark:border-red-800 dark:bg-red-900/20">
                      <FileX className="h-3 w-3 text-red-600 dark:text-red-400" />
                      <span className="text-xs text-red-700 dark:text-red-300">No Probation</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <FileCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>All students with conditional letters have also signed probation forms</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
