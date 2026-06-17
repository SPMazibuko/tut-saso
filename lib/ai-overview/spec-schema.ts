import { z } from "zod"

// Chart type definitions
export const ChartTypeSchema = z.enum([
  "bar",
  "line",
  "area",
  "pie",
  "stackedBar",
  "table",
  "kpi",
])

export type ChartType = z.infer<typeof ChartTypeSchema>

// Filter schemas
export const FilterSchema = z.object({
  field: z.string(),
  operator: z.enum(["equals", "in", "range", "contains", "greaterThan", "lessThan"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
})

// Metric schemas
export const MetricSchema = z.object({
  field: z.string(),
  aggregation: z.enum(["count", "sum", "avg", "min", "max", "distinctCount"]),
  alias: z.string().optional(),
})

// Chart definition schema
export const ChartDefSchema = z.object({
  id: z.string(),
  type: ChartTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  x: z.union([z.string(), z.null()]).optional(), // Field for x-axis (can be null for some chart types)
  y: z.union([z.string(), z.null()]).optional(), // Single y field (can be null for some chart types)
  series: z.array(z.string()).optional(), // Multiple series (for multi-series charts)
  groupBy: z.array(z.string()).optional(), // Grouping fields
  filters: z.array(FilterSchema).optional(),
  metrics: z.array(MetricSchema).optional(),
  dataset: z.string(), // Which dataset to use
})

// Dashboard spec schema
export const DashboardSpecSchema = z.object({
  intent: z.string(),
  datasets: z.array(z.string()),
  charts: z.array(ChartDefSchema),
  globalFilters: z.array(FilterSchema).optional(),
})

export type DashboardSpec = z.infer<typeof DashboardSpecSchema>
export type ChartDef = z.infer<typeof ChartDefSchema>
export type Filter = z.infer<typeof FilterSchema>
export type Metric = z.infer<typeof MetricSchema>
