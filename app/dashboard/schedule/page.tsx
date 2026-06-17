"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DeleteDialog } from "@/components/schedule/delete-dialog"
import Link from "next/link"
import { Calendar, Plus, Pencil, Trash2, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Schedule } from "@/lib/types"
import { PageHeader } from "@/components/page-header"

// Demo data - replace with actual API calls
const demoSchedules: Schedule[] = [
  {
    id: 1,
    title: "Semester 1 Schedule",
    grade: "SCI",
    term: 1,
    year: 2025,
    createdAt: new Date(),
    updatedAt: new Date(),
    events: [],
  },
  {
    id: 2,
    title: "Semester 2 Schedule",
    grade: "ENG",
    term: 2,
    year: 2025,
    createdAt: new Date(),
    updatedAt: new Date(),
    events: [],
  },
]

const FACULTY_OPTIONS = [
  { value: "SCI", label: "Faculty of Science" },
  { value: "ENG", label: "Faculty of Engineering and the Built Environment" },
  { value: "BUS", label: "Faculty of Commerce, Management and Law" },
  { value: "EDU", label: "Faculty of Education and Human Sciences" },
  { value: "HSC", label: "Faculty of Health Sciences" },
] as const

const getFacultyLabel = (code: string) =>
  FACULTY_OPTIONS.find((f) => f.value === code)?.label ?? code

export default function ScheduleList() {
  const router = useRouter()
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all")
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; schedule: Schedule | null }>({
    isOpen: false,
    schedule: null,
  })

  const filteredSchedules = selectedFaculty === "all"
    ? demoSchedules
    : demoSchedules.filter((schedule) => schedule.grade === selectedFaculty)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 dark:bg-sidebar">
      <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-10 xl:px-16">
        <PageHeader 
          title="Schedule Management"
          description="Create and manage semester schedules for different faculties."
        >
          <Link href="/dashboard/schedule/create" passHref>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Button>
          </Link>
        </PageHeader>

        <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
            <CardDescription>
              View and manage all faculty schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select
                value={selectedFaculty}
                onValueChange={setSelectedFaculty}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {FACULTY_OPTIONS.map((faculty) => (
                    <SelectItem key={faculty.value} value={faculty.value}>
                      {faculty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.title}</TableCell>
                    <TableCell>{getFacultyLabel(schedule.grade)}</TableCell>
                    <TableCell>Semester {schedule.term}</TableCell>
                    <TableCell>{schedule.year}</TableCell>
                    <TableCell>{schedule.updatedAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/schedule/${schedule.id}`} passHref>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/schedule/${schedule.id}/edit`} passHref>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteDialog({ isOpen: true, schedule })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, schedule: null })}
        onConfirm={() => {
          // Here we would normally make an API call to delete the schedule
          if (deleteDialog.schedule) {
            console.log(`Deleting schedule ${deleteDialog.schedule.id}`)
            setDeleteDialog({ isOpen: false, schedule: null })
            // Refresh the page to show updated list
            router.refresh()
          }
        }}
        title={deleteDialog.schedule?.title || ""}
      />
      </div>
    </main>
  )
}
