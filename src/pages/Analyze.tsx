import { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import HistoryMenu from "@/components/HistoryMenu";
import { toast } from "sonner";
import { analyzeScreenshot } from "@/lib/gemini";
import ScreenshotPreview from "@/components/ScreenshotPreview";

const CONTEXTS = [
{ value: "friend", label: "Friend" },
{ value: "work", label: "Work" },
{ value: "dating", label: "Dating" },
{ value: "formal", label: "Formal" }] as
const;

type ContextValue = (typeof CONTEXTS)[number]["value"];

const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageData = location.state?.imageData as string | undefined;
  const [selectedContext, setSelectedContext] = useState<ContextValue | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!imageData || !selectedContext) return;

    setIsAnalyzing(true);
    abortRef.current = new AbortController();

    try {
      const relationshipLabel = CONTEXTS.find((c) => c.value === selectedContext)?.label ?? selectedContext;
      const analysisData = await analyzeScreenshot(
        imageData,
        relationshipLabel,
        abortRef.current.signal
      );

      if (abortRef.current?.signal.aborted) return;

      navigate("/results", {
        state: { analysisData, imageData, context: selectedContext, relationshipLabel, fromAnalyze: true }
      });
    } catch (e: any) {
      if (e?.name === "AbortError" || abortRef.current?.signal.aborted) return;
      console.error("Analysis error:", e);
      toast.error(e?.message || "Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  }, [imageData, selectedContext, navigate]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsAnalyzing(false);
  }, []);

  // Scanning overlay — title (same size as "Got it! Ready to scan?"), image (no glow), context text, Cancel only
  if (isAnalyzing) {
    return (
      <div className="min-h-screen w-full bg-[#121212] relative overflow-x-hidden">
        <div className="w-full flex flex-col min-h-screen relative">
          <header className="flex items-center px-6 pt-6 pb-2 w-full">
            <button
              type="button"
              onClick={() => setHistoryMenuOpen(true)}
              className="p-2 -ml-2 text-white touch-manipulation"
              aria-label="Open history"
            >
              <Menu className="w-6 h-6" />
            </button>
          </header>
          <HistoryMenu open={historyMenuOpen} onClose={() => setHistoryMenuOpen(false)} />

          {/* Content inset so header and button stay inside phone container */}
          <div className="flex flex-1 flex-col px-6">
            {/* Title — same large font as "Got it! Ready to scan?", left-aligned */}
            <h1
              className="text-left font-bold leading-tight tracking-tight text-white pt-2"
              style={{ fontSize: 32 }}
            >
              Scanning the vibe...
            </h1>

            {/* Image — same size as upload step, no green glow; scan line animation only */}
            {imageData && (
              <div className="mt-6">
                <ScreenshotPreview
                  src={imageData}
                  alt="Scanning"
                  overlay={
                    <div
                      className="absolute left-0 right-0 h-[3px] animate-scan-line pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, #B8FF00, transparent)",
                        boxShadow: "0 0 12px rgba(184, 255, 0, 0.6)",
                      }}
                    />
                  }
                />
              </div>
            )}

            {/* Dynamic: Chatting with [selected context] */}
            <p className="text-center text-white mt-6" style={{ fontSize: 17 }}>
              Chatting with{" "}
              <span className="text-[#ECFF51] font-medium">
                {selectedContext ? CONTEXTS.find((c) => c.value === selectedContext)?.label ?? selectedContext.charAt(0).toUpperCase() + selectedContext.slice(1) : ""}
              </span>
            </p>

            <div className="flex-1" />

            {/* Cancel — Figma: large rounded-rectangle, dark grey, white text, generous padding */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-4 rounded-2xl font-semibold text-white bg-[#2E2E2E] active:opacity-90 transition-opacity mb-10 text-[17px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#121212] relative">
      <div className="w-full flex flex-col min-h-screen relative">
        {/* Header — match Index: no wrapper px, header has px-6 so hamburger position is identical */}
        <header className="flex items-center px-6 pt-6 pb-2 w-full">
          <button
            type="button"
            onClick={() => setHistoryMenuOpen(true)}
            className="p-2 -ml-2 text-white touch-manipulation"
            aria-label="Open history"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <HistoryMenu open={historyMenuOpen} onClose={() => setHistoryMenuOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col pb-28 px-6">
          {/* Main heading — Figma: large, bold, left-aligned */}
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white pt-2">
            Got it! Ready to scan?
          </h1>

          {/* Screenshot Preview */}
          {imageData && (
            <div className="mt-6 mb-6">
              <ScreenshotPreview src={imageData} alt="Uploaded screenshot">
                <button
                  onClick={() => navigate("/")}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white active:bg-white/25 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </ScreenshotPreview>
            </div>
          )}
        </main>

        {/* Context pills — inside phone container, 24px above Analyze button */}
        <div className="absolute bottom-[104px] left-0 right-0 z-10 px-6">
          <p className="text-[17px] text-white/70 mb-2">
            Chatting with...
          </p>
          <div className="flex flex-nowrap gap-2 overflow-x-auto">
            {CONTEXTS.map((ctx) => {
              const isSelected = selectedContext === ctx.value;
              return (
                <button
                  key={ctx.value}
                  onClick={() => setSelectedContext(ctx.value)}
                  className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-[15px] border transition-colors ${
                    isSelected
                      ? "bg-[#505050] border-white/20 text-white font-bold"
                      : "bg-[#2C2C2C] border-white/15 text-white font-normal"
                  }`}
                >
                  {ctx.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Analyze Button — inside phone container, 24px from bottom */}
        <div className="absolute bottom-6 left-0 right-0 z-10 px-6">
          <button
            disabled={!selectedContext}
            onClick={handleAnalyze}
            className="w-full h-14 rounded-3xl bg-gradient-to-r from-[#AAFF00] to-[#00FF00] text-white text-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed active:opacity-90 transition-opacity"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>);

};

export default Analyze;