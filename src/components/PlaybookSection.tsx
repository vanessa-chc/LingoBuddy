import { FC, useState, useCallback } from "react";
import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const INTENTS = ["Witty", "Sincere", "Formal"] as const;
type Intent = (typeof INTENTS)[number];

interface PlaybookReply {
  intent?: string;
  text: string;
}

interface PlaybookData {
  replies?: PlaybookReply[];
}

interface PlaybookSectionProps {
  playbook?: PlaybookData;
  suggestedReplies?: string[];
}

const PlaybookSection: FC<PlaybookSectionProps> = ({ playbook, suggestedReplies }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<Intent>("Witty");
  const [emojisOn, setEmojisOn] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Build replies from playbook or fallback to suggestedReplies
  const allReplies: PlaybookReply[] = playbook?.replies?.length
    ? playbook.replies
    : (suggestedReplies || []).map((text) => ({ text, intent: "Witty" }));

  const filteredReplies = allReplies
    .filter((r) => !r.intent || r.intent.toLowerCase() === selectedIntent.toLowerCase())
    .slice(0, 3);

  // If no replies match the filter, show all (max 3)
  const displayReplies = filteredReplies.length > 0 ? filteredReplies : allReplies.slice(0, 3);

  const formatReply = (text: string) => {
    if (!emojisOn) return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
    return text;
  };

  const copyReply = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  return (
    <section className="mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-foreground" style={{ fontSize: 22 }}>
          Playbook
        </span>
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className="p-1.5 rounded-lg transition-colors"
          aria-label="Playbook settings"
        >
          <Settings
            className="transition-all duration-300"
            size={24}
            style={{
              color: settingsOpen ? "hsl(var(--cta))" : "hsl(var(--muted-foreground))",
              transform: settingsOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </div>

      {/* Collapsible settings */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 flex flex-col gap-3">
              {/* Intent pills */}
              <div className="flex gap-2">
                {INTENTS.map((intent) => {
                  const isSelected = selectedIntent === intent;
                  return (
                    <button
                      key={intent}
                      onClick={() => setSelectedIntent(intent)}
                      className="shrink-0 font-semibold transition-colors"
                      style={{
                        padding: "10px 20px",
                        borderRadius: 24,
                        fontSize: 15,
                        border: isSelected
                          ? "2px solid hsl(var(--cta))"
                          : "1px solid rgba(255,255,255,0.15)",
                        background: isSelected ? "hsl(var(--cta))" : "transparent",
                        color: isSelected ? "hsl(var(--cta-foreground))" : "hsl(var(--foreground))",
                      }}
                    >
                      {intent}
                    </button>
                  );
                })}
              </div>

              {/* Emoji toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Include emojis</span>
                <button
                  onClick={() => setEmojisOn((v) => !v)}
                  className="relative w-[51px] h-[31px] rounded-full transition-colors duration-300"
                  style={{
                    background: emojisOn ? "hsl(var(--cta))" : "rgba(255,255,255,0.15)",
                  }}
                  aria-label="Toggle emojis"
                >
                  <motion.div
                    className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow"
                    animate={{ left: emojisOn ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply cards */}
      <div className="flex flex-col gap-2">
        {displayReplies.map((reply, i) => (
          <button
            key={`${selectedIntent}-${emojisOn}-${i}`}
            onClick={() => copyReply(formatReply(reply.text), i)}
            className="w-full text-left transition-colors active:scale-[0.98]"
            style={{
              background: "#2A2A2E",
              borderRadius: 12,
              padding: 16,
            }}
          >
            {reply.intent && (
              <span className="block mb-1" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                {reply.intent}
              </span>
            )}
            <span className="text-foreground" style={{ fontSize: 17 }}>
              {copiedIndex === i ? "✓ Copied!" : formatReply(reply.text)}
            </span>
          </button>
        ))}
      </div>

      {/* Hint text when collapsed */}
      {!settingsOpen && (
        <p className="mt-2 text-center" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
          Tap ⚙️ to customize
        </p>
      )}
    </section>
  );
};

export default PlaybookSection;
