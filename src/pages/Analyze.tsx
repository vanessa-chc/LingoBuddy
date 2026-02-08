import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
        <header className="flex items-center gap-3 px-5 pt-4 pb-2">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-foreground">Add Context</span>
        </header>

        <main className="flex-1 flex flex-col px-5 pb-8">
          {imageData && (
            <div className="flex justify-center mt-4">
              <img src={imageData} alt="Uploaded screenshot" className="max-h-[400px] rounded-xl object-contain" />
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-3">Who sent this?</p>
            <div className="flex gap-2">
              {CONTEXTS.map((ctx) => {
                const isSelected = selectedContext === ctx.value;
                return (
                  <button
                    key={ctx.value}
                    onClick={() => setSelectedContext(ctx.value)}
                    className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-cta text-cta-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {ctx.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button
              disabled={!selectedContext}
              onClick={handleAnalyze}
              className="w-full py-4 rounded-2xl text-base font-semibold transition-colors bg-cta text-cta-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analyze;
