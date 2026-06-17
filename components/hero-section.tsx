import { Button } from "@/components/ui/button"
import { ArrowRight, Download } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container relative">
        <div className="mx-auto max-w-5xl py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
              <span className="text-primary">●</span>
              <span className="ml-2 text-muted-foreground">
                Empowering Academic Success Through Predictive Analytics
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl text-balance">
              Transform Student Success with <span className="text-primary">Data-Driven Insights</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty leading-relaxed">
              iPASS is an intelligent platform designed to strengthen student success in schools and higher education
              through early risk detection, predictive analytics, and coordinated academic support.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="#demo">
                  Request Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="#resources">
                  <Download className="h-4 w-4" />
                  Download Proposal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
