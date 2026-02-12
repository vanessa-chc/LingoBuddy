/**
 * Analysis error categories and Leon's voice (Google AI UX patterns).
 * Used by ErrorState and by Gemini/gemini client to show the right message and action.
 */

export const ANALYSIS_ERROR_CODES = {
  INVALID_IMAGE_CONTENT: "INVALID_IMAGE_CONTENT",
  IMAGE_QUALITY_ISSUE: "IMAGE_QUALITY_ISSUE",
  API_LIMIT_REACHED: "API_LIMIT_REACHED",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type AnalysisErrorCode = keyof typeof ANALYSIS_ERROR_CODES;

export type ErrorStateConfig = {
  message: string;
  /** Emoji or visual hint for this state (Confused Leon, Sleepy Leon, etc.) */
  emoji: string;
  /** Leon avatar for this error (No text = Confused, Blurry = Blurry, Tech = Sleep) */
  avatar: string;
  /** Primary action label */
  buttonLabel: string;
  /** 'try_another' = navigate to home for new photo; 'retry' = retry same analysis */
  buttonAction: "try_another" | "retry";
};

export const ANALYSIS_ERROR_CONFIG: Record<AnalysisErrorCode, ErrorStateConfig> = {
  INVALID_IMAGE_CONTENT: {
    message:
      "Leon's looking for a convo, but this looks like a selfie. 🤳 Try a chat screenshot?",
    emoji: "🤳",
    avatar: "/assets/Confused.png",
    buttonLabel: "Try Another Photo",
    buttonAction: "try_another",
  },
  IMAGE_QUALITY_ISSUE: {
    message:
      "A bit blurry! 🌫️ Can you get a sharper snap for me so I can read the vibes?",
    emoji: "🌫️",
    avatar: "/assets/Blurry.png",
    buttonLabel: "Try Another Photo",
    buttonAction: "try_another",
  },
  API_LIMIT_REACHED: {
    message:
      "Oops, Leon is taking a nap. 😴 He over-analyzed too many vibes! Try again later?",
    emoji: "😴",
    avatar: "/assets/Sleep.png",
    buttonLabel: "Retry",
    buttonAction: "retry",
  },
  NETWORK_ERROR: {
    message:
      "Connection hiccup. 📡 Want to try again?",
    emoji: "📡",
    avatar: "/assets/Sleep.png",
    buttonLabel: "Retry",
    buttonAction: "retry",
  },
};

/** Default when we can't determine category (backward compat: show nap screen) */
export const DEFAULT_ANALYSIS_ERROR_CODE: AnalysisErrorCode = "API_LIMIT_REACHED";

export function getConfig(code: AnalysisErrorCode): ErrorStateConfig {
  return ANALYSIS_ERROR_CONFIG[code];
}

export function isAnalysisErrorCode(
  value: string
): value is AnalysisErrorCode {
  return value in ANALYSIS_ERROR_CODES;
}
