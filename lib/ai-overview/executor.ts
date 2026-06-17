import type { ChartDef, Filter, Metric } from "./spec-schema"
import { getDataset } from "./datasets"

// Apply a filter to a record
function applyFilter(record: any, filter: Filter): boolean {
  const fieldValue = getNestedValue(record, filter.field)

  switch (filter.operator) {
    case "equals":
      return fieldValue === filter.value
    case "in":
      return Array.isArray(filter.value) && filter.value.includes(fieldValue)
    case "range":
      if (!Array.isArray(filter.value) || filter.value.length !== 2) return false
      return fieldValue >= filter.value[0] && fieldValue <= filter.value[1]
    case "contains":
      if (typeof fieldValue === "string" && typeof filter.value === "string") {
        return fieldValue.toLowerCase().includes(filter.value.toLowerCase())
      }
      return false
    case "greaterThan":
      return typeof fieldValue === "number" && typeof filter.value === "number" && fieldValue > filter.value
    case "lessThan":
      return typeof fieldValue === "number" && typeof filter.value === "number" && fieldValue < filter.value
    default:
      return true
  }
}

// Get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj)
}

// Apply filters to dataset
function filterDataset(dataset: any[], filters: Filter[] = []): any[] {
  if (filters.length === 0) return dataset
  return dataset.filter((record) => filters.every((filter) => applyFilter(record, filter)))
}

// Compute metric aggregation
function computeMetric(records: any[], metric: Metric): number {
  const values = records.map((r) => getNestedValue(r, metric.field)).filter((v) => v != null)

  switch (metric.aggregation) {
    case "count":
      return records.length
    case "sum":
      return values.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0)
    case "avg":
      const nums = values.filter((v) => typeof v === "number")
      return nums.length > 0 ? nums.reduce((sum, v) => sum + v, 0) / nums.length : 0
    case "min":
      const minNums = values.filter((v) => typeof v === "number")
      return minNums.length > 0 ? Math.min(...minNums) : 0
    case "max":
      const maxNums = values.filter((v) => typeof v === "number")
      return maxNums.length > 0 ? Math.max(...maxNums) : 0
    case "distinctCount":
      return new Set(values).size
    default:
      return 0
  }
}

// Group records by fields
function groupBy(records: any[], groupFields: string[]): Map<string, any[]> {
  const groups = new Map<string, any[]>()

  for (const record of records) {
    const key = groupFields.map((field) => getNestedValue(record, field) ?? "null").join("|")
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(record)
  }

  return groups
}

// Execute a chart definition and return chart-ready data
export function executeChart(chartDef: ChartDef): any[] {
  // Get the dataset
  const dataset = getDataset(chartDef.dataset)

  // Apply filters
  let filtered = filterDataset(dataset, chartDef.filters)

  // Apply grouping if specified
  if (chartDef.groupBy && chartDef.groupBy.length > 0) {
    const groups = groupBy(filtered, chartDef.groupBy)

    // Convert groups to chart data
    const chartData: any[] = []
    for (const [key, groupRecords] of groups.entries()) {
      const groupValues = key.split("|")
      const dataPoint: any = {}

      // Add group field values
      chartDef.groupBy.forEach((field, idx) => {
        dataPoint[field] = groupValues[idx] === "null" ? null : groupValues[idx]
      })

      // Add x-axis value (use first group field if x not specified)
      if (chartDef.x && chartDef.x !== null) {
        dataPoint[chartDef.x] = getNestedValue(groupRecords[0], chartDef.x) ?? groupValues[0]
      } else if (chartDef.groupBy.length > 0) {
        dataPoint.name = groupValues[0]
      }

      // Compute metrics
      if (chartDef.metrics && chartDef.metrics.length > 0) {
        chartDef.metrics.forEach((metric) => {
          const alias = metric.alias || `${metric.field}_${metric.aggregation}`
          dataPoint[alias] = computeMetric(groupRecords, metric)
        })
      } else if (chartDef.y && chartDef.y !== null) {
        // Simple aggregation: count or sum of y field
        const yValue = getNestedValue(groupRecords[0], chartDef.y)
        if (typeof yValue === "number") {
          dataPoint.value = computeMetric(groupRecords, { field: chartDef.y, aggregation: "sum" })
        } else {
          dataPoint.value = groupRecords.length
        }
      } else {
        // Default: count
        dataPoint.value = groupRecords.length
      }

      // Add series values if specified
      if (chartDef.series && chartDef.series.length > 0) {
        chartDef.series.forEach((seriesField) => {
          const seriesValue = getNestedValue(groupRecords[0], seriesField)
          dataPoint[seriesField] = typeof seriesValue === "number" 
            ? computeMetric(groupRecords, { field: seriesField, aggregation: "sum" })
            : groupRecords.length
        })
      }

      chartData.push(dataPoint)
    }

    return chartData.sort((a, b) => {
      // Sort by first group field or name
      const sortKey = chartDef.groupBy?.[0] || "name"
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal
      }
      return String(aVal).localeCompare(String(bVal))
    })
  } else {
    // No grouping - return aggregated single value or list
    if (chartDef.metrics && chartDef.metrics.length > 0) {
      // Return single data point with metrics
      const dataPoint: any = {}
      chartDef.metrics.forEach((metric) => {
        const alias = metric.alias || `${metric.field}_${metric.aggregation}`
        dataPoint[alias] = computeMetric(filtered, metric)
      })
      return [dataPoint]
    } else if (chartDef.type === "kpi") {
      // KPI: return single value
      const value = chartDef.y && chartDef.y !== null
        ? computeMetric(filtered, { field: chartDef.y, aggregation: "avg" })
        : filtered.length
      return [{ value, label: chartDef.title }]
    } else {
      // Return all records (for table view or simple lists)
      return filtered.slice(0, 100) // Limit to 100 records for performance
    }
  }
}
