"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle } from "lucide-react"

interface ConditionalLettersData {
  lettersSigned: number
  lettersNotSigned: number
}

interface ConditionalLettersProps {
  data: ConditionalLettersData
}

export function ConditionalLetters({ data }: ConditionalLettersProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Conditional Letter</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Letters signed</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{data.lettersSigned}</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-100 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Letters not signed</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.lettersNotSigned}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
