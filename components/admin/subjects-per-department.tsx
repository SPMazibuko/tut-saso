"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"

interface SubjectsPerDepartmentProps {
  data: Array<{ name: string; count: number }>
  onDepartmentSelect?: (departmentName: string) => void
  selectedDepartment?: string
}

export function SubjectsPerDepartment({
  data,
  onDepartmentSelect,
  selectedDepartment,
}: SubjectsPerDepartmentProps) {
  const chartConfig = {
    count: {
      label: "Subjects",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subjects Per Department</CardTitle>
        <CardDescription>Number of subjects by subject department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ChartContainer config={chartConfig}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                onClick={(data) => {
                  if (onDepartmentSelect && data?.name) {
                    onDepartmentSelect(data.name)
                  }
                }}
                className={cn(
                  "cursor-pointer",
                  selectedDepartment && "opacity-50 hover:opacity-100"
                )}
              />
            </BarChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {data.map((item) => (
              <div
                key={item.name}
                onClick={() => onDepartmentSelect?.(item.name)}
                className={cn(
                  "rounded-lg border p-2 cursor-pointer hover:bg-muted transition-colors",
                  selectedDepartment === item.name && "bg-primary/10 border-primary"
                )}
              >
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-lg font-bold">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

