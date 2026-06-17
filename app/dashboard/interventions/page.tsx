"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getInterventions, getStudents, createIntervention } from "@/lib/data-service"
import { getCurrentUser } from "@/lib/auth"
import type { Intervention, Learner } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [students, setStudents] = useState<Learner[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pageByStatus, setPageByStatus] = useState<Record<Intervention["status"], number>>({
    planned: 1,
    "in-progress": 1,
    completed: 1,
    cancelled: 1,
  })
  const user = getCurrentUser()

  useEffect(() => {
    setInterventions(getInterventions())
    setStudents(getStudents())
  }, [])

  const handleCreateIntervention = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newIntervention = createIntervention({
      studentId: formData.get("studentId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as Intervention["type"],
      status: "planned",
      assignedTo: user?.email || "",
      createdBy: user?.email || "",
      startDate: new Date(formData.get("startDate") as string),
      notes: formData.get("notes") as string,
    })

    setInterventions([...interventions, newIntervention])
    setDialogOpen(false)
  }

  const statusGroups = {
    planned: interventions.filter((i) => i.status === "planned"),
    "in-progress": interventions.filter((i) => i.status === "in-progress"),
    completed: interventions.filter((i) => i.status === "completed"),
    cancelled: interventions.filter((i) => i.status === "cancelled"),
  }

  const statusIcons = {
    planned: Clock,
    "in-progress": ClipboardList,
    completed: CheckCircle2,
    cancelled: XCircle,
  }

  const statusColors = {
    planned: "text-blue-600",
    "in-progress": "text-orange-600",
    completed: "text-green-600",
    cancelled: "text-gray-600",
  }

  const ITEMS_PER_PAGE = 8

  const getVisiblePages = (total: number, current: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1) as Array<number | "ellipsis">
    }
    const pages = new Set<number>()
    pages.add(1)
    pages.add(total)
    pages.add(current)
    if (current - 1 >= 1) pages.add(current - 1)
    if (current + 1 <= total) pages.add(current + 1)

    if (current <= 3) {
      pages.add(2)
      pages.add(3)
      pages.add(4)
    }

    if (current >= total - 2) {
      pages.add(total - 1)
      pages.add(total - 2)
      pages.add(total - 3)
    }

    const sorted = Array.from(pages).sort((a, b) => a - b)
    const output: Array<number | "ellipsis"> = []
    for (let i = 0; i < sorted.length; i++) {
      const page = sorted[i]
      output.push(page)
      const next = sorted[i + 1]
      if (next && next - page > 1) {
        output.push("ellipsis")
      }
    }
    return output
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intervention Tracking</h1>
          <p className="text-muted-foreground">Manage and monitor student support programs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Intervention
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Intervention</DialogTitle>
              <DialogDescription>Add a new support program or intervention for a student</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - Faculty {student.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g., Math Tutoring Program" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the intervention program..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutoring">Tutoring</SelectItem>
                      <SelectItem value="counseling">Counseling</SelectItem>
                      <SelectItem value="mentoring">Mentoring</SelectItem>
                      <SelectItem value="academic-support">Academic Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes or observations..." rows={2} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Intervention</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(statusGroups).map(([status, items]) => {
          const Icon = statusIcons[status as keyof typeof statusIcons]
          const color = statusColors[status as keyof typeof statusColors]

          return (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{status.replace("-", " ")}</CardTitle>
                <Icon className={cn("h-4 w-4", color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{items.length}</div>
                <p className="text-xs text-muted-foreground">
                  {((items.length / interventions.length) * 100 || 0).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Interventions Tabs */}
      <Tabs defaultValue="planned" className="space-y-6">
        <TabsList>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {(["planned", "in-progress", "completed", "cancelled"] as Intervention["status"][]).map(
          (typedStatus) => {
            const items = statusGroups[typedStatus]
            const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
            const current = Math.min(totalPages, Math.max(1, pageByStatus[typedStatus] || 1))
            const pageItems = items.slice((current - 1) * ITEMS_PER_PAGE, current * ITEMS_PER_PAGE)

            const title = `${typedStatus.replace("-", " ")}`

            return (
              <TabsContent key={typedStatus} value={typedStatus} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize">{title} Interventions</CardTitle>
                    <CardDescription>{items.length} intervention(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No interventions</p>
                      ) : (
                        pageItems.map((intervention) => {
                          const student = students.find((s) => s.id === intervention.studentId)

                          return (
                            <div
                              key={intervention.id}
                              className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-start gap-2">
                                    <h4 className="font-semibold">{intervention.title}</h4>
                                    <Badge
                                      variant={intervention.status === "in-progress" ? "default" : "secondary"}
                                      className={cn(
                                        intervention.status === "completed" &&
                                          "bg-green-500 hover:bg-green-600 text-white",
                                        intervention.status === "cancelled" &&
                                          "bg-gray-500 hover:bg-gray-600 text-white",
                                      )}
                                    >
                                      {intervention.status}
                                    </Badge>
                                  </div>

                                  <p className="text-sm text-muted-foreground">{intervention.description}</p>

                                  {student && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                        {student.name.charAt(0)}
                                      </div>
                                      <span className="text-sm font-medium">{student.name}</span>
                                      <span className="text-sm text-muted-foreground">• Faculty {student.grade}</span>
                                    </div>
                                  )}

                                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span className="capitalize">Type: {intervention.type}</span>
                                    <span>•</span>
                                    <span>Start: {new Date(intervention.startDate).toLocaleDateString()}</span>
                                    {intervention.endDate && (
                                      <>
                                        <span>•</span>
                                        <span>End: {new Date(intervention.endDate).toLocaleDateString()}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>Assigned to: {intervention.assignedTo}</span>
                                  </div>

                                  {intervention.notes && (
                                    <div className="p-2 bg-muted rounded text-sm">
                                      <p className="font-medium text-xs text-muted-foreground mb-1">Notes:</p>
                                      <p>{intervention.notes}</p>
                                    </div>
                                  )}

                                  {intervention.outcome && (
                                    <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
                                      <p className="font-medium text-xs text-muted-foreground mb-1">Outcome:</p>
                                      <p>{intervention.outcome}</p>
                                    </div>
                                  )}
                                </div>

                                {student && (
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/students/${student.id}`}>View Student</Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {items.length > ITEMS_PER_PAGE ? (
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPageByStatus((prev) => ({
                                  ...prev,
                                  [typedStatus]: Math.max(1, current - 1),
                                }))
                              }}
                            />
                          </PaginationItem>
                          {getVisiblePages(totalPages, current).map((p, idx) =>
                            p === "ellipsis" ? (
                              <PaginationItem key={`e-${idx}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            ) : (
                              <PaginationItem key={p}>
                                <PaginationLink
                                  href="#"
                                  isActive={current === p}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setPageByStatus((prev) => ({
                                      ...prev,
                                      [typedStatus]: p as number,
                                    }))
                                  }}
                                >
                                  {p}
                                </PaginationLink>
                              </PaginationItem>
                            ),
                          )}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPageByStatus((prev) => ({
                                  ...prev,
                                  [typedStatus]: Math.min(totalPages, current + 1),
                                }))
                              }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          },
        )}
      </Tabs>
    </div>
  )
}
