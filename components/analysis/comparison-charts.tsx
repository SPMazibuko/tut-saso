"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = {
  primary: "#8884d8",
  secondary: "#82ca9d",
  accent: "#ffc658",
  danger: "#ff6b6b",
  warning: "#ffa726",
  info: "#42a5f5",
}

interface ComparisonBarChartProps {
  data: Array<Record<string, string | number>>
  title: string
  description?: string
  bars: Array<{ dataKey: string; name: string; color?: string }>
  xAxisKey?: string
}

export function ComparisonBarChart({ data, title, description, bars, xAxisKey = "name" }: ComparisonBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {bars.map((bar) => (
              <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color || COLORS.primary} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ComparisonRadarChartProps {
  data: Array<Record<string, string | number>>
  title: string
  description?: string
  metrics: Array<{ key: string; name: string }>
}

export function ComparisonRadarChart({ data, title, description, metrics }: ComparisonRadarChartProps) {
  const radarData = metrics.map((metric) => {
    const result: Record<string, string | number> = { metric: metric.name }
    data.forEach((item, index) => {
      result[`value${index}`] = item[metric.key] as number
    })
    return result
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            {data.map((item, index) => (
              <Radar
                key={index}
                name={item.name as string}
                dataKey={`value${index}`}
                stroke={Object.values(COLORS)[index % Object.values(COLORS).length]}
                fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                fillOpacity={0.6}
              />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface SideBySideComparisonProps {
  data1: { label: string; value: number }[]
  data2: { label: string; value: number }[]
  title: string
  description?: string
  label1: string
  label2: string
}

export function SideBySideComparison({ data1, data2, title, description, label1, label2 }: SideBySideComparisonProps) {
  const combinedData = data1.map((item, index) => ({
    metric: item.label,
    [label1]: item.value,
    [label2]: data2[index]?.value || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={label1} fill={COLORS.primary} />
            <Bar dataKey={label2} fill={COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

