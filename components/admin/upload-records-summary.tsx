"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Search, Filter, Download, Upload, FileText } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface UploadRecord {
  id: string
  module: string
  status: "Processed" | "Pending" | "Failed"
  uploadedBy: string
  uploadedAt: Date
  recordCount: number
  department: string
}

interface UploadRecordsSummaryProps {
  records: UploadRecord[]
  onFilter: (filters: any) => void
  onExport: () => void
  onUpload: () => void
}

export function UploadRecordsSummary({ records, onFilter, onExport, onUpload }: UploadRecordsSummaryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")

  // Mock summary data
  const summary = {
    total: 2845,
    byModule: [
      { module: "CSC101", count: 450 },
      { module: "ENG205", count: 380 },
      { module: "BUS301", count: 350 },
      { module: "ART102", count: 280 },
      { module: "SCI401", count: 100 },
    ],
    byStatus: [
      { status: "Processed", count: 2500 },
      { status: "Pending", count: 245 },
      { status: "Failed", count: 100 },
    ],
    recentUploads: [
      { id: "1", module: "CSC101", status: "Processed", count: 150, date: "2024-09-15" },
      { id: "2", module: "ENG205", status: "Pending", count: 80, date: "2024-09-14" },
      { id: "3", module: "BUS301", status: "Failed", count: 45, date: "2024-09-14" },
      { id: "4", module: "ART102", status: "Processed", count: 120, date: "2024-09-13" },
      { id: "5", module: "SCI401", status: "Processed", count: 90, date: "2024-09-13" },
    ],
  }

  const moduleChartData = summary.byModule.map((m) => ({
    module: m.module,
    records: m.count,
  }))

  const chartConfig = {
    records: {
      label: "Records",
      color: "hsl(var(--chart-1))",
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {summary.byModule.map((mod) => (
                  <SelectItem key={mod.module} value={mod.module.toLowerCase()}>
                    {mod.module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {summary.byStatus.map((status) => (
                  <SelectItem key={status.status} value={status.status.toLowerCase()}>
                    {status.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 lg:col-span-2">
              <Button 
                onClick={onUpload}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Records
              </Button>
              <Button variant="outline" size="icon" onClick={() => onFilter({
                search: searchTerm,
                module: moduleFilter,
                status: statusFilter,
                dateRange,
              })}>
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Badge>{summary.total}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.byStatus[0].count}</div>
            <p className="text-xs text-muted-foreground">Processed Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge variant="secondary">{summary.byStatus[1].count}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((summary.byStatus[1].count / summary.total) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Of Total Records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Badge variant="destructive">{summary.byStatus[2].count}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.byStatus[2].count}</div>
            <p className="text-xs text-muted-foreground">Need Attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Badge variant="outline">
              {Math.round((summary.byStatus[0].count / summary.total) * 100)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.byStatus[0].count}</div>
            <p className="text-xs text-muted-foreground">Successfully Processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Records by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={moduleChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="records" fill="var(--color-records)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {summary.recentUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{upload.module}</p>
                        <p className="text-xs text-muted-foreground">{upload.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(upload.status)}>{upload.status}</Badge>
                      <Badge variant="outline">{upload.count} records</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
