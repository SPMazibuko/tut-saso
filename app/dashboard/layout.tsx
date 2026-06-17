"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Offline banner
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <AuthGuard>
      <div className="flex h-screen max-h-screen overflow-hidden">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto bg-muted/30 h-full">
          {isOffline && (
            <div className="bg-yellow-500 text-yellow-950 text-sm px-4 py-2 text-center">You're offline. Some features may be unavailable.</div>
          )}
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
