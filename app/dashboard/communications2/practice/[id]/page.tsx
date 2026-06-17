"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const bank: Record<string, { title: string; problems: Array<{ q: string; a: string }> }> = {
  "algebra-basics": {
    title: "Algebra Basics",
    problems: [
      { q: "Solve for x: 3x + 7 = 25", a: "x = 6" },
      { q: "Factor: x^2 - 9x", a: "x(x - 9)" },
      { q: "Simplify: (2x^2)(3x)", a: "6x^3" },
    ],
  },
  quadratics: {
    title: "Quadratic Equations",
    problems: [
      { q: "Solve x^2 - 5x + 6 = 0", a: "x = 2, 3" },
      { q: "Vertex of y = x^2 - 4x + 1", a: "(2, -3)" },
      { q: "Discriminant of x^2 + 2x + 1 = 0", a: "Δ = 0" },
    ],
  },
  "calculus-derivatives": {
    title: "Derivatives",
    problems: [
      { q: "d/dx (x^3)", a: "3x^2" },
      { q: "d/dx (sin x)", a: "cos x" },
      { q: "d/dx (e^{2x})", a: "2e^{2x}" },
    ],
  },
  "calculus-integrals": {
    title: "Integrals",
    problems: [
      { q: "∫ 2x dx", a: "x^2 + C" },
      { q: "∫ cos x dx", a: "sin x + C" },
      { q: "∫ e^x dx", a: "e^x + C" },
    ],
  },
  geometry: {
    title: "Geometry",
    problems: [
      { q: "Sum of interior angles in a triangle", a: "180°" },
      { q: "Area of circle (r)", a: "πr^2" },
      { q: "Pythagorean theorem", a: "a^2 + b^2 = c^2" },
    ],
  },
}

export default function PracticeSetPage() {
  const params = useParams<{ id: string }>()
  const set = useMemo(() => bank[params.id] ?? { title: "Practice", problems: [] }, [params.id])

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{set.title}</h1>
          <p className="text-muted-foreground">Work through the problems below</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/communications/practice">All sets</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {set.problems.map((p, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">Problem {i + 1}</CardTitle>
              <CardDescription>{p.q}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <span className="font-medium">Answer:</span> {p.a}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


