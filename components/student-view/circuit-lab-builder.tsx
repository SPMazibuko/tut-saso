"use client"

import { useMemo, useRef, useEffect, useCallback, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  Zap,
  Radio,
  Lightbulb,
  Gauge,
  Battery,
  Minus,
  Settings,
  Code,
  Eye,
  EyeOff,
  Grid3x3,
  Layers,
  Trash2,
  Cable,
  Activity,
} from "lucide-react"
import { useRoboticsBuilder } from "@/hooks/useRoboticsBuilder"
import { useRoboticsSimulation } from "@/hooks/useRoboticsSimulation"
import { FirmwareEditor } from "@/components/robotics/FirmwareEditor"
import { COMPONENT_LIBRARY, getComponentTypeById } from "@/lib/robotics/library"
import { recordCircuitBuild } from "@/lib/student-gamification"
import type { ComponentPort, ComponentPropertySchemaField, Connection, PlacedComponent } from "@/lib/robotics/types"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const ARDUINO_WIRE_PORTS = ["D13", "D12", "D11", "D10", "D9", "5V", "GND1", "GND2", "A0", "A1"]

type ActiveWire = {
  fromComponentId: string
  fromPortId: string
  mouseX: number
  mouseY: number
}

function getDisplayPorts(typeId: string, ports: ComponentPort[]): ComponentPort[] {
  if (typeId === "arduino-uno") {
    return ports.filter((p) => ARDUINO_WIRE_PORTS.includes(p.id))
  }
  return ports
}

function getPortPosition(
  compX: number,
  compY: number,
  portIndex: number,
  totalPorts: number,
  side: "left" | "right" = "right",
) {
  const cardWidth = 112
  const cardPaddingTop = 56
  const spacing = 18
  const clusterHeight = Math.max(totalPorts - 1, 0) * spacing
  const startY = compY + cardPaddingTop - clusterHeight / 2

  return {
    x: side === "right" ? compX + cardWidth : compX,
    y: startY + portIndex * spacing,
  }
}

function formatConnectionLabel(conn: Connection, components: PlacedComponent[]) {
  const from = components.find((c) => c.id === conn.from.componentId)
  const to = components.find((c) => c.id === conn.to.componentId)
  return `${from?.name ?? "?"} (${conn.from.portId}) → ${to?.name ?? "?"} (${conn.to.portId})`
}

function ComponentPropertyField({
  field,
  value,
  onChange,
}: {
  field: ComponentPropertySchemaField
  value: unknown
  onChange: (val: unknown) => void
}) {
  const id = `prop-${field.key}`

  if (field.type === "select" && field.options) {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={id} className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{field.label}</Label>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />
      </div>
    )
  }

  if (field.type === "number") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          type="number"
          className="mt-1"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>
    )
  }

  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        className="mt-1"
        value={value === undefined || value === null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function CircuitLabBuilder() {
  const {
    projectName,
    setProjectName,
    isSimulating,
    toggleSimulate,
    activePanel,
    setActivePanel,
    components: placedComponents,
    connections,
    selectComponent,
    selectedComponentId,
    addComponent,
    reset,
    moveComponent,
    addConnection,
    removeComponent,
    renameComponent,
    removeConnection,
    updateComponentProps,
    firmwareCode,
  } = useRoboticsBuilder()

  const { start, stop, logs, clearLogs } = useRoboticsSimulation()
  const { toast } = useToast()
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(false)

  const selectedComponent = useMemo(
    () => placedComponents.find((c) => c.id === selectedComponentId) ?? null,
    [placedComponents, selectedComponentId],
  )
  const selectedType = useMemo(
    () => (selectedComponent ? getComponentTypeById(selectedComponent.typeId) : undefined),
    [selectedComponent],
  )

  const circuitStats = useMemo(() => {
    const byCategory = (cat: string) =>
      placedComponents.filter((c) => getComponentTypeById(c.typeId)?.category === cat).length
    return {
      components: placedComponents.length,
      wires: connections.length,
      controllers: byCategory("controller"),
      sensors: byCategory("sensor"),
      actuators: byCategory("actuator"),
      power: byCategory("power"),
    }
  }, [placedComponents, connections])

  const componentConnections = useMemo(() => {
    if (!selectedComponentId) return []
    return connections.filter(
      (c) => c.from.componentId === selectedComponentId || c.to.componentId === selectedComponentId,
    )
  }, [connections, selectedComponentId])

  const iconMap = useMemo(() => ({ Cpu, Lightbulb, Radio, Zap, Gauge, Battery, Minus }), [])
  const libraryForUI = useMemo(() => COMPONENT_LIBRARY.map((c) => ({
    typeId: c.id,
    name: c.name,
    iconName: c.iconName,
    color: "text-primary",
  })), [])

  const handleAdd = (typeId: string) => addComponent(typeId)

  // Drag and snap-to-grid
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const GRID = 20
  const snap = (n: number) => Math.round(n / GRID) * GRID

  const onMouseDownComponent = useCallback((e: React.MouseEvent, compId: string) => {
    if ((e.target as HTMLElement).closest("[data-circuit-port]")) return
    if (activeWireRef.current) return
    selectComponent(compId)
    setActivePanel("properties")
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const comp = placedComponents.find((c) => c.id === compId)
    if (!comp) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    dragRef.current = { id: compId, offsetX: mouseX - comp.x, offsetY: mouseY - comp.y }
    e.preventDefault()
  }, [placedComponents, selectComponent, setActivePanel])

  // Wiring state — useState so the preview wire re-renders while dragging
  const [activeWire, setActiveWire] = useState<ActiveWire | null>(null)
  const activeWireRef = useRef<ActiveWire | null>(null)

  const setWire = useCallback((wire: ActiveWire | null) => {
    activeWireRef.current = wire
    setActiveWire(wire)
  }, [])

  const handleSimulate = () => {
    if (isSimulating) {
      stop()
      toggleSimulate()
      return
    }
    if (placedComponents.length === 0) {
      toast({ title: "Nothing to simulate", description: "Add at least one component first.", variant: "destructive" })
      return
    }
    clearLogs()
    start({ code: firmwareCode, components: placedComponents, connections })
    toggleSimulate()
    toast({ title: "Simulation started", description: "Firmware is running against your circuit layout." })
  }

  const handleReset = () => {
    if (!window.confirm("Reset the circuit? All components and wires will be cleared.")) return
    if (isSimulating) stop()
    setWire(null)
    reset()
    toast({ title: "Circuit reset", description: "Canvas restored to a fresh Arduino starter layout." })
  }

  const handleSave = () => {
    recordCircuitBuild()
    toast({
      title: "Circuit saved",
      description: `${projectName} — ${placedComponents.length} components, ${connections.length} wires. +150 XP on first build.`,
    })
  }

  const handleCanvasBackgroundClick = () => {
    if (activeWireRef.current) {
      setWire(null)
      return
    }
    selectComponent(null)
  }

  const getPortAnchor = useCallback(
    (componentId: string, portId: string) => {
      const comp = placedComponents.find((c) => c.id === componentId)
      if (!comp) return null
      const type = getComponentTypeById(comp.typeId)
      if (!type) return null
      const displayPorts = getDisplayPorts(comp.typeId, type.ports)
      const portIndex = displayPorts.findIndex((p) => p.id === portId)
      if (portIndex < 0) return null
      const isSplitSides = displayPorts.length <= 3
      const side: "left" | "right" = isSplitSides && portIndex === 0 ? "left" : "right"
      const anchorIndex = isSplitSides ? 0 : portIndex
      const anchorTotal = isSplitSides ? 1 : displayPorts.length
      return getPortPosition(comp.x, comp.y, anchorIndex, anchorTotal, side)
    },
    [placedComponents],
  )

  const canConnect = (
    fromComponentId: string,
    fromTypeId: string,
    fromPortId: string,
    toComponentId: string,
    toTypeId: string,
    toPortId: string,
  ) => {
    if (fromComponentId === toComponentId && fromPortId === toPortId) return false

    const fromType = getComponentTypeById(fromTypeId)
    const toType = getComponentTypeById(toTypeId)
    if (!fromType || !toType) return false

    const fromPort = fromType.ports.find((p) => p.id === fromPortId)
    const toPort = toType.ports.find((p) => p.id === toPortId)
    if (!fromPort || !toPort) return false

    // Educational sandbox — allow all cross-component port connections
    return true
  }

  const connectionExists = (fromId: string, fromPort: string, toId: string, toPort: string) => {
    return connections.some(
      (c) =>
        (c.from.componentId === fromId &&
          c.from.portId === fromPort &&
          c.to.componentId === toId &&
          c.to.portId === toPort) ||
        (c.from.componentId === toId &&
          c.from.portId === toPort &&
          c.to.componentId === fromId &&
          c.to.portId === fromPort),
    )
  }

  const completeWire = useCallback(
    (toComponentId: string, toPortId: string) => {
      const start = activeWireRef.current
      if (!start) return false

      if (start.fromComponentId === toComponentId && start.fromPortId === toPortId) {
        setWire(null)
        return false
      }

      const fromComp = placedComponents.find((c) => c.id === start.fromComponentId)
      const toComp = placedComponents.find((c) => c.id === toComponentId)
      if (!fromComp || !toComp) {
        setWire(null)
        return false
      }

      if (
        !canConnect(
          start.fromComponentId,
          fromComp.typeId,
          start.fromPortId,
          toComponentId,
          toComp.typeId,
          toPortId,
        ) ||
        connectionExists(start.fromComponentId, start.fromPortId, toComponentId, toPortId)
      ) {
        setWire(null)
        return false
      }

      const id = `${start.fromComponentId}:${start.fromPortId}->${toComponentId}:${toPortId}`
      addConnection({
        id,
        from: { componentId: start.fromComponentId, portId: start.fromPortId },
        to: { componentId: toComponentId, portId: toPortId },
      })
      setWire(null)
      return true
    },
    [placedComponents, connections, addConnection, setWire],
  )

  const startWire = useCallback(
    (componentId: string, portId: string, e: React.PointerEvent) => {
      e.stopPropagation()
      e.preventDefault()
      dragRef.current = null
      selectComponent(componentId)
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      setWire({
        fromComponentId: componentId,
        fromPortId: portId,
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top,
      })
    },
    [selectComponent, setWire],
  )

  const handlePortPointerDown = useCallback(
    (componentId: string, portId: string, e: React.PointerEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (activeWireRef.current) {
        completeWire(componentId, portId)
      } else {
        startWire(componentId, portId, e)
      }
    },
    [completeWire, startWire],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedComponentId) {
        removeComponent(selectedComponentId)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedComponentId, removeComponent])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragRef.current.offsetX
      const y = e.clientY - rect.top - dragRef.current.offsetY
      moveComponent(dragRef.current.id, snap(x), snap(y))
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [moveComponent])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!activeWireRef.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      setWire({
        ...activeWireRef.current,
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top,
      })
    }

    const findPortAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      const portEl = el?.closest("[data-circuit-port]") as HTMLElement | null
      if (!portEl) return null
      const componentId = portEl.dataset.componentId
      const portId = portEl.dataset.portId
      return componentId && portId ? { componentId, portId } : null
    }

    const onUp = (e: PointerEvent) => {
      if (!activeWireRef.current) return

      const port = findPortAt(e.clientX, e.clientY)
      if (port) {
        completeWire(port.componentId, port.portId)
        return
      }

      setWire(null)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [setWire, completeWire])

  return (
    <div className="-mx-6 md:-mx-8 -mb-6 md:-mb-8">
      <div className="h-[calc(100vh-14rem)] flex flex-col gap-4 px-6 md:px-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="project-name" className="sr-only">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant={isSimulating ? "destructive" : "default"}
                  onClick={handleSimulate}
                  className={isSimulating ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Simulate
                    </>
                  )}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Workspace */}
        <div className="flex-1 grid grid-cols-[300px_1fr_300px] gap-4">
          {/* Left Sidebar - Component Library */}
          <Card className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Components
              </h3>
            </div>
            <CardContent className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {libraryForUI.map((component, index) => (
                  <button
                    key={index}
                    onClick={() => handleAdd(component.typeId)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {(() => {
                        const IconComp = (iconMap as Record<string, any>)[component.iconName] ?? Cpu
                        return <IconComp className={`w-5 h-5 ${component.color}`} />
                      })()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{component.name}</p>
                      <p className="text-xs text-muted-foreground">{component.typeId}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Center - Canvas */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border shadow-sm px-3 py-1 font-semibold",
                  isSimulating
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border",
                )}
              >
                {isSimulating ? "Simulating…" : "Design Mode"}
              </Badge>
              <Button
                variant={showGrid ? "default" : "outline"}
                size="icon"
                className="bg-background/80 backdrop-blur-sm"
                onClick={() => setShowGrid((v) => !v)}
                title={showGrid ? "Hide grid" : "Show grid"}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={showLabels ? "default" : "outline"}
                size="icon"
                className="bg-background/80 backdrop-blur-sm"
                onClick={() => setShowLabels((v) => !v)}
                title={showLabels ? "Hide labels" : "Show port & wire labels"}
              >
                {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <CardContent className="p-0 h-full bg-gradient-to-br from-muted/20 to-muted/5 relative">
              {showGrid && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
              )}

              {/* Placed Components + Wires */}
              <div
                ref={canvasRef}
                className="relative h-full min-h-[420px]"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) handleCanvasBackgroundClick()
                }}
              >
                {/* SVG wires layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                  {connections.map((conn) => {
                    const a = getPortAnchor(conn.from.componentId, conn.from.portId)
                    const b = getPortAnchor(conn.to.componentId, conn.to.portId)
                    if (!a || !b) return null
                    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5)
                    const d = `M ${a.x},${a.y} C ${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`
                    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
                    return (
                      <g key={conn.id}>
                        <path
                          d={d}
                          stroke="var(--primary)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                        />
                        {showLabels && (
                          <text
                            x={mid.x}
                            y={mid.y - 6}
                            textAnchor="middle"
                            className="fill-primary text-[9px] font-medium"
                            style={{ pointerEvents: "none" }}
                          >
                            {conn.from.portId}→{conn.to.portId}
                          </text>
                        )}
                      </g>
                    )
                  })}
                  {activeWire && (() => {
                    const a = getPortAnchor(activeWire.fromComponentId, activeWire.fromPortId)
                    if (!a) return null
                    const b = { x: activeWire.mouseX, y: activeWire.mouseY }
                    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5)
                    const d = `M ${a.x},${a.y} C ${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`
                    return (
                      <path
                        d={d}
                        stroke="var(--primary)"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                        opacity={0.8}
                      />
                    )
                  })()}
                </svg>

                {placedComponents.map((component) => {
                  const type = getComponentTypeById(component.typeId)
                  const displayPorts = getDisplayPorts(component.typeId, type?.ports ?? [])
                  const IconComp = (iconMap as Record<string, typeof Cpu>)[type?.iconName ?? "Cpu"] ?? Cpu

                  const renderPort = (port: ComponentPort, idx: number, side: "left" | "right") => {
                    const isWiringFrom =
                      activeWire?.fromComponentId === component.id && activeWire?.fromPortId === port.id
                    const isSplitSides = displayPorts.length <= 3
                    const topOffset = isSplitSides
                      ? 56
                      : 56 + idx * 18 - (displayPorts.length - 1) * 9

                    return (
                      <>
                        <button
                          key={`${side}-${port.id}`}
                          type="button"
                          data-circuit-port="true"
                          data-component-id={component.id}
                          data-port-id={port.id}
                          onPointerDown={(e) => handlePortPointerDown(component.id, port.id, e)}
                          className={`z-30 rounded-full border-2 border-background shadow-sm transition-transform hover:scale-125 ${
                            isWiringFrom ? "w-5 h-5 bg-primary ring-2 ring-primary/40" : "w-4 h-4 bg-primary"
                          }`}
                          title={`${port.name} (${port.kind}) — click or drag to connect`}
                          style={{
                            position: "absolute",
                            top: `${topOffset}px`,
                            [side === "right" ? "right" : "left"]: "-8px",
                            touchAction: "none",
                          }}
                        />
                        {showLabels && (
                          <span
                            className="absolute z-20 text-[9px] font-mono text-primary bg-background/90 px-1 rounded border pointer-events-none whitespace-nowrap"
                            style={{
                              top: `${topOffset + 14}px`,
                              [side === "right" ? "right" : "left"]: "-10px",
                              transform: side === "right" ? "translateX(50%)" : "translateX(-50%)",
                            }}
                          >
                            {port.id}
                          </span>
                        )}
                      </>
                    )
                  }

                  return (
                    <div
                      key={component.id}
                      onMouseDown={(e) => onMouseDownComponent(e, component.id)}
                      className={`absolute cursor-move transition-all z-20 ${
                        selectedComponentId === component.id ? "ring-2 ring-primary rounded-lg" : ""
                      }`}
                      style={{
                        left: `${component.x}px`,
                        top: `${component.y}px`,
                        transform: isSimulating ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      <div className={`relative bg-card border-2 border-border rounded-lg p-4 shadow-lg hover:border-primary transition-colors w-28 ${
                        isSimulating && component.typeId === "led" ? "ring-2 ring-yellow-400 shadow-yellow-200/50 animate-pulse" : ""
                      }`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isSimulating && component.typeId === "led"
                              ? "bg-yellow-400/30"
                              : "bg-primary/10"
                          }`}>
                            <IconComp className={`w-6 h-6 ${
                              isSimulating && component.typeId === "led" ? "text-yellow-500" : "text-primary"
                            }`} />
                          </div>
                          <p className="text-xs font-medium text-center leading-tight">{component.name}</p>
                        </div>
                        {displayPorts.length <= 3
                          ? displayPorts.map((port, idx) =>
                              renderPort(port, idx, idx === 0 ? "left" : "right"),
                            )
                          : displayPorts.map((port, idx) => renderPort(port, idx, "right"))}
                      </div>
                    </div>
                  )
                })}

                {placedComponents.length <= 1 && !activeWire && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="text-center text-muted-foreground">
                      <Zap className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium mb-2">Build Your Electrical Circuit</p>
                      <p className="text-sm">
                        Add components, then click a blue port and drag to another port to wire connections
                      </p>
                    </div>
                  </div>
                )}

                {activeWire && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      Drag to a port and release · or click two ports · {connections.length} wire
                      {connections.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Sidebar - Properties/Code */}
          <Card className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Button
                variant={activePanel === "properties" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActivePanel("properties")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Properties
              </Button>
              <Button
                variant={activePanel === "code" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActivePanel("code")}
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </Button>
            </div>
            <CardContent className="p-4 overflow-y-auto flex-1">
              {activePanel === "properties" && (
                <div className="space-y-4">
                  {selectedComponent && selectedType ? (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="capitalize text-xs">
                            {selectedType.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">{selectedType.id}</span>
                        </div>
                        <h4 className="font-medium">{selectedType.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Position ({selectedComponent.x}, {selectedComponent.y})
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="comp-name">Label</Label>
                          <Input
                            id="comp-name"
                            className="mt-1"
                            value={selectedComponent.name}
                            onChange={(e) => renameComponent(selectedComponent.id, e.target.value)}
                          />
                        </div>

                        {selectedType.propertySchema.map((field) => (
                          <ComponentPropertyField
                            key={field.key}
                            field={field}
                            value={selectedComponent.props[field.key]}
                            onChange={(val) =>
                              updateComponentProps(selectedComponent.id, { [field.key]: val })
                            }
                          />
                        ))}

                        {selectedType.ports.length > 0 && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Available ports</Label>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {getDisplayPorts(selectedComponent.typeId, selectedType.ports).map((port) => (
                                <Badge key={port.id} variant="outline" className="text-[10px] font-mono">
                                  {port.id} · {port.kind}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {componentConnections.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              <Cable className="w-3.5 h-3.5" />
                              Connections ({componentConnections.length})
                            </Label>
                            {componentConnections.map((conn) => (
                              <div
                                key={conn.id}
                                className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs"
                              >
                                <span className="truncate">{formatConnectionLabel(conn, placedComponents)}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => removeConnection(conn.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => removeComponent(selectedComponent.id)}
                      >
                        Remove Component
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Circuit Overview
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{projectName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Components", value: circuitStats.components },
                          { label: "Wires", value: circuitStats.wires },
                          { label: "Controllers", value: circuitStats.controllers },
                          { label: "Sensors", value: circuitStats.sensors },
                          { label: "Actuators", value: circuitStats.actuators },
                          { label: "Power", value: circuitStats.power },
                        ].map((stat) => (
                          <div key={stat.label} className="rounded-lg border bg-muted/40 p-2 text-center">
                            <p className="text-lg font-bold">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mode</span>
                          <Badge variant={isSimulating ? "default" : "secondary"}>
                            {isSimulating ? "Simulating" : "Design"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Grid</span>
                          <span>{showGrid ? "Visible" : "Hidden"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Labels</span>
                          <span>{showLabels ? "On" : "Off"}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Cable className="w-3.5 h-3.5" />
                          All wires ({connections.length})
                        </Label>
                        {connections.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">
                            No connections yet. Click a port and drag to another to wire components.
                          </p>
                        ) : (
                          connections.map((conn) => (
                            <div
                              key={conn.id}
                              className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs"
                            >
                              <span className="truncate">{formatConnectionLabel(conn, placedComponents)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => removeConnection(conn.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>

                      {isSimulating && logs.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label>Simulation log</Label>
                            <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/30 p-2 font-mono text-[10px] space-y-1">
                              {logs.slice(-20).map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Click a component on the canvas to edit its properties
                      </p>
                    </>
                  )}
                </div>
              )}

              {activePanel === "code" && <FirmwareEditor />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
