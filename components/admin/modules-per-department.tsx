"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { useState } from "react"

interface DepartmentModuleData {
  name: string
  count: number
}

interface ModulesPerDepartmentProps {
  data: DepartmentModuleData[]
  onDepartmentSelect?: (departmentName: string) => void
  selectedDepartment?: string
}

export function ModulesPerDepartment({ data, onDepartmentSelect, selectedDepartment }: ModulesPerDepartmentProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">Modules Identified Per Department</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {data.map((department, index) => (
            <div 
              key={department.name} 
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedDepartment === department.name 
                  ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-purple-300 dark:border-purple-600 shadow-md' 
                  : 'bg-gradient-to-r from-slate-50 to-purple-50/30 dark:from-slate-800 dark:to-slate-900/30 border-slate-100 dark:border-slate-700 hover:from-purple-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-800'
              }`}
              onClick={() => onDepartmentSelect?.(department.name)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg ${
                  selectedDepartment === department.name 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className={`font-semibold ${
                    selectedDepartment === department.name 
                      ? 'text-purple-900 dark:text-purple-100' 
                      : 'text-slate-900 dark:text-white'
                  }`}>{department.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  selectedDepartment === department.name 
                    ? 'text-purple-700 dark:text-purple-200' 
                    : 'text-slate-900 dark:text-white'
                }`}>{department.count}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
