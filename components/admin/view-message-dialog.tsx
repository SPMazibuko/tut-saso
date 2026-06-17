"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface ViewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: {
    id: string
    role: string
    name: string
    threadCondition: string
    readStatus: string
    dateSent: string
    dateRead: string
    content?: string
  } | null
}

export default function ViewMessageDialog({ open, onOpenChange, message }: ViewMessageDialogProps) {
  if (!message) return null

  // Mock message content - in real app this would come from the backend
  const messageContent = `Dear Student,

I hope this message finds you well. I wanted to discuss your recent academic performance and attendance in our module. Based on our records, there are some areas that require attention.

Please make sure to attend all upcoming tutorial sessions and complete your assignments on time. If you need any additional support, don't hesitate to reach out.

Best regards,
${message.name}
${message.role}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{message.threadCondition}</DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>From: {message.name} ({message.role})</span>
            <Badge variant={message.readStatus === "Unread" ? "destructive" : "secondary"}>
              {message.readStatus}
            </Badge>
          </DialogDescription>
          <div className="text-sm text-muted-foreground">
            <div>Sent: {message.dateSent}</div>
            {message.readStatus === "Read" && <div>Read: {message.dateRead}</div>}
          </div>
        </DialogHeader>
        <Card className="p-4 whitespace-pre-line text-sm">
          {message.content || messageContent}
        </Card>
      </DialogContent>
    </Dialog>
  )
}
