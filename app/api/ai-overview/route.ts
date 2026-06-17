import { NextRequest } from "next/server"
import OpenAI from "openai"
import { DashboardSpecSchema, type DashboardSpec } from "@/lib/ai-overview/spec-schema"
import { buildChart, type ChartData } from "@/lib/ai-overview/chart-builders"
import { getAvailableDatasets, getDatasetSchema } from "@/lib/ai-overview/datasets"

export const runtime = "nodejs"

interface DashboardRequest {
  prompt: string
  constraints?: {
    maxCharts?: number | null
  }
}

interface DashboardResponse {
  dashboardSpec: DashboardSpec
  charts: ChartData[]
  insight: {
    markdown: string
  }
  error?: string
}

// Get DeepSeek client
function getDeepSeekClient(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return null
  }

  const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat"

  return new OpenAI({
    apiKey,
    baseURL,
    defaultQuery: { model },
  })
}

// Generate dashboard spec from prompt using DeepSeek
async function generateDashboardSpec(prompt: string, client: OpenAI): Promise<DashboardSpec> {
  const availableDatasets = getAvailableDatasets()
  const datasetSchemas: Record<string, Record<string, string>> = {}
  
  // Get schemas for all datasets
  for (const datasetName of availableDatasets) {
    try {
      datasetSchemas[datasetName] = getDatasetSchema(datasetName)
    } catch (e) {
      // Skip if schema can't be determined
    }
  }

  const systemPrompt = `You are an analytics dashboard generator. Convert user prompts into structured dashboard specifications.

Available datasets and their schemas:
${availableDatasets.map((name) => {
  const schema = datasetSchemas[name]
  const fields = Object.entries(schema)
    .map(([key, type]) => `  - ${key}: ${type}`)
    .join("\n")
  return `\n${name}:\n${fields || "  (empty dataset)"}`
}).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "intent": "brief description of what the dashboard shows",
  "datasets": ["students", "alerts", ...],
  "charts": [
    {
      "id": "chart-1",
      "type": "bar|line|area|pie|stackedBar|table|kpi",
      "title": "Chart Title",
      "description": "Optional description",
      "dataset": "students",
      "x": "fieldName",
      "y": "fieldName",
      "series": ["field1", "field2"],
      "groupBy": ["field1", "field2"],
      "filters": [
        {
          "field": "fieldName",
          "operator": "equals|in|range|contains|greaterThan|lessThan",
          "value": "value or [value1, value2] for range/in"
        }
      ],
      "metrics": [
        {
          "field": "fieldName",
          "aggregation": "count|sum|avg|min|max|distinctCount",
          "alias": "optionalAlias"
        }
      ]
    }
  ],
  "globalFilters": []
}

Guidelines:
- Generate MANY charts (aim for 5-15+ charts) to provide comprehensive insights
- Use appropriate chart types: bar for comparisons, line for trends, pie for distributions, stackedBar for multi-series, kpi for single metrics
- For risk/attendance/performance questions, create multiple views (by module, by risk level, over time, distributions, etc.)
- Use groupBy to create breakdowns (e.g., groupBy: ["module", "risk_level"] for grade breakdowns)
- Use metrics for aggregations (count, avg, sum, etc.)
- Use filters to narrow data when needed
- Make chart titles descriptive and clear`

  try {
    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("Empty response from DeepSeek")
    }

    const parsed = JSON.parse(content)
    const validated = DashboardSpecSchema.parse(parsed)
    return validated
  } catch (error: any) {
    console.error("DeepSeek dashboard spec generation failed:", error)
    throw new Error(`Failed to generate dashboard spec: ${error.message}`)
  }
}

// Generate preliminary insight from prompt + spec (no chart data)
async function generateDraftInsight(
  prompt: string,
  dashboardSpec: DashboardSpec,
  client: OpenAI,
): Promise<string> {
  const chartTitles = dashboardSpec.charts.map((c) => `- ${c.title} (${c.type})`).join("\n")
  const systemPrompt = `You are an analytics insights writer. Write a brief preliminary markdown summary based on the user's question and planned dashboard structure.

Focus on:
- What the dashboard will show
- Expected areas of interest
- Keep it concise (2-4 short paragraphs)

Do NOT reference specific data values (charts are not built yet).`

  try {
    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `User's question: ${prompt}\n\nPlanned dashboard (${dashboardSpec.intent}) with ${dashboardSpec.charts.length} charts:\n${chartTitles}\n\nWrite a brief preliminary insight.`,
        },
      ],
      temperature: 0.7,
    })
    return response.choices[0]?.message?.content || `## Preliminary Insights\n\nGenerating dashboard: ${dashboardSpec.intent}. Charts will appear shortly.`
  } catch (error: any) {
    console.error("DeepSeek draft insight generation failed:", error)
    return `## Preliminary Insights\n\nGenerating dashboard: ${dashboardSpec.intent}. Charts will appear shortly.`
  }
}

// Generate written insight from dashboard results
async function generateInsight(
  prompt: string,
  dashboardSpec: DashboardSpec,
  charts: ChartData[],
  client: OpenAI,
): Promise<string> {
  const chartSummaries = charts.map((chart) => {
    const dataPreview = chart.data.slice(0, 3).map((d) => {
      const keys = Object.keys(d).slice(0, 5)
      return keys.reduce((acc, k) => ({ ...acc, [k]: d[k] }), {})
    })
    return `- ${chart.title} (${chart.type}): ${chart.data.length} data points. Sample: ${JSON.stringify(dataPreview)}`
  }).join("\n")

  const systemPrompt = `You are an analytics insights writer. Write a clear, concise markdown summary of dashboard findings.

Focus on:
- Key findings and patterns
- Notable trends or outliers
- Actionable insights
- Data quality notes if relevant

Keep it professional and data-driven.`

  try {
    const response = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `User's question: ${prompt}\n\nDashboard contains ${charts.length} charts:\n${chartSummaries}\n\nWrite a comprehensive insight summary.`,
        },
      ],
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || "No insight generated."
  } catch (error: any) {
    console.error("DeepSeek insight generation failed:", error)
    return `## Insights\n\nDashboard generated ${charts.length} charts analyzing: ${dashboardSpec.intent}`
  }
}

const BATCH_SIZE = 5

function sseEvent(name: string, data: unknown): string {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest) {
  let body: DashboardRequest
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { prompt, constraints = {} } = body

  // Validate prompt
  if (!prompt || typeof prompt !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid prompt" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (prompt.length > 2000) {
    return new Response(JSON.stringify({ error: "Prompt too long (max 2000 characters)" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const wantsSse = req.headers.get("accept")?.includes("text/event-stream")

  // JSON path (no streaming)
  if (!wantsSse) {
    try {
      const client = getDeepSeekClient()
      if (!client) {
        return new Response(
          JSON.stringify({
            error: "DEEPSEEK_API_KEY not configured. Please set DEEPSEEK_API_KEY environment variable.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        )
      }

      const dashboardSpec = await generateDashboardSpec(prompt, client)
      let chartsToBuild = dashboardSpec.charts
      if (constraints.maxCharts !== null && constraints.maxCharts !== undefined) {
        chartsToBuild = chartsToBuild.slice(0, constraints.maxCharts || 50)
      }

      const charts: ChartData[] = []
      for (const chartDef of chartsToBuild) {
        try {
          charts.push(buildChart(chartDef))
        } catch (error: any) {
          console.error(`Failed to build chart ${chartDef.id}:`, error)
        }
      }

      const insightMarkdown = await generateInsight(prompt, dashboardSpec, charts, client)
      const response: DashboardResponse = {
        dashboardSpec,
        charts,
        insight: { markdown: insightMarkdown },
      }
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error: any) {
      console.error("AI Overview API error:", error)
      return new Response(
        JSON.stringify({
          error: error?.message || "Unexpected error occurred",
          details: process.env.NODE_ENV === "development" ? String(error) : undefined,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
  }

  // SSE path
  const encoder = new TextEncoder()
  const KEEPALIVE_MS = 12_000

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)))
      }
      const ping = () => {
        controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`))
      }

      let keepaliveId: ReturnType<typeof setInterval> | null = null
      const startKeepalive = () => {
        if (keepaliveId) return
        keepaliveId = setInterval(ping, KEEPALIVE_MS)
      }
      const stopKeepalive = () => {
        if (keepaliveId) {
          clearInterval(keepaliveId)
          keepaliveId = null
        }
      }

      try {
        send("status", { stage: "starting", message: "Starting…" })
        startKeepalive()

        const client = getDeepSeekClient()
        if (!client) {
          send("error", { error: "DEEPSEEK_API_KEY not configured. Please set DEEPSEEK_API_KEY environment variable." })
          controller.close()
          return
        }

        send("status", { stage: "spec", message: "Generating dashboard spec…" })
        const dashboardSpec = await generateDashboardSpec(prompt, client)
        send("spec", { dashboardSpec })
        send("status", { stage: "spec_done", message: "Spec ready", totalCharts: dashboardSpec.charts.length })

        let chartsToBuild = dashboardSpec.charts
        if (constraints.maxCharts !== null && constraints.maxCharts !== undefined) {
          chartsToBuild = chartsToBuild.slice(0, constraints.maxCharts || 50)
        }
        const total = chartsToBuild.length

        send("status", { stage: "insight_draft", message: "Drafting preliminary insights…" })
        const draftMarkdown = await generateDraftInsight(prompt, dashboardSpec, client)
        send("insight", { markdown: draftMarkdown, kind: "draft" })
        send("status", { stage: "insight_draft_done", message: "Draft insights ready" })

        send("status", { stage: "charts", message: `Building charts (0/${total})…`, totalCharts: total })
        const allCharts: ChartData[] = []

        for (let i = 0; i < chartsToBuild.length; i += BATCH_SIZE) {
          const batch = chartsToBuild.slice(i, i + BATCH_SIZE)
          const batchResults: ChartData[] = []
          for (const chartDef of batch) {
            try {
              batchResults.push(buildChart(chartDef))
            } catch (error: any) {
              console.error(`Failed to build chart ${chartDef.id}:`, error)
            }
          }
          allCharts.push(...batchResults)
          send("status", {
            stage: "charts_progress",
            message: `Building charts (${allCharts.length}/${total})…`,
            built: allCharts.length,
            total,
          })
          send("charts", { charts: batchResults, built: allCharts.length, total })
          await new Promise((r) => setImmediate(r))
        }

        send("status", { stage: "insight_final", message: "Finalizing insights…" })
        const finalMarkdown = await generateInsight(prompt, dashboardSpec, allCharts, client)
        send("insight", { markdown: finalMarkdown, kind: "final" })
        send("status", { stage: "done", message: "Complete" })
        send("done", {})
      } catch (error: any) {
        console.error("AI Overview API error:", error)
        send("error", { error: error?.message || "Unexpected error occurred" })
      } finally {
        stopKeepalive()
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
