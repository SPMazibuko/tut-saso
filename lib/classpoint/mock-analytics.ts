/**
 * Deterministic mock ClassPoint Q&A analytics keyed by attendance session ID.
 * Used for drill-down: total questions, answer ratio (correct/incorrect, option distribution), most missed questions.
 */

/** Simple deterministic seed from string (same string => same seed). */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Seeded pseudo-random in [0, 1). */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

export interface AnswerRatioOption {
  option: string
  label?: string
  count: number
  percentage: number
  correct: boolean
}

export interface MostMissedQuestion {
  questionIndex: number
  questionText: string
  correctOption: string
  totalAnswered: number
  correctCount: number
  incorrectCount: number
  correctPercentage: number
  topWrongOption: string
  topWrongCount: number
}

export interface QuestionAnalytics {
  questionIndex: number
  questionText: string
  correctOption: string
  totalAnswered: number
  correctCount: number
  incorrectCount: number
  correctPercentage: number
  options: AnswerRatioOption[]
}

export interface SessionAnalytics {
  sessionId: string
  totalQuestions: number
  totalResponses: number
  answerRatios: {
    correctPercentage: number
    incorrectPercentage: number
    byOption: AnswerRatioOption[]
  }
  mostMissedQuestions: MostMissedQuestion[]
  questions: QuestionAnalytics[]
}

const SAMPLE_QUESTIONS = [
  "What is the main concept covered in this section?",
  "Which of the following best describes the relationship between X and Y?",
  "According to the lecture, the primary cause of Z is:",
  "Which formula correctly represents the process?",
  "What is the next step in the procedure?",
  "Which assumption is required for this result to hold?",
  "Identify the correct classification.",
  "What does the acronym stand for?",
  "Which factor has the greatest impact?",
  "Select the most appropriate definition.",
]

const OPTIONS = ["A", "B", "C", "D"]

/** Generate deterministic mock analytics for an attendance session. */
export function getSessionAnalytics(sessionId: string): SessionAnalytics {
  const seed = hashString(sessionId)
  const rng = seededRandom(seed)

  const totalQuestions = 5 + Math.floor(rng() * 11) // 5–15

  const questions: QuestionAnalytics[] = []
  for (let i = 0; i < totalQuestions; i++) {
    const correctOptionIndex = Math.floor(rng() * 4)
    const correctPctQ = 0.25 + rng() * 0.65 // 25–90%
    const totalAnswered = 10 + Math.floor(rng() * 51) // 10–60
    const correctCount = Math.round(totalAnswered * correctPctQ)
    const incorrectCount = totalAnswered - correctCount

    const counts = [0, 0, 0, 0]
    counts[correctOptionIndex] = correctCount

    // Distribute incorrect counts across the other options (deterministically)
    const wrongIndices = [0, 1, 2, 3].filter((x) => x !== correctOptionIndex)
    let remaining = incorrectCount
    for (let k = 0; k < wrongIndices.length; k++) {
      const idx = wrongIndices[k]!
      if (k === wrongIndices.length - 1) {
        counts[idx] += remaining
        break
      }
      const take = Math.min(remaining, Math.floor(remaining * (0.25 + rng() * 0.45)))
      counts[idx] += take
      remaining -= take
    }

    const options: AnswerRatioOption[] = OPTIONS.map((opt, optIdx) => ({
      option: opt,
      label: opt,
      count: counts[optIdx] ?? 0,
      percentage: totalAnswered > 0 ? ((counts[optIdx] ?? 0) / totalAnswered) * 100 : 0,
      correct: optIdx === correctOptionIndex,
    }))

    const topWrong = options
      .filter((o) => !o.correct)
      .slice()
      .sort((a, b) => b.count - a.count)[0]

    questions.push({
      questionIndex: i + 1,
      questionText: SAMPLE_QUESTIONS[i % SAMPLE_QUESTIONS.length]!,
      correctOption: OPTIONS[correctOptionIndex]!,
      totalAnswered,
      correctCount,
      incorrectCount,
      correctPercentage: totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0,
      options,
    })
  }

  const totalResponses = questions.reduce((sum, q) => sum + q.totalAnswered, 0)
  const totalCorrect = questions.reduce((sum, q) => sum + q.correctCount, 0)
  const correctPercentage = totalResponses > 0 ? (totalCorrect / totalResponses) * 100 : 0
  const incorrectPercentage = 100 - correctPercentage

  // Aggregate option distribution (A/B/C/D across all questions; not "correctness" specific)
  const optionTotals: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const q of questions) {
    for (const o of q.options) optionTotals[o.option] = (optionTotals[o.option] ?? 0) + o.count
  }
  const byOption: AnswerRatioOption[] = OPTIONS.map((opt) => {
    const count = optionTotals[opt] ?? 0
    return {
      option: opt,
      label: opt,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
      correct: false,
    }
  })

  // Most missed questions (worst 3–5 by correct %)
  const numMissed = Math.min(5, Math.max(3, Math.floor(rng() * 3 + 3)))
  const mostMissedQuestions: MostMissedQuestion[] = questions
    .slice()
    .sort((a, b) => a.correctPercentage - b.correctPercentage)
    .slice(0, numMissed)
    .map((q) => {
      const topWrong = q.options
        .filter((o) => !o.correct)
        .slice()
        .sort((a, b) => b.count - a.count)[0]
      return {
        questionIndex: q.questionIndex,
        questionText: q.questionText,
        correctOption: q.correctOption,
        totalAnswered: q.totalAnswered,
        correctCount: q.correctCount,
        incorrectCount: q.incorrectCount,
        correctPercentage: q.correctPercentage,
        topWrongOption: topWrong?.option ?? "",
        topWrongCount: topWrong?.count ?? 0,
      }
    })

  return {
    sessionId,
    totalQuestions,
    totalResponses,
    answerRatios: {
      correctPercentage,
      incorrectPercentage,
      byOption,
    },
    mostMissedQuestions,
    questions,
  }
}
