"use client"

import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Code, Copy, Play, Square } from "lucide-react"
import { useRoboticsSimulation } from "@/hooks/useRoboticsSimulation"
import { useRoboticsBuilder } from "@/hooks/useRoboticsBuilder"

export function FirmwareEditor() {
  const { firmwareCode, setFirmwareCode, components, connections } = useRoboticsBuilder()
  const { start, stop, logs, running } = useRoboticsSimulation()
  const [localCode, setLocalCode] = useState<string>(firmwareCode)

  const onApply = useCallback(() => {
    setFirmwareCode(localCode)
  }, [localCode, setFirmwareCode])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localCode)
    } catch {
      // ignore
    }
  }, [localCode])

  const canStart = useMemo(() => components.length > 0, [components])

  const onStart = useCallback(() => {
    onApply()
    start({ code: localCode, components, connections })
  }, [onApply, start, localCode, components, connections])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
        <Button size="sm" onClick={onApply}>
          <Code className="w-4 h-4 mr-2" />
          Apply
        </Button>
        {!running ? (
          <Button size="sm" disabled={!canStart} onClick={onStart}>
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        ) : (
          <Button variant="destructive" size="sm" onClick={stop}>
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>
      <Textarea
        className="min-h-[200px] font-mono text-xs"
        value={localCode}
        onChange={(e) => setLocalCode(e.target.value)}
      />
      {logs.length > 0 && (
        <div className="bg-muted rounded-md p-2 max-h-40 overflow-auto font-mono text-xs">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  )
}
