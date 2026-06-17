"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const GRADIENT_CLASSES: Record<string, string> = {
  blue: "bg-gradient-to-br from-blue-500 to-cyan-600",
  purple: "bg-gradient-to-br from-purple-500 to-pink-600",
  emerald: "bg-gradient-to-br from-emerald-500 to-teal-600",
  cyan: "bg-gradient-to-br from-cyan-500 to-blue-600",
  red: "bg-gradient-to-br from-red-500 to-orange-600",
  indigo: "bg-gradient-to-br from-indigo-500 to-purple-600",
  coral: "bg-gradient-to-br from-orange-500 to-red-500",
  amber: "bg-gradient-to-br from-amber-500 to-orange-600",
  rose: "bg-gradient-to-br from-rose-500 to-pink-600",
}

interface GradientCardProps extends React.ComponentProps<"div"> {
  gradient?: keyof typeof GRADIENT_CLASSES | (string & {})
}

export function GradientCard({
  className,
  gradient,
  children,
  ...props
}: GradientCardProps) {
  const gradientClass = gradient ? GRADIENT_CLASSES[gradient] : undefined

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-sm",
        gradientClass ?? "bg-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
