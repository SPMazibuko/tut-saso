"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Brain, HelpCircle, Phone, Mail } from "lucide-react"
import { StudentViewLayout } from "@/components/student-view/student-view-layout"

const supportChannels = [
  {
    title: "AI Academic Support",
    description: "Get help with module content, assignments and study planning from the SASO AI assistant.",
    icon: Brain,
    href: "/dashboard/ai-support",
    action: "Open AI Support",
  },
  {
    title: "Student Communications",
    description: "Message your tutor, mentor or module coordinator through the institutional messaging hub.",
    icon: MessageSquare,
    href: "/dashboard/communications",
    action: "Open Messages",
  },
  {
    title: "Student Development & Support (SDS)",
    description: "Access counselling, academic advising and wellness support services.",
    icon: HelpCircle,
    href: "#",
    action: "Contact SDS",
  },
]

export default function StudentSupportPage() {
  return (
    <StudentViewLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Student Support</h1>
          <p className="text-muted-foreground">
            Academic, wellness and administrative support channels at TUT
          </p>
        </div>

        <div className="grid gap-4">
          {supportChannels.map((channel) => (
            <Card key={channel.title}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <channel.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{channel.title}</CardTitle>
                    <CardDescription className="mt-1">{channel.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={channel.href}>
                  <Button variant="outline">{channel.action}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Contact</CardTitle>
            <CardDescription>Faculty of Information & Communication Technology</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>ict-enquiries@tut.ac.za</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>+27 12 382 5000</span>
            </div>
            <p className="text-muted-foreground">
              Office hours: Monday – Friday, 08:00 – 16:30 (SAST)
            </p>
          </CardContent>
        </Card>
      </div>
    </StudentViewLayout>
  )
}
