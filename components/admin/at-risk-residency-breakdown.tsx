"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { Home, Building2 } from "lucide-react"

interface AtRiskResidencyBreakdownProps {
  data: {
    onCampus: number
    offCampus: number
  }
  onOpenDrilldown?: () => void
}

const breakdownRowBase =
  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:opacity-90 hover:shadow-sm"

const COLORS = ["#f59e0b", "#8b5cf6"] // Orange for on-campus, purple for off-campus

export function AtRiskResidencyBreakdown({ data, onOpenDrilldown }: AtRiskResidencyBreakdownProps) {
  const chartData = [
    { name: "On Campus", value: data.onCampus },
    { name: "Off Campus", value: data.offCampus },
  ]

  const total = data.onCampus + data.offCampus

  const chartConfig = {
    onCampus: {
      label: "On Campus",
      color: "hsl(38, 92%, 50%)",
    },
    offCampus: {
      label: "Off Campus",
      color: "hsl(270, 91%, 65%)",
    },
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">At-Risk Students Residency</CardTitle>
        <CardDescription className="text-muted-foreground">Campus residency distribution for students at risk</CardDescription>
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
              className={`${breakdownRowBase} border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50/50 dark:border-orange-800 dark:from-orange-900/20 dark:to-amber-900/20`}
              onClick={() => onOpenDrilldown?.()}
              role={onOpenDrilldown ? "button" : undefined}
            >
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.onCampus}</p>
                <p className="text-xs text-muted-foreground">On Campus</p>
              </div>
            </div>
            <div
              className={`${breakdownRowBase} border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50/50 dark:border-purple-800 dark:from-purple-900/20 dark:to-violet-900/20`}
              onClick={() => onOpenDrilldown?.()}
              role={onOpenDrilldown ? "button" : undefined}
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.offCampus}</p>
                <p className="text-xs text-muted-foreground">Off Campus</p>
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
