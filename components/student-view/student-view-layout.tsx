"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  BookOpen,
  ClipboardList,
  Calendar,
  GraduationCap,
  MessageSquare,
  User,
  Trophy,
  Zap,
} from "lucide-react"
import { SASO_DASHBOARD_STATS } from "@/lib/tut-saso-data"

interface StudentViewLayoutProps {
  children: React.ReactNode
}

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard/student-view", icon: Home, exact: true },
  { name: "My Modules", href: "/dashboard/student-view/modules", icon: BookOpen },
  { name: "Assignments", href: "/dashboard/student-view/assignments", icon: ClipboardList },
  { name: "Attendance", href: "/dashboard/student-view/attendance", icon: Calendar },
  { name: "Academic Progress", href: "/dashboard/student-view/progress", icon: GraduationCap },
  { name: "Quizzes", href: "/dashboard/student-view/quizzes", icon: Trophy },
  { name: "Circuit Lab", href: "/dashboard/student-view/circuit-lab", icon: Zap },
  { name: "Support", href: "/dashboard/student-view/support", icon: MessageSquare },
  { name: "Profile", href: "/dashboard/student-view/profile", icon: User },
]

export function StudentViewLayout({ children }: StudentViewLayoutProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex flex-col gap-3 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                TUT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">Student Portal</h2>
                  <Badge variant="secondary" className="text-xs">
                    Preview
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tshwane University of Technology · {SASO_DASHBOARD_STATS.academicYear} Academic Year
                </p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Semester 1
            </Badge>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-1">
            {studentNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 md:p-8">{children}</div>
    </div>
  )
}
