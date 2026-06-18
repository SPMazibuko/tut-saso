"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, Download, Eye, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { RiskNote, RiskNoteSummary } from "@/lib/types"
import { generateRiskNoteSummary, calculateWorkingDays, addWorkingDays, shouldEscalate, getNextEscalationLevel, getStatusFromEscalationLevel } from "@/lib/utils/risk-notes"
import { format } from "date-fns"
import { formatStudentNumber } from "@/lib/student-numbers"

interface RiskNotesSummaryProps {
  riskNotes: RiskNote[]
  onFilter: (filters: any) => void
  onExport: () => void
  onViewCommunication?: (riskNote: RiskNote) => void
  onEscalate?: (riskNote: RiskNote) => void
  onMarkImproved?: (riskNote: RiskNote) => void
}

// Mock data generator for demonstration
export function generateMockRiskNotes(): RiskNote[] {
  const now = new Date()
  const mockNotes: RiskNote[] = []
  
  // Generate 400 risk notes
  const firstNames = [
    "John", "Mary", "James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda",
    "William", "Jennifer", "Richard", "Lisa", "Joseph", "Michelle", "Thomas", "Kimberly", "Charles", "Amy",
    "Daniel", "Angela", "Matthew", "Melissa", "Anthony", "Deborah", "Mark", "Stephanie", "Donald", "Rebecca",
    "Steven", "Sharon", "Paul", "Laura", "Andrew", "Cynthia", "Joshua", "Kathleen", "Kenneth", "Anna",
    "Kevin", "Brenda", "Brian", "Pamela", "George", "Emma", "Edward", "Nicole", "Ronald", "Samantha",
    "Timothy", "Christine", "Jason", "Helen", "Jeffrey", "Debra", "Ryan", "Rachel", "Jacob", "Carolyn",
    "Gary", "Janet", "Nicholas", "Catherine", "Eric", "Maria", "Jonathan", "Frances", "Stephen", "Ann",
    "Larry", "Marie", "Justin", "Heather", "Scott", "Diane", "Brandon", "Julie", "Benjamin", "Joyce",
    "Samuel", "Victoria", "Frank", "Kelly", "Gregory", "Christina", "Raymond", "Joan", "Alexander", "Evelyn",
    "Patrick", "Judith", "Jack", "Megan", "Dennis", "Cheryl", "Jerry", "Andrea", "Tyler", "Hannah",
    "Aaron", "Jacqueline", "Jose", "Martha", "Henry", "Gloria", "Adam", "Teresa", "Douglas", "Sara",
    "Nathan", "Janice", "Zachary", "Jean", "Kyle", "Alice", "Noah", "Madison", "Ethan", "Grace"
  ]
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
    "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams",
    "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips",
    "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris",
    "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson",
    "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks",
    "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins",
    "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster"
  ]
  
  const modules = [
    { code: "CSC101", name: "Introduction to Computer Science", dept: "Management" as const },
    { code: "ENG205", name: "Engineering Principles", dept: "Sciences" as const },
    { code: "BUS301", name: "Business Management", dept: "Management" as const },
    { code: "SCI401", name: "Advanced Science", dept: "Sciences" as const },
    { code: "EDU201", name: "Education Theory", dept: "Education" as const },
    { code: "ACC101", name: "Accounting Fundamentals", dept: "Accounting" as const },
    { code: "MKT201", name: "Marketing Principles", dept: "Marketing" as const },
    { code: "MIS301", name: "Management Information Systems", dept: "Management Information Systems (MIS)" as const },
    { code: "HUM101", name: "Humanities Introduction", dept: "Humanities" as const },
    { code: "AGR201", name: "Agricultural Science", dept: "Agriculture" as const },
    { code: "HLT301", name: "Health Professions", dept: "Health Professions" as const },
    { code: "THE101", name: "Theology Basics", dept: "Theology" as const },
    { code: "CHP201", name: "Chaplaincy Studies", dept: "Chaplaincy / Religious Studies" as const },
  ]
  
  const statuses: RiskNote['status'][] = ['new', 'aeo_review', 'hod_review', 'assistant_dean_review', 'improved', 'resolved', 'disengaged']
  const escalationLevels: RiskNote['escalationLevel'][] = ['aeo', 'hod', 'assistant_dean']
  
  for (let i = 0; i < 400; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const module = modules[Math.floor(Math.random() * modules.length)]
    const studentNumber = formatStudentNumber(i + 1, 2020)
    const studentId = String(i + 1)
    
    // Generate random creation date (within last 30 days)
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    const triggers = []
    
    // Generate random metrics below 70%
    const attendance = 30 + Math.random() * 40 // 30-70%
    const participation = 25 + Math.random() * 45 // 25-70%
    const performance = 35 + Math.random() * 35 // 35-70%
    const tutorialSessions = 40 + Math.random() * 30 // 40-70%
    
    // Randomly trigger different risk types
    if (Math.random() > 0.2 && attendance < 70) {
      triggers.push({ type: 'attendance' as const, value: attendance, threshold: 70, triggered: true })
    }
    if (Math.random() > 0.2 && participation < 70) {
      triggers.push({ type: 'participation' as const, value: participation, threshold: 70, triggered: true })
    }
    if (Math.random() > 0.2 && performance < 70) {
      triggers.push({ type: 'performance' as const, value: performance, threshold: 70, triggered: true })
    }
    if (Math.random() > 0.2 && tutorialSessions < 70) {
      triggers.push({ type: 'tutorial_sessions' as const, value: tutorialSessions, threshold: 70, triggered: true })
    }
    
    // Ensure at least one trigger
    if (triggers.length === 0) {
      triggers.push({ type: 'attendance' as const, value: attendance, threshold: 70, triggered: true })
    }
    
    // Determine escalation level and status based on days
    const workingDays = calculateWorkingDays(createdAt, now)
    let escalationLevel: 'aeo' | 'hod' | 'assistant_dean' = 'aeo'
    let status: RiskNote['status'] = 'aeo_review'
    
    if (workingDays >= 10) {
      escalationLevel = 'assistant_dean'
      status = Math.random() > 0.7 ? 'assistant_dean_review' : (Math.random() > 0.5 ? 'disengaged' : 'assistant_dean_review')
    } else if (workingDays >= 5) {
      escalationLevel = 'hod'
      status = Math.random() > 0.6 ? 'hod_review' : (Math.random() > 0.5 ? 'improved' : 'hod_review')
    } else {
      // Distribute statuses for AEO level
      const rand = Math.random()
      if (rand > 0.85) {
        status = 'improved'
      } else if (rand > 0.7) {
        status = 'resolved'
      } else if (rand > 0.55) {
        status = 'new'
      } else {
        status = 'aeo_review'
      }
    }
    
    // Some percentage should be disengaged
    if (Math.random() > 0.9 && workingDays > 5) {
      status = 'disengaged'
    }
    
    mockNotes.push({
      id: `rn-${studentId}-${module.code}-${createdAt.getTime()}`,
      studentId: studentId,
      studentNumber: studentNumber,
      studentName: `${firstName} ${lastName}`,
      studentEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`,
      moduleCode: module.code,
      moduleName: module.name,
      department: module.dept,
      triggers,
      status,
      escalationLevel,
      createdAt,
      escalatedAt: workingDays >= 5 ? addWorkingDays(createdAt, 5) : undefined,
      lastEscalatedAt: workingDays >= 5 ? addWorkingDays(createdAt, 5) : undefined,
      improvedAt: status === 'improved' ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      resolvedAt: status === 'resolved' ? new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
      attendancePercentage: attendance,
      participationPercentage: participation,
      performancePercentage: performance,
      tutorialSessionsPercentage: tutorialSessions,
      workingDaysSinceCreation: workingDays,
      workingDaysSinceLastEscalation: workingDays >= 5 ? calculateWorkingDays(addWorkingDays(createdAt, 5), now) : workingDays,
      communicationId: `conv-${studentId}-${createdAt.getTime()}`,
    })
  }
  
  return mockNotes
}

export function RiskNotesSummary({ 
  riskNotes: propRiskNotes, 
  onFilter, 
  onExport,
  onViewCommunication,
  onEscalate,
  onMarkImproved
}: RiskNotesSummaryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [escalationFilter, setEscalationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [selectedRiskNote, setSelectedRiskNote] = useState<RiskNote | null>(null)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  
  // Use prop risk notes or generate mock data
  const riskNotes = propRiskNotes.length > 0 ? propRiskNotes : generateMockRiskNotes()
  
  const summary = generateRiskNoteSummary(riskNotes)
  
  // Filter risk notes
  const filteredNotes = riskNotes.filter(note => {
    const matchesSearch = searchTerm === "" || 
      note.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.moduleCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === "all" || note.department.toLowerCase() === departmentFilter.toLowerCase()
    const matchesEscalation = escalationFilter === "all" || note.escalationLevel === escalationFilter
    const matchesStatus = statusFilter === "all" || note.status === statusFilter
    
    return matchesSearch && matchesDepartment && matchesEscalation && matchesStatus
  })
  
  const handleViewCommunication = (note: RiskNote) => {
    setSelectedRiskNote(note)
    setShowCommunicationDialog(true)
    if (onViewCommunication) {
      onViewCommunication(note)
    }
  }
  
  const handleEscalate = (note: RiskNote) => {
    if (shouldEscalate(note)) {
      const nextLevel = getNextEscalationLevel(note.escalationLevel)
      if (nextLevel) {
        if (onEscalate) {
          onEscalate(note)
        }
      }
    }
  }
  
  const getStatusBadge = (status: RiskNote['status']) => {
    const variants: Record<RiskNote['status'], { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      new: { variant: "destructive", label: "New" },
      aeo_review: { variant: "default", label: "AEO Review" },
      hod_review: { variant: "secondary", label: "HOD Review" },
      assistant_dean_review: { variant: "outline", label: "Assistant Dean Review" },
      improved: { variant: "default", label: "Improved" },
      resolved: { variant: "default", label: "Resolved" },
      disengaged: { variant: "destructive", label: "Disengaged" }
    }
    
    const config = variants[status] || variants.new
    return <Badge variant={config.variant}>{config.label}</Badge>
  }
  
  const getEscalationBadge = (level: RiskNote['escalationLevel']) => {
    const colors: Record<RiskNote['escalationLevel'], string> = {
      aeo: "bg-blue-100 text-blue-800",
      hod: "bg-yellow-100 text-yellow-800",
      assistant_dean: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[level]}>{level.toUpperCase()}</Badge>
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Risk Notes</CardTitle>
            <Badge variant="destructive">{summary.new}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.new}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improved</CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">{summary.improved}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.improved}</div>
            <p className="text-xs text-muted-foreground">Students showing improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Still Disengaged</CardTitle>
            <Badge variant="destructive">{summary.stillDisengaged}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.stillDisengaged}</div>
            <p className="text-xs text-muted-foreground">Require further intervention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risk Notes</CardTitle>
            <Badge>{summary.total}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">All active risk notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AEO Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summary.byEscalationLevel.aeo}</div>
            <p className="text-xs text-muted-foreground">At Academic Excellence Office</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">HOD Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{summary.byEscalationLevel.hod}</div>
            <p className="text-xs text-muted-foreground">At Head of Department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assistant Dean Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{summary.byEscalationLevel.assistant_dean}</div>
            <p className="text-xs text-muted-foreground">At Assistant Dean</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search risk notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Humanities">Humanities</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Sciences">Sciences</SelectItem>
                <SelectItem value="Health Professions">Health Professions</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Accounting">Accounting</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Management Information Systems (MIS)">Management Information Systems (MIS)</SelectItem>
                <SelectItem value="Theology">Theology</SelectItem>
                <SelectItem value="Chaplaincy / Religious Studies">Chaplaincy / Religious Studies</SelectItem>
              </SelectContent>
            </Select>

            <Select value={escalationFilter} onValueChange={setEscalationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Escalation Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="aeo">AEO</SelectItem>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="assistant_dean">Assistant Dean</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="aeo_review">AEO Review</SelectItem>
                <SelectItem value="hod_review">HOD Review</SelectItem>
                <SelectItem value="assistant_dean_review">Assistant Dean Review</SelectItem>
                <SelectItem value="improved">Improved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="disengaged">Disengaged</SelectItem>
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

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => onFilter({
                search: searchTerm,
                department: departmentFilter,
                escalation: escalationFilter,
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

      {/* Risk Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Notes List</CardTitle>
          <CardDescription>View and manage all risk notes with escalation tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Triggers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escalation</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => (
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
                    <TableCell>{getStatusBadge(note.status)}</TableCell>
                    <TableCell>{getEscalationBadge(note.escalationLevel)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{note.workingDaysSinceCreation} days</div>
                        {note.workingDaysSinceLastEscalation > 0 && (
                          <div className="text-muted-foreground">
                            {note.workingDaysSinceLastEscalation} since escalation
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCommunication(note)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {shouldEscalate(note) && getNextEscalationLevel(note.escalationLevel) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEscalate(note)}
                          >
                            Escalate
                          </Button>
                        )}
                        {note.status !== 'improved' && note.status !== 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkImproved && onMarkImproved(note)}
                            className="text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark Improved
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Risk Note Communication</DialogTitle>
            <DialogDescription>
              View the communication sent to the student regarding this risk note
            </DialogDescription>
          </DialogHeader>
          {selectedRiskNote && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {selectedRiskNote.studentName}</div>
                  <div><strong>Student Number:</strong> {selectedRiskNote.studentNumber}</div>
                  <div><strong>Email:</strong> {selectedRiskNote.studentEmail}</div>
                  <div><strong>Module:</strong> {selectedRiskNote.moduleCode} - {selectedRiskNote.moduleName}</div>
                  <div><strong>Department:</strong> {selectedRiskNote.department}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Note Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Status:</strong> {getStatusBadge(selectedRiskNote.status)}
                  </div>
                  <div>
                    <strong>Escalation Level:</strong> {getEscalationBadge(selectedRiskNote.escalationLevel)}
                  </div>
                  <div>
                    <strong>Created:</strong> {format(selectedRiskNote.createdAt, "PPP")}
                  </div>
                  {selectedRiskNote.escalatedAt && (
                    <div>
                      <strong>Escalated:</strong> {format(selectedRiskNote.escalatedAt, "PPP")}
                    </div>
                  )}
                  <div>
                    <strong>Working Days Since Creation:</strong> {selectedRiskNote.workingDaysSinceCreation}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedRiskNote.attendancePercentage !== undefined && (
                    <div>
                      <strong>Attendance:</strong> {selectedRiskNote.attendancePercentage.toFixed(1)}%
                      {selectedRiskNote.attendancePercentage < 70 && (
                        <Badge variant="destructive" className="ml-2">Below Threshold</Badge>
                      )}
                    </div>
                  )}
                  {selectedRiskNote.participationPercentage !== undefined && (
                    <div>
                      <strong>Participation:</strong> {selectedRiskNote.participationPercentage.toFixed(1)}%
                      {selectedRiskNote.participationPercentage < 70 && (
                        <Badge variant="destructive" className="ml-2">Below Threshold</Badge>
                      )}
                    </div>
                  )}
                  {selectedRiskNote.performancePercentage !== undefined && (
                    <div>
                      <strong>Performance:</strong> {selectedRiskNote.performancePercentage.toFixed(1)}%
                      {selectedRiskNote.performancePercentage < 70 && (
                        <Badge variant="destructive" className="ml-2">Below Threshold</Badge>
                      )}
                    </div>
                  )}
                  {selectedRiskNote.tutorialSessionsPercentage !== undefined && (
                    <div>
                      <strong>Tutorial Sessions:</strong> {selectedRiskNote.tutorialSessionsPercentage.toFixed(1)}%
                      {selectedRiskNote.tutorialSessionsPercentage < 70 && (
                        <Badge variant="destructive" className="ml-2">Below Threshold</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Sent to Student</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedRiskNote.communicationId ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Communication ID: {selectedRiskNote.communicationId}
                        </p>
                        <p>
                          Dear {selectedRiskNote.studentName},
                        </p>
                        <p className="mt-2">
                          This is an automated risk note to inform you that your academic performance requires attention.
                        </p>
                        <p className="mt-2">
                          {selectedRiskNote.triggers.map((trigger, idx) => (
                            <span key={idx}>
                              Your {trigger.type.replace('_', ' ')} is currently at {trigger.value.toFixed(1)}%, which is below the required 70% threshold.
                              {idx < selectedRiskNote.triggers.length - 1 && <><br /><br /></>}
                            </span>
                          ))}
                        </p>
                        <p className="mt-2">
                          {selectedRiskNote.escalationLevel === 'aeo' 
                            ? 'This risk note has been sent to the Academic Excellence Office (AEO) for review.'
                            : selectedRiskNote.escalationLevel === 'hod'
                            ? 'This risk note has been escalated to the Head of Department (HOD) for review.'
                            : 'This risk note has been escalated to the Assistant Dean for review.'}
                        </p>
                        <p className="mt-2">
                          Please contact your lecturer or academic advisor to discuss your progress and available support options. We are here to help you succeed in your studies.
                        </p>
                        <p className="mt-4">
                          Best regards,<br />
                          Academic Support Team
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No communication sent yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
