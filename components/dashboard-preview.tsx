"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, AlertTriangle, CheckCircle } from "lucide-react"

export function DashboardPreview() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Real-Time Analytics Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor student performance, identify at-risk students, and track intervention effectiveness in real-time.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-accent">+12.5%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <span className="text-xs font-medium text-accent">+8.2%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Performance</p>
                <p className="text-2xl font-bold">87.3%</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <span className="text-xs font-medium text-destructive">-15.3%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">At-Risk Students</p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <span className="text-xs font-medium text-accent">+22.1%</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interventions Active</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-card">
            <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
              <img
                src="/modern-analytics-dashboard-with-charts-and-graphs-.jpg"
                alt="SASO System Analytics Dashboard"
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
