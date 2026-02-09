import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisData = location.state?.analysisData;
  const imageData = location.state?.imageData;
  const context = location.state?.context;

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-[430px] flex flex-col min-h-screen items-center justify-center px-5">
          <p className="text-muted-foreground">No analysis data found.</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary text-sm">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="flex items-center gap-3 px-5 pt-4 pb-2">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-foreground">Results</span>
        </header>

        <main className="flex-1 px-5 pb-8 overflow-y-auto">
          {/* Summary */}
          <div className="mt-4 p-4 rounded-2xl bg-secondary">
            <p className="text-sm text-muted-foreground mb-1">Summary</p>
            <p className="text-foreground text-[15px] leading-relaxed">{analysisData.summary}</p>
          </div>

          {/* Overall Tone */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall tone:</span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: "hsl(var(--cta))", color: "hsl(var(--cta-foreground))" }}>
              {analysisData.overallTone}
            </span>
          </div>

          {/* Slang Terms */}
          {analysisData.slangTerms?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Slang breakdown</p>
              <div className="flex flex-col gap-3">
                {analysisData.slangTerms.map((term: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-secondary">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">"{term.term}"</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        term.vibeCheck === "positive" ? "bg-green-500/20 text-green-400" :
                        term.vibeCheck === "negative" ? "bg-red-500/20 text-red-400" :
                        term.vibeCheck === "sarcastic" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-white/10 text-white/60"
                      }`}>
                        {term.vibeCheck}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{term.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Replies */}
          {analysisData.suggestedReplies?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Suggested replies</p>
              <div className="flex flex-col gap-2">
                {analysisData.suggestedReplies.map((reply: string, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-border text-foreground text-sm">
                    {reply}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Notes */}
          {analysisData.culturalNotes && (
            <div className="mt-6 p-4 rounded-2xl bg-secondary">
              <p className="text-sm text-muted-foreground mb-1">Cultural notes</p>
              <p className="text-foreground text-sm leading-relaxed">{analysisData.culturalNotes}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Results;
