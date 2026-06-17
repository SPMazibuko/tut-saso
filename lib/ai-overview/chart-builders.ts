import type { ChartDef } from "./spec-schema"
import { executeChart } from "./executor"

export interface ChartData {
  id: string
  title: string
  description?: string
  type: ChartDef["type"]
  data: any[]
  xKey?: string
  yKeys?: string[]
  seriesConfig?: Record<string, { label: string; color?: string }>
  notes?: string
}

// Build chart data from chart definition
export function buildChart(chartDef: ChartDef): ChartData {
  const data = executeChart(chartDef)

  // Determine x and y keys
  let xKey = chartDef.x || undefined
  let yKeys: string[] = []

  if (chartDef.series && chartDef.series.length > 0) {
    yKeys = chartDef.series
  } else if (chartDef.y && chartDef.y !== null) {
    yKeys = [chartDef.y]
  } else if (chartDef.metrics && chartDef.metrics.length > 0) {
    yKeys = chartDef.metrics.map((m) => m.alias || `${m.field}_${m.aggregation}`)
  } else if (data.length > 0) {
    // Auto-detect from data
    const firstRow = data[0]
    if (chartDef.groupBy && chartDef.groupBy.length > 0) {
      xKey = chartDef.groupBy[0]
    } else if ("name" in firstRow) {
      xKey = "name"
    }

    // Find numeric fields for y
    for (const key in firstRow) {
      if (key !== xKey && typeof firstRow[key] === "number") {
        yKeys.push(key)
      }
    }

    if (yKeys.length === 0 && "value" in firstRow) {
      yKeys = ["value"]
    }
  }

  // Build series config
  const seriesConfig: Record<string, { label: string; color?: string }> = {}
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  yKeys.forEach((key, idx) => {
    seriesConfig[key] = {
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      color: colors[idx % colors.length],
    }
  })

  return {
    id: chartDef.id,
    title: chartDef.title,
    description: chartDef.description,
    type: chartDef.type,
    data,
    xKey: xKey || "name",
    yKeys: yKeys.length > 0 ? yKeys : ["value"],
    seriesConfig,
    notes: `Dataset: ${chartDef.dataset}, Records: ${data.length}`,
  }
}
