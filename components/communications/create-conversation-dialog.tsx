"use client"

import type React from "react"
import type { SubjectMatter } from "@/lib/types"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

// Mock users data
const mockUsers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@student.edu",
    role: "student" as const,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    firstName: "Emma",
    lastName: "Davis",
    email: "emma.davis@student.edu",
    role: "student" as const,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    firstName: "Mary",
    lastName: "Johnson",
    email: "mary.johnson@university.edu",
    role: "tutor" as const,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    firstName: "System",
    lastName: "Admin",
    email: "admin@university.edu",
    role: "admin" as const,
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

interface CreateConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateConversationDialog({ open, onOpenChange }: CreateConversationDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [subjectMatter, setSubjectMatter] = useState<SubjectMatter>("Communication")
  const [isViewOnly, setIsViewOnly] = useState(false)

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    // Handle conversation creation here
    console.log("Creating conversation:", {
      user: selectedUser,
      subjectMatter,
      isViewOnly
    })
    onOpenChange(false)
    setSelectedUser("")
    setSearchTerm("")
    setRoleFilter("all")
    setSubjectMatter("Communication")
    setIsViewOnly(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>Select a user to start a new conversation with.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="tutor">Tutors</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select User</Label>
              <div className="mt-2 max-h-64 overflow-y-auto border rounded-md">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedUser === user.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-xs bg-muted px-2 py-1 rounded capitalize">{user.role}</div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Matter</Label>
                <Select value={subjectMatter} onValueChange={(value) => setSubjectMatter(value as SubjectMatter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject matter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Risk Note">Risk Note</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="view-only"
                  checked={isViewOnly}
                  onCheckedChange={(checked) => setIsViewOnly(checked as boolean)}
                />
                <Label htmlFor="view-only">Make this conversation view-only (recipients cannot respond)</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedUser}>
              Start Conversation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
