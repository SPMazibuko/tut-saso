"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { ScheduleInfoDialog } from "@/components/schedule/schedule-info-dialog"
import type { Schedule, ScheduleEvent } from "@/lib/types"
import { PageHeader } from "@/components/page-header"

// Demo data - replace with actual API calls
const demoSchedule: Schedule = {
  id: 1,
  title: "Semester 1 Schedule",
  grade: "SCI",
  term: 1,
  year: 2025,
  createdAt: new Date(),
  updatedAt: new Date(),
  events: [
    {
      id: 1,
      scheduleId: 1,
      week: 1,
      startDate: new Date("2025-01-20"),
      endDate: new Date("2025-01-24"),
      type: "Orientation",
      highlights: "Welcome week, course registration, orientation activities",
      extendedInfo: "Orientation week for new and returning students"
    },
    {
      id: 2,
      scheduleId: 1,
      week: 2,
      startDate: new Date("2025-01-27"),
      endDate: new Date("2025-01-31"),
      type: "Classes",
      extendedInfo: "Regular classes begin"
    },
    {
      id: 3,
      scheduleId: 1,
      week: 3,
      startDate: new Date("2025-02-03"),
      endDate: new Date("2025-02-07"),
      type: "Classes",
      extendedInfo: "Regular classes"
    },
    {
      id: 4,
      scheduleId: 1,
      week: 4,
      startDate: new Date("2025-02-10"),
      endDate: new Date("2025-02-14"),
      type: "Classes",
      highlights: "First assessments and assignments due",
      extendedInfo: "Regular classes"
    },
    {
      id: 5,
      scheduleId: 1,
      week: 5,
      startDate: new Date("2025-02-17"),
      endDate: new Date("2025-02-21"),
      type: "Classes",
      extendedInfo: "Regular classes"
    },
    {
      id: 6,
      scheduleId: 1,
      week: 6,
      startDate: new Date("2025-02-24"),
      endDate: new Date("2025-02-28"),
      type: "Midterms",
      extendedInfo: "Midterm examinations"
    },
    {
      id: 7,
      scheduleId: 1,
      week: 7,
      startDate: new Date("2025-03-03"),
      endDate: new Date("2025-03-07"),
      type: "Midterms",
      highlights: "Midterm examinations continue, results feedback",
      extendedInfo: "Midterm examinations"
    },
    {
      id: 8,
      scheduleId: 1,
      week: 8,
      startDate: new Date("2025-03-10"),
      endDate: new Date("2025-03-14"),
      type: "Classes",
      extendedInfo: "Regular classes resume"
    },
    {
      id: 9,
      scheduleId: 1,
      week: 9,
      startDate: new Date("2025-03-17"),
      endDate: new Date("2025-03-21"),
      type: "Parent-Teacher Conference",
      highlights: "Parent-Teacher Conference - discuss student progress",
      extendedInfo: "Scheduled meetings with parents and teachers"
    },
    {
      id: 10,
      scheduleId: 1,
      week: 10,
      startDate: new Date("2025-03-24"),
      endDate: new Date("2025-03-28"),
      type: "Classes",
      highlights: "End of semester assessments",
      extendedInfo: "Regular classes"
    },
    {
      id: 11,
      scheduleId: 1,
      week: 11,
      startDate: new Date("2025-03-31"),
      endDate: new Date("2025-04-04"),
      type: "Holiday",
      extendedInfo: "School holiday break"
    },
    {
      id: 12,
      scheduleId: 1,
      week: 12,
      startDate: new Date("2025-04-07"),
      endDate: new Date("2025-04-11"),
      type: "Sports Day",
      highlights: "Annual Sports Day - all faculties participate",
      extendedInfo: "School sports events and competitions"
    },
    {
      id: 13,
      scheduleId: 1,
      week: 13,
      startDate: new Date("2025-04-14"),
      endDate: new Date("2025-04-18"),
      type: "Classes",
      highlights: "Final semester assessments preparation",
      extendedInfo: "Regular classes"
    },
    {
      id: 14,
      scheduleId: 1,
      week: 14,
      startDate: new Date("2025-04-21"),
      endDate: new Date("2025-04-25"),
      type: "Finals",
      highlights: "Final examinations begin",
      extendedInfo: "Semester final examinations"
    },
    {
      id: 15,
      scheduleId: 1,
      week: 15,
      startDate: new Date("2025-04-28"),
      endDate: new Date("2025-05-02"),
      type: "Finals",
      extendedInfo: "Final examinations continue"
    },
    {
      id: 16,
      scheduleId: 1,
      week: 16,
      startDate: new Date("2025-05-05"),
      endDate: new Date("2025-05-09"),
      type: "Finals",
      highlights: "Final examinations conclude, report cards issued",
      extendedInfo: "Final examinations and semester closure"
    }
  ]
}

const FACULTY_OPTIONS = [
  { value: "SCI", label: "Faculty of Science" },
  { value: "ENG", label: "Faculty of Engineering and the Built Environment" },
  { value: "BUS", label: "Faculty of Commerce, Management and Law" },
  { value: "EDU", label: "Faculty of Education and Human Sciences" },
  { value: "HSC", label: "Faculty of Health Sciences" },
] as const

const getFacultyLabel = (code: string) =>
  FACULTY_OPTIONS.find((f) => f.value === code)?.label ?? code

// Helper function to get background color based on event type
function getEventTypeColor(type: string): string {
  switch (type) {
    case 'Classes':
      return 'bg-primary/10 border-primary/20'
    case 'Midterms':
      return 'bg-orange-50 border-orange-200'
    case 'Finals':
      return 'bg-yellow-50 border-yellow-200'
    case 'Parent-Teacher Conference':
      return 'bg-purple-50 border-purple-200'
    case 'Sports Day':
      return 'bg-green-50 border-green-200'
    case 'Holiday':
      return 'bg-gray-50 border-gray-200'
    case 'Orientation':
      return 'bg-teal-50 border-teal-200'
    default:
      return 'bg-muted border-border'
  }
}

function getEventTypeBadgeColor(type: string): string {
  switch (type) {
    case 'Classes':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Midterms':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Finals':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'Parent-Teacher Conference':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'Sports Day':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'Holiday':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'Orientation':
      return 'bg-teal-100 text-teal-800 border-teal-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default function ViewSchedule() {
  const params = useParams()
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // In a real app, we would fetch the schedule using the ID from params
  const schedule = demoSchedule

  const handleCardClick = (event: ScheduleEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
      <PageHeader
        title={schedule.title}
        description={`${getFacultyLabel(schedule.grade)} - Semester ${schedule.term} ${schedule.year}`}
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href="/dashboard/schedule" passHref className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Back to List</span>
              <span className="xs:hidden">Back</span>
            </Button>
          </Link>
          <Link href={`/dashboard/schedule/${schedule.id}/edit`} passHref className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Pencil className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Edit Schedule</span>
              <span className="xs:hidden">Edit</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Header Information */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2">Semester Schedule</h1>
        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
          <div className="block sm:inline">Regular Classes</div>
          <div className="block sm:inline sm:mx-2">•</div>
          <div className="block sm:inline">Midterm Examinations</div>
          <div className="block sm:inline sm:mx-2">•</div>
          <div className="block sm:inline">Final Examinations</div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-3 sm:space-y-4">
        {schedule.events.map((event, index) => (
          <Card 
            key={event.id} 
            className={`border-2 ${getEventTypeColor(event.type)} transition-all hover:shadow-md cursor-pointer group`}
            onClick={() => handleCardClick(event)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
                {/* Date Column */}
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">
                    {event.startDate.toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short' 
                    })} - {event.endDate.toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500">Week {event.week}</div>
                </div>

                {/* Event Type Column */}
                <div className="text-center sm:text-left">
                  <Badge 
                    variant="outline" 
                    className={`${getEventTypeBadgeColor(event.type)} font-medium border text-xs sm:text-sm`}
                  >
                    {event.type}
                  </Badge>
                </div>

                {/* Highlights Column */}
                <div className="text-xs sm:text-sm col-span-1 sm:col-span-2 lg:col-span-1">
                  {event.highlights && (
                    <div className="font-medium text-gray-800 mb-1 break-words">
                      {event.highlights}
                    </div>
                  )}
                </div>

                {/* Extended Information Column */}
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
                  <div className="whitespace-pre-line break-words flex-1">
                    {event.extendedInfo && event.extendedInfo}
                  </div>
                  <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card className="mt-6 sm:mt-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Classes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 border border-orange-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Midterms</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border border-yellow-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Finals</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-100 border border-purple-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Parent-Teacher</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Sports Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border border-gray-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Holiday</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-teal-100 border border-teal-300 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Orientation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Information Dialog */}
      {selectedEvent && (
        <ScheduleInfoDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          week={selectedEvent.week}
          eventType={selectedEvent.type}
        />
      )}
    </div>
  )
}
