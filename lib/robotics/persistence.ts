import type { PlacedComponent, Connection } from "@/lib/robotics/types"

const STORAGE_KEY = "tut_saso:circuit_lab:project"

export interface PersistedProject {
  name: string
  components: PlacedComponent[]
  connections: Connection[]
  firmwareCode?: string
}

export function saveProject(project: PersistedProject) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    }
  } catch {
    // ignore
  }
}

export function loadProject(): PersistedProject | null {
  try {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedProject
    if (!parsed || !Array.isArray(parsed.components) || !Array.isArray(parsed.connections)) return null
    return parsed
  } catch {
    return null
  }
}
