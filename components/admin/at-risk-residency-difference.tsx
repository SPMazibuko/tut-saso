"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AtRiskResidencyDifferenceProps {
  difference: number // onCampus - offCampus
  onOpenDrilldown?: () => void
}

export function AtRiskResidencyDifference({ difference, onOpenDrilldown }: AtRiskResidencyDifferenceProps) {
  const isPositive = difference > 0
  const isNegative = difference < 0
  const isZero = difference === 0

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/70 via-muted/40 to-transparent dark:from-muted/40 dark:via-muted/20 dark:to-transparent">
        <CardTitle className="text-xl font-semibold text-foreground">Residency Difference</CardTitle>
      </CardHeader>
      <CardContent
        className={`p-6 ${onOpenDrilldown ? "cursor-pointer hover:opacity-90" : ""}`}
        onClick={() => onOpenDrilldown?.()}
        role={onOpenDrilldown ? "button" : undefined}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg",
            isPositive && "bg-gradient-to-r from-orange-500 to-amber-500",
            isNegative && "bg-gradient-to-r from-purple-500 to-violet-500",
            isZero && "bg-gradient-to-r from-gray-400 to-gray-500"
          )}>
            {isPositive && <TrendingUp className="h-8 w-8" />}
            {isNegative && <TrendingDown className="h-8 w-8" />}
            {isZero && <Minus className="h-8 w-8" />}
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">
              {isPositive ? "+" : ""}{difference}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPositive && "More on-campus than off-campus"}
              {isNegative && "More off-campus than on-campus"}
              {isZero && "Equal on-campus and off-campus"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              On-campus − Off-campus
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
