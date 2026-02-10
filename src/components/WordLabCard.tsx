import { FC } from "react";

interface WordLabTerm {
  slang: string;
  term?: string;
  definition: string;
  meaning?: string;
  usage: string;
  vibeCheck?: string;
  emoji?: string;
}

interface WordLabCardProps {
  term: WordLabTerm;
}

const VIBE_EMOJIS: Record<string, string> = {
  positive: "🔥",
  negative: "😬",
  sarcastic: "😏",
  neutral: "💬",
};

const WordLabCard: FC<WordLabCardProps> = ({ term }) => {
  const word = term.slang || term.term || "";
  const definition = term.definition || term.meaning || "";
  const emoji = term.emoji || VIBE_EMOJIS[term.vibeCheck || ""] || "💬";

  return (
    <div className="flex flex-col gap-2">
      {/* Slang word + emoji */}
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none" style={{ fontSize: 24, width: 24, height: 24 }}>
          {emoji}
        </span>
        <span
          className="font-bold"
          style={{ color: "hsl(var(--cta))", fontSize: 20 }}
        >
          {word}
        </span>
      </div>

      {/* Definition */}
      <p className="text-muted-foreground" style={{ fontSize: 15 }}>
        {definition}
      </p>

      {/* Usage card */}
      {term.usage && (
        <div
          className="flex items-start gap-3 p-3 rounded-xl mt-1"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <img
            src="/assets/leon/default.png"
            alt="Leon"
            className="shrink-0 rounded-full"
            style={{ width: 32, height: 32 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <p
            className="italic text-muted-foreground"
            style={{ fontSize: 15 }}
          >
            {term.usage}
          </p>
        </div>
      )}
    </div>
  );
};

export default WordLabCard;
