"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Trash2,
} from "lucide-react"
import { ChartRenderer } from "@/components/ai-overview/chart-renderer"
import type { ChartData } from "@/lib/ai-overview/chart-builders"
import type { DashboardSpec } from "@/lib/ai-overview/spec-schema"

const STORAGE_KEY = "ai-overview-results"
const STORAGE_PROMPT_KEY = "ai-overview-last-prompt"

interface DashboardResponse {
  dashboardSpec: DashboardSpec
  charts: ChartData[]
  insight: {
    markdown: string
  }
  error?: string
}

export default function AIOverviewPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSpec, setShowSpec] = useState(false)
  const [streamProgress, setStreamProgress] = useState<{ built: number; total: number } | null>(null)
  const [displayedCharts, setDisplayedCharts] = useState<ChartData[]>([])
  const [stageMessage, setStageMessage] = useState("")
  const [progressValue, setProgressValue] = useState<number | null>(null)
  const [showProgressBanner, setShowProgressBanner] = useState(false)
  const [insightKind, setInsightKind] = useState<"draft" | "final" | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const resultsRef = useRef<DashboardResponse | null>(null)
  const chartsRef = useRef<ChartData[]>([])
  const indeterminateRef = useRef(false)
  const CHART_BATCH = 3
  const CHART_INTERVAL_MS = 80

  // Load cached results on mount
  useEffect(() => {
    try {
      const cachedResults = localStorage.getItem(STORAGE_KEY)
      const cachedPrompt = localStorage.getItem(STORAGE_PROMPT_KEY)
      if (cachedResults && cachedPrompt) {
        const parsed = JSON.parse(cachedResults)
        setResults(parsed)
        setPrompt(cachedPrompt)
      }
    } catch (err) {
      console.error("Failed to load cached results:", err)
    }
  }, [])

  const saveResults = (data: DashboardResponse, promptText: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(STORAGE_PROMPT_KEY, promptText)
    } catch (err) {
      console.error("Failed to save results to localStorage:", err)
    }
  }

  const clearResults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_PROMPT_KEY)
      setResults(null)
      setPrompt("")
      setError(null)
      setShowSpec(false)
      setStreamProgress(null)
      setDisplayedCharts([])
      setStageMessage("")
      setProgressValue(null)
      setShowProgressBanner(false)
      setInsightKind(null)
      resultsRef.current = null
      chartsRef.current = []
    } catch (err) {
      console.error("Failed to clear cached results:", err)
    }
  }

  // Indeterminate progress animation (0–35%) when waiting on spec/insight
  useEffect(() => {
    if (!showProgressBanner) return
    indeterminateRef.current = true
    let v = 0
    const id = setInterval(() => {
      if (!indeterminateRef.current) {
        clearInterval(id)
        return
      }
      v = Math.min(v + 2, 35)
      setProgressValue(v)
      if (v >= 35) {
        indeterminateRef.current = false
        clearInterval(id)
      }
    }, 150)
    return () => clearInterval(id)
  }, [showProgressBanner])

  // Progressive chart mount to avoid UI freeze when many charts arrive
  useEffect(() => {
    const charts = results?.charts ?? []
    chartsRef.current = charts
    if (charts.length === 0) {
      setDisplayedCharts([])
      return
    }
    setDisplayedCharts((prev) => {
      if (prev.length >= charts.length) return prev
      return charts.slice(0, Math.min(prev.length + CHART_BATCH, charts.length))
    })
    const id = setInterval(() => {
      setDisplayedCharts((prev) => {
        const target = chartsRef.current
        if (!target.length || prev.length >= target.length) return prev
        return target.slice(0, Math.min(prev.length + CHART_BATCH, target.length))
      })
    }, CHART_INTERVAL_MS)
    return () => clearInterval(id)
  }, [results?.charts])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter an analytics question")
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const ac = new AbortController()
    abortControllerRef.current = ac

    setLoading(true)
    setError(null)
    setResults(null)
    setShowSpec(false)
    setStreamProgress(null)
    setDisplayedCharts([])
    setStageMessage("Starting…")
    setProgressValue(null)
    setShowProgressBanner(true)
    setInsightKind(null)
    resultsRef.current = null
    chartsRef.current = []
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_PROMPT_KEY)
    } catch {
      // ignore
    }

    try {
      const response = await fetch("/api/ai-overview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          constraints: { maxCharts: null },
        }),
        signal: ac.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Dashboard generation failed")
      }

      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("text/event-stream")) {
        const data: DashboardResponse = await response.json()
        setResults(data)
        setInsightKind("final")
        setShowProgressBanner(false)
        saveResults(data, prompt.trim())
        return
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")
      const decoder = new TextDecoder()
      let buffer = ""
      const promptTrimmed = prompt.trim()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""
        for (const part of parts) {
          let eventName = ""
          let dataStr = ""
          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) eventName = line.slice(7).trim()
            else if (line.startsWith("data: ")) dataStr = line.slice(6)
          }
          if (!eventName || !dataStr) continue
          try {
            const data = JSON.parse(dataStr)
            if (eventName === "status") {
              const msg = data.message ?? ""
              setStageMessage(msg)
              const built = data.built ?? 0
              const total = data.total ?? data.totalCharts
              if (typeof total === "number" && total > 0) {
                indeterminateRef.current = false
                const pct = Math.round(40 + (60 * built) / total)
                setProgressValue(Math.min(pct, 100))
              }
              if (data.stage === "done") {
                indeterminateRef.current = false
                setProgressValue(100)
                setTimeout(() => setShowProgressBanner(false), 400)
              }
            } else if (eventName === "spec") {
              const next: DashboardResponse = {
                dashboardSpec: data.dashboardSpec,
                charts: [],
                insight: { markdown: "" },
              }
              resultsRef.current = next
              setResults(next)
            } else if (eventName === "charts") {
              const batch = (data.charts as ChartData[]) || []
              setResults((prev) => {
                if (!prev) return prev
                const next = { ...prev, charts: [...prev.charts, ...batch] }
                resultsRef.current = next
                return next
              })
              if (data.total != null) {
                indeterminateRef.current = false
                setStreamProgress({ built: data.built ?? 0, total: data.total })
                const built = data.built ?? 0
                const total = data.total
                if (total > 0) setProgressValue(Math.round(40 + (60 * built) / total))
              }
            } else if (eventName === "insight") {
              const kind = data.kind ?? "final"
              setInsightKind(kind)
              setResults((prev) => {
                if (!prev) return prev
                const next = { ...prev, insight: { markdown: data.markdown ?? "" } }
                resultsRef.current = next
                return next
              })
            } else if (eventName === "done") {
              const current = resultsRef.current
              if (current) saveResults(current, promptTrimmed)
              setStreamProgress(null)
              setStageMessage("Complete")
            } else if (eventName === "error") {
              setError(data.error ?? "Stream error")
              setStreamProgress(null)
              setShowProgressBanner(false)
            }
          } catch (e) {
            // ignore parse errors for single event
          }
        }
      }
      if (buffer.trim()) {
        let eventName = ""
        let dataStr = ""
        for (const line of buffer.split("\n")) {
          if (line.startsWith("event: ")) eventName = line.slice(7).trim()
          else if (line.startsWith("data: ")) dataStr = line.slice(6)
        }
        if (eventName === "error" && dataStr) {
          try {
            const data = JSON.parse(dataStr)
            setError(data.error ?? "Stream error")
          } catch {
            // ignore
          }
        }
      }
      const current = resultsRef.current
      if (current && !current.insight.markdown) {
        setStreamProgress(null)
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return
      setError(err?.message || "An error occurred while generating the dashboard")
      setShowProgressBanner(false)
      console.error("Dashboard generation error:", err)
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="relative">
      {/* Sticky progress banner */}
      {showProgressBanner && (
        <div
          className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 transition-all duration-300 data-[state=closed]:opacity-0"
          role="progressbar"
          aria-valuenow={progressValue ?? undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={stageMessage}
        >
          <div className="max-w-4xl mx-auto space-y-2">
            <p className="text-sm font-medium text-foreground">{stageMessage}</p>
            <Progress
              value={progressValue ?? 0}
              className="h-2.5"
            />
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Overview</h1>
          <p className="text-muted-foreground">
            Ask questions about TUT SASO student data and generate comprehensive analytics dashboards with insights
          </p>
        </div>
        {results && (
          <Button variant="outline" onClick={clearResults} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear Results
          </Button>
        )}
      </div>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Question</CardTitle>
          <CardDescription>
            Enter a question about university data. AI will generate multiple charts and insights.
            <br />
            Examples: "Show risk distribution by module", "Compare attendance vs risk levels", "Analyze intervention effectiveness"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Show me risk distribution by module, attendance trends, and intervention outcomes..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleGenerate()
              }
            }}
          />
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Dashboard...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Dashboard
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Insight */}
          {(results.insight?.markdown || (loading && results)) && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI Insights</CardTitle>
                  {insightKind === "draft" && (
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!results.insight?.markdown ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {results.insight.markdown.split('\n').map((line, idx) => {
                    // Basic markdown rendering
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-xl font-semibold mt-3 mb-2">{line.substring(3)}</h2>
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-lg font-semibold mt-2 mb-1">{line.substring(4)}</h3>
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>
                    }
                    if (line.trim() === '') {
                      return <br key={idx} />
                    }
                    return <p key={idx} className="mb-2">{line}</p>
                  })}
                </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dashboard Spec (Collapsible) */}
          <Collapsible open={showSpec} onOpenChange={setShowSpec}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Dashboard Specification</CardTitle>
                      <CardDescription className="text-xs">
                        Raw JSON spec used to generate charts (for debugging)
                      </CardDescription>
                    </div>
                    {showSpec ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(results.dashboardSpec, null, 2)}
                  </pre>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Charts Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Charts ({results.charts.length}
                {loading && streamProgress && ` / ${streamProgress.total} building…`})
              </h2>
            </div>
            {!results.insight?.markdown && loading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Charts will appear after preliminary insights…</p>
                  </div>
                </CardContent>
              </Card>
            ) : results.charts.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No charts generated. Try a different question.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedCharts.map((chart) => (
                  <ChartRenderer key={chart.id} chart={chart} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State (Skeletons) */}
      {loading && !results && (
        <div className="space-y-6">
          {/* Insight skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <CardTitle>AI Insights</CardTitle>
              </div>
              <CardDescription>Generating insights and charts…</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
              <div className="pt-2">
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>

          {/* Spec skeleton */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dashboard Specification</CardTitle>
              <CardDescription className="text-xs">
                Creating the chart spec…
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>

          {/* Charts skeleton grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Charts</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-40 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-lg font-semibold">Start Analyzing</h3>
                <p className="text-sm text-muted-foreground">
                  Enter an analytics question above to generate comprehensive dashboards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
