import { ComponentType } from "./types"

export const COMPONENT_LIBRARY: ComponentType[] = [
  {
    id: "arduino-uno",
    name: "Arduino Uno",
    category: "controller",
    iconName: "Cpu",
    ports: [
      ...Array.from({ length: 14 }, (_, i) => ({
        id: `D${i}`,
        name: `D${i}`,
        kind: "digital" as const,
        direction: "bidirectional" as const,
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `A${i}`,
        name: `A${i}`,
        kind: "analog" as const,
        direction: "input" as const,
      })),
      { id: "5V", name: "5V", kind: "power", direction: "output" },
      { id: "3V3", name: "3.3V", kind: "power", direction: "output" },
      { id: "GND1", name: "GND", kind: "ground", direction: "bidirectional" },
      { id: "GND2", name: "GND", kind: "ground", direction: "bidirectional" },
    ],
    defaultProps: {},
    propertySchema: [],
  },
  {
    id: "resistor",
    name: "Resistor",
    category: "misc",
    iconName: "Minus",
    ports: [
      { id: "A", name: "A", kind: "signal", direction: "bidirectional" },
      { id: "B", name: "B", kind: "signal", direction: "bidirectional" },
    ],
    defaultProps: { ohms: 220 },
    propertySchema: [
      { key: "ohms", label: "Resistance (Ω)", type: "number", min: 1, max: 1000000, step: 1 },
    ],
  },
  {
    id: "led",
    name: "LED",
    category: "actuator",
    iconName: "Lightbulb",
    ports: [
      { id: "ANODE", name: "+", kind: "signal", direction: "input" },
      { id: "CATHODE", name: "-", kind: "ground", direction: "bidirectional" },
    ],
    defaultProps: { color: "red" },
    propertySchema: [
      {
        key: "color",
        label: "Color",
        type: "select",
        options: [
          { label: "Red", value: "red" },
          { label: "Green", value: "green" },
          { label: "Blue", value: "blue" },
          { label: "Yellow", value: "yellow" },
        ],
      },
    ],
  },
  {
    id: "ultrasonic-sensor",
    name: "Ultrasonic Sensor",
    category: "sensor",
    iconName: "Radio",
    ports: [
      { id: "VCC", name: "VCC", kind: "power", direction: "input" },
      { id: "TRIG", name: "TRIG", kind: "signal", direction: "input" },
      { id: "ECHO", name: "ECHO", kind: "signal", direction: "output" },
      { id: "GND", name: "GND", kind: "ground", direction: "bidirectional" },
    ],
    defaultProps: { distanceCm: 20 },
    propertySchema: [
      { key: "distanceCm", label: "Distance (cm)", type: "number", min: 1, max: 400, step: 1 },
    ],
  },
  {
    id: "dc-motor",
    name: "DC Motor",
    category: "actuator",
    iconName: "Zap",
    ports: [
      { id: "V+", name: "+", kind: "power", direction: "input" },
      { id: "V-", name: "-", kind: "ground", direction: "bidirectional" },
      { id: "PWM", name: "PWM", kind: "signal", direction: "input" },
    ],
    defaultProps: { speed: 0 },
    propertySchema: [
      { key: "speed", label: "Speed (%)", type: "number", min: 0, max: 100, step: 1 },
    ],
  },
  {
    id: "battery",
    name: "Battery",
    category: "power",
    iconName: "Battery",
    ports: [
      { id: "+", name: "+", kind: "power", direction: "output" },
      { id: "-", name: "-", kind: "ground", direction: "bidirectional" },
    ],
    defaultProps: { voltage: 5 },
    propertySchema: [
      { key: "voltage", label: "Voltage (V)", type: "number", min: 1, max: 12, step: 0.1 },
    ],
  },
]

export function getComponentTypeById(id: string): ComponentType | undefined {
  return COMPONENT_LIBRARY.find((c) => c.id === id)
}
