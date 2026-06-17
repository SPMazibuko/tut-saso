"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const mockActivities = [
  {
    id: "1",
    type: "import",
    user: "System Admin",
    action: "imported student data",
    details: "245 new student records added",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    id: "2",
    type: "alert",
    user: "Dr. Sarah Johnson",
    action: "flagged at-risk students",
    details: "12 students in ENG201 require attention",
    timestamp: "4 hours ago",
    status: "pending",
  },
  {
    id: "3",
    type: "communication",
    user: "Mary Johnson",
    action: "sent weekly report",
    details: "Tutorial progress report submitted",
    timestamp: "6 hours ago",
    status: "completed",
  },
  {
    id: "4",
    type: "system",
    user: "System",
    action: "backup completed",
    details: "Daily database backup successful",
    timestamp: "8 hours ago",
    status: "completed",
  },
  {
    id: "5",
    type: "grade",
    user: "Prof. Michael Chen",
    action: "submitted grades",
    details: "ENG101 final grades uploaded",
    timestamp: "1 day ago",
    status: "completed",
  },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case "import":
      return "📥"
    case "alert":
      return "⚠️"
    case "communication":
      return "💬"
    case "system":
      return "⚙️"
    case "grade":
      return "📊"
    default:
      return "📋"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function RecentActivities() {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getActivityIcon(activity.type)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  <span className="text-accent">{activity.user}</span> {activity.action}
                </p>
                {getStatusBadge(activity.status)}
              </div>
              <p className="text-sm text-muted-foreground">{activity.details}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
