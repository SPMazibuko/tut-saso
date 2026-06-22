"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { Connection, PlacedComponent } from "@/lib/robotics/types"
import { SimulationOrchestrator } from "@/lib/robotics/orchestrator"

type SimulationContextValue = {
  logs: string[]
  clearLogs: () => void
  start: (args: { code: string; components: PlacedComponent[]; connections: Connection[] }) => void
  stop: () => void
  running: boolean
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

export function RoboticsSimulationProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const orchestratorRef = useRef<SimulationOrchestrator | null>(null)

  if (!orchestratorRef.current) {
    orchestratorRef.current = new SimulationOrchestrator({ onLog: (msg) => setLogs((l) => [...l, msg]) })
  }

  const start = useCallback(
    (args: { code: string; components: PlacedComponent[]; connections: Connection[] }) => {
      orchestratorRef.current!.load(args.components, args.connections)
      orchestratorRef.current!.startAll()
      orchestratorRef.current!.startFirmware(args.code)
      setRunning(true)
    },
    [],
  )

  const stop = useCallback(() => {
    orchestratorRef.current!.stopAll()
    setRunning(false)
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  const value = useMemo<SimulationContextValue>(
    () => ({ logs, clearLogs, start, stop, running }),
    [logs, clearLogs, start, stop, running],
  )

  useEffect(() => {
    return () => {
      orchestratorRef.current?.stopAll()
    }
  }, [])

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useRoboticsSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error("useRoboticsSimulation must be used within RoboticsSimulationProvider")
  return ctx
}
