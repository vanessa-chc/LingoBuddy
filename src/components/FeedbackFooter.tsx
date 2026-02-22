import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface FeedbackFooterProps {
  analysisId: string;
  context?: string;
  slangTerms?: string[];
}

type FeedbackState = "idle" | "submitting" | "thankyou" | "submitted";

export function FeedbackFooter({ analysisId, context, slangTerms }: FeedbackFooterProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const [selectedFeedback, setSelectedFeedback] = useState<boolean | null>(null);

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedbackState("submitting");

    try {
      const { error } = await supabase.from("analysis_feedback").insert({
        analysis_id: analysisId,
        is_helpful: isHelpful,
        context: context ?? null,
        slang_terms: slangTerms?.length ? slangTerms : null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You already submitted feedback for this analysis");
          setFeedbackState("submitted");
          setSelectedFeedback(isHelpful);
          return;
        }
        throw error;
      }

      setSelectedFeedback(isHelpful);
      setFeedbackState("thankyou");

      setTimeout(() => {
        setFeedbackState("submitted");
      }, 2000);
    } catch (err) {
      console.error("Feedback submission error:", err);
      toast.error("Failed to submit feedback. Please try again.");
      setFeedbackState("idle");
    }
  };

  const isDisabled = feedbackState === "submitting" || feedbackState === "submitted";

  return (
    <section className="mt-6 pt-4 border-t border-white/10" aria-label="Feedback">
      <div className="flex items-center justify-between gap-3">
        <span
          className="transition-colors duration-300 ease-out text-[13px]"
          style={{
            color:
              feedbackState === "thankyou"
                ? "#ECFF51"
                : feedbackState === "submitted"
                  ? "rgba(255, 255, 255, 0.45)"
                  : "rgba(255, 255, 255, 0.55)",
          }}
        >
          {feedbackState === "idle" || feedbackState === "submitting"
            ? "Was Leon's take helpful?"
            : feedbackState === "thankyou"
              ? "Thanks for the feedback!"
              : "Feedback submitted"}
        </span>

        <div
          className="flex gap-2 transition-opacity duration-300 shrink-0"
          style={{ opacity: feedbackState === "thankyou" ? 0 : 1 }}
          aria-hidden={feedbackState === "thankyou"}
        >
          <button
            type="button"
            onClick={() => handleFeedback(true)}
            disabled={isDisabled}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all active:scale-95 disabled:opacity-30 touch-manipulation"
            style={{
              background:
                selectedFeedback === true
                  ? "rgba(123, 215, 70, 0.18)"
                  : "rgba(255, 255, 255, 0.08)",
            }}
            aria-label="Helpful"
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => handleFeedback(false)}
            disabled={isDisabled}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all active:scale-95 disabled:opacity-30 touch-manipulation"
            style={{
              background:
                selectedFeedback === false
                  ? "rgba(255, 59, 48, 0.18)"
                  : "rgba(255, 255, 255, 0.08)",
            }}
            aria-label="Not helpful"
          >
            👎
          </button>
        </div>
      </div>
    </section>
  );
}
