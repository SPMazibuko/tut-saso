"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { isAuthenticated, login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Loader2,
  Shield,
  UserCheck,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const PORTALS = [
  {
    title: "Admin Portal",
    subtitle: "System Management",
    description: "Configure users, policies, and institutional analytics.",
    icon: UserCheck,
    role: "super-admin",
    accent: "from-blue-500/20 to-blue-600/5",
    iconBg: "bg-blue-500/15 text-blue-400",
    ring: "hover:ring-blue-500/40",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    title: "Academic Admin Portal",
    subtitle: "Learning Resources",
    description: "Manage programmes, modules, and academic support.",
    icon: BookOpen,
    role: "departmental-admin",
    accent: "from-emerald-500/20 to-emerald-600/5",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    ring: "hover:ring-emerald-500/40",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    title: "Lecturer/Tutor Portal",
    subtitle: "Access Resources",
    description: "Deliver sessions, track progress, and support learners.",
    icon: Users,
    role: "tutor",
    accent: "from-violet-500/20 to-violet-600/5",
    iconBg: "bg-violet-500/15 text-violet-400",
    ring: "hover:ring-violet-500/40",
    glow: "group-hover:shadow-violet-500/20",
  },
] as const

const HIGHLIGHTS = [
  { value: "15,000+", label: "Students supported" },
  { value: "24/7", label: "Digital access" },
  { value: "1", label: "Faculties connected" },
]

export default function HomePage() {
  const router = useRouter()
  const loginRef = useRef<HTMLElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = login(email, password)

      if (user) {
        router.push("/dashboard")
      } else {
        setError("Invalid username or password")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 h-[280px] w-[280px] rounded-full bg-emerald-600/8 blur-[90px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/25">
              <Shield className="h-6 w-6 text-blue-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">SASO System</h1>
              <p className="text-xs text-zinc-400 sm:text-sm">SASO ICT</p>
            </div>
          </div>
          <div className="w-10" aria-hidden />
        </div>
      </header>

      <main className="relative z-10">
        <section className="container mx-auto px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20 sm:pb-20">
          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-3xl duration-700">
            <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30">
                <Shield className="h-12 w-12 text-blue-400 sm:h-14 sm:w-14" strokeWidth={1.5} />
              </div>
            </div>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Welcome to SASO</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">
              We Serve — <span className="text-zinc-300">&quot;Revived, Recapitalized, Rebuilt&quot;</span>
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {HIGHLIGHTS.map((item, i) => (
                <div
                  key={item.label}
                  className="animate-in fade-in slide-in-from-bottom-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm duration-500"
                  style={{ animationDelay: `${150 + i * 80}ms`, animationFillMode: "backwards" }}
                >
                  <p className="text-xl font-semibold text-white sm:text-2xl">{item.value}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 sm:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {PORTALS.map((portal, i) => {
              const Icon = portal.icon

              return (
                <button
                  key={portal.title}
                  type="button"
                  onClick={() => router.push("/select-role")}
                  className={cn(
                    "group animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                    portal.accent,
                    portal.ring,
                    portal.glow,
                  )}
                  style={{ animationDelay: `${250 + i * 100}ms`, animationFillMode: "backwards" }}
                >
                  <div
                    className={cn(
                      "mb-5 flex h-14 w-14 items-center justify-center rounded-full ring-1 ring-white/10",
                      portal.iconBg,
                    )}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{portal.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{portal.subtitle}</p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">{portal.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors group-hover:text-white">
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section ref={loginRef} className="container mx-auto scroll-mt-24 px-4 pb-24 sm:px-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-xl duration-700">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Access Your Dashboard</h2>
              <p className="mt-3 text-sm text-zinc-400 sm:text-base">
                Enter your credentials to access your role-specific dashboard and tools
              </p>
            </div>

            <Card className="border-white/10 bg-zinc-950/80 shadow-2xl shadow-blue-500/5 backdrop-blur-xl">
              <CardHeader className="space-y-3 pb-2 pt-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/25">
                  <Shield className="h-7 w-7 text-blue-400" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold text-white">SASO Login</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Enter your credentials to access the SASO system
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-8 pt-2">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert
                      variant="destructive"
                      className="border-destructive/50 bg-destructive/10"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm text-zinc-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your student number or email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                      className="h-11 border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-zinc-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="h-11 w-full gap-2 bg-blue-500 font-medium text-black hover:bg-blue-400"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                  Need a different role?{" "}
                  <Link href="/select-role" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
                    Browse all portals
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/60 px-4 py-8 text-center backdrop-blur-xl">
        <p className="text-sm text-zinc-500">
          Need help? Contact your system administrator or visit our{" "}
          <Link href="/select-role" className="text-zinc-300 underline-offset-4 transition-colors hover:text-white hover:underline">
            support center
          </Link>
          .
        </p>
        <p className="mt-3 text-xs text-zinc-600">© {new Date().getFullYear()} SASO System · Information and Communication Technology</p>
      </footer>
    </div>
  )
}
