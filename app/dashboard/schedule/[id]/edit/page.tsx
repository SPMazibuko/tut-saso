"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
      highlights: "Welcome week, course registration",
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
    }
  ]
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  grade: z.string().min(1, "Faculty is required"),
  term: z.string().min(1, "Semester is required"),
  year: z.string().min(4, "Year is required"),
  events: z.array(z.object({
    week: z.number(),
    type: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string().optional(),
    highlights: z.string().optional(),
    extendedInfo: z.string().optional(),
  }))
})

const FACULTY_OPTIONS = [
  { value: "SCI", label: "Faculty of Science" },
  { value: "ENG", label: "Faculty of Engineering and the Built Environment" },
  { value: "BUS", label: "Faculty of Commerce, Management and Law" },
  { value: "EDU", label: "Faculty of Education and Human Sciences" },
  { value: "HSC", label: "Faculty of Health Sciences" },
] as const

export default function EditSchedule() {
  const router = useRouter()
  const params = useParams()
  // In a real app, we would fetch the schedule using the ID from params
  const schedule = demoSchedule

  const [events, setEvents] = useState<ScheduleEvent[]>(schedule.events)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: schedule.title,
      grade: schedule.grade,
      term: schedule.term.toString(),
      year: schedule.year.toString(),
      events: schedule.events.map(event => ({
        ...event,
        startDate: event.startDate.toISOString().split('T')[0],
        endDate: event.endDate.toISOString().split('T')[0],
      }))
    }
  })

  const addEvent = () => {
    setEvents([...events, {
      id: Math.max(...events.map(e => e.id)) + 1,
      scheduleId: schedule.id,
      week: events.length + 1,
      type: "Classes",
      startDate: new Date(),
      endDate: new Date(),
      description: "",
      highlights: "",
      extendedInfo: ""
    }])
  }

  const removeEvent = (index: number) => {
    const newEvents = [...events]
    newEvents.splice(index, 1)
    setEvents(newEvents)
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Here we would normally make an API call to update the schedule
    console.log(data)
    router.push(`/dashboard/schedule/${schedule.id}`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Edit Schedule"
        description="Modify the existing semester schedule"
      />

      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>
            Update the information for the schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Semester 1 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a faculty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FACULTY_OPTIONS.map((faculty) => (
                            <SelectItem key={faculty.value} value={faculty.value}>
                              {faculty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                          <SelectItem value="3">Semester 3</SelectItem>
                          <SelectItem value="4">Semester 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Schedule Events</h3>
                  <Button type="button" onClick={addEvent}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </div>

                {events.map((event, index) => (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name={`events.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Classes">Classes</SelectItem>
                                  <SelectItem value="Midterms">Midterms</SelectItem>
                                  <SelectItem value="Finals">Finals</SelectItem>
                                  <SelectItem value="Parent-Teacher Conference">Parent-Teacher Conference</SelectItem>
                                  <SelectItem value="Sports Day">Sports Day</SelectItem>
                                  <SelectItem value="Holiday">Holiday</SelectItem>
                                  <SelectItem value="Orientation">Orientation</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`events.${index}.week`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Week Number</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`events.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`events.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`events.${index}.highlights`}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Highlights</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter any highlights or important notes"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`events.${index}.extendedInfo`}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Extended Information</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter any additional information"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {events.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="mt-4"
                          onClick={() => removeEvent(index)}
                        >
                          <Minus className="mr-2 h-4 w-4" />
                          Remove Event
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/schedule/${schedule.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
