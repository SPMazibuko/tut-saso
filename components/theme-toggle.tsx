"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("rounded-full", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
   >
      <Sun className={cn("h-5 w-5 transition-transform", isDark && "scale-0 rotate-90")} />
      <Moon className={cn("absolute h-5 w-5 transition-transform", !isDark && "scale-0 -rotate-90")} />
    </Button>
  )
}


