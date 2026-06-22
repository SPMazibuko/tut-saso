export type PortKind = "digital" | "analog" | "power" | "ground" | "signal"

export type PortDirection = "input" | "output" | "bidirectional"

export interface ComponentPort {
  id: string
  name: string
  kind: PortKind
  direction: PortDirection
}

export interface ComponentPropertySchemaField {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "select"
  options?: Array<{ label: string; value: string | number }>
  min?: number
  max?: number
  step?: number
}

export interface ComponentType {
  id: string
  name: string
  category: "controller" | "sensor" | "actuator" | "power" | "misc"
  iconName: string
  ports: ComponentPort[]
  defaultProps: Record<string, unknown>
  propertySchema: ComponentPropertySchemaField[]
}

export interface PlacedComponent {
  id: string
  typeId: string
  name: string
  x: number
  y: number
  props: Record<string, unknown>
}

export interface ConnectionEndpointRef {
  componentId: string
  portId: string
}

export interface Connection {
  id: string
  from: ConnectionEndpointRef
  to: ConnectionEndpointRef
}

export interface Project {
  id: string
  name: string
  components: PlacedComponent[]
  connections: Connection[]
  createdAt: string
  updatedAt: string
}

export type ActivePanel = "components" | "properties" | "code"
