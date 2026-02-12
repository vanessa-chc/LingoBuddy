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

/** PRD: vibeCheck.summary, wordLab[], playbook.{ vibeMatch, safeChill, sincere } */
export interface AnalysisResult {
  vibeCheck: {
    summary: string;
  };
  wordLab: Array<{
    slang: string;
    definition: string;
    usage: string;
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

/** Build prompt: selectedPreset optional; if empty, AI chooses tone automatically. PRD: preset refetch must include Tone + 3 categories. */
const ANALYSIS_PROMPT = (relationshipContext: string, selectedPreset: string) => {
  const presetInstruction = selectedPreset && selectedPreset.trim()
    ? `Tone: ${selectedPreset.trim()}. Generate 3 replies for categories: Vibe Match, Stay Chill, Keep it Real.`
    : "Choose the most appropriate tone automatically (e.g. Witty or Sincere) based on the conversation. In both cases, generate exactly 3 replies matching these functions: Vibe Match (Recommended), Stay Chill, and Keep it Real.";
  return `You are Leon, a friendly chameleon AI helping international students understand American slang.

CRITICAL — CHECK THE IMAGE FIRST (do this before anything else):
- The image MUST be a screenshot of a chat/messaging app with visible message bubbles, conversation text, or a clear messaging UI (e.g. iMessage, WhatsApp, Instagram DMs). You must be able to read actual words that people typed in the chat.
- If the image is NOT a chat screenshot — for example: a selfie, a single person photo, character art, an icon, a logo, a meme with no dialogue, a landscape, or any image where you cannot see real message text or chat bubbles — you MUST return ONLY this JSON and nothing else: {"errorCode": "INVALID_IMAGE_CONTENT"}.
- Do NOT analyze non-chat images. Do NOT invent, infer, or hallucinate a conversation. Do NOT describe "vibes" or "intent" for an image that has no visible chat. If there is no conversation text in the image, return {"errorCode": "INVALID_IMAGE_CONTENT"}.
- If the image is too blurry or low-resolution to read the text accurately, return only: {"errorCode": "IMAGE_QUALITY_ISSUE"}.

USER CONTEXT: Chatting with ${relationshipContext}

Only if the image clearly contains a chat/conversation with readable message text, analyze it. ${presetInstruction}

Return ONLY valid JSON with this exact structure (no <b> or other HTML tags):

{
  "vibeCheck": {
    "summary": "Max 2 sentences. Focus on social intent and overall tone only."
  },
  "wordLab": [
    {
      "slang": "the slang word or phrase only",
      "definition": "Short, clear meaning",
      "usage": "Casual explanation of how it's used in this context"
    }
  ],
  "playbook": {
    "vibeMatch": {
      "intent": "Vibe Match",
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
- Vibe Check: maximum 2 sentences. Focus on social intent only.
- wordLab: STRICT slang only. No academic or formal terms. Only casual slang, abbreviations, or colloquialisms from the actual messages you see.
- No HTML tags in JSON. Plain text only.
- Keep definitions under 8 words.
- Playbook replies: sound like a 22-year-old, not a textbook. Include 1–2 emojis per reply when it fits. Skip emojis only if the context is very formal.
- If no slang detected in the messages, explain overall vibe and suggest replies anyway. Maximum 3 slang terms in wordLab.
- Return only the JSON object, no markdown or code fences. Do not include errorCode in successful analysis responses.`;
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
    if (!parsed.playbook) {
      parsed.playbook = {
        vibeMatch: { intent: "Witty", reply: "" },
        safeChill: { intent: "Safe & Chill", reply: "" },
        sincere: { intent: "Sincere", reply: "" },
      };
    }
    return parsed as AnalysisResult;
  } catch (e) {
    if (e instanceof AnalysisError) throw e;
    throw new AnalysisError("API_LIMIT_REACHED", "Could not parse analysis response.");
  }
}
