"use client"

import { useState, useEffect, useRef } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { mockChatMessages, mockConversations, mockCommunicationInsights } from "@/lib/mock-data"
import { analyzeSentiment, detectLanguage, translate, SUPPORTED_LANGUAGES } from "@/lib/nlp"
import type { ChatMessage } from "@/lib/types"
import {
  Send,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Users,
  Heart,
  Brain,
  Sparkles,
  Flag,
  Bot,
  User,
  Search,
  Paperclip,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function CommunicationsPage() {
  const user = getCurrentUser()
  const isStudent = user?.role === "student"

  if (isStudent) {
    return <StudentChatView userId={user.id} userName={user.name} />
  }

  return <AdminCommunicationsView />
}

function StudentChatView({ userId, userName }: { userId: string; userName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<"school" | "wellbeing">("school")
  const [language, setLanguage] = useState<typeof SUPPORTED_LANGUAGES[number]>("en")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  function persistMessages(currentMode: "school" | "wellbeing", msgs: ChatMessage[]) {
    try {
      localStorage.setItem(`chat.messages.${currentMode}`, JSON.stringify(msgs))
    } catch {}
  }

  useEffect(() => {
    // Initialize with this student's conversation
    const userConversation = mockConversations.find((c) => c.studentId === userId)
    if (userConversation) {
      setSelectedConversationId(userConversation.id)
      const userMessages = mockChatMessages.filter((m) => m.conversationId === userConversation.id)
      setMessages(userMessages)
    }
    // Hydrate from localStorage
    try {
      const savedLang = localStorage.getItem("chat.language")
      if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as any)) setLanguage(savedLang as any)
      const savedMode = localStorage.getItem("chat.mode") as "school" | "wellbeing" | null
      if (savedMode === "school" || savedMode === "wellbeing") setMode(savedMode)
      const saved = localStorage.getItem(`chat.messages.${savedMode ?? "school"}`)
      if (saved) setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
    } catch {}
  }, [userId])

  useEffect(() => {
    if (!selectedConversationId) return
    const convMessages = mockChatMessages.filter((m) => m.conversationId === selectedConversationId)
    setMessages(convMessages)
  }, [selectedConversationId])

  // Switch conversation when mode changes (separate threads)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`chat.messages.${mode}`)
      if (saved) {
        const parsed = JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        setMessages(parsed)
      } else {
        // start fresh thread
        setMessages([])
      }
    } catch {
      setMessages([])
    }
  }, [mode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Persist messages and preferences per mode
  useEffect(() => {
    try {
      localStorage.setItem("chat.language", language)
      localStorage.setItem("chat.mode", mode)
      localStorage.setItem(`chat.messages.${mode}`, JSON.stringify(messages))
    } catch {}
  }, [messages, mode, language])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const detectedLang = language || detectLanguage(inputMessage)
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversationId ?? "conv1",
      senderId: userId,
      senderType: "student",
      content: inputMessage,
      timestamp: new Date(),
      sentiment: analyzeSentiment(inputMessage) || "neutral",
      topics: [],
      language: detectedLang,
    }

    const nextMessages = [...messages, newMessage]
    setMessages(nextMessages)
    persistMessages(mode, nextMessages)
    setInputMessage("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          language: detectedLang,
          mode,
          history: messages.map((m) => ({
            role: m.senderType === "student" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

      const data = (await res.json()) as { reply: string; language: string }
      const reply = data.reply ?? "I'm here to help. Could you share more?"
      const localized = detectedLang !== "en" ? translate(reply, "en", detectedLang).translatedText : reply

      const botResponse: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        conversationId: selectedConversationId ?? "conv1",
        senderId: "bot",
        senderType: "bot",
        content: localized,
        timestamp: new Date(),
        sentiment: analyzeSentiment(localized) || "positive",
        topics: ["support"],
        language: detectedLang,
      }
      setMessages((prev) => {
        const updated = [...prev, botResponse]
        persistMessages(mode, updated)
        return updated
      })
    } catch (e) {
      toast({
        title: "Connection issue",
        description: "Couldn't reach the AI right now. Please try again in a moment.",
      })
    } finally {
      setIsTyping(false)
    }
  }


  const suggestedPromptsSchool = [
    "Explain integration by parts",
    "Create a 7-day study plan for Biology",
    "Help me summarize a chapter",
    "Practice problems for quadratic equations",
  ]
  const suggestedPromptsWellbeing = [
    "I'm feeling stressed about exams",
    "I feel unmotivated, any tips?",
    "Help me with anxiety before tests",
    "I need encouragement",
  ]

  const placeholder = mode === "school" ? "Ask for school help…" : "Share how you're feeling or ask for support…"

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Chat</h1>
        <p className="text-muted-foreground">Your personal AI companion for academic and emotional support</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-12rem)] min-h-[560px]">
        {/* Left: Conversations */}
        <Card className="w-72 hidden lg:flex flex-col min-h-0 min-w-0">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary">
                  {userName?.slice(0,1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{userName}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col p-0">
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search history"
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <Separator />
            <div className="px-4 pt-3 pb-2 text-xs font-medium text-muted-foreground">Suggested</div>
            <div className="px-4 pb-3 flex flex-wrap gap-2 min-w-0">
              {(mode === "school" ? suggestedPromptsSchool : suggestedPromptsWellbeing).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage(p)}
                  className="max-w-full whitespace-normal break-words text-left"
                >
             <span className="text-sm py-3">{p}</span>
                </Button>
              ))}
            </div>
            <Separator />
            <div className="px-4 py-2 text-xs font-medium text-muted-foreground">History</div>
            <ScrollArea className="flex-1">
              <div className="px-2 pb-4 space-y-1">
                {messages
                  .filter((m) => m.senderType === "student")
                  .slice(-15)
                  .reverse()
                  .filter((m) => m.content.toLowerCase().includes(search.toLowerCase()))
                  .map((m) => (
                    <div key={m.id} className="rounded-lg px-3 py-2 hover:bg-accent text-xs">
                      <div className="truncate">{m.content}</div>
                      <div className="text-[10px] text-muted-foreground">{format(m.timestamp, "MMM d, HH:mm")}</div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Center: Chat */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">AI Support Companion</CardTitle>
                <CardDescription className="text-xs">Here to help with schoolwork and emotional support</CardDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as "school" | "wellbeing") }>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="school">School help</TabsTrigger>
                  <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-muted-foreground">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="h-8 px-2 rounded-md border bg-background text-sm"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Feel free to ask me anything - whether you need help with homework, want to talk about how you're
                      feeling, or just need some encouragement. I'm here for you!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    message.senderType === "student" ? "flex-row-reverse" : "flex-row"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={message.senderType === "student" ? "bg-primary" : "bg-muted"}>
                      {message.senderType === "student" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex flex-col gap-1 max-w-[75%] ${
                      message.senderType === "student" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        message.senderType === "student"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground px-1">{format(message.timestamp, "h:mm a")}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 bg-background">
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={placeholder}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Languages supported: {SUPPORTED_LANGUAGES.join(", ")}</p>
              <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift + Enter for new line</p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Helpful resources */}
        <Card className="w-80 hidden xl:flex flex-col min-h-0">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-muted">AI</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">Helpful resources</CardTitle>
                <CardDescription className="text-xs">Curated for {mode === "school" ? "school help" : "wellbeing"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col p-0">
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Tips</div>
                <div className="text-2xl font-semibold">{mode === "school" ? 32 : 18}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Guides</div>
                <div className="text-2xl font-semibold">{mode === "school" ? 64 : 12}</div>
              </div>
            </div>
            <Separator />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{mode === "school" ? "Study guides" : "Wellness articles"}</span>
                </div>
                <span className="text-sm text-muted-foreground">{mode === "school" ? "126 guides" : "45 articles"}</span>
              </div>
              <Link href={mode === "school" ? "/dashboard/communications/practice" : "#"} className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1.5 transition">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="text-sm">{mode === "school" ? "Practice problems" : "Coping strategies"}</span>
                </div>
                <span className="text-sm text-muted-foreground">{mode === "school" ? "53 sets" : "20 tips"}</span>
              </Link>
              <Link href="/dashboard/communications/check-ins" className="flex items-center justify-between hover:bg-accent rounded-md px-2 py-1.5 transition">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Motivation & check-ins</span>
                </div>
                <span className="text-sm text-muted-foreground">Daily</span>
              </Link>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Urgent help</span>
                </div>
                <span className="text-sm text-muted-foreground">1-800-273-8255</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          If you're experiencing a crisis or emergency, please contact your school counselor immediately or call the
          crisis helpline at 1-800-273-8255.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function AdminCommunicationsView() {
  const insights = mockCommunicationInsights

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communications Dashboard</h1>
        <p className="text-muted-foreground">Monitor student engagement and identify students who may need support</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalConversations}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.activeStudents}</div>
            <p className="text-xs text-muted-foreground">Using the chat system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Messages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.averageMessagesPerStudent}</div>
            <p className="text-xs text-muted-foreground">Per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <Flag className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{insights.flaggedConversations}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Students</TabsTrigger>
          <TabsTrigger value="conversations">Recent Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Overall emotional tone of conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Positive</span>
                      <span className="text-sm text-muted-foreground">{insights.sentimentDistribution.positive}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(insights.sentimentDistribution.positive / insights.totalConversations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Neutral</span>
                      <span className="text-sm text-muted-foreground">{insights.sentimentDistribution.neutral}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(insights.sentimentDistribution.neutral / insights.totalConversations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Negative</span>
                      <span className="text-sm text-muted-foreground">{insights.sentimentDistribution.negative}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{
                          width: `${(insights.sentimentDistribution.negative / insights.totalConversations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Concerning</span>
                      <span className="text-sm text-muted-foreground">{insights.sentimentDistribution.concerning}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${(insights.sentimentDistribution.concerning / insights.totalConversations) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Discussion Topics</CardTitle>
                <CardDescription>Most common themes in student conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.topTopics.map((topic) => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            topic.sentiment === "concerning"
                              ? "destructive"
                              : topic.sentiment === "negative"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {topic.topic}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{topic.count} mentions</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Students Requiring Attention</CardTitle>
              <CardDescription>
                Students showing signs of distress or risk based on conversation analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.atRiskStudents.map((student) => (
                  <div key={student.studentId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{student.studentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last contact: {format(student.lastContact, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Conversations</p>
                        <p className="text-lg font-semibold">{student.conversationCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Concerning Messages</p>
                        <p className="text-lg font-semibold text-destructive">{student.concerningMessages}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Risk Indicators:</p>
                      <div className="flex flex-wrap gap-2">
                        {student.riskIndicators.map((indicator, idx) => (
                          <Badge key={idx} variant="outline">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button size="sm" className="w-full">
                      Contact Student
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Latest student interactions with the support chatbot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockConversations.map((conversation) => (
                  <div key={conversation.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{conversation.studentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(conversation.lastMessageAt, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            conversation.overallSentiment === "concerning"
                              ? "destructive"
                              : conversation.overallSentiment === "positive"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {conversation.overallSentiment}
                        </Badge>
                        {conversation.flagged && (
                          <Badge variant="destructive">
                            <Flag className="h-3 w-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {conversation.topics.slice(0, 4).map((topic, idx) => (
                        <Badge key={idx} variant="outline">
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{conversation.messageCount} messages</span>
                      {conversation.flagged && <span className="text-destructive">{conversation.flagReason}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
