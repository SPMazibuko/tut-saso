import type { Connection, PlacedComponent } from "@/lib/robotics/types"

export type CircuitSnapshot = {
  components: PlacedComponent[]
  connections: Connection[]
}

export interface CircuitEngine {
  load(snapshot: CircuitSnapshot): void
  start(): void
  stop(): void
  setIO(path: { componentId: string; portId: string }, value: number | boolean): void
  onIOChange?(cb: (path: { componentId: string; portId: string }, value: number) => void): void
}

export interface PhysicsEngine {
  load(snapshot: CircuitSnapshot): void
  start(): void
  stop(): void
  step?(dtMs: number): void
  getSensorValue?(id: string): number
}

export interface FirmwareEngine {
  loadCode(code: string): void
  start(io: {
    read: (path: { componentId: string; portId: string }) => number
    write: (path: { componentId: string; portId: string }, value: number | boolean) => void
    log?: (msg: string) => void
  }): void
  stop(): void
}

export class NoopCircuitEngine implements CircuitEngine {
  load(_snapshot: CircuitSnapshot): void {}
  start(): void {}
  stop(): void {}
  setIO(_path: { componentId: string; portId: string }, _value: number | boolean): void {}
  onIOChange(_cb: (path: { componentId: string; portId: string }, value: number) => void): void {}
}

export class NoopPhysicsEngine implements PhysicsEngine {
  private running = false
  private rafId: number | null = null
  private lastTs = 0

  load(_snapshot: CircuitSnapshot): void {}
  start(): void {
    if (this.running) return
    this.running = true
    const loop = (ts: number) => {
      if (!this.running) return
      const dt = this.lastTs ? ts - this.lastTs : 16
      this.lastTs = ts
      this.step?.(dt)
      this.rafId = typeof window !== "undefined" ? window.requestAnimationFrame(loop) : null
    }
    if (typeof window !== "undefined") {
      this.rafId = window.requestAnimationFrame(loop)
    }
  }
  stop(): void {
    this.running = false
    if (typeof window !== "undefined" && this.rafId) {
      window.cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
  step(_dtMs: number): void {}
  getSensorValue(_id: string): number {
    return 0
  }
}

export class NoopFirmwareEngine implements FirmwareEngine {
  private running = false
  private io: Parameters<FirmwareEngine["start"]>[0] | null = null

  loadCode(_code: string): void {}
  start(io: Parameters<FirmwareEngine["start"]>[0]): void {
    this.io = io
    this.running = true
    this.io?.log?.("Firmware simulation started")
  }
  stop(): void {
    if (!this.running) return
    this.running = false
    this.io?.log?.("Firmware simulation stopped")
  }
}
