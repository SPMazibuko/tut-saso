"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { DollarSign, GraduationCap } from "lucide-react"

interface AtRiskFundingBreakdownProps {
  data: {
    selfFunded: number
    nsfas: number
  }
  onOpenDrilldown?: () => void
}

const breakdownRowBase =
  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:opacity-90 hover:shadow-sm"

const COLORS = ["#10b981", "#3b82f6"] // Green for self-funded, blue for NSFAS

export function AtRiskFundingBreakdown({ data, onOpenDrilldown }: AtRiskFundingBreakdownProps) {
  const chartData = [
    { name: "Self Funded", value: data.selfFunded },
    { name: "NSFAS/Bursary", value: data.nsfas },
  ]

  const total = data.selfFunded + data.nsfas

  const chartConfig = {
    selfFunded: {
      label: "Self Funded",
      color: "hsl(142, 76%, 36%)",
    },
    nsfas: {
      label: "NSFAS/Bursary",
      color: "hsl(217, 91%, 60%)",
    },
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">At-Risk Students Funding</CardTitle>
        <CardDescription className="text-muted-foreground">Funding distribution for students at risk</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <ChartContainer config={chartConfig} className="h-[200px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`${breakdownRowBase} border-green-100 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20`}
              onClick={() => onOpenDrilldown?.()}
              role={onOpenDrilldown ? "button" : undefined}
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.selfFunded}</p>
                <p className="text-xs text-muted-foreground">Self Funded</p>
              </div>
            </div>
            <div
              className={`${breakdownRowBase} border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20`}
              onClick={() => onOpenDrilldown?.()}
              role={onOpenDrilldown ? "button" : undefined}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.nsfas}</p>
                <p className="text-xs text-muted-foreground">NSFAS/Bursary</p>
              </div>
            </div>
          </div>
          <div
            className={`pt-2 border-t border-border/60 ${onOpenDrilldown ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={() => onOpenDrilldown?.()}
            role={onOpenDrilldown ? "button" : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total At-Risk Students</span>
              <span className="text-lg font-bold text-foreground">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
