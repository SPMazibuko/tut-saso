"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientCardProps extends React.ComponentProps<"div"> {
  gradient?: string
}

export function GradientCard({
  className,
  gradient,
  children,
  ...props
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm",
        gradient && "bg-gradient-to-br",
        className
      )}
      style={
        gradient
          ? {
              background: gradient,
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  )
}

