/**
 * Gemini API client for LingoBuddy analysis.
 * Uses VITE_GEMINI_API_KEY from env.
 * Response shape follows PRD "AI System Prompt" exactly.
 * Can return errorCode in JSON for image/content issues (Google AI UX).
 */

import { AnalysisError } from "@/lib/AnalysisError";
import { isAnalysisErrorCode } from "@/lib/analysisErrorTypes";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-2.5-flash";

/** vibeCheck, wordLab (tier, optional cultural_tip), playbook */
export interface AnalysisResult {
  vibeCheck: {
    summary: string;
  };
  wordLab: Array<{
    slang: string;
    definition: string;
    usage: string;
    /** One-word tier: "Slang" | "Nuance" | "Literal" */
    tier: "Slang" | "Nuance" | "Literal";
    /** Optional 1-sentence tip when there are usage risks or cultural nuances */
    cultural_tip?: string;
    reasoning: string;
  }>;
  playbook: {
    vibeMatch: { intent: string; reply: string };
    safeChill: { intent: string; reply: string };
    sincere: { intent: string; reply: string };
  };
}

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || typeof key !== "string") {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your .env file and restart the dev server (npm run dev)."
    );
  }
  return key;
}

export function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL");
  }
  return { mimeType: match[1], base64: match[2] };
}

/** Build prompt per Issue 7 Master Prompt: Slang Spectrum, confidence/hunch, strict JSON. */
const ANALYSIS_PROMPT = (relationshipContext: string, selectedPreset: string) => {
  const presetInstruction = selectedPreset && selectedPreset.trim()
    ? `Tone: ${selectedPreset.trim()}. Generate 3 replies for: Vibe Match (Recommended), Stay Chill, Keep it Real.`
    : "Choose the most appropriate tone automatically. Generate exactly 3 replies: Vibe Match (Recommended), Stay Chill, and Keep it Real.";
  return `You are Leon, a culturally savvy, supportive, and witty American friend who helps international students decode social nuances. Explain slang and cultural context without being judgmental or overly academic.

CRITICAL — CHECK THE IMAGE FIRST (do this before anything else):
- The image MUST be a screenshot of a chat/messaging app with visible message bubbles, conversation text, or a clear messaging UI. You must be able to read actual words that people typed in the chat.
- If the image is NOT a chat screenshot (e.g. selfie, character art, icon, logo, meme with no dialogue, landscape, or no visible chat text), return ONLY: {"errorCode": "INVALID_IMAGE_CONTENT"}.
- Do NOT analyze non-chat images. Do NOT invent or hallucinate a conversation.
- If the image is too blurry or low-resolution to read the text accurately, return only: {"errorCode": "IMAGE_QUALITY_ISSUE"}.

USER CONTEXT: Chatting with ${relationshipContext}

THE SLANG SPECTRUM — use these exact one-word values for the "tier" field:
- "Slang" — Core urban slang (e.g. Slay, No cap). MANDATORY: always include.
- "Nuance" — Social nuance: standard words in specific contexts (e.g. Lowkey, Midterm grind). Include if subtext is essential.
- "Literal" — Standard English / literal vocabulary (e.g. Mini, Course, Assignment). IGNORE in production; include only in test mode.

LOGIC CONSTRAINTS:
- Ambiguity: If a word has 90%+ probability of being standard/literal (e.g. "mini" meaning size), treat as Tier 3 and skip it.
- Cultural tip (absolute quality filter): High bar—if a word's usage is straightforward, return an empty string for cultural_tip even if it's slang (e.g. "chill" has straightforward usage: no tip). Leon should ONLY add a tip when there is at least one of: (1) Social Risk—e.g. "Don't use this with your boss"; (2) Hidden Nuance—e.g. "This word sounds sarcastic in certain tones"; (3) Cultural Origin—e.g. "This started on TikTok and might feel cringe if used in person." Only words that actually need a pro-tip get one. When present: max 30 words, vary sentence structure, no bolding or single-phrase starters. Keep cultural_tip and reasoning strictly separate.

Only if the image clearly contains a chat with readable message text, analyze it. ${presetInstruction}

Return ONLY valid JSON in this exact structure (no HTML tags, no markdown fences):

{
  "vibeCheck": {
    "summary": "Max 2 sentences focusing on social intent."
  },
  "wordLab": [
    {
      "slang": "The term",
      "definition": "Short, clear meaning (under 8 words).",
      "usage": "Casual explanation of how it's used in this context.",
      "tier": "Slang or Nuance or Literal (exactly one word)",
      "cultural_tip": "Optional, max 30 words. Return null or \"\" unless the word needs a pro-tip. Only add when there is: Social Risk (e.g. don't use with your boss), Hidden Nuance (e.g. sounds sarcastic in certain tones), or Cultural Origin (e.g. TikTok-origin, might feel cringe in person). Straightforward usage = no tip (e.g. 'chill' gets no cultural_tip). When present, vary openings; no bolding or label-like starters.",
      "reasoning": "Internal only. Briefly explain the cultural source or logic. Do not repeat or mix this into cultural_tip."
    }
  ],
  "playbook": {
    "vibeMatch": {
      "intent": "Vibe Match (Recommended)",
      "reply": "Natural response matching the group chat energy"
    },
    "safeChill": {
      "intent": "Stay Chill",
      "reply": "Low-risk, friendly response"
    },
    "sincere": {
      "intent": "Keep it Real",
      "reply": "Genuine, direct response"
    }
  }
}

RULES:
- wordLab: For each term set "tier" to exactly one word: "Slang", "Nuance", or "Literal". Include only Slang and Nuance in production; Literal only for test mode.
- cultural_tip: Only when the word actually needs a pro-tip. Return null or \"\" for straightforward usage (e.g. chill, LOL, OK—no tip). Add only for: Social Risk, Hidden Nuance, or Cultural Origin. Max 30 words when present. Vary openings; no bolding or single-phrase starters. Keep strictly separate from reasoning.
- Keep definitions under 8 words. No HTML in JSON. Plain text only.
- Playbook replies: sound like a 22-year-old. Include 1–2 emojis when it fits; skip if very formal.
- Maximum 3 terms in wordLab. If no slang detected, explain overall vibe and suggest replies anyway.
- Return only the JSON object. Do not include errorCode in successful responses.`;
};

export async function analyzeScreenshot(
  imageDataUrl: string,
  context: string,
  signal?: AbortSignal,
  selectedPreset?: string | null
): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  const { mimeType, base64 } = parseDataUrl(imageDataUrl);
  const preset = selectedPreset?.trim() ?? "";

  const url = `${GEMINI_BASE}/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: ANALYSIS_PROMPT(context, preset) },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error && (e.message === "Failed to fetch" || e.message.includes("network")));
    if (isNetwork) throw new AnalysisError("NETWORK_ERROR", e instanceof Error ? e.message : "Network error");
    throw e;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err?.error?.message || res.statusText || "").toLowerCase();
    const isQuotaOrSafety =
      res.status === 429 ||
      msg.includes("quota") ||
      msg.includes("resource exhausted") ||
      msg.includes("safety") ||
      msg.includes("blocked");
    if (isQuotaOrSafety) {
      throw new AnalysisError("API_LIMIT_REACHED", err?.error?.message || res.statusText);
    }
    if (res.status >= 500) {
      throw new AnalysisError("NETWORK_ERROR", err?.error?.message || res.statusText);
    }
    throw new AnalysisError("API_LIMIT_REACHED", err?.error?.message || res.statusText);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  if (!candidate?.content?.parts?.length) {
    const blockReason = candidate?.finishReason || data?.promptFeedback?.blockReason;
    throw new AnalysisError(
      "API_LIMIT_REACHED",
      blockReason ? `Blocked: ${blockReason}` : "Empty response from Gemini."
    );
  }

  const text = candidate.content.parts[0].text?.trim();
  if (!text) {
    throw new AnalysisError("API_LIMIT_REACHED", "Empty response from Gemini.");
  }

  const raw = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(raw) as AnalysisResult & { errorCode?: string };
    if (parsed.errorCode && isAnalysisErrorCode(parsed.errorCode)) {
      throw new AnalysisError(parsed.errorCode);
    }
    if (!parsed.vibeCheck?.summary) parsed.vibeCheck = { summary: "Analysis complete." };
    if (!Array.isArray(parsed.wordLab)) parsed.wordLab = [];
    // Slang Spectrum: normalize fields; filter out Literal (Tier 3); optional cultural_tip
    type RawTerm = { slang?: string; definition?: string; usage?: string; tier?: string; cultural_tip?: string; reasoning?: string };
    parsed.wordLab = (parsed.wordLab as RawTerm[])
      .filter((t) => t.slang && (t.tier as string) !== "Literal")
      .map((t) => ({
        slang: t.slang ?? "",
        definition: t.definition ?? "",
        usage: t.usage ?? "",
        tier: t.tier === "Slang" || t.tier === "Nuance" ? t.tier : "Nuance",
        cultural_tip: typeof t.cultural_tip === "string" && t.cultural_tip.trim() ? t.cultural_tip.trim() : undefined,
        reasoning: t.reasoning ?? "",
      }));
    if (!parsed.playbook) {
      parsed.playbook = {
        vibeMatch: { intent: "Vibe Match (Recommended)", reply: "" },
        safeChill: { intent: "Stay Chill", reply: "" },
        sincere: { intent: "Keep it Real", reply: "" },
      };
    } else {
      parsed.playbook.vibeMatch = { ...parsed.playbook.vibeMatch, intent: parsed.playbook.vibeMatch?.intent ?? "Vibe Match (Recommended)" };
      parsed.playbook.safeChill = { ...parsed.playbook.safeChill, intent: parsed.playbook.safeChill?.intent ?? "Stay Chill" };
      parsed.playbook.sincere = { ...parsed.playbook.sincere, intent: parsed.playbook.sincere?.intent ?? "Keep it Real" };
    }
    return parsed as AnalysisResult;
  } catch (e) {
    if (e instanceof AnalysisError) throw e;
    throw new AnalysisError("API_LIMIT_REACHED", "Could not parse analysis response.");
  }
}
