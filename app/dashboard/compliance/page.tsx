"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listDPIA, listConsent, recordConsent } from "@/lib/compliance"

export default function CompliancePage() {
  const [dpia] = useState(listDPIA())
  const [consents, setConsents] = useState(listConsent())
  const [userId, setUserId] = useState("")

  const addConsent = (scope: "analytics" | "communications" | "biometrics", granted: boolean) => {
    if (!userId) return
    recordConsent({ id: `c-${Date.now()}`, userId, scope, granted, timestamp: new Date(), method: "parental" })
    setConsents(listConsent())
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">POPIA Compliance</h1>
        <p className="text-muted-foreground">Consent records and DPIA registry</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consent Management</CardTitle>
            <CardDescription>Capture or review consent records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
              <Button onClick={() => addConsent("analytics", true)}>Grant Analytics</Button>
              <Button variant="outline" onClick={() => addConsent("communications", true)}>
                Grant Comms
              </Button>
            </div>
            <div className="space-y-2">
              {consents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No consents yet</p>
              ) : (
                consents.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <span className="text-sm">
                      {c.userId} • {c.scope} • {c.granted ? "granted" : "revoked"}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.timestamp.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DPIA Registry</CardTitle>
            <CardDescription>Data Protection Impact Assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dpia.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border bg-card">
                  <p className="font-medium">{d.process}</p>
                  <p className="text-xs text-muted-foreground mb-1">Owner: {d.owner}</p>
                  <p className="text-xs mb-1">Risks: {d.risksIdentified.join(", ")}</p>
                  <p className="text-xs">Mitigations: {d.mitigations.join(", ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


