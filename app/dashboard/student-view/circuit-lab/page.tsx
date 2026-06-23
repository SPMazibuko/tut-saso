"use client"

import { StudentViewLayout } from "@/components/student-view/student-view-layout"
import { CircuitLabBuilder } from "@/components/student-view/circuit-lab-builder"
import { RoboticsBuilderProvider } from "@/hooks/useRoboticsBuilder"
import { RoboticsSimulationProvider } from "@/hooks/useRoboticsSimulation"
import { Toaster } from "@/components/ui/toaster"

export default function CircuitLabPage() {
  return (
    <StudentViewLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Circuit Lab</h1>
        <p className="text-sm text-muted-foreground">
          Design and simulate electrical circuits — drag components, wire connections and run firmware
        </p>
      </div>
      <RoboticsSimulationProvider>
        <RoboticsBuilderProvider>
          <CircuitLabBuilder />
        </RoboticsBuilderProvider>
      </RoboticsSimulationProvider>
      <Toaster />
    </StudentViewLayout>
  )
}
