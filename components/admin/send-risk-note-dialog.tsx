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

interface SendRiskNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudents: Learner[]
}

export default function SendRiskNoteDialog({
  open,
  onOpenChange,
  selectedStudents,
}: SendRiskNoteDialogProps) {
  const [riskNote, setRiskNote] = useState("")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!riskNote.trim()) {
      toast({
        title: "Error",
        description: "Please enter a risk note",
        variant: "destructive",
      })
      return
    }

    // Placeholder for actual implementation
    console.log("Sending risk note to students:", selectedStudents.map((s) => s.id))
    console.log("Risk Note:", riskNote)

    toast({
      title: "Risk Note Sent",
      description: `Risk note sent to ${selectedStudents.length} student(s)`,
    })

    setRiskNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Risk Note</DialogTitle>
          <DialogDescription>
            Send a risk note to {selectedStudents.length} selected student(s)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="risk-note">Risk Note</Label>
            <Textarea
              id="risk-note"
              placeholder="Enter risk note details here..."
              value={riskNote}
              onChange={(e) => setRiskNote(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit}>
            Send Risk Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

