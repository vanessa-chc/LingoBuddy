import type { AnalysisErrorCode } from "./analysisErrorTypes";

/**
 * Thrown when analysis fails so the UI can show the right error screen.
 */
export class AnalysisError extends Error {
  readonly code: AnalysisErrorCode;

  constructor(code: AnalysisErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AnalysisError";
    this.code = code;
    Object.setPrototypeOf(this, AnalysisError.prototype);
  }
}

export function isAnalysisError(e: unknown): e is AnalysisError {
  return e instanceof AnalysisError;
}
