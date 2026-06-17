"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { AlertTriangle } from "lucide-react"

interface AcademicWarningsPerDepartmentProps {
  data: Array<{ name: string; count: number }>
}

export function AcademicWarningsPerDepartment({ data }: AcademicWarningsPerDepartmentProps) {
  const chartConfig = {
    count: {
      label: "Academic Warnings",
      color: "hsl(var(--chart-3))",
    },
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Warnings Per Department</CardTitle>
        <CardDescription>Student academic warnings by subject department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-3xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Total Academic Warnings</p>
            </div>
          </div>
          <ChartContainer config={chartConfig}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

