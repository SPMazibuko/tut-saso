"use client"

import { useState } from "react"
import type { Learner } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudents: Learner[]
}

export default function SendMessageDialog({
  open,
  onOpenChange,
  selectedStudents,
}: SendMessageDialogProps) {
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    // Placeholder for actual implementation
    console.log("Sending message to students:", selectedStudents.map((s) => s.id))
    console.log("Message:", message)

    toast({
      title: "Message Sent",
      description: `Message sent to ${selectedStudents.length} student(s)`,
    })

    setMessage("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message to {selectedStudents.length} selected student(s)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

