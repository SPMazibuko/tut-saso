"use client"

import type { SupportedLanguage, TranslationResult, ChatMessage } from "./types"

// Simple multilingual stub for 11 SA languages (codes aligned in types)
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "en",
  "af",
  "xh",
  "zu",
  "st",
  "tn",
  "ts",
  "nr",
  "ss",
  "ve",
  "nso",
]

export function translate(
  text: string,
  source: SupportedLanguage,
  target: SupportedLanguage,
): TranslationResult {
  if (source === target) {
    return { source, target, originalText: text, translatedText: text }
  }
  // Stub: prepend language tag to simulate translation
  return {
    source,
    target,
    originalText: text,
    translatedText: `[${target}] ${text}`,
  }
}

export function detectLanguage(text: string): SupportedLanguage {
  // Trivial heuristic
  const lower = text.toLowerCase()
  if (lower.includes("lekgoa") || lower.includes("thuto")) return "nso"
  if (lower.includes("umsebenzi") || lower.includes("umfundi")) return "zu"
  if (lower.includes("leerling") || lower.includes("skool")) return "af"
  return "en"
}

export function analyzeSentiment(text: string): ChatMessage["sentiment"] {
  const t = text.toLowerCase()
  if (/(hopeless|pointless|can't do this|depressed)/.test(t)) return "concerning"
  if (/(stressed|anxious|worried|sad)/.test(t)) return "negative"
  if (/(thank|good|great|helpful|👍|😊)/.test(t)) return "positive"
  return "neutral"
}

