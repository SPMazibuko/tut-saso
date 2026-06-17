"use client"

import type React from "react"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock, Loader2 } from "lucide-react"
import { isAuthenticated, login } from "@/lib/auth"
import { isSelectableRole } from "@/lib/role-mapping"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")
  const selectedRole = isSelectableRole(roleParam) ? roleParam : null
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router, selectedRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = login(email, password, roleParam)

      if (user) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-accent/[0.06] dark:via-primary/10 dark:to-accent/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
      />
      <div className="absolute left-1/2 top-1/4 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
      <div className="absolute bottom-1/4 right-1/4 h-[240px] w-[240px] rounded-full bg-accent/10 blur-3xl dark:bg-accent/15" />

      {/* Card */}
      <Card
        className="relative w-full max-w-[420px] border-border/80 bg-card/80 shadow-xl shadow-primary/5 backdrop-blur-xl dark:bg-card/90 dark:shadow-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl"
        style={{ animationDelay: "0ms", animationFillMode: "backwards" }}
      >
        <CardHeader className="space-y-4 pb-2 pt-8 text-center sm:pt-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
            <Lock className="h-7 w-7" strokeWidth={2} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              iPASS Login
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-base">
              Enter your credentials to access the system
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-10 pt-2 sm:pb-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert
                variant="destructive"
                className="animate-in fade-in slide-in-from-top-1 border-destructive/50 bg-destructive/10 dark:bg-destructive/15"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg border-input/80 bg-background/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-background/30"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-input/80 bg-background/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-background/30"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg font-medium shadow-sm transition-all hover:shadow focus-visible:ring-2 focus-visible:ring-primary/20"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function LoginPageFallback() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-accent/[0.06] dark:via-primary/10 dark:to-accent/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <Card className="relative w-full max-w-[420px] rounded-2xl border-border/80 bg-card/80 shadow-xl backdrop-blur-xl dark:bg-card/90">
        <CardHeader className="space-y-4 pb-2 pt-8 text-center sm:pt-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
            <Lock className="h-7 w-7 animate-pulse text-primary" />
          </div>
          <div className="space-y-2">
            <div className="mx-auto h-7 w-48 rounded-md bg-muted animate-pulse" />
            <div className="mx-auto h-4 w-64 rounded-md bg-muted/80 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pb-10 pt-2 sm:pb-12">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted/80 animate-pulse" />
            <div className="h-11 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted/80 animate-pulse" />
            <div className="h-11 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="h-11 w-full rounded-lg bg-muted animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}
