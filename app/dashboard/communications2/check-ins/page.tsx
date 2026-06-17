"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

type Entry = { id: string; mood: string; note: string; at: string }

const moods = [
  { id: "great", label: "Great" },
  { id: "good", label: "Good" },
  { id: "okay", label: "Okay" },
  { id: "low", label: "Low" },
  { id: "stressed", label: "Stressed" },
]

export default function CheckInsPage() {
  const [selected, setSelected] = useState<string>("good")
  const [note, setNote] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkins.entries")
      if (saved) setEntries(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("checkins.entries", JSON.stringify(entries))
    } catch {}
  }, [entries])

  function addEntry() {
    const e: Entry = { id: `${Date.now()}`, mood: selected, note, at: new Date().toISOString() }
    setEntries([e, ...entries])
    setNote("")
  }

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Motivation & check-ins</h1>
          <p className="text-muted-foreground">Track how you feel and jot a quick reflection</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/communications">Back to chat</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
          <CardDescription>Select one and add a brief note if you like.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <Button
                key={m.id}
                variant={selected === m.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelected(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
          <Textarea
            placeholder="Write a short check-in..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={addEntry} disabled={!selected && !note.trim()}>Save check-in</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((e) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="text-base">{e.mood}</CardTitle>
              <CardDescription>{new Date(e.at).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap">{e.note || "No note"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


