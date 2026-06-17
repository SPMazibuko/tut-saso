"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck } from "lucide-react"

interface ModuleTutorsProps {
  count: number
}

export function ModuleTutors({ count }: ModuleTutorsProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Module Tutors</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4">
              <UserCheck className="h-10 w-10" />
            </div>
            <div className="text-slate-600 dark:text-slate-400 mb-2">Number of module tutors</div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">{count}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
