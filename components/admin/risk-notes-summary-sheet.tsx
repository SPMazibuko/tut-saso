"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import type { RiskNote, RiskNoteSummary } from "@/lib/types"
import { generateRiskNoteSummary } from "@/lib/utils/risk-notes"
import { format } from "date-fns"

interface RiskNotesSummarySheetProps {
  riskNotes: RiskNote[]
  role?: 'aeo' | 'hod' | 'assistant_dean'
  onExport?: () => void
}

export function RiskNotesSummarySheet({ riskNotes, role = 'assistant_dean', onExport }: RiskNotesSummarySheetProps) {
  const summary = generateRiskNoteSummary(riskNotes)
  
  // Filter notes based on role visibility
  const visibleNotes = role === 'assistant_dean' 
    ? riskNotes // Assistant Dean sees all
    : role === 'hod'
    ? riskNotes.filter(note => note.escalationLevel === 'hod' || note.escalationLevel === 'assistant_dean')
    : riskNotes // AEO can track all
  
  const visibleSummary = generateRiskNoteSummary(visibleNotes)
  
  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Default export functionality
      const data = {
        summary: visibleSummary,
        riskNotes: visibleNotes.map(note => ({
          id: note.id,
          studentNumber: note.studentNumber,
          studentName: note.studentName,
          moduleCode: note.moduleCode,
          status: note.status,
          escalationLevel: note.escalationLevel,
          createdAt: note.createdAt.toISOString(),
          triggers: note.triggers.map(t => `${t.type}: ${t.value}%`).join(', ')
        }))
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `risk-notes-summary-${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Notes Summary Sheet</CardTitle>
              <CardDescription>
                Comprehensive overview of risk notes for {role === 'assistant_dean' ? 'Assistant Dean' : role === 'hod' ? 'Head of Department' : 'Academic Excellence Office'}
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Risk Notes Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{visibleSummary.new}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total new risk notes requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Improved on AEO Side</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{visibleSummary.improved}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Students showing improvement after intervention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Still Disengaged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{visibleSummary.stillDisengaged}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Students requiring further intervention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Escalation Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Escalation Level Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{visibleSummary.byEscalationLevel.aeo}</div>
                  <div className="text-sm text-muted-foreground mt-1">AEO Level</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{visibleSummary.byEscalationLevel.hod}</div>
                  <div className="text-sm text-muted-foreground mt-1">HOD Level</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{visibleSummary.byEscalationLevel.assistant_dean}</div>
                  <div className="text-sm text-muted-foreground mt-1">Assistant Dean Level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(visibleSummary.byStatus).map(([status, count]) => (
                    <TableRow key={status}>
                      <TableCell>
                        <Badge variant={
                          status === 'improved' || status === 'resolved' ? 'default' :
                          status === 'disengaged' ? 'destructive' : 'secondary'
                        }>
                          {status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{count}</TableCell>
                      <TableCell>
                        {visibleSummary.total > 0 
                          ? `${((count / visibleSummary.total) * 100).toFixed(1)}%`
                          : '0%'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Risk Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(visibleSummary.byType).map(([type, count]) => (
                    <TableRow key={type}>
                      <TableCell>
                        <Badge variant="outline">
                          {type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{count}</TableCell>
                      <TableCell>
                        {visibleSummary.total > 0 
                          ? `${((count / visibleSummary.total) * 100).toFixed(1)}%`
                          : '0%'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Risk Notes List */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Risk Notes</CardTitle>
              <CardDescription>
                Complete list of all risk notes {role === 'assistant_dean' ? '' : 'at your level and above'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Triggers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Escalation</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{note.studentName}</div>
                            <div className="text-sm text-muted-foreground">{note.studentNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{note.moduleCode}</div>
                            <div className="text-sm text-muted-foreground">{note.moduleName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {note.triggers.map((trigger, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {trigger.type.replace('_', ' ')}: {trigger.value.toFixed(0)}%
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            note.status === 'improved' || note.status === 'resolved' ? 'default' :
                            note.status === 'disengaged' ? 'destructive' : 'secondary'
                          }>
                            {note.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            note.escalationLevel === 'aeo' ? 'bg-blue-100 text-blue-800' :
                            note.escalationLevel === 'hod' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {note.escalationLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(note.createdAt, "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

