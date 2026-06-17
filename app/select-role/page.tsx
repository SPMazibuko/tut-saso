"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import type { SelectableRoleSlug } from "@/lib/role-mapping"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  GraduationCap,
  Users,
  Shield,
  School,
  Landmark,
  BookOpen,
  Heart,
  Building2,
  Settings,
  UserPlus,
  Lightbulb,
} from "lucide-react"

const VISIBLE_BULLETS = 3

type RoleCard = {
  role: SelectableRoleSlug
  title: string
  description: string
  bullets: string[]
  icon: React.ComponentType<{ className?: string }>
  accentColor: string
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: "super-admin",
    title: "Super Admin",
    description: "Manage system settings and oversee operations",
    bullets: [
      "Manage system settings",
      "Oversee all system operations",
      "Manage user accounts and permissions",
      "Configure campuses and programs",
      "Access full reporting and analytics",
    ],
    icon: Users,
    accentColor: "#ec4899",
  },
  {
    role: "tutor",
    title: "Tutor",
    description: "Support student learning and provide guidance",
    bullets: [
      "Conduct tutoring sessions",
      "Provide academic support and guidance",
      "Monitor student progress",
      "Create and grade assessments",
      "Collaborate with lecturers and staff",
    ],
    icon: BookOpen,
    accentColor: "#22c55e",
  },
  {
    role: "mentor",
    title: "Mentor",
    description: "Guide and mentor students in their academic journey",
    bullets: [
      "Provide mentorship and guidance",
      "Support student personal development",
      "Facilitate academic and career planning",
      "Monitor student progress",
      "Connect students with resources",
    ],
    icon: Heart,
    accentColor: "#ec4899",
  },
  {
    role: "lecture",
    title: "Lecture",
    description: "Deliver lectures and manage course content",
    bullets: [
      "Deliver course lectures",
      "Manage lecture schedules",
      "Upload course materials",
      "Assess student understanding",
      "Coordinate with module coordinators",
    ],
    icon: Building2,
    accentColor: "#14b8a6",
  },
  {
    role: "departmental-admin",
    title: "Departmental Administrator",
    description: "Manage departmental operations and administrative tasks",
    bullets: [
      "Manage department operations",
      "Handle administrative tasks",
      "Coordinate department activities",
      "Oversee schedules and resources",
      "Generate departmental reports",
    ],
    icon: Settings,
    accentColor: "#3b82f6",
  },
  {
    role: "hod-section-head",
    title: "HOD / Section Head",
    description: "Oversee department operations and strategic planning",
    bullets: [
      "Oversee department operations",
      "Strategic planning and decision-making",
      "Manage department staff and resources",
      "Ensure quality and compliance",
      "Drive academic initiatives",
    ],
    icon: Shield,
    accentColor: "#7c3aed",
  },
  {
    role: "assistant-dean",
    title: "Assistant Dean",
    description: "Support dean in academic and administrative leadership",
    bullets: [
      "Support dean in leadership activities",
      "Oversee academic programs",
      "Manage faculty operations",
      "Coordinate across departments",
      "Implement academic policies",
    ],
    icon: Landmark,
    accentColor: "#6366f1",
  },
  {
    role: "student-enrollment",
    title: "Student Enrollment",
    description: "Manage student enrollment processes and records",
    bullets: [
      "Process student enrollments",
      "Manage enrollment records",
      "Handle registration activities",
      "Maintain student data integrity",
      "Support enrollment reporting",
    ],
    icon: UserPlus,
    accentColor: "#22c55e",
  },
  {
    role: "instructional-designer",
    title: "Instructional Designer",
    description: "Design and develop effective learning experiences",
    bullets: [
      "Design learning experiences",
      "Develop course content",
      "Create educational materials",
      "Apply learning design principles",
      "Collaborate with faculty",
    ],
    icon: Lightbulb,
    accentColor: "#d97706",
  },
  {
    role: "module-coordinator",
    title: "Module Coordinator / Lecturer",
    description: "Manage courses and track student progress",
    bullets: [
      "Manage module content and curriculum",
      "Track student progress and grades",
      "Create and grade assessments",
      "Coordinate with tutors and lecturers",
      "Report on module performance",
    ],
    icon: GraduationCap,
    accentColor: "#b45309",
  },
  {
    role: "student",
    title: "Student",
    description: "Access academic resources and track your progress",
    bullets: [
      "View academic progress and grades",
      "Access learning resources and materials",
      "Submit assignments and assessments",
      "Track attendance and participation",
      "Get academic support and guidance",
    ],
    icon: Users,
    accentColor: "#0ea5e9",
  },
]

export default function SelectRolePage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <School className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-white sm:text-xl">iPASS</div>
              <div className="text-xs text-zinc-400">Academic Success System</div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h1 className="text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
            Select Your Role
          </h1>
          <p className="mt-3 text-zinc-400 text-base leading-relaxed sm:text-lg text-balance">
            Choose your role to access the appropriate dashboard and tools for your needs.
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {ROLE_CARDS.map((item, i) => {
            const Icon = item.icon
            const href = `/login?role=${encodeURIComponent(item.role)}`
            const accent = item.accentColor
            const visibleBullets = item.bullets.slice(0, VISIBLE_BULLETS)
            const moreCount = item.bullets.length - VISIBLE_BULLETS

            return (
              <Card
                key={item.role}
                className="group relative overflow-hidden rounded-2xl border-2 bg-zinc-900/90 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{
                  borderColor: accent,
                  animationDelay: `${Math.min(i * 70, 350)}ms`,
                  animationFillMode: "backwards",
                  boxShadow: `0 0 20px ${accent}20`,
                }}
              >
                <CardHeader className="space-y-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${accent}20` }}
                    >
                      <span style={{ color: accent }}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</span>
                  </div>
                  <CardTitle className="text-lg font-semibold tracking-tight text-white">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-zinc-400">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm font-medium text-white mb-2">Key Responsibilities:</p>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    {visibleBullets.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                    {moreCount > 0 && (
                      <li className="text-zinc-500">+{moreCount} more</li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Link
                    href={href}
                    className="flex h-11 w-full items-center justify-center rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accent }}
                  >
                    Continue
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

