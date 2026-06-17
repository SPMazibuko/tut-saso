"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, Users, BookOpen, Clock } from "lucide-react"

interface ScheduleInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  week: number
  eventType: string
}

export function ScheduleInfoDialog({ isOpen, onClose, week, eventType }: ScheduleInfoDialogProps) {
  const getWeekInfo = (week: number) => {
    if (week === 1) {
      return {
        title: "Orientation Week",
        period: "Week 1 - Start of Semester",
        icon: <Calendar className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="font-semibold text-teal-900 mb-2">Welcome Activities</h4>
              <ul className="text-teal-800 space-y-1 text-sm">
                <li>• Welcome assembly and introductions</li>
                <li>• Course registration and subject selection</li>
                <li>• School tour and facility orientation</li>
                <li>• Distribution of textbooks and materials</li>
                <li>• Introduction to school policies and code of conduct</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Important for New Students
              </h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Meet teachers and classmates</li>
                <li>• Understand class schedules and timetables</li>
                <li>• Learn about support services available</li>
                <li>• Get familiar with school facilities</li>
              </ul>
            </div>
          </div>
        )
      }
    } else if (week >= 2 && week <= 5) {
      return {
        title: "Early Semester Period",
        period: `Weeks 2-5 (Early semester activities)`,
        icon: <BookOpen className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Regular Classes</h4>
              <ul className="text-green-800 space-y-1 text-sm">
                <li>• Regular instructional classes begin</li>
                <li>• Introduction to semester curriculum</li>
                <li>• First assignments and projects assigned</li>
                <li>• Baseline assessments may be conducted</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Important Reminders
              </h4>
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• Establish good study habits early in the semester</li>
                <li>• Complete assignments on time</li>
                <li>• Attend all classes regularly</li>
                <li>• Seek help if struggling with any subject</li>
              </ul>
            </div>
          </div>
        )
      }
    } else if (week >= 6 && week <= 7) {
      return {
        title: "Midterm Assessment Period",
        period: "Weeks 6-7 (Midterm examinations)",
        icon: <BookOpen className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Midterm Examinations</h4>
              <ul className="text-orange-800 space-y-1 text-sm">
                <li>• Midterm tests across all subjects</li>
                <li>• Assessment of progress so far</li>
                <li>• Results feedback and discussion</li>
                <li>• Identify areas needing improvement</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student Support
              </h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Review sessions available before exams</li>
                <li>• Study groups and peer support</li>
                <li>• Teacher consultation hours</li>
                <li>• Academic support services available</li>
              </ul>
            </div>
          </div>
        )
      }
    } else if (week === 9) {
      return {
        title: "Parent-Teacher Conference",
        period: "Week 9 - Progress Review",
        icon: <Users className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Conference Activities</h4>
              <ul className="text-purple-800 space-y-1 text-sm">
                <li>• Scheduled meetings with parents and teachers</li>
                <li>• Review student progress and performance</li>
                <li>• Discuss academic strengths and areas for improvement</li>
                <li>• Set goals for the remainder of the semester</li>
                <li>• Address any concerns or questions</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preparation Tips
              </h4>
              <ul className="text-green-800 space-y-1 text-sm">
                <li>• Review your child's recent assessments</li>
                <li>• Prepare questions about academic progress</li>
                <li>• Discuss attendance and participation</li>
                <li>• Plan for upcoming semester activities</li>
              </ul>
            </div>
          </div>
        )
      }
    } else if (week >= 13 && week <= 16) {
      return {
        title: "Final Assessment Period",
        period: "Weeks 13-16 (Final examinations)",
        icon: <Clock className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Final Examinations
              </h4>
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• Comprehensive semester final examinations</li>
                <li>• Cover all material from the semester</li>
                <li>• Significant portion of semester grade</li>
                <li>• Results determine semester promotion</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Preparation Support</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Revision classes and study sessions</li>
                <li>• Past papers and practice tests</li>
                <li>• Study guides and resources</li>
                <li>• Teacher consultation for clarification</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">After Examinations</h4>
              <ul className="text-green-800 space-y-1 text-sm">
                <li>• Report cards issued</li>
                <li>• Semester results and feedback</li>
                <li>• Planning for next semester</li>
                <li>• Recognition of achievements</li>
              </ul>
            </div>
          </div>
        )
      }
    }
    
    return null
  }

  const weekInfo = getWeekInfo(week)

  if (!weekInfo) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {weekInfo.icon}
            {weekInfo.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {weekInfo.period} - {eventType}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {weekInfo.content}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This information applies to semester schedules across different faculties. 
            The timing and activities are designed to support student success and academic progress throughout the semester.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
