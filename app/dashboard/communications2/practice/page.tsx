"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const practiceSets = [
  { id: "algebra-basics", title: "Algebra Basics", desc: "Linear equations, factoring, exponents", count: 20 },
  { id: "quadratics", title: "Quadratic Equations", desc: "Completing the square, formula, graphing", count: 18 },
  { id: "calculus-derivatives", title: "Derivatives", desc: "Rules, product/quotient, chain rule", count: 24 },
  { id: "calculus-integrals", title: "Integrals", desc: "u-substitution, parts, areas", count: 22 },
  { id: "geometry", title: "Geometry", desc: "Triangles, circles, similarity, proofs", count: 16 },
]

export default function PracticePage() {
  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice problems</h1>
          <p className="text-muted-foreground">Quick sets to strengthen understanding before exams</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/communications">Back to chat</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {practiceSets.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{s.count} questions</div>
              <Button size="sm" asChild>
                <Link href={`/dashboard/communications/practice/${s.id}`}>Start</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


