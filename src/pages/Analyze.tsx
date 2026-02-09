import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

const CONTEXTS = [
  { value: "friend", label: "Friend" },
  { value: "work", label: "Work" },
  { value: "dating", label: "Dating" },
  { value: "formal", label: "Formal" },
] as const;

type ContextValue = (typeof CONTEXTS)[number]["value"];

const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageData = location.state?.imageData as string | undefined;
  const [selectedContext, setSelectedContext] = useState<ContextValue | null>(null);

  const handleAnalyze = () => {
    toast("Analysis coming soon!");
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 pt-4 pb-2">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-foreground">Add Context</span>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-5 pb-[100px]">
          {/* Screenshot Preview */}
          {imageData && (
            <div className="relative flex justify-center mt-4">
              <img
                src={imageData}
                alt="Uploaded screenshot"
                className="max-h-[400px] rounded-xl object-contain"
                style={{
                  borderRadius: 12,
                  boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
                }}
              />
              <button
                onClick={() => navigate("/")}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-foreground hover:bg-white/25 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Context Label */}
          <p
            className="text-left text-muted-foreground"
            style={{ marginTop: 24, fontSize: 17 }}
          >
            Chatting with...
          </p>

          {/* Context Pills */}
          <div
            className="flex overflow-x-auto no-scrollbar"
            style={{ gap: 12, marginTop: 12 }}
          >
            {CONTEXTS.map((ctx) => {
              const isSelected = selectedContext === ctx.value;
              return (
                <button
                  key={ctx.value}
                  onClick={() => setSelectedContext(ctx.value)}
                  className="shrink-0 font-semibold transition-colors"
                  style={{
                    padding: "12px 24px",
                    borderRadius: 24,
                    fontSize: 17,
                    border: isSelected
                      ? "2px solid hsl(var(--cta))"
                      : "1px solid rgba(255,255,255,0.15)",
                    background: isSelected ? "hsl(var(--cta))" : "transparent",
                    color: isSelected ? "hsl(var(--cta-foreground))" : "hsl(var(--foreground))",
                  }}
                >
                  {ctx.label}
                </button>
              );
            })}
          </div>
        </main>

        {/* Fixed Analyze Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5">
          <button
            disabled={!selectedContext}
            onClick={handleAnalyze}
            className="w-full font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              height: 56,
              borderRadius: 20,
              fontSize: 17,
              background: "hsl(var(--cta))",
              color: "hsl(var(--cta-foreground))",
            }}
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
