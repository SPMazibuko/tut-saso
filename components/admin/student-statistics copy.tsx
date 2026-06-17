"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"]

interface KPICardProps {
  items: {
    subtitle: string
    title: string
    value: number | string
    icon?: React.ReactNode
    meta?: string
  }[]
}

const cardGradients = [
  "bg-gradient-to-br from-purple-500 to-indigo-600",
  "bg-gradient-to-br from-blue-500 to-cyan-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600"
]

export const KPICards = ({ items }: KPICardProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {items.map((item, index) => (
      <Card 
        key={item.title} 
        className={`border-0 shadow-lg ${cardGradients[index % cardGradients.length]} overflow-hidden`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">{item.subtitle}</p>
              <h3 className="text-2xl font-semibold text-white">{item.value}</h3>
            </div>
            {item.icon && (
              <div className="text-white/90 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                {item.icon}
              </div>
            )}
          </div>
          {item.meta && <p className="text-xs text-white/70 mt-2">{item.meta}</p>}
        </CardContent>
      </Card>
    ))}
  </div>
)

export const DepartmentBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div style={{ height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 24, left: -12, bottom: 16 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="probation" stackId="a" name="Probation" fill={COLORS[0]} />
          <Bar dataKey="readmitted" stackId="a" name="Readmitted" fill={COLORS[1]} />
          <Bar dataKey="excluded" stackId="a" name="Excluded" fill={COLORS[2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const StudentStatusPieChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export const StatisticsList: React.FC<{
  title: string
  items: { name: string; value: number }[]
}> = ({ title, items }) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name} className="flex justify-between items-center text-sm">
              <span className="text-slate-600">{item.name}</span>
              <span className="font-medium text-slate-900">{item.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}