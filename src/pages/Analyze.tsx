import { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
        state: { analysisData, imageData, context: selectedContext, relationshipLabel }
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
      <div className="min-h-screen bg-[#121212] flex justify-center">
        <div className="w-full max-w-[430px] flex flex-col min-h-screen px-5">
          <header className="flex items-center pt-6 pb-2">
            <button type="button" className="p-2 -ml-2 text-white" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </header>

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
    );
  }

  return (
    <div className="min-h-screen w-screen max-w-[100vw] overflow-x-hidden bg-[#121212] flex justify-center box-border">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen px-5">
        {/* Header: hamburger only; close is on the image overlay */}
        <header className="flex items-center pt-6 pb-2">
          <button className="p-2 -ml-2 text-white" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col pb-28">
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

        {/* Context pills — fixed 24px above Analyze button, single row */}
        <div className="fixed bottom-[104px] left-5 right-5 z-10 max-w-[390px] mx-auto">
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

        {/* Fixed Analyze Button — lime-green gradient, 24px from bottom */}
        <div className="fixed bottom-6 left-5 right-5 z-10 max-w-[390px] mx-auto">
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