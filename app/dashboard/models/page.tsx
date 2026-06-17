"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { listModels, startTraining } from "@/lib/ai"

export default function ModelsPage() {
  const [models, setModels] = useState(listModels())

  const triggerTraining = (type: "risk-prediction" | "attendance-forecast" | "grade-forecast") => {
    startTraining(type)
    setTimeout(() => setModels(listModels()), 2200)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
        <p className="text-muted-foreground">Manage prediction models and monitor fairness</p>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => triggerTraining("risk-prediction")}>Train Risk Model</Button>
        <Button variant="outline" onClick={() => triggerTraining("attendance-forecast")}>
          Train Attendance Model
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {models.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle>{m.name}</CardTitle>
              <CardDescription>
                Type: {m.type} • Version: {m.version} • Status: {m.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last trained: {m.trainedAt.toLocaleString()}</p>
                <p className="text-sm">Features: {m.features.join(", ") || "-"}</p>
                {m.fairnessMetrics && m.fairnessMetrics.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Fairness Metrics</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {m.fairnessMetrics.map((f, i) => (
                        <li key={i}>
                          {f.group}: {f.metric} = {f.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


