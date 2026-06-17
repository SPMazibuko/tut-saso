"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { AlertTriangle, XCircle, BookOpen, FileQuestion } from "lucide-react"

interface ProbationReasonBreakdownProps {
  data: {
    module_cancellation: number
    low_credits: number
    academic_performance: number
    other: number
  }
  onOpenDrilldown?: () => void
}

const breakdownRowBase = "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:opacity-90 hover:shadow-sm"



const COLORS = ["#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"] // Orange, Purple, Red, Gray

const REASON_LABELS: Record<string, string> = {
  module_cancellation: "Module Cancellation",
  low_credits: "Few modules registered",
  academic_performance: "Academic Performance",
  other: "Other",
}

const REASON_ICONS: Record<string, typeof AlertTriangle> = {
  module_cancellation: XCircle,
  low_credits: BookOpen,
  academic_performance: AlertTriangle,
  other: FileQuestion,
}

export function ProbationReasonBreakdown({ data, onOpenDrilldown }: ProbationReasonBreakdownProps) {
  const chartData = [
    { name: REASON_LABELS.module_cancellation, value: data.module_cancellation, key: "module_cancellation" },
    { name: REASON_LABELS.low_credits, value: data.low_credits, key: "low_credits" },
    { name: REASON_LABELS.academic_performance, value: data.academic_performance, key: "academic_performance" },
    { name: REASON_LABELS.other, value: data.other, key: "other" },
  ] // Show all categories for drilldown

  const total = data.module_cancellation + data.low_credits + data.academic_performance + data.other

  const chartConfig = {
    module_cancellation: {
      label: REASON_LABELS.module_cancellation,
      color: "hsl(38, 92%, 50%)",
    },
    low_credits: {
      label: REASON_LABELS.low_credits,
      color: "hsl(270, 91%, 65%)",
    },
    academic_performance: {
      label: REASON_LABELS.academic_performance,
      color: "hsl(0, 84%, 60%)",
    },
    other: {
      label: REASON_LABELS.other,
      color: "hsl(215, 16%, 47%)",
    },
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">Probation by Reason</CardTitle>
        <CardDescription className="text-muted-foreground">Distribution of probation reasons for students on probation</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {total > 0 ? (
            <>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={chartData.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const name = typeof props?.name === "string" ? props.name : ""
                      const percent = typeof props?.percent === "number" ? props.percent : 0
                      return `${name}: ${(percent * 100).toFixed(0)}%`
                    }}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.filter((item) => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-4">
                {chartData.map((item, index) => {
                  const Icon = REASON_ICONS[item.key] || FileQuestion
                  const colorClasses = [
                    "border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50/50 dark:border-orange-800 dark:from-orange-900/20 dark:to-amber-900/20",
                    "border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50/50 dark:border-purple-800 dark:from-purple-900/20 dark:to-violet-900/20",
                    "border-red-100 bg-gradient-to-r from-red-50 to-rose-50/50 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20",
                    "border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50/50 dark:border-gray-800 dark:from-gray-900/20 dark:to-slate-900/20",
                  ]
                  const iconBgClasses = [
                    "bg-orange-500",
                    "bg-purple-500",
                    "bg-red-500",
                    "bg-gray-500",
                  ]
                  const textColorClasses = [
                    "text-orange-600 dark:text-orange-400",
                    "text-purple-600 dark:text-purple-400",
                    "text-red-600 dark:text-red-400",
                    "text-gray-600 dark:text-gray-400",
                  ]

                  return (
                    <div
                      key={item.key}
                      className={`${breakdownRowBase} ${colorClasses[index % colorClasses.length]} p-3`}
                      onClick={() => onOpenDrilldown?.()}
                      role={onOpenDrilldown ? "button" : undefined}
                    >
                      <div className={`w-10 h-10 ${iconBgClasses[index % iconBgClasses.length]} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${textColorClasses[index % textColorClasses.length]}`}>{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                className={`pt-2 border-t border-border/60 ${onOpenDrilldown ? "cursor-pointer hover:opacity-80" : ""}`}
                onClick={() => onOpenDrilldown?.()}
                role={onOpenDrilldown ? "button" : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total on Probation</span>
                  <span className="text-lg font-bold text-foreground">{total}</span>
                </div>
              </div>
            </>
          ) : (
            <div
              className={`py-8 text-center text-muted-foreground ${onOpenDrilldown ? "cursor-pointer hover:opacity-80" : ""}`}
              onClick={() => onOpenDrilldown?.()}
              role={onOpenDrilldown ? "button" : undefined}
            >
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No probation data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
