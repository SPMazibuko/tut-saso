"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Mail, Inbox, CheckCircle2 } from "lucide-react"
import { GradientCard } from "@/components/ui/gradient-card"
import type { Conversation, ReadMethod, ReadStats } from "@/lib/types"
import { formatStudentEmail, studentNumberFromId } from "@/lib/student-numbers"

const studentEmail = (id: number) => formatStudentEmail(studentNumberFromId(id))

// Mock data - in a real app, this would be fetched from your backend
const mockConversations: Conversation[] = [
  {
    id: "1",
    subjectMatter: "Risk Note" as const,
    isViewOnly: true,
    participants: [
      { 
        id: "1", 
        email: studentEmail(1), 
        firstName: "John", 
        lastName: "Smith", 
        role: "student" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        }
      },
      { 
        id: "2", 
        email: studentEmail(2), 
        firstName: "Jane", 
        lastName: "Doe", 
        role: "student" as const,
        readStatus: {
          hasRead: true,
          readMethod: "student_email" as ReadMethod,
          readAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        }
      },

    ],
    lastMessage: {
      id: "1",
      conversationId: "1",
      senderId: "1",
      content: "Thank you for the extension on the assignment!",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      readBy: ["lecturer", "1", "2"],
    },
    isGroup: true,
    unreadCount: 1,
    readStats: {
      total: 4,
      read: 3,
      unread: 1,
      readMethods: {
        portal: 2,
        student_email: 1,
        personal_email: 0
      }
    }
  },
  {
    id: "2",
    subjectMatter: "Communication" as const,
    isViewOnly: false,
    participants: [
      { 
        id: "4", 
        email: studentEmail(4), 
        firstName: "Emma", 
        lastName: "Davis", 
        role: "student" as const,
        readStatus: {
          hasRead: true,
          readMethod: "student_email" as ReadMethod,
          readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        }
      },
      { 
        id: "5", 
        email: studentEmail(5), 
        firstName: "Mike", 
        lastName: "Brown", 
        role: "student" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        }
      },
  
    ],
    lastMessage: {
      id: "2",
      conversationId: "2",
      senderId: "4",
      content: "When is the next group meeting?",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      readBy: ["lecturer", "5"],
    },
    isGroup: true,
    name: "CS101 Study Group",
    unreadCount: 2,
    readStats: {
      total: 4,
      read: 2,
      unread: 2,
      readMethods: {
        portal: 1,
        student_email: 1,
        personal_email: 0
      }
    }
  },
  {
    id: "3",
    subjectMatter: "Risk Note" as const,
    isViewOnly: true,
    participants: [
      { 
        id: "7", 
        email: studentEmail(7), 
        firstName: "David", 
        lastName: "Lee", 
        role: "student" as const,
        readStatus: {
          hasRead: false,
          readMethod: null,
          readAt: null,
        }
      },
      {
        id: "lecturer",
        email: "sarah.johnson@tut.ac.za",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "lecturer" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        }
      },
    ],
    lastMessage: {
      id: "3",
      conversationId: "3",
      senderId: "lecturer",
      content: "I've noticed you've missed the last 3 classes. Please schedule a meeting to discuss your academic progress.",
      sentAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      readBy: ["lecturer"],
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
    id: "4",
    subjectMatter: "Info" as const,
    isViewOnly: true,
    participants: [
      { 
        id: "8", 
        email: "admin@tut.ac.za", 
        firstName: "System", 
        lastName: "Admin", 
        role: "admin" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
        }
      },
      {
        id: "lecturer",
        email: "sarah.johnson@tut.ac.za",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "lecturer" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        }
      },
    ],
    lastMessage: {
      id: "4",
      conversationId: "4",
      senderId: "8",
      content: "Reminder: Faculty marks submission deadline is tomorrow.",
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      readBy: ["lecturer"],
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
    id: "5",
    subjectMatter: "Communication" as const,
    isViewOnly: false,
    participants: [
      { 
        id: "9", 
        email: "mary.johnson@tut.ac.za", 
        firstName: "Mary", 
        lastName: "Johnson", 
        role: "tutor" as const,
        readStatus: {
          hasRead: false,
          readMethod: null,
          readAt: null,
        }
      },
      {
        id: "lecturer",
        email: "sarah.johnson@tut.ac.za",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "lecturer" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        }
      },
    ],
    lastMessage: {
      id: "5",
      conversationId: "5",
      senderId: "9",
      content: "The weekly progress report is ready for review.",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
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
    id: "6",
    subjectMatter: "Risk Note" as const,
    isViewOnly: true,
    participants: [
      { 
        id: "10", 
        email: studentEmail(10), 
        firstName: "Alex", 
        lastName: "Thompson", 
        role: "student" as const,
        readStatus: {
          hasRead: true,
          readMethod: "personal_email" as ReadMethod,
          readAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        }
      },
      {
        id: "lecturer",
        email: "sarah.johnson@tut.ac.za",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "lecturer" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        }
      },
    ],
    lastMessage: {
      id: "6",
      conversationId: "6",
      senderId: "10",
      content: "I understand the concerns about my attendance. I'll work on improving my punctuality.",
      sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      readBy: ["lecturer"],
    },
    isGroup: false,
    unreadCount: 0,
    readStats: {
      total: 2,
      read: 2,
      unread: 0,
      readMethods: {
        portal: 1,
        student_email: 0,
        personal_email: 1
      }
    }
  },

  {
    id: "2",
    subjectMatter: "Info" as const,
    isViewOnly: true,
    participants: [
      { 
        id: "14", 
        email: "it.support@tut.ac.za", 
        firstName: "IT", 
        lastName: "Support", 
        role: "admin" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        }
      },
      {
        id: "lecturer",
        email: "sarah.johnson@tut.ac.za",
        firstName: "Sarah",
        lastName: "Johnson",
        role: "lecturer" as const,
        readStatus: {
          hasRead: true,
          readMethod: "portal" as ReadMethod,
          readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        }
      },
    ],
    lastMessage: {
      id: "8",
      conversationId: "8",
      senderId: "14",
      content: "System maintenance completed. All services are now operational.",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      readBy: ["lecturer"],
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
  // Add more mock conversations as needed
]

type FilterType = 'all' | 'read' | 'unread' | 'portal' | 'student_email' | 'personal_email'

export default function ConversationDetailsPage() {
  const params = useParams()
  const conversationId = params.id as string
  const conversation = mockConversations.find((c) => c.id === conversationId)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')

  // Filter participants based on selected filter
  const filteredParticipants = conversation?.participants.filter((participant) => {
    switch (selectedFilter) {
      case 'read':
        return participant.readStatus.hasRead
      case 'unread':
        return !participant.readStatus.hasRead
      case 'portal':
        return participant.readStatus.readMethod === 'portal'
      case 'student_email':
        return participant.readStatus.readMethod === 'student_email'
      case 'personal_email':
        return participant.readStatus.readMethod === 'personal_email'
      default:
        return true
    }
  })

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-8 pt-6">
        <AppHeader title="Conversation Not Found" subtitle="The requested conversation could not be found." />
      </div>
    )
  }

  const getSubjectMatterBadgeVariant = (subjectMatter: string) => {
    switch (subjectMatter) {
      case "Risk Note":
        return "destructive"
      case "Info":
        return "secondary"
      default:
        return "default"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "tutor":
        return "bg-primary/10 text-primary border-primary/20"
      case "student":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"> 
      <div className="flex items-center justify-between">
        <AppHeader
          title="Conversation Details"
          subtitle={`Details and participants for conversation with ${conversation.participants
            .filter((p) => p.id !== "lecturer")
            .map((p) => `${p.firstName} ${p.lastName}`)
            .join(", ")}`}
        />
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Conversations
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <GradientCard 
          gradient="purple" 
          className={`relative overflow-hidden cursor-pointer transform transition-all duration-200 ${selectedFilter === 'all' ? 'scale-105 ring-2 ring-purple-400' : 'hover:scale-105'}`}
          onClick={() => setSelectedFilter('all')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Total Participants</div>
              <div className="text-3xl font-bold text-white">{conversation.readStats.total}</div>
            </div>
          </div>
          <div className="text-white/90 text-sm">All conversation participants</div>
        </GradientCard>

        <GradientCard 
          gradient="emerald" 
          className={`relative overflow-hidden cursor-pointer transform transition-all duration-200 ${selectedFilter === 'read' ? 'scale-105 ring-2 ring-emerald-400' : 'hover:scale-105'}`}
          onClick={() => setSelectedFilter('read')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Read</div>
              <div className="text-3xl font-bold text-white">{conversation.readStats.read}</div>
            </div>
          </div>
          <div className="text-white/90 text-sm">Have read the message</div>
        </GradientCard>

        <GradientCard 
          gradient="coral" 
          className={`relative overflow-hidden cursor-pointer transform transition-all duration-200 ${selectedFilter === 'unread' ? 'scale-105 ring-2 ring-red-400' : 'hover:scale-105'}`}
          onClick={() => setSelectedFilter('unread')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Unread</div>
              <div className="text-3xl font-bold text-white">{conversation.readStats.unread}</div>
            </div>
          </div>
          <div className="text-white/90 text-sm">Haven't read yet</div>
        </GradientCard>

        <GradientCard 
          gradient="blue" 
          className={`relative overflow-hidden cursor-pointer transform transition-all duration-200 ${selectedFilter === 'portal' ? 'scale-105 ring-2 ring-blue-400' : 'hover:scale-105'}`}
          onClick={() => setSelectedFilter('portal')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">Portal Reads</div>
              <div className="text-3xl font-bold text-white">{conversation.readStats.readMethods.portal}</div>
            </div>
          </div>
          <div className="text-white/90 text-sm">Read via portal</div>
        </GradientCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-0 shadow-xl bg-white dark:bg-black rounded-2xl">
          <CardHeader>
            <CardTitle>Conversation Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Subject Matter</p>
                <Badge variant={getSubjectMatterBadgeVariant(conversation.subjectMatter)}>
                  {conversation.subjectMatter}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                <Badge variant="outline">{conversation.isGroup ? "Group" : "Direct Message"}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Permissions</p>
                <Badge variant="outline">{conversation.isViewOnly ? "View Only" : "Can Respond"}</Badge>
              </div>

              {conversation.lastMessage && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Last Activity</p>
                  <p className="text-sm">{new Date(conversation.lastMessage.sentAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-xl bg-white dark:bg-black rounded-2xl">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Read Status</TableHead>
                    <TableHead>Read Method</TableHead>
                    <TableHead className="text-right">Read Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants?.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={`${participant.firstName} ${participant.lastName}`} />
                          <AvatarFallback>
                            {participant.firstName[0]}
                            {participant.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {participant.firstName} {participant.lastName}
                        </span>
                      </TableCell>
                      <TableCell>{participant.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getRoleBadgeColor(participant.role)}`}>
                          {participant.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={participant.readStatus.hasRead ? "outline" : "secondary"}
                          className={participant.readStatus.hasRead ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400" : "bg-muted text-muted-foreground border-border"}
                        >
                          {participant.readStatus.hasRead ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {participant.readStatus.readMethod ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {participant.readStatus.readMethod === "portal" && "Portal"}
                            {participant.readStatus.readMethod === "student_email" && "Student Email"}
                            {participant.readStatus.readMethod === "personal_email" && "Personal Email"}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {participant.readStatus.readAt ? (
                          new Date(participant.readStatus.readAt).toLocaleString()
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
