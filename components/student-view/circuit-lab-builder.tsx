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
  Grid3x3,
  Layers,
} from "lucide-react"
import { useRoboticsBuilder } from "@/hooks/useRoboticsBuilder"
import { FirmwareEditor } from "@/components/robotics/FirmwareEditor"
import { COMPONENT_LIBRARY, getComponentTypeById } from "@/lib/robotics/library"
import { recordCircuitBuild } from "@/lib/student-gamification"
import type { ComponentPort } from "@/lib/robotics/types"

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
  } = useRoboticsBuilder()

  const iconMap = useMemo(() => ({ Cpu, Lightbulb, Radio, Zap, Gauge, Battery, Minus }), [])
  const libraryForUI = useMemo(() => COMPONENT_LIBRARY.map((c) => ({
    typeId: c.id,
    name: c.name,
    iconName: c.iconName,
    color: "text-primary",
  })), [])

  const handleAdd = (typeId: string) => addComponent(typeId)
  const handleSimulate = () => toggleSimulate()
  const handleReset = () => reset()
  const handleSave = () => {
    recordCircuitBuild()
    alert("Circuit saved! +150 XP earned for your first build.")
  }

  // Drag and snap-to-grid
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const GRID = 20
  const snap = (n: number) => Math.round(n / GRID) * GRID

  const onMouseDownComponent = useCallback((e: React.MouseEvent, compId: string) => {
    if ((e.target as HTMLElement).closest("[data-circuit-port]")) return
    if (activeWireRef.current) return
    selectComponent(compId)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const comp = placedComponents.find((c) => c.id === compId)
    if (!comp) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    dragRef.current = { id: compId, offsetX: mouseX - comp.x, offsetY: mouseY - comp.y }
    e.preventDefault()
  }, [placedComponents, selectComponent])

  // Wiring state — useState so the preview wire re-renders while dragging
  const [activeWire, setActiveWire] = useState<ActiveWire | null>(null)
  const activeWireRef = useRef<ActiveWire | null>(null)

  const setWire = useCallback((wire: ActiveWire | null) => {
    activeWireRef.current = wire
    setActiveWire(wire)
  }, [])

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
              <Badge variant={isSimulating ? "default" : "secondary"} className="bg-background/80 backdrop-blur-sm">
                {isSimulating ? "Simulating..." : "Design Mode"}
              </Badge>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            <CardContent className="p-0 h-full bg-gradient-to-br from-muted/20 to-muted/5 relative">
              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Placed Components + Wires */}
              <div ref={canvasRef} className="relative h-full min-h-[420px]">
                {/* SVG wires layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                  {connections.map((conn) => {
                    const a = getPortAnchor(conn.from.componentId, conn.from.portId)
                    const b = getPortAnchor(conn.to.componentId, conn.to.portId)
                    if (!a || !b) return null
                    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5)
                    const d = `M ${a.x},${a.y} C ${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`
                    return (
                      <path
                        key={conn.id}
                        d={d}
                        stroke="var(--primary)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
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
                      <div className="relative bg-card border-2 border-border rounded-lg p-4 shadow-lg hover:border-primary transition-colors w-28">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComp className="w-6 h-6 text-primary" />
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
                  {selectedComponentId ? (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Component Properties</h4>
                        <p className="text-sm text-muted-foreground mb-4">Configure the selected component settings</p>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const comp = placedComponents.find(c => c.id === selectedComponentId)
                          if (!comp) return null
                          return (
                            <div>
                              <Label htmlFor="comp-name">Name</Label>
                              <Input id="comp-name" value={comp.name} onChange={(e) => renameComponent(comp.id, e.target.value)} />
                            </div>
                          )
                        })()}
                        <div>
                          <Label htmlFor="comp-pin">Pin</Label>
                          <Input id="comp-pin" defaultValue="13" type="number" />
                        </div>
                        <div>
                          <Label htmlFor="comp-voltage">Voltage (V)</Label>
                          <Input id="comp-voltage" defaultValue="5" type="number" />
                        </div>
                        <div className="pt-2">
                          <Button variant="destructive" onClick={() => removeComponent(selectedComponentId)}>
                            Remove Component
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Select a component to view its properties</p>
                    </div>
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
