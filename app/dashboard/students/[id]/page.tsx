// "use client"

// import { useState, useEffect } from "react"
// import { useParams } from "next/navigation"
// import { AppHeader } from "@/components/layout/app-header"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Filter, Search, GraduationCap, TrendingUp, Award, Calendar } from "lucide-react"
// import ViewMessageDialog from "@/components/admin/view-message-dialog"
// import { getStudent, getCommunicationHistory, getSciBonoPerformance } from "@/lib/data-service"
// import type { Learner, CommunicationHistory } from "@/lib/types"

// export default function StudentReportPage() {
//   const params = useParams()
//   const studentId = parseInt(params.id as string)
//   const [activeTab, setActiveTab] = useState("details")
//   const [selectedMessage, setSelectedMessage] = useState<CommunicationHistory | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [student, setStudent] = useState<Learner | undefined>(undefined)
//   const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([])
//   const [loading, setLoading] = useState(true)

//   // Load student data
//   useEffect(() => {
//     const loadStudentData = () => {
//       setLoading(true)
//       const studentData = getStudent(studentId)
//       if (studentData) {
//         setStudent(studentData)
//         const commHistory = getCommunicationHistory(studentId)
//         setCommunicationHistory(commHistory)
//       }
//       setLoading(false)
//     }
//     loadStudentData()
//   }, [studentId])

//   // Filter communications based on search query and status
//   const filteredCommunications = communicationHistory.filter((comm) => {
//     const matchesSearch =
//       comm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       comm.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       comm.threadCondition.toLowerCase().includes(searchQuery.toLowerCase())

//     const matchesStatus =
//       statusFilter === "all" ||
//       (statusFilter === "unread" && comm.readStatus === "Unread") ||
//       (statusFilter === "read" && comm.readStatus === "Read")

//     return matchesSearch && matchesStatus
//   })

//   if (loading) {
//     return (
//       <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
//         <AppHeader title="Learner Report" subtitle="Loading..." />
//         <div className="flex items-center justify-center h-64">
//           <p className="text-muted-foreground">Loading student data...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!student) {
//     return (
//       <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
//         <AppHeader title="Learner Report" subtitle="Learner Not Found" />
//         <Card>
//           <CardContent className="p-6">
//             <p className="text-muted-foreground">Learner with ID {studentId} not found.</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   const sciBono = student.sciBono

//   // Handle different student data structures - provide defaults if fields are missing
//   const assessments = student.assessments || {
//     AS: 0,
//     CT: 0,
//     WR: 0,
//     PP: 0,
//   }

//   const attendance = student.attendance || {
//     attended: 0,
//     total: 0,
//     percentage: student.attendanceRate || 0,
//   }

//   // If attendance was provided as attendanceRate, calculate attended/total
//   if (student.attendanceRate && !student.attendance) {
//     const total = 32 // Default total sessions
//     attendance.attended = Math.round((student.attendanceRate / 100) * total)
//     attendance.total = total
//     attendance.percentage = student.attendanceRate
//   }

//   // Handle both studentNumber and legacy studentId field (if it exists)
//   const studentNumber = student.studentNumber || (student as any).studentId || `STU${String(student.id).padStart(6, "0")}`
//   const studentName = student.name || ""
//   const studentSurname = student.surname || ""

//   return (
//     <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
//       <AppHeader title="Learner Report" subtitle={`${studentName} ${studentSurname} - ${studentNumber}`} />

//       <div className="grid grid-cols-3 gap-6">
//         <Card className="col-span-1">
//           <CardHeader>
//             <CardTitle className="text-slate-900 dark:text-white">Learner Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>
//               <label className="text-sm font-medium">Learner Number</label>
//               <p className="text-sm text-muted-foreground dark:text-white">{studentNumber}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Name</label>
//               <p className="text-sm text-muted-foreground dark:text-white">
//                 {studentName} {studentSurname}
//               </p>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Email</label>
//               <p className="text-sm text-muted-foreground dark:text-white">{student.email}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Academic Status</label>
//               <p className="text-sm text-muted-foreground dark:text-white">{student.academicStatus}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium">Risk Level</label>
//               <p className="text-sm text-muted-foreground dark:text-white">{student.riskLevel}</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="col-span-2">
//           <CardHeader>
//             <CardTitle>Academic Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div>
//               <h4 className="font-medium mb-2">Current Subject</h4>
//               <Badge variant="outline">{student.subjectCode || "N/A"}</Badge>
//             </div>
//             <div>
//               <h4 className="font-medium mb-2">Previous Subjects</h4>
//               <div className="flex flex-wrap gap-2">
//                 {student.previousSubjects && student.previousSubjects.length > 0 ? (
//                   student.previousSubjects.map((subject) => (
//                     <Badge key={subject} variant="outline">
//                       {subject}
//                     </Badge>
//                   ))
//                 ) : (
//                   <span className="text-sm text-muted-foreground">No previous subjects</span>
//                 )}
//               </div>
//             </div>
//             <div>
//               <h4 className="font-medium mb-2">Assessment Scores</h4>
//               <div className="grid grid-cols-4 gap-4">
//                 <Card>
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-lg">Assignment Score (AS)</CardTitle>
//                     <CardDescription>{assessments.AS}%</CardDescription>
//                   </CardHeader>
//                 </Card>
//                 <Card>
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-lg">Class Test (CT)</CardTitle>
//                     <CardDescription>{assessments.CT}%</CardDescription>
//                   </CardHeader>
//                 </Card>
//                 <Card>
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-lg">Written Report (WR)</CardTitle>
//                     <CardDescription>{assessments.WR}%</CardDescription>
//                   </CardHeader>
//                 </Card>
//                 <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-lg text-purple-700">Preliminary Predicate</CardTitle>
//                     <CardDescription className="text-purple-600 font-semibold">
//                       {assessments.PP > 0 ? assessments.PP : Math.round((assessments.AS + assessments.CT + assessments.WR) / 3)}%
//                     </CardDescription>
//                   </CardHeader>
//                 </Card>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {sciBono?.isParticipant && (
//         <Card className="border-2 border-blue-200 dark:border-blue-800">
//           <CardHeader>
//             <div className="flex items-center gap-2">
//               <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               <CardTitle>Sci-Bono Performance</CardTitle>
//             </div>
//             <CardDescription>STEM Learning Platform participation and performance metrics</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Status and Dates */}
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="text-sm font-medium text-muted-foreground">Status</label>
//                 <div className="mt-1">
//                   <Badge
//                     variant={
//                       sciBono.status === "completed"
//                         ? "default"
//                         : sciBono.status === "active"
//                         ? "secondary"
//                         : "outline"
//                     }
//                     className={
//                       sciBono.status === "completed"
//                         ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
//                         : sciBono.status === "active"
//                         ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
//                         : ""
//                     }
//                   >
//                     {sciBono.status === "completed"
//                       ? "Completed"
//                       : sciBono.status === "active"
//                       ? "Active"
//                       : "Inactive"}
//                   </Badge>
//                 </div>
//               </div>
//               {sciBono.enrollmentDate && (
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Enrollment Date</label>
//                   <div className="mt-1 flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <p className="text-sm font-medium">
//                       {sciBono.enrollmentDate.toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//               )}
//               {sciBono.completionDate && (
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
//                   <div className="mt-1 flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <p className="text-sm font-medium">
//                       {sciBono.completionDate.toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Performance Breakdown */}
//             <div>
//               <h4 className="font-medium mb-4">Performance Breakdown</h4>
//               <div className="grid grid-cols-3 gap-4">
//                 {/* Robotics */}
//                 <Card>
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-base">Robotics Sandbox</CardTitle>
//                     <CardDescription className="text-lg font-semibold text-primary">
//                       {sciBono.scores.robotics.overallScore}%
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="p-4 pt-0 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Circuit Builder:</span>
//                       <span className="font-medium">{sciBono.scores.robotics.circuitBuilder}%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Robot Design:</span>
//                       <span className="font-medium">{sciBono.scores.robotics.robotDesign}%</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Physics Simulation:</span>
//                       <span className="font-medium">{sciBono.scores.robotics.physicsSimulation}%</span>
//                     </div>
//                     <div className="flex justify-between pt-2 border-t">
//                       <span className="text-muted-foreground">Activities:</span>
//                       <span className="font-medium">{sciBono.scores.robotics.activitiesCompleted}</span>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Math */}
//                 <Card>
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-base">Gamified Math</CardTitle>
//                     <CardDescription className="text-lg font-semibold text-primary">
//                       {sciBono.scores.math.overallScore}%
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="p-4 pt-0 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Challenges:</span>
//                       <span className="font-medium">{sciBono.scores.math.challengesCompleted}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Puzzles Solved:</span>
//                       <span className="font-medium">{sciBono.scores.math.puzzlesSolved}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Adaptive Level:</span>
//                       <span className="font-medium">{sciBono.scores.math.adaptiveLevel}/10</span>
//                     </div>
//                     <div className="flex justify-between pt-2 border-t">
//                       <span className="text-muted-foreground">Badges:</span>
//                       <span className="font-medium">{sciBono.scores.math.badgesEarned}</span>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* AI Tutor */}
//                 <Card>
//                   <CardHeader className="p-4">
//                     <CardTitle className="text-base">AI Tutor</CardTitle>
//                     <CardDescription className="text-lg font-semibold text-primary">
//                       {sciBono.scores.aiTutor.averageRating.toFixed(1)}/5.0
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="p-4 pt-0 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Sessions:</span>
//                       <span className="font-medium">{sciBono.scores.aiTutor.sessionsCompleted}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">Help Requests:</span>
//                       <span className="font-medium">{sciBono.scores.aiTutor.helpRequests}</span>
//                     </div>
//                     <div className="pt-2 border-t">
//                       <span className="text-muted-foreground text-xs">Topics Covered:</span>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {sciBono.scores.aiTutor.topicsCovered.map((topic, idx) => (
//                           <Badge key={idx} variant="outline" className="text-xs">
//                             {topic}
//                           </Badge>
//                         ))}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>

//             {/* Attendance and Badges */}
//             <div className="grid grid-cols-2 gap-4">
//               <Card>
//                 <CardHeader className="p-4">
//                   <CardTitle className="text-base">Sci-Bono Attendance</CardTitle>
//                   <CardDescription className="text-2xl font-bold text-primary">
//                     {sciBono.attendance.toFixed(2)}%
//                   </CardDescription>
//                 </CardHeader>
//               </Card>
//               <Card>
//                 <CardHeader className="p-4">
//                   <CardTitle className="text-base flex items-center gap-2">
//                     <Award className="h-4 w-4" />
//                     Badges Earned
//                   </CardTitle>
//                   <CardDescription>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {sciBono.badgesEarned.map((badge, idx) => (
//                         <Badge key={idx} variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
//                           {badge}
//                         </Badge>
//                       ))}
//                     </div>
//                   </CardDescription>
//                 </CardHeader>
//               </Card>
//             </div>

//             {/* Improvements Section */}
//             {sciBono.improvements && (
//               <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
//                 <CardHeader>
//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
//                     <CardTitle>Post Sci-Bono Improvements</CardTitle>
//                   </div>
//                   <CardDescription>Performance comparison before and after Sci-Bono participation</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <h5 className="font-medium mb-2 text-sm text-muted-foreground">Assessment Scores</h5>
//                       <div className="space-y-2">
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm">Pre Sci-Bono:</span>
//                           <span className="font-medium">
//                             {sciBono.improvements.preSciBono.assessments.PP}%
//                           </span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm">Post Sci-Bono:</span>
//                           <span className="font-medium text-green-600 dark:text-green-400">
//                             {sciBono.improvements.postSciBono.assessments.PP}%
//                           </span>
//                         </div>
//                         <div className="flex justify-between items-center pt-2 border-t">
//                           <span className="text-sm font-semibold">Improvement:</span>
//                           <span className="font-bold text-green-600 dark:text-green-400">
//                             +{sciBono.improvements.improvements.assessmentImprovement}%
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <h5 className="font-medium mb-2 text-sm text-muted-foreground">Attendance</h5>
//                       <div className="space-y-2">
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm">Pre Sci-Bono:</span>
//                           <span className="font-medium">
//                             {sciBono.improvements.preSciBono.attendance.percentage}%
//                           </span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm">Post Sci-Bono:</span>
//                           <span className="font-medium text-green-600 dark:text-green-400">
//                             {sciBono.improvements.postSciBono.attendance.percentage}%
//                           </span>
//                         </div>
//                         <div className="flex justify-between items-center pt-2 border-t">
//                           <span className="text-sm font-semibold">Improvement:</span>
//                           <span className="font-bold text-green-600 dark:text-green-400">
//                             +{sciBono.improvements.improvements.attendanceImprovement.toFixed(1)}%
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="pt-4 border-t">
//                     <h5 className="font-medium mb-2 text-sm text-muted-foreground">Risk Level Change</h5>
//                     <div className="flex items-center gap-2">
//                       <Badge variant="outline">{sciBono.improvements.preSciBono.riskLevel}</Badge>
//                       <span className="text-muted-foreground">→</span>
//                       <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">
//                         {sciBono.improvements.postSciBono.riskLevel}
//                       </Badge>
//                       <span className="text-sm text-muted-foreground ml-2">
//                         {sciBono.improvements.improvements.riskLevelChange}
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Urgent Matter Track History</CardTitle>
//           <CardDescription>Track all communications and interventions</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center gap-4 mb-6">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
//               <Input
//                 placeholder="Search communications..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl"
//               />
//             </div>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-slate-200 rounded-xl">
//                 <SelectValue placeholder="Filter by status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="unread">Unread</SelectItem>
//                 <SelectItem value="read">Read</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="rounded-xl border border-slate-200 overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-slate-50 dark:bg-slate-800">
//                   <TableHead className="font-semibold dark:text-white">Message ID</TableHead>
//                   <TableHead className="font-semibold dark:text-white">Role</TableHead>
//                   <TableHead className="font-semibold dark:text-white">Name</TableHead>
//                   <TableHead className="font-semibold dark:text-white">Thread Condition</TableHead>
//                   <TableHead className="font-semibold dark:text-white">Status</TableHead>
//                   <TableHead className="font-semibold">Date Sent</TableHead>
//                   <TableHead className="font-semibold dark:text-white">Date Read</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredCommunications.map((comm) => (
//                   <TableRow key={comm.id}>
//                     <TableCell>{comm.id}</TableCell>
//                     <TableCell>{comm.role}</TableCell>
//                     <TableCell>{comm.name}</TableCell>
//                     <TableCell>
//                       <button
//                         onClick={() => setSelectedMessage(comm)}
//                         className="text-left hover:text-primary hover:underline"
//                       >
//                         {comm.threadCondition}
//                       </button>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={comm.readStatus === "Unread" ? "destructive" : "secondary"}>
//                         {comm.readStatus}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{comm.dateSent}</TableCell>
//                     <TableCell>{comm.readStatus === "Unread" ? "-" : comm.dateRead}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <ViewMessageDialog
//         open={selectedMessage !== null}
//         onOpenChange={(open) => !open && setSelectedMessage(null)}
//         message={selectedMessage}
//       />
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Search } from "lucide-react"
import ViewMessageDialog from "@/components/admin/view-message-dialog"
import type { Learner } from "@/lib/types"

// Mock data for student details
const mockCommunicationHistory = [
  {
    id: "156",
    role: "TUTOR",
    name: "Mr. Mazibuko",
    threadCondition: "ENG101 - Engineering Fundamentals Assignment",
    readStatus: "Unread",
    dateSent: "2025-03-12 16:45:12",
    dateRead: "-",
  },
  {
    id: "262",
    role: "TUTOR",
    name: "Ms Nkosi",
    threadCondition: "ENG101 - Engineering Fundamentals Assignment",
    readStatus: "Read",
    dateSent: "2025-03-12 18:04:36",
    dateRead: "2025-04-02 07:11:21",
  },
  {
    id: "567",
    role: "TUTOR",
    name: "Mr SEKHITLA",
    threadCondition: "ENG101 - Tutorial Session",
    readStatus: "Read",
    dateSent: "2025-03-28 14:37:20",
    dateRead: "2025-04-02 07:11:21",
  },
  {
    id: "606",
    role: "TUTOR",
    name: "Mr SEKHITLA",
    threadCondition: "ENG101 - Recess Catch-up Plan",
    readStatus: "Read",
    dateSent: "2025-03-31 06:12:50",
    dateRead: "2025-04-02 07:11:21",
  },
  {
    id: "791",
    role: "TUTOR",
    name: "Mr SEKHITLA",
    threadCondition: "ENG101 - Tutorial Session",
    readStatus: "Unread",
    dateSent: "2025-04-09 11:52:47",
    dateRead: "-",
  },
  {
    id: "812",
    role: "AEO",
    name: "Ms M Mashile",
    threadCondition: "IMPORTANT SECOND TERM INFORMATION AND SCHEDULE",
    readStatus: "Unread",
    dateSent: "2025-04-10 09:15:30",
    dateRead: "-",
  },
]

// Mock student data - in a real app, this would come from an API
const mockStudent: Learner = {
  id: 1,
  studentNumber: "ST2024001",
  name: "John",
  surname: "Smith",
  email: "john.smith@student.edu",
  academicStatus: "First-time",
    subjectCode: "ENG101",
    assessments: { AS: 75, CT: 80, WR: 85, PP: 73 },
  attendance: { attended: 28, total: 32, percentage: 87.5 },
  riskLevel: "Good",
  enrollmentYear: 2024,
  semester: 1,
  teacherId: 1,
  previousSubjects: ["ENG101"],
}

export default function StudentReportPage() {
  const params = useParams()
  const studentId = parseInt(params.id as string)
  const [activeTab, setActiveTab] = useState("details")
  const [selectedMessage, setSelectedMessage] = useState<typeof mockCommunicationHistory[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const student = mockStudent // In real app, this would come from params.id

  // Filter communications based on search query and status
  const filteredCommunications = mockCommunicationHistory.filter((comm) => {
    const matchesSearch = 
      comm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.threadCondition.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "unread" && comm.readStatus === "Unread") ||
      (statusFilter === "read" && comm.readStatus === "Read")
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <AppHeader 
        title="Student Report" 
        subtitle={`${student.name} ${student.surname} - ${student.studentNumber}`}
      />

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Student Number</label>
              <p className="text-sm text-muted-foreground dark:text-white">{student.studentNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground dark:text-white">{student.name} {student.surname}</p>
            </div>
          <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground dark:text-white">{student.email}</p>
          </div>
            <div>
              <label className="text-sm font-medium">Academic Status</label>
              <p className="text-sm text-muted-foreground dark:text-white">{student.academicStatus}</p>
        </div>
            <div>
              <label className="text-sm font-medium">Risk Level</label>
              <p className="text-sm text-muted-foreground dark:text-white">{student.riskLevel}</p>
      </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Current Module</h4>
              <Badge variant="outline">{student.subjectCode}</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">Previous Modules</h4>
              <div className="flex flex-wrap gap-2">
                {student.previousSubjects?.map((module) => (
                  <Badge key={module} variant="outline">{module}</Badge>
                ))}
              </div>
              </div>
            <div>
              <h4 className="font-medium mb-2">Assessment Scores</h4>
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Assignment Score (AS)</CardTitle>
                    <CardDescription>{student.assessments.AS}%</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Class Test (CT)</CardTitle>
                    <CardDescription>{student.assessments.CT}%</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">Written Report (WR)</CardTitle>
                    <CardDescription>{student.assessments.WR}%</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg text-purple-700">Preliminary Predicate</CardTitle>
                    <CardDescription className="text-purple-600 font-semibold">
                      {Math.round((student.assessments.AS + student.assessments.CT + student.assessments.WR) / 3)}%
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              </div>
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Urgent Matter Track History</CardTitle>
          <CardDescription>Track all communications and interventions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search communications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-12 bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="font-semibold dark:text-white">Message ID</TableHead>
                  <TableHead className="font-semibold dark:text-white">Role</TableHead>
                  <TableHead className="font-semibold dark:text-white">Name</TableHead>
                  <TableHead className="font-semibold dark:text-white">Thread Condition</TableHead>
                  <TableHead className="font-semibold dark:text-white">Status</TableHead>
                  <TableHead className="font-semibold">Date Sent</TableHead>
                  <TableHead className="font-semibold dark:text-white">Date Read</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>{comm.id}</TableCell>
                    <TableCell>{comm.role}</TableCell>
                    <TableCell>{comm.name}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedMessage(comm)}
                        className="text-left hover:text-primary hover:underline"
                      >
                        {comm.threadCondition}
                      </button>
                    </TableCell>
                            <TableCell>
                      <Badge variant={comm.readStatus === "Unread" ? "destructive" : "secondary"}>
                        {comm.readStatus}
                      </Badge>
                            </TableCell>
                    <TableCell>{comm.dateSent}</TableCell>
                    <TableCell>{comm.readStatus === "Unread" ? "-" : comm.dateRead}</TableCell>
                    </TableRow>
                  ))
                }
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>

      <ViewMessageDialog
        open={selectedMessage !== null}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
        
        message={selectedMessage}
      />
    </div>
  )
}
