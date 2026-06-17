"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { listReportSpecs, generateReport, listGeneratedReports } from "@/lib/reports"

export default function ReportsPage() {
  const [specs] = useState(listReportSpecs())
  const [generated, setGenerated] = useState(listGeneratedReports())

  const handleGenerate = (id: string) => {
    generateReport(id)
    setGenerated(listGeneratedReports())
  }

  const handleDownload = (location: string, format?: "csv" | "json") => {
    const url = new URL(location, typeof window !== "undefined" ? window.location.origin : "http://localhost")
    if (format) {
      url.searchParams.set("format", format)
    }
    window.open(url.toString(), "_blank")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regulatory Reports</h1>
        <p className="text-muted-foreground">Generate exports for DHET and Umalusi</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {specs.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              <CardDescription>
                Audience: {s.audience} • Format: {s.format} {s.scheduleCron ? `• Cron: ${s.scheduleCron}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleGenerate(s.id)}>Generate</Button>
                <Button variant="secondary" onClick={() => handleDownload(`/api/reports?specId=${s.id}`, "csv")}>
                  Download CSV
                </Button>
                <Button variant="secondary" onClick={() => handleDownload(`/api/reports?specId=${s.id}`, "json")}>
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated</CardTitle>
          <CardDescription>Recent report runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {generated.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports yet</p>
            ) : (
              generated.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <span className="text-sm">{g.location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{g.generatedAt.toLocaleString()}</span>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(g.location)}>Download</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


