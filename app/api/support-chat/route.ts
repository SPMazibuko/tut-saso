import { NextRequest } from "next/server"
import OpenAI from "openai"
import {
  getLearnerProfile,
  detectWorkflowMode,
  determineRiskLevel,
  determineSupportType,
  generateDiagnosticQuestions,
  logInterventionCase,
  escalateInterventionCase,
  getAvailableRolePlayers,
} from "@/lib/chat-workflows"

export const runtime = "edge"

interface ChatRequest {
  message: string
  history: Array<{ role: string; content: string }>
  language?: string
  mode?: "school" | "wellbeing"
  studentId?: string
  workflowState?: string
  diagnosticResponses?: Array<{ question: string; response: string }>
  consentedRolePlayers?: string[]
}

interface ChatResponse {
  reply: string
  language: string
  workflowMode?: "academic" | "wellness" | "unknown"
  workflowState?: string
  diagnosticQuestions?: Array<{ question: string; purpose: string }>
  requiresConsent?: boolean
  rolePlayers?: Array<{ type: string; name: string; description: string }>
  interventionCaseId?: string
  riskLevel?: "low" | "moderate" | "high"
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const {
      message,
      history = [],
      language = "en",
      mode = "school",
      studentId,
      workflowState = "intake",
      diagnosticResponses = [],
      consentedRolePlayers = [],
    } = body

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing message" }), { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server missing OPENAI_API_KEY" }), { status: 500 })
    }

    const client = new OpenAI({ apiKey })

    // Detect workflow mode
    const detectedMode = detectWorkflowMode(message, history)
    const workflowMode = detectedMode !== "unknown" ? detectedMode : mode === "school" ? "academic" : "wellness"

    // Get learner profile if studentId provided
    let learnerProfile = null
    let riskLevel: "low" | "moderate" | "high" = "low"
    let supportType: string = "content-coaching"
    let conversationSummary = ""

    if (studentId) {
      learnerProfile = getLearnerProfile(studentId)
      if (learnerProfile) {
        // Build conversation context
        conversationSummary = `Conversation history: ${history
          .map((h) => `${h.role}: ${h.content}`)
          .join("\n")}\n\nLatest message: ${message}`
        riskLevel = determineRiskLevel(learnerProfile, workflowMode, conversationSummary)
        supportType = determineSupportType(workflowMode, message, learnerProfile)
      }
    }

    // Build system prompt based on workflow mode
    let systemPrompt = ""
    let responseJson: ChatResponse = {
      reply: "",
      language,
      workflowMode,
      workflowState,
    }

    if (workflowMode === "academic") {
      // Academic Assistance Workflow
      systemPrompt = buildAcademicSystemPrompt(language, learnerProfile, riskLevel)
      responseJson = await handleAcademicWorkflow(
        client,
        message,
        history,
        language,
        workflowState,
        learnerProfile,
        riskLevel,
        supportType,
        diagnosticResponses,
        conversationSummary,
      )
    } else if (workflowMode === "wellness") {
      // Wellness / Psycho-Social Support Workflow
      systemPrompt = buildWellnessSystemPrompt(language, learnerProfile, riskLevel)
      responseJson = await handleWellnessWorkflow(
        client,
        message,
        history,
        language,
        workflowState,
        learnerProfile,
        riskLevel,
        conversationSummary,
        consentedRolePlayers,
      )
    } else {
      // Fallback to basic support
      systemPrompt = `You are a helpful educational assistant. Reply in ${language}.`
      const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ]

      const chat = await client.chat.completions.create({
        model: "gpt-4",
        messages: messages as any,
        temperature: 0.7,
      })

      responseJson.reply = chat.choices?.[0]?.message?.content ?? "I'm here to help. Could you share more?"
    }

    return new Response(JSON.stringify(responseJson), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? "Unexpected error" }), { status: 500 })
  }
}

function buildAcademicSystemPrompt(
  language: string,
  profile: any,
  riskLevel: "low" | "moderate" | "high",
): string {
  let prompt = `You are a personalized, curriculum-aligned academic assistant helping students in South Africa. `

  if (profile) {
    prompt += `\n\nSTUDENT PROFILE:
- Grade: ${profile.grade}
- Attendance Rate: ${profile.attendanceRate}%
- Overall Risk Level: ${profile.overallRiskLevel}
- Recent Assessments: ${profile.assessments.length} found
- Risk Flags: ${profile.riskFlags.length} active`

    if (profile.assessments.length > 0) {
      const avgScore = profile.assessments
        .filter((a: any) => a.percentage !== undefined)
        .reduce((sum: number, a: any) => sum + (a.percentage || 0), 0) / profile.assessments.length || 0

      prompt += `\n- Average Assessment Score: ${avgScore.toFixed(1)}%`

      if (profile.attendanceRate < 85 || avgScore < 50) {
        prompt += `\n⚠️ ATTENTION: This learner has attendance gaps (${profile.attendanceRate}%) or performance issues (avg ${avgScore.toFixed(1)}%). You may need to acknowledge these gaps when helping.`
      }
    }
  }

  prompt += `\n\nYOUR APPROACH:
1. Before giving answers, ask 1-2 diagnostic questions to test prerequisite understanding (especially for Grade 11-12 concepts, check Grade 10-11 foundations).
2. Use Socratic questioning to encourage metacognition and accountability.
3. Provide step-by-step explanations aligned to the curriculum.
4. If foundational gaps are detected, offer remedial steps.
5. Link to study resources when relevant.
6. Be encouraging but honest about where improvement is needed.
7. Reply in ${language}.`

  return prompt
}

function buildWellnessSystemPrompt(
  language: string,
  profile: any,
  riskLevel: "low" | "moderate" | "high",
): string {
  let prompt = `You are a compassionate, empathetic wellness assistant providing supportive guidance to students. `

  if (profile) {
    prompt += `\n\nSTUDENT CONTEXT:
- Grade: ${profile.grade}
- Attendance: ${profile.attendanceRate}%
- Current Risk Level: ${profile.overallRiskLevel}`
  }

  prompt += `\n\nYOUR APPROACH:
1. Respond with empathy, validation, and active listening.
2. Ask gentle, open-ended questions to understand the concern.
3. Offer simple grounding or coping strategies when appropriate.
4. If you detect high risk indicators (self-harm, crisis language), you must guide the student to seek immediate professional help.
5. Remind students that professional counselors are available.
6. Reply in ${language}.`

  return prompt
}

async function handleAcademicWorkflow(
  client: OpenAI,
  message: string,
  history: any[],
  language: string,
  currentState: string,
  profile: any,
  riskLevel: "low" | "moderate" | "high",
  supportType: string,
  diagnosticResponses: Array<{ question: string; response: string }>,
  conversationSummary: string,
): Promise<ChatResponse> {
  const systemPrompt = buildAcademicSystemPrompt(language, profile, riskLevel)
  let responseJson: ChatResponse = {
    reply: "",
    language,
    workflowMode: "academic",
    workflowState: currentState,
    riskLevel,
  }

  // State: intake or diagnostic-questions
  if (currentState === "intake" || currentState === "diagnostic-questions") {
    // Generate diagnostic questions
    const subject = extractSubject(message)
    const topic = extractTopic(message)
    const grade = profile?.grade || "10"

    const diagnosticQs = generateDiagnosticQuestions(subject, topic, grade)
    
    if (diagnosticQs.length > 0 && !diagnosticResponses.length) {
      // First time asking diagnostic questions
      responseJson.workflowState = "diagnostic-questions"
      responseJson.diagnosticQuestions = diagnosticQs
      responseJson.reply = `I'd like to help you with ${topic || "this topic"}. To give you the best support, let me ask a few quick questions first:

${diagnosticQs.map((q, i) => `${i + 1}. ${q.question}`).join("\n\n")}

Please answer these so I can tailor my explanation to your level.`
    } else if (diagnosticResponses.length > 0) {
      // Moving to analysis and guidance
      responseJson.workflowState = "analyzing"
    }
  }

  // Prepare messages for AI
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ]

  // Add diagnostic context if available
  if (diagnosticResponses.length > 0) {
    const diagnosticContext = diagnosticResponses
      .map((dr) => `Q: ${dr.question}\nA: ${dr.response}`)
      .join("\n\n")
    messages.push({
      role: "system",
      content: `Diagnostic responses received:\n${diagnosticContext}\n\nUse these to tailor your explanation.`,
    })
  }

  // Get AI response
  try {
    const chat = await client.chat.completions.create({
      model: "gpt-4",
      messages: messages as any,
      temperature: 0.7,
    })

    responseJson.reply = chat.choices?.[0]?.message?.content ?? "I'm here to help. Could you share more?"

    // If we're past diagnostic phase, provide guidance
    if (currentState !== "intake" || diagnosticResponses.length > 0) {
      responseJson.workflowState = "providing-guidance"
    }

    // Log intervention case (always, per requirements)
    if (profile && message.length > 10) {
      // Only log substantial conversations
      const interventionCase = logInterventionCase({
        studentId: profile.studentId,
        rootCause: "academic",
        supportType: supportType as any,
        riskLevel,
        aiSummary: `Academic support provided: ${supportType}. Student requested help with ${extractTopic(message) || "academic topic"}. Risk assessment: ${riskLevel}.`,
        conversationContext: conversationSummary.substring(0, 500), // Limit length
        diagnosticQuestions: diagnosticResponses,
      })

      responseJson.interventionCaseId = interventionCase.id

      // Escalation check
      if (riskLevel === "high") {
        // Auto-escalate high risk academic cases
        escalateInterventionCase(interventionCase.id, "academic-advisor")
        responseJson.workflowState = "escalated"
        responseJson.reply += `\n\n⚠️ Based on your academic profile, I've also created a support plan that has been shared with an Academic Advisor for follow-up.`
      } else if (riskLevel === "moderate") {
        responseJson.reply += `\n\n💡 If you'd like additional support, consider reaching out to your lecturer or academic advisor.`
      }
      // Low risk: AI can handle, case logged but not escalated
    }

    return responseJson
  } catch (err: any) {
    responseJson.reply = "I apologize, but I'm having trouble processing that right now. Could you rephrase your question?"
    return responseJson
  }
}

async function handleWellnessWorkflow(
  client: OpenAI,
  message: string,
  history: any[],
  language: string,
  currentState: string,
  profile: any,
  riskLevel: "low" | "moderate" | "high",
  conversationSummary: string,
  consentedRolePlayers: string[],
): Promise<ChatResponse> {
  const systemPrompt = buildWellnessSystemPrompt(language, profile, riskLevel)
  let responseJson: ChatResponse = {
    reply: "",
    language,
    workflowMode: "wellness",
    workflowState: currentState,
    riskLevel,
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ]

  // Check for crisis language
  const lowerMessage = message.toLowerCase()
  const isCrisis =
    lowerMessage.includes("suicide") ||
    lowerMessage.includes("kill myself") ||
    lowerMessage.includes("end it") ||
    lowerMessage.includes("harm myself")

  if (isCrisis) {
    responseJson.workflowState = "escalated"
    responseJson.reply = `I'm really concerned about what you're sharing. Your safety is important. Please reach out immediately to:
- Crisis Helpline: 0800 567 567 (free, 24/7)
- Your school counselor or a trusted adult
- Emergency services: 10111

I can also help connect you with a counselor right now. Would you like me to share this conversation with a support professional?`
    responseJson.requiresConsent = true
    responseJson.rolePlayers = getAvailableRolePlayers()
    return responseJson
  }

  // Get AI response
  try {
    const chat = await client.chat.completions.create({
      model: "gpt-4",
      messages: messages as any,
      temperature: 0.7,
    })

    responseJson.reply = chat.choices?.[0]?.message?.content ?? "I'm here to listen. Could you share more?"

    // After supportive response, check if we should request consent for escalation
    if (currentState === "intake" && (riskLevel === "moderate" || riskLevel === "high")) {
      responseJson.workflowState = "consent-request"
      responseJson.requiresConsent = true
      responseJson.rolePlayers = getAvailableRolePlayers()
      responseJson.reply += `\n\n💬 Would you like me to share a summary of this conversation with a support role player (counselor, mentor, etc.) who can provide additional assistance? This is completely optional, and you can choose who you'd like to connect with.`
    }

    // If consent given, show role player selection
    if (consentedRolePlayers.length > 0) {
      responseJson.workflowState = "role-player-selection"
      // Note: In a real implementation, this would trigger escalation
      responseJson.reply += `\n\n✅ Thank you. I've shared your information with the selected support professionals. They will reach out to schedule a session with you.`
      
      // Log and escalate
      if (profile) {
        const interventionCase = logInterventionCase({
          studentId: profile.studentId,
          rootCause: "wellness",
          supportType: riskLevel === "high" ? "wellness-support" : "stress-management",
          riskLevel,
          aiSummary: `Wellness support provided. Student consented to share with role players: ${consentedRolePlayers.join(", ")}.`,
          conversationContext: conversationSummary.substring(0, 500),
          consentedRolePlayers: consentedRolePlayers as any,
        })

        // Escalate to selected role players
        consentedRolePlayers.forEach((roleType) => {
          escalateInterventionCase(interventionCase.id, roleType as any)
        })

        responseJson.interventionCaseId = interventionCase.id
        responseJson.workflowState = "escalated"
      }
    }

    // Always log wellness cases (but only escalate with consent or high risk)
    if (profile && !consentedRolePlayers.length && riskLevel !== "low") {
      logInterventionCase({
        studentId: profile.studentId,
        rootCause: "wellness",
        supportType: "wellness-support",
        riskLevel,
        aiSummary: `Wellness conversation. Risk level: ${riskLevel}. ${riskLevel === "high" ? "Requires follow-up." : "Monitor for escalation."}`,
        conversationContext: conversationSummary.substring(0, 500),
      })
    }

    return responseJson
  } catch (err: any) {
    responseJson.reply = "I'm here to support you. Could you share a bit more about what's on your mind?"
    return responseJson
  }
}

// Helper functions
function extractSubject(message: string): string | null {
  const subjects = ["mathematics", "math", "science", "physics", "chemistry", "biology", "english", "history"]
  const lower = message.toLowerCase()
  for (const subject of subjects) {
    if (lower.includes(subject)) return subject
  }
  return null
}

function extractTopic(message: string): string | null {
  // Simple extraction - in production, use NLP
  const topicPatterns = [
    /help with (\w+)/i,
    /explain (\w+)/i,
    /understand (\w+)/i,
    /struggling with (\w+)/i,
  ]
  for (const pattern of topicPatterns) {
    const match = message.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}
