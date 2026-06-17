"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"
import { FileCheck, FileX } from "lucide-react"

interface ConditionalLettersProps {
  data: {
    lettersSigned: number
    lettersNotSigned: number
  }
}

const COLORS = ["#00C49F", "#FF8042"]

export function ConditionalLetters({ data }: ConditionalLettersProps) {
  const chartData = [
    { name: "Letters Signed", value: data.lettersSigned },
    { name: "Not Signed", value: data.lettersNotSigned },
  ]

  const total = data.lettersSigned + data.lettersNotSigned

  const chartConfig = {
    signed: {
      label: "Signed",
      color: "hsl(var(--chart-1))",
    },
    notSigned: {
      label: "Not Signed",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditional Letters</CardTitle>
        <CardDescription>Letter signing status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <FileCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{data.lettersSigned}</p>
                <p className="text-xs text-muted-foreground">Signed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <FileX className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{data.lettersNotSigned}</p>
                <p className="text-xs text-muted-foreground">Not Signed</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Letters</span>
              <span className="text-lg font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

