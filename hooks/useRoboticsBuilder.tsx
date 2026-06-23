"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react"
import type { ActivePanel, PlacedComponent, Connection } from "@/lib/robotics/types"
import { COMPONENT_LIBRARY, getComponentTypeById } from "@/lib/robotics/library"
import { loadProject, saveProject } from "@/lib/robotics/persistence"

function defaultFirmware(): string {
  return `// LED blink example\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}`
}

type RoboticsBuilderState = {
  projectName: string
  isSimulating: boolean
  activePanel: ActivePanel
  components: PlacedComponent[]
  connections: Connection[]
  selectedComponentId: string | null
  firmwareCode: string
}

type RoboticsBuilderAction =
  | { type: "setProjectName"; name: string }
  | { type: "toggleSimulate" }
  | { type: "setActivePanel"; panel: ActivePanel }
  | { type: "addComponent"; typeId: string }
  | { type: "selectComponent"; id: string | null }
  | { type: "moveComponent"; id: string; x: number; y: number }
  | { type: "addConnection"; connection: Connection }
  | { type: "removeConnection"; id: string }
  | { type: "removeComponent"; id: string }
  | { type: "renameComponent"; id: string; name: string }
  | { type: "updateComponentProps"; id: string; props: Record<string, unknown> }
  | { type: "setFirmwareCode"; code: string }
  | { type: "reset" }

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultState(activePanel: ActivePanel = "properties"): RoboticsBuilderState {
  const arduino = getComponentTypeById("arduino-uno")
  const initialArduinoComponent: PlacedComponent = {
    id: generateId(),
    typeId: arduino?.id ?? "arduino-uno",
    name: arduino?.name ?? "Arduino Uno",
    x: 200,
    y: 150,
    props: arduino?.defaultProps ?? {},
  }

  return {
    projectName: "My Circuit",
    isSimulating: false,
    activePanel,
    components: [initialArduinoComponent],
    connections: [],
    selectedComponentId: null,
    firmwareCode: defaultFirmware(),
  }
}

function initialState(): RoboticsBuilderState {
  const arduino = getComponentTypeById("arduino-uno")
  const initialArduinoComponent: PlacedComponent = {
    id: "1",
    typeId: arduino?.id ?? "arduino-uno",
    name: arduino?.name ?? "Arduino Uno",
    x: 200,
    y: 150,
    props: arduino?.defaultProps ?? {},
  }

  const restored = loadProject()
  if (restored) {
    return {
      projectName: restored.name || "My Circuit",
      isSimulating: false,
      activePanel: "properties",
      components: restored.components.length ? restored.components : [initialArduinoComponent],
      connections: restored.connections || [],
      selectedComponentId: null,
      firmwareCode: restored.firmwareCode ?? defaultFirmware(),
    }
  }

  return createDefaultState()
}

function reducer(state: RoboticsBuilderState, action: RoboticsBuilderAction): RoboticsBuilderState {
  switch (action.type) {
    case "setProjectName":
      return { ...state, projectName: action.name }
    case "toggleSimulate":
      return { ...state, isSimulating: !state.isSimulating }
    case "setActivePanel":
      return { ...state, activePanel: action.panel }
    case "addComponent": {
      const type = getComponentTypeById(action.typeId)
      if (!type) return state
      const newComponent: PlacedComponent = {
        id: generateId(),
        typeId: type.id,
        name: type.name,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        props: { ...type.defaultProps },
      }
      return { ...state, components: [...state.components, newComponent] }
    }
    case "selectComponent":
      return { ...state, selectedComponentId: action.id }
    case "moveComponent":
      return {
        ...state,
        components: state.components.map((c) => (c.id === action.id ? { ...c, x: action.x, y: action.y } : c)),
      }
    case "addConnection": {
      const exists = state.connections.some((c) => c.id === action.connection.id)
      if (exists) return state
      return { ...state, connections: [...state.connections, action.connection] }
    }
    case "removeConnection":
      return { ...state, connections: state.connections.filter((c) => c.id !== action.id) }
    case "removeComponent":
      return {
        ...state,
        components: state.components.filter((c) => c.id !== action.id),
        connections: state.connections.filter(
          (c) => c.from.componentId !== action.id && c.to.componentId !== action.id,
        ),
        selectedComponentId: state.selectedComponentId === action.id ? null : state.selectedComponentId,
      }
    case "renameComponent":
      return {
        ...state,
        components: state.components.map((c) => (c.id === action.id ? { ...c, name: action.name } : c)),
      }
    case "updateComponentProps":
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === action.id ? { ...c, props: { ...c.props, ...action.props } } : c,
        ),
      }
    case "setFirmwareCode":
      return { ...state, firmwareCode: action.code }
    case "reset":
      return createDefaultState(state.activePanel)
    default:
      return state
  }
}

type RoboticsBuilderContextValue = RoboticsBuilderState & {
  addComponent: (typeId: string) => void
  selectComponent: (id: string | null) => void
  moveComponent: (id: string, x: number, y: number) => void
  setProjectName: (name: string) => void
  toggleSimulate: () => void
  setActivePanel: (panel: ActivePanel) => void
  reset: () => void
  catalog: typeof COMPONENT_LIBRARY
  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
  removeComponent: (id: string) => void
  renameComponent: (id: string, name: string) => void
  updateComponentProps: (id: string, props: Record<string, unknown>) => void
  setFirmwareCode: (code: string) => void
}

const RoboticsBuilderContext = createContext<RoboticsBuilderContextValue | null>(null)

export function RoboticsBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [hydrated, setHydrated] = useState(false)

  const value = useMemo<RoboticsBuilderContextValue>(
    () => ({
      ...state,
      addComponent: (typeId) => dispatch({ type: "addComponent", typeId }),
      selectComponent: (id) => dispatch({ type: "selectComponent", id }),
      moveComponent: (id, x, y) => dispatch({ type: "moveComponent", id, x, y }),
      setProjectName: (name) => dispatch({ type: "setProjectName", name }),
      toggleSimulate: () => dispatch({ type: "toggleSimulate" }),
      setActivePanel: (panel) => dispatch({ type: "setActivePanel", panel }),
      reset: () => dispatch({ type: "reset" }),
      catalog: COMPONENT_LIBRARY,
      addConnection: (connection) => dispatch({ type: "addConnection", connection }),
      removeConnection: (id) => dispatch({ type: "removeConnection", id }),
      removeComponent: (id) => dispatch({ type: "removeComponent", id }),
      renameComponent: (id, name) => dispatch({ type: "renameComponent", id, name }),
      updateComponentProps: (id, props) => dispatch({ type: "updateComponentProps", id, props }),
      setFirmwareCode: (code) => dispatch({ type: "setFirmwareCode", code }),
    }),
    [state],
  )

  useEffect(() => {
    saveProject({
      name: state.projectName,
      components: state.components,
      connections: state.connections,
      firmwareCode: state.firmwareCode,
    })
  }, [state.projectName, state.components, state.connections, state.firmwareCode])

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) return <div />

  return <RoboticsBuilderContext.Provider value={value}>{children}</RoboticsBuilderContext.Provider>
}

export function useRoboticsBuilder(): RoboticsBuilderContextValue {
  const ctx = useContext(RoboticsBuilderContext)
  if (!ctx) throw new Error("useRoboticsBuilder must be used within RoboticsBuilderProvider")
  return ctx
}
