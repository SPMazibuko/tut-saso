import type { Connection, PlacedComponent } from "@/lib/robotics/types"
import {
  NoopCircuitEngine,
  NoopFirmwareEngine,
  NoopPhysicsEngine,
  type CircuitEngine,
  type FirmwareEngine,
  type PhysicsEngine,
} from "@/lib/robotics/engines"

export type OrchestratorConfig = {
  circuit?: CircuitEngine
  physics?: PhysicsEngine
  firmware?: FirmwareEngine
  onLog?: (msg: string) => void
}

export class SimulationOrchestrator {
  private circuit: CircuitEngine
  private physics: PhysicsEngine
  private firmware: FirmwareEngine
  private onLog?: (msg: string) => void

  constructor(cfg: OrchestratorConfig = {}) {
    this.circuit = cfg.circuit ?? new NoopCircuitEngine()
    this.physics = cfg.physics ?? new NoopPhysicsEngine()
    this.firmware = cfg.firmware ?? new NoopFirmwareEngine()
    this.onLog = cfg.onLog
  }

  load(components: PlacedComponent[], connections: Connection[]): void {
    const snapshot = { components, connections }
    this.circuit.load(snapshot)
    this.physics.load(snapshot)
  }

  startFirmware(code: string): void {
    this.firmware.loadCode(code)
    this.firmware.start({
      read: () => 0,
      write: (path, value) => this.circuit.setIO(path, value),
      log: (msg) => this.onLog?.(msg),
    })
  }

  startAll(): void {
    this.circuit.start()
    this.physics.start()
  }

  stopAll(): void {
    this.firmware.stop()
    this.circuit.stop()
    this.physics.stop()
  }
}
