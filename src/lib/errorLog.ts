/**
 * Client-side error reporting to Supabase for debugging production issues
 * (e.g. "Leon is taking a nap"). Fire-and-forget; never throws.
 */

import { supabase } from "@/integrations/supabase/client";
import { getOrCreateAnonymousUserId } from "@/lib/anonymousUserId";

export type ErrorLogContext = {
  route?: string;
  relationship_context?: string;
  [key: string]: unknown;
};

/**
 * Report an error to the backend. Safe to call from catch blocks.
 * Does not throw; failures are logged to console only.
 */
export function reportError(params: {
  code: string;
  message: string;
  context?: ErrorLogContext;
  rawError?: string;
}): void {
  const { code, message, context = {}, rawError } = params;

  const payload = {
    code,
    message: message.slice(0, 2000),
    context: {
      ...context,
      anonymous_user_id: typeof window !== "undefined" ? getOrCreateAnonymousUserId() : undefined,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
    },
    raw_error: rawError != null ? String(rawError).slice(0, 8000) : null,
  };

  supabase
    .from("error_log")
    .insert(payload)
    .then(({ error }) => {
      if (error) console.warn("[LingoBuddy] Failed to report error to server:", error.message);
    })
    .catch((e) => console.warn("[LingoBuddy] Error reporting failed:", e));
}
