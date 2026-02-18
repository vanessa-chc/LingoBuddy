import { FC, useState } from "react";

interface WordLabTerm {
  slang?: string;
  term?: string;
  definition?: string;
  meaning?: string;
  usage?: string;
  tier?: string;
  cultural_tip?: string;
}

interface WordLabCardProps {
  term: WordLabTerm;
}

const GLASSES_LEON_PNG = "/assets/Glassess.png";
const GLASSES_LEON_PNG_UPPER = "/assets/Glassess.PNG";

/** Strip raw HTML tags (e.g. <b>) for clean text */
function stripHtml(html: string): string {
  if (typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

const WordLabCard: FC<WordLabCardProps> = ({ term }) => {
  const [leonImgSrc, setLeonImgSrc] = useState<string | null>(GLASSES_LEON_PNG);
  const [tipExpanded, setTipExpanded] = useState(false);
  const word = term.slang || term.term || "";
  const definition = stripHtml(term.definition || term.meaning || "");
  const tier = term.tier ?? null;
  const isLiteral = tier === "Literal";
  const hasCulturalTip = typeof term.cultural_tip === "string" && term.cultural_tip.trim().length > 0;

  return (
    <div className="flex flex-col gap-1 border border-border rounded-lg p-3">
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <span className="font-bold text-[17px] text-accent">{word}</span>
          {hasCulturalTip && (
            <button
              type="button"
              onClick={() => setTipExpanded((prev) => !prev)}
              className="shrink-0 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
              aria-label={tipExpanded ? "Hide cultural tip" : "Show Leon's cultural tip"}
            >
              {leonImgSrc ? (
                <img
                  src={leonImgSrc}
                  alt=""
                  className="w-[24px] h-auto"
                  aria-hidden
                  onError={() => {
                    setLeonImgSrc((prev) =>
                      prev === GLASSES_LEON_PNG ? GLASSES_LEON_PNG_UPPER : null
                    );
                  }}
                />
              ) : (
                <span className="text-[11px] text-accent font-medium">Tip</span>
              )}
            </button>
          )}
        </div>
        {tier && (
          <span
            className={`text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded shrink-0 ${isLiteral ? "opacity-40" : ""}`}
          >
            {tier}
          </span>
        )}
      </div>
      <p className="text-[15px] font-normal text-muted-foreground">{definition}</p>
      {hasCulturalTip && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: tipExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="mt-2 rounded-md bg-accent/10 px-3 py-2 text-[13px] text-muted-foreground/90">
              {term.cultural_tip!.trim().replace(/^Context:\s*/i, "")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordLabCard;
