import { FC } from "react";

interface WordLabTerm {
  slang?: string;
  term?: string;
  definition?: string;
  meaning?: string;
  usage?: string;
}

interface WordLabCardProps {
  term: WordLabTerm;
}

/** Strip raw HTML tags (e.g. <b>) for clean text */
function stripHtml(html: string): string {
  if (typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

const WordLabCard: FC<WordLabCardProps> = ({ term }) => {
  const word = term.slang || term.term || "";
  const definition = stripHtml(term.definition || term.meaning || "");

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-[17px]" style={{ color: "#ECFF51" }}>
        {word}
      </span>
      <p className="text-[15px] font-normal text-white/80">{definition}</p>
    </div>
  );
};

export default WordLabCard;
