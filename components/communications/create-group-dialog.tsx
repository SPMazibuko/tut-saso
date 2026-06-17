"use client"

import type React from "react"

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
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

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
    firstName: "Mike",
    lastName: "Brown",
    email: "mike.brown@student.edu",
    role: "student" as const,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    firstName: "Mary",
    lastName: "Johnson",
    email: "mary.johnson@university.edu",
    role: "tutor" as const,
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim() || selectedUsers.length === 0) return

    // Handle group creation here
    console.log("Creating group:", groupName, "with users:", selectedUsers)
    onOpenChange(false)
    setGroupName("")
    setSelectedUsers([])
    setSearchTerm("")
    setRoleFilter("all")
  }

  const selectedUserObjects = selectedUsers.map((id) => mockUsers.find((user) => user.id === id)!).filter(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Group Conversation</DialogTitle>
          <DialogDescription>Create a group conversation with multiple participants.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div>
                <Label>Selected Participants ({selectedUsers.length})</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUserObjects.map((user) => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                      {user.firstName} {user.lastName}
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
              <Label>Add Participants</Label>
              <div className="mt-2 max-h-64 overflow-y-auto border rounded-md">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!groupName.trim() || selectedUsers.length === 0}>
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
