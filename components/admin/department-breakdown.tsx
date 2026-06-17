"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

interface DepartmentBreakdownProps {
  data: {
    excluded: Array<{ name: string; value: number }>
    readmitted: Array<{ name: string; value: number }>
    probation: Array<{ name: string; value: number }>
  }
}

export function DepartmentBreakdown({ data }: DepartmentBreakdownProps) {
  // Combine data for comparison chart
  const chartData = data.excluded.map((item) => {
    const readmitted = data.readmitted.find((r) => r.name === item.name)
    const probation = data.probation.find((p) => p.name === item.name)
    return {
      name: item.name,
      Excluded: item.value,
      Readmitted: readmitted?.value || 0,
      Probation: probation?.value || 0,
    }
  })

  const chartConfig = {
    excluded: {
      label: "Excluded",
      color: "hsl(var(--destructive))",
    },
    readmitted: {
      label: "Readmitted",
      color: "hsl(var(--chart-2))",
    },
    probation: {
      label: "Probation",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Breakdown</CardTitle>
        <CardDescription>Student status by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="Excluded" fill="var(--color-excluded)" />
            <Bar dataKey="Readmitted" fill="var(--color-readmitted)" />
            <Bar dataKey="Probation" fill="var(--color-probation)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

