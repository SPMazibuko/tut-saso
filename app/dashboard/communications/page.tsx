"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Users, Send, Paperclip, MoreVertical, MessageSquare, Info, Filter, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateConversationDialog } from "@/components/communications/create-conversation-dialog"
import { CreateGroupDialog } from "@/components/communications/create-group-dialog"

import type { Conversation, Message } from "@/lib/types"
import { generateMockRiskNotes, RiskNotesSummary } from "@/components/admin/risk-notes-summary"
import { MonthlyReports } from "@/components/admin/monthly-reports"
import { RiskNotesSummarySheet } from "@/components/admin/risk-notes-summary-sheet"
import { UploadRecordsSummary } from "@/components/admin/upload-records-summary"

// Mock student data
const mockStudents = [
  {
    id: "1",
    name: "John Smith",
    studentNumber: "2020123456",
    moduleCode: "CSC101",
    status: "probation",
    department: "Computer Science",
    lastUpdated: new Date(2025, 8, 1),
  },
  {
    id: "2",
    name: "Mary Johnson",
    studentNumber: "2020123457",
    moduleCode: "CSC101",
    status: "readmitted",
    department: "Computer Science",
    lastUpdated: new Date(2025, 8, 1),
  },
  {
    id: "3",
    name: "James Brown",
    studentNumber: "2020123458",
    moduleCode: "ENG205",
    status: "other",
    department: "Engineering",
    lastUpdated: new Date(2025, 8, 8),
  },
  {
    id: "4",
    name: "Sarah Davis",
    studentNumber: "2020123459",
    moduleCode: "BUS301",
    status: "probation",
    department: "Business",
    lastUpdated: new Date(2025, 8, 15),
  },
  {
    id: "5",
    name: "Michael Wilson",
    studentNumber: "2020123460",
    moduleCode: "SCI401",
    status: "other",
    department: "Science",
    lastUpdated: new Date(2025, 8, 15),
  },
]

// Mock data for conversations (imported from lecturer's page and extended for admin view)
const mockConversations: Conversation[] = [
  {
    id: "1",
    subjectMatter: "Risk Note",
    isViewOnly: true,
    participants: [
      {
        id: "1", email: "john.smith@student.edu", firstName: "John", lastName: "Smith", role: "student", readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        }
      },
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "System",
        lastName: "Admin",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "1",
      senderId: "1",
      content: "Thank you for the extension on the assignment!",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
    isGroup: false,
    unreadCount: 0,
    readStats: {
      total: 2,
      read: 2,
      unread: 0,
      readMethods: {
        portal: 2,
        student_email: 0,
        personal_email: 0
      }
    }
  },
  {
    id: "2",
    subjectMatter: "Communication",
    isViewOnly: false,
    participants: [
      { id: "2", email: "mary.johnson@university.edu", firstName: "Mary", lastName: "Johnson", role: "tutor", readStatus: { hasRead: false, readMethod: null, readAt: null } },
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "System",
        lastName: "Admin",
        role: "admin",
        readStatus: { hasRead: true, readMethod: "portal", readAt: new Date(Date.now() - 30 * 60 * 1000) }
      },
    ],
    lastMessage: {
      id: "2",
      conversationId: "2",
      senderId: "2",
      content: "The weekly progress report is ready for review.",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      readBy: [],
    },
    isGroup: false,
    unreadCount: 1,
    readStats: {
      total: 2,
      read: 1,
      unread: 1,
      readMethods: {
        portal: 1,
        student_email: 0,
        personal_email: 0
      }
    }
  },
  {
    id: "3",
    subjectMatter: "Risk Note",
    isViewOnly: true,
    participants: [
      {
        id: "3",
        email: "thabo.mthembu@student.edu",
        firstName: "Thabo",
        lastName: "Mthembu",
        role: "student",
        readStatus: {
          hasRead: false,
          readMethod: null,
          readAt: null,
        },
      },
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "System",
        lastName: "Admin",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "3",
      senderId: "admin",
      content: "Your attendance has fallen below 70%. Please meet with your advisor this week.",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
    isGroup: false,
    unreadCount: 1,
    readStats: {
      total: 2,
      read: 1,
      unread: 1,
      readMethods: {
        portal: 1,
        student_email: 0,
        personal_email: 0,
      },
    },
  },
  {
    id: "4",
    subjectMatter: "Communication",
    isViewOnly: false,
    isGroup: true,
    name: "First-Year Orientation Group",
    participants: [
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "Student",
        lastName: "Success",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      },
      {
        id: "s1",
        email: "nomsa.khumalo@student.edu",
        firstName: "Nomsa",
        lastName: "Khumalo",
        role: "student",
        readStatus: {
          hasRead: true,
          readMethod: "student_email",
          readAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
      },
      {
        id: "s2",
        email: "peter.ngwenya@student.edu",
        firstName: "Peter",
        lastName: "Ngwenya",
        role: "student",
        readStatus: {
          hasRead: false,
          readMethod: null,
          readAt: null,
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "4",
      senderId: "admin",
      content: "Welcome to Solusi! Please read the orientation guide and confirm your attendance at the faculty briefing.",
      sentAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      readBy: ["admin", "s1"],
    },
    unreadCount: 1,
    readStats: {
      total: 3,
      read: 2,
      unread: 1,
      readMethods: {
        portal: 2,
        student_email: 1,
        personal_email: 0,
      },
    },
  },
  {
    id: "5",
    subjectMatter: "Communication",
    isViewOnly: false,
    participants: [
      {
        id: "4",
        email: "sipho.ndlovu@university.edu",
        firstName: "Sipho",
        lastName: "Ndlovu",
        role: "tutor",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      },
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "System",
        lastName: "Admin",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "5",
      senderId: "4",
      content: "Several students in CSC101 have missed the last two tutorials. Can we trigger early support?",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
    isGroup: false,
    unreadCount: 0,
    readStats: {
      total: 2,
      read: 2,
      unread: 0,
      readMethods: {
        portal: 2,
        student_email: 0,
        personal_email: 0,
      },
    },
  },
  {
    id: "6",
    subjectMatter: "Risk Note",
    isViewOnly: true,
    participants: [
      {
        id: "5",
        email: "lerato.molefe@student.edu",
        firstName: "Lerato",
        lastName: "Molefe",
        role: "student",
        readStatus: {
          hasRead: false,
          readMethod: null,
          readAt: null,
        },
      },
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "Assistant",
        lastName: "Dean",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "6",
      senderId: "admin",
      content: "Your performance places you at risk of exclusion. Please schedule a consultation within 5 working days.",
      sentAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
    isGroup: false,
    unreadCount: 1,
    readStats: {
      total: 2,
      read: 1,
      unread: 1,
      readMethods: {
        portal: 1,
        student_email: 0,
        personal_email: 0,
      },
    },
  },
  {
    id: "7",
    subjectMatter: "Communication",
    isViewOnly: false,
    isGroup: true,
    name: "At-Risk Students Support Group",
    participants: [
      {
        id: "admin",
        email: "aeo@university.edu",
        firstName: "Academic",
        lastName: "Excellence Office",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
      },
      {
        id: "s6",
        email: "kagiso.sithole@student.edu",
        firstName: "Kagiso",
        lastName: "Sithole",
        role: "student",
        readStatus: {
          hasRead: true,
          readMethod: "student_email",
          readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      },
      {
        id: "s7",
        email: "andi.mkhize@student.edu",
        firstName: "Andiswa",
        lastName: "Mkhize",
        role: "student",
        readStatus: {
          hasRead: false,
          readMethod: null,
          readAt: null,
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "7",
      senderId: "admin",
      content: "Remember to complete your weekly check-in form before Friday so we can support your progress.",
      sentAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
      readBy: ["admin", "s6"],
    },
    unreadCount: 1,
    readStats: {
      total: 3,
      read: 2,
      unread: 1,
      readMethods: {
        portal: 2,
        student_email: 1,
        personal_email: 0,
      },
    },
  },
  {
    id: "8",
    subjectMatter: "Info",
    isViewOnly: true,
    participants: [
      {
        id: "6",
        email: "hod.business@university.edu",
        firstName: "Nandi",
        lastName: "Dlamini",
        role: "tutor",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        },
      },
      {
        id: "admin",
        email: "admin@university.edu",
        firstName: "System",
        lastName: "Admin",
        role: "admin",
        readStatus: {
          hasRead: true,
          readMethod: "portal",
          readAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
        },
      },
    ],
    lastMessage: {
      id: "1",
      conversationId: "8",
      senderId: "admin",
      content: "Faculty meeting on student success analytics is scheduled for Monday at 10:00 in the Senate Room.",
      sentAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      readBy: ["admin", "6"],
    },
    isGroup: false,
    unreadCount: 0,
    readStats: {
      total: 2,
      read: 2,
      unread: 0,
      readMethods: {
        portal: 2,
        student_email: 0,
        personal_email: 0,
      },
    },
  },
]

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      conversationId: "1",
      senderId: "admin",
      content:
        "Hi John, I've approved your extension request for the programming assignment. You now have until Friday to submit.",
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      readBy: ["1"],
    },
    {
      id: "2",
      conversationId: "1",
      senderId: "1",
      content:
        "Thank you so much! I really appreciate your understanding. I'll make sure to submit it by Friday.",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
    {
      id: "3",
      conversationId: "1",
      senderId: "1",
      content: "Thank you for the extension on the assignment!",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
  ],
  "2": [
    {
      id: "1",
      conversationId: "2",
      senderId: "2",
      content: "Hi, I've completed the weekly progress report for our tutorial groups.",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
    {
      id: "2",
      conversationId: "2",
      senderId: "2",
      content: "The weekly progress report is ready for review.",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      readBy: [],
    },
  ],
  "3": [
    {
      id: "1",
      conversationId: "3",
      senderId: "admin",
      content: "Your attendance has fallen below 70%. Please meet with your advisor this week.",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
  ],
  "4": [
    {
      id: "1",
      conversationId: "4",
      senderId: "admin",
      content: "Welcome to Solusi! Please read the orientation guide and confirm your attendance at the faculty briefing.",
      sentAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      readBy: ["admin", "s1"],
    },
  ],
  "5": [
    {
      id: "1",
      conversationId: "5",
      senderId: "4",
      content: "Several students in CSC101 have missed the last two tutorials. Can we trigger early support?",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
  ],
  "6": [
    {
      id: "1",
      conversationId: "6",
      senderId: "admin",
      content: "Your performance places you at risk of exclusion. Please schedule a consultation within 5 working days.",
      sentAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      readBy: ["admin"],
    },
  ],
  "7": [
    {
      id: "1",
      conversationId: "7",
      senderId: "admin",
      content: "Remember to complete your weekly check-in form before Friday so we can support your progress.",
      sentAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
      readBy: ["admin", "s6"],
    },
  ],
  "8": [
    {
      id: "1",
      conversationId: "8",
      senderId: "admin",
      content: "Faculty meeting on student success analytics is scheduled for Monday at 10:00 in the Senate Room.",
      sentAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      readBy: ["admin", "6"],
    },
  ],
}

// Mock data for risk notes summary
const riskNotesSummary = {
  total: 156,
  byDepartment: [
    { department: "Computer Science", count: 45 },
    { department: "Engineering", count: 38 },
    { department: "Business", count: 35 },
    { department: "Arts", count: 28 },
    { department: "Science", count: 10 },
  ],
  byRiskLevel: [
    { level: "High", count: 32 },
    { level: "Medium", count: 58 },
    { level: "Low", count: 66 },
  ],
  byStatus: [
    { status: "Resolved", count: 89 },
    { status: "In Progress", count: 45 },
    { status: "New", count: 22 },
  ],
}

// Mock data for uploaded records
const uploadedRecords = {
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
}

// Mock data for monthly reports
const monthlyReports = {
  riskNotes: [
    { month: "Jan", count: 25 },
    { month: "Feb", count: 30 },
    { month: "Mar", count: 28 },
    { month: "Apr", count: 35 },
    { month: "May", count: 32 },
    { month: "Jun", count: 40 },
  ],
  communications: [
    { month: "Jan", count: 120 },
    { month: "Feb", count: 150 },
    { month: "Mar", count: 140 },
    { month: "Apr", count: 180 },
    { month: "May", count: 160 },
    { month: "Jun", count: 200 },
  ],
}

// Mock data for risk notes used across Risk Notes views
const mockRiskNotes = generateMockRiskNotes()

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-destructive/10 text-destructive"
    case "tutor":
      return "bg-primary/10 text-primary"
    case "student":
      return "bg-green-100 text-green-800"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const formatMessageTime = (date: Date) => {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}

const getConversationName = (conversation: Conversation) => {
  if (conversation.isGroup && conversation.name) {
    return conversation.name
  }

  const otherParticipant = conversation.participants.find((p) => p.id !== "admin")
  return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Unknown"
}

const getConversationAvatar = (conversation: Conversation) => {
  if (conversation.isGroup) {
    return "/diverse-group-meeting.png"
  }

  const otherParticipant = conversation.participants.find((p) => p.id !== "admin")
  return otherParticipant?.avatar || "/placeholder.svg?height=40&width=40"
}

export default function AdminCommunicationsPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateConversation, setShowCreateConversation] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")

  // Student filtering state
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentStatusFilter, setStudentStatusFilter] = useState("all")

  // Filter conversations based on search, role filter, and date range
  const filteredConversations = mockConversations.filter((conversation) => {
    const term = searchTerm.toLowerCase().trim()

    const matchesSearch =
      term === "" ||
      getConversationName(conversation).toLowerCase().includes(term) ||
      conversation.subjectMatter?.toLowerCase().includes(term) ||
      conversation.participants.some(
        (p) =>
          p.firstName.toLowerCase().includes(term) ||
          p.lastName.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term),
      )

    const matchesFilter =
      filterType === "all" ||
      conversation.participants.some((p) => p.role === filterType)

    let matchesDate = true
    if (dateRange !== "all" && conversation.lastMessage?.sentAt) {
      const now = new Date()
      const sent = conversation.lastMessage.sentAt
      const diffMs = now.getTime() - sent.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      if (dateRange === "today") {
        matchesDate = diffDays < 1
      } else if (dateRange === "week") {
        matchesDate = diffDays < 7
      } else if (dateRange === "month") {
        matchesDate = diffDays < 30
      } else if (dateRange === "year") {
        matchesDate = diffDays < 365
      }
    }

    return matchesSearch && matchesFilter && matchesDate
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    // In a real app, this would send the message to the backend
    console.log("Sending message:", newMessage, "to conversation:", selectedConversation.id)
    setNewMessage("")
  }

  // Filter students based on search term and status
  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = studentSearchTerm === "" ||
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.moduleCode.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(studentSearchTerm.toLowerCase())

    const matchesStatus = studentStatusFilter === "all" || student.status === studentStatusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 dark:bg-sidebar">
      <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-10 xl:px-16">
        <AppHeader
          title="Communications"
          subtitle="Monitor and manage communications, risk notes, and student records"
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Student List</TabsTrigger>
              <TabsTrigger value="risk-notes">Risk Notes</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>

              <Button onClick={() => setShowCreateConversation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Risk Notes</CardTitle>
                  <Badge>{riskNotesSummary.total}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{riskNotesSummary.byRiskLevel[0].count}</div>
                  <p className="text-xs text-muted-foreground">High Risk Cases</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uploaded Records</CardTitle>
                  <Badge>{uploadedRecords.total}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uploadedRecords.byStatus[0].count}</div>
                  <p className="text-xs text-muted-foreground">Processed Records</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Reports</CardTitle>
                  <Badge variant="outline">Last 30 Days</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReports.riskNotes[5].count}</div>
                  <p className="text-xs text-muted-foreground">New Risk Notes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Communications</CardTitle>
                  <Badge variant="outline">Last 30 Days</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReports.communications[5].count}</div>
                  <p className="text-xs text-muted-foreground">Total Messages</p>
                </CardContent>
              </Card>
            </div>

            {/* Communications and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Conversations List */}
              <Card className="lg:col-span-1 border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50/50 dark:from-slate-800 dark:to-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        onClick={() => setShowCreateConversation(true)}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                      <Button onClick={() => setShowCreateGroup(true)} variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        New Group
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search conversations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Conversations</SelectItem>
                            <SelectItem value="student">Students</SelectItem>
                            <SelectItem value="tutor">Tutors</SelectItem>
                            <SelectItem value="admin">Administrators</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="h-[400px]">
                    {/* extra right padding so content doesn't sit under the scrollbar */}
                    <div className="p-2 pr-6">
                      {filteredConversations.map((conversation) => {
                        const otherParticipant = conversation.participants.find((p) => p.id !== "admin")
                        return (
                          <div
                            key={conversation.id}
                            className={`grid grid-cols-[auto_1fr] items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 min-w-0 w-full max-w-full overflow-hidden hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 hover:border-purple-200 hover:shadow-sm ${selectedConversation?.id === conversation.id ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700" : ""
                              }`}
                            onClick={() => setSelectedConversation(conversation)}
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={otherParticipant?.avatar || "/placeholder.svg"}
                                  alt={otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Unknown"}
                                />
                                <AvatarFallback>
                                  {otherParticipant ? `${otherParticipant.firstName[0]}${otherParticipant.lastName[0]}` : "U"}
                                </AvatarFallback>
                              </Avatar>
                              {(conversation.unreadCount ?? 0) > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 max-w-full">
                              <div className="grid grid-cols-[1fr_auto] items-center gap-2 mb-1 min-w-0">
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Unknown"}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-1 min-w-0 max-w-full overflow-hidden">
                                    {otherParticipant && (
                                      <Badge className={`text-xs max-w-full truncate ${getRoleBadgeColor(otherParticipant.role)}`}>
                                        {otherParticipant.role}
                                      </Badge>
                                    )}
                                    {conversation.subjectMatter && (
                                      <Badge
                                        className="max-w-[140px] truncate"
                                        variant={
                                          conversation.subjectMatter === "Risk Note"
                                            ? "destructive"
                                            : conversation.subjectMatter === "Info"
                                              ? "secondary"
                                              : "default"
                                        }
                                        title={conversation.subjectMatter}
                                      >
                                        {conversation.subjectMatter}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {conversation.participants.length > 1 && (
                                  <div className="shrink-0">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => window.location.href = `/dashboard/communications/${conversation.id}`}>
                                          <Info className="h-4 w-4 mr-2" />
                                          See Details
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 min-w-0 w-full">
                                <p
                                  className="text-xs text-muted-foreground truncate flex-1 min-w-0 w-full"
                                  title={conversation.lastMessage?.content || ""}
                                >
                                  {conversation.lastMessage?.content || "No messages yet"}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {conversation.lastMessage ? formatMessageTime(conversation.lastMessage.sentAt) : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2 border-0 shadow-xl bg-white dark:bg-black rounded-2xl overflow-hidden">
                <CardContent className="p-0 flex flex-col h-[600px]">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50/50 dark:from-slate-800 dark:to-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-purple-100">
                            <AvatarImage
                              src={getConversationAvatar(selectedConversation) || "/placeholder.svg"}
                              alt={getConversationName(selectedConversation)}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white dark:bg-slate-800 dark:text-slate-300">
                              {selectedConversation.isGroup
                                ? "G"
                                : selectedConversation.participants.find((p) => p.id !== "admin")
                                  ? `${selectedConversation.participants.find((p) => p.id !== "admin")!.firstName[0]}${selectedConversation.participants.find((p) => p.id !== "admin")!.lastName[0]
                                  }`
                                  : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{getConversationName(selectedConversation)}</h3>
                            <p className="text-sm text-slate-600">
                              {selectedConversation.isGroup
                                ? `${selectedConversation.participants.length} participants`
                                : "Online"}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="hover:bg-purple-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {(mockMessages[selectedConversation.id] || []).map((message) => {
                            const sender = selectedConversation.participants.find((p) => p.id === message.senderId)
                            const isOwnMessage = message.senderId === "admin"

                            return (
                              <div key={message.id} className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={sender?.avatar || "/placeholder.svg"}
                                    alt={sender ? `${sender.firstName} ${sender.lastName}` : "Unknown"}
                                  />
                                  <AvatarFallback>
                                    {sender ? `${sender.firstName[0]}${sender.lastName[0]}` : "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`flex-1 max-w-[70%] ${isOwnMessage ? "text-right" : ""}`}>
                                  <div
                                    className={`p-3 rounded-lg ${isOwnMessage
                                        ? "bg-primary text-primary-foreground ml-auto"
                                        : "bg-muted text-muted-foreground"
                                      }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{formatMessageTime(message.sentAt)}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 bg-gradient-to-r from-slate-50 to-purple-50/50 dark:from-slate-800 dark:to-slate-700/50 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-purple-100">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="flex-1 bg-white border-slate-200 focus:border-purple-300 focus:ring-purple-200"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center p-8">
                      <div>
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
                        <p className="text-slate-600 mb-4">Choose a conversation from the list to start messaging</p>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateConversation(true)}
                          size="sm"
                          className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
                        >
                          <Plus className="h-4 w-4" />
                          Start New Chat
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk-notes" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Note Tracking System</CardTitle>
                  <CardDescription>
                    Automatic risk note generation based on 70% threshold for attendance, participation, performance, and tutorial sessions.
                    Risk notes are automatically escalated after 5 working days without improvement: AEO → HOD → Assistant Dean.
                  </CardDescription>
                </CardHeader>
              </Card>

              <RiskNotesSummary
                riskNotes={mockRiskNotes}
                onFilter={(filters) => console.log("Filtering risk notes:", filters)}
                onExport={() => console.log("Exporting risk notes")}
                onViewCommunication={(riskNote) => {
                  console.log("Viewing communication for risk note:", riskNote.id)
                  // In a real implementation, this would open the communication view
                }}
                onEscalate={(riskNote) => {
                  console.log("Escalating risk note:", riskNote.id)
                  // In a real implementation, this would escalate the risk note
                  alert(`Risk note ${riskNote.id} will be escalated to the next level.`)
                }}
                onMarkImproved={(riskNote) => {
                  console.log("Marking risk note as improved:", riskNote.id)
                  // In a real implementation, this would mark the risk note as improved
                  alert(`Risk note ${riskNote.id} has been marked as improved.`)
                }}
              />

              <RiskNotesSummarySheet
                riskNotes={mockRiskNotes}
                role="assistant_dean"
                onExport={() => console.log("Exporting summary sheet")}
              />
            </div>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <UploadRecordsSummary
              records={[]}
              onFilter={(filters) => console.log("Filtering records:", filters)}
              onExport={() => console.log("Exporting records")}
              onUpload={() => console.log("Uploading records")}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <MonthlyReports
              reports={[]}
              onFilter={(filters) => console.log("Filtering reports:", filters)}
              onExport={() => console.log("Exporting reports")}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student List</CardTitle>
                <CardDescription>View and manage student information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Search students..."
                      className="max-w-sm"
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                    />
                    <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="probation">On Probation</SelectItem>
                        <SelectItem value="readmitted">Readmitted</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.studentNumber}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.moduleCode}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(student.status)}>
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell>{student.lastUpdated.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateConversationDialog open={showCreateConversation} onOpenChange={setShowCreateConversation} />
        <CreateGroupDialog open={showCreateGroup} onOpenChange={setShowCreateGroup} />
      </div>
    </main>
  )
}