"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Area, AreaChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import type { ChartData } from "@/lib/ai-overview/chart-builders"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

interface ChartRendererProps {
  chart: ChartData
}

export function ChartRenderer({ chart }: ChartRendererProps) {
  const chartConfig = chart.seriesConfig || {}

  // KPI Chart
  if (chart.type === "kpi") {
    const value = chart.data[0]?.value ?? 0
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chart.title}</CardTitle>
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
          {chart.notes && <p className="text-sm text-muted-foreground mt-2">{chart.notes}</p>}
        </CardContent>
      </Card>
    )
  }

  // Table Chart
  if (chart.type === "table") {
    if (chart.data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      )
    }

    const columns = Object.keys(chart.data[0])
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chart.title}</CardTitle>
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {chart.data.slice(0, 50).map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {chart.data.length > 50 && (
            <p className="text-sm text-muted-foreground mt-2">Showing first 50 of {chart.data.length} rows</p>
          )}
        </CardContent>
      </Card>
    )
  }

  // Pie Chart
  if (chart.type === "pie") {
    const dataKey = chart.yKeys?.[0] || "value"
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chart.title}</CardTitle>
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={dataKey}
                nameKey={chart.xKey || "name"}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Bar Chart (including stacked)
  if (chart.type === "bar" || chart.type === "stackedBar") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chart.title}</CardTitle>
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "name"} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {chart.yKeys?.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key]?.color || COLORS[idx % COLORS.length]}
                  stackId={chart.type === "stackedBar" ? "stack" : undefined}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Line Chart
  if (chart.type === "line") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chart.title}</CardTitle>
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "name"} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {chart.yKeys?.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartConfig[key]?.color || COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Area Chart
  if (chart.type === "area") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chart.title}</CardTitle>
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey || "name"} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {chart.yKeys?.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={chartConfig[key]?.color || COLORS[idx % COLORS.length]}
                  fill={chartConfig[key]?.color || COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Fallback
  return (
    <Card>
      <CardHeader>
        <CardTitle>{chart.title}</CardTitle>
        {chart.description && <CardDescription>{chart.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Chart type "{chart.type}" not yet supported</p>
      </CardContent>
    </Card>
  )
}
