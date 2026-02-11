import { FC, useState, useCallback, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CHAMELEON_AVATAR = "/assets/ChameleonAvatar.png";

/** Presets hidden initially; only affect content when user selects from customization accordion */
const PRESETS = ["Witty", "Sincere", "Formal"] as const;
type Preset = (typeof PRESETS)[number];

interface PlaybookReply {
  intent?: string;
  text: string;
}

interface PRDPlaybookEntry {
  intent: string;
  reply: string;
}

interface PlaybookData {
  replies?: PlaybookReply[];
  vibeMatch?: PRDPlaybookEntry;
  safeChill?: PRDPlaybookEntry;
  sincere?: PRDPlaybookEntry;
}

interface PlaybookSectionProps {
  playbook?: PlaybookData | null;
  /** When user selects/deselects a preset, parent can refetch and pass new playbook */
  onPresetChange?: (preset: string | null) => void;
  isPresetLoading?: boolean;
}

/** Static category labels — never change to preset names */
const STATIC_CATEGORIES: { key: "vibeMatch" | "safeChill" | "sincere"; label: string }[] = [
  { key: "vibeMatch", label: "Vibe Match (Recommended)" },
  { key: "safeChill", label: "Stay Chill" },
  { key: "sincere", label: "Keep it Real" },
];

function getRepliesByCategory(playbook: PlaybookData | null | undefined): { label: string; text: string }[] {
  if (!playbook) return STATIC_CATEGORIES.map((c) => ({ label: c.label, text: "" }));
  return STATIC_CATEGORIES.map((c) => {
    const entry = playbook[c.key];
    return { label: c.label, text: entry?.reply ?? "" };
  });
}

const PlaybookSection: FC<PlaybookSectionProps> = ({ playbook, onPresetChange, isPresetLoading }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [emojisOn, setEmojisOn] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const wasLoadingRef = useRef(false);

  const categoryReplies = getRepliesByCategory(playbook);

  // When loading finishes (true → false), briefly set justUpdated for reply-card animation
  useEffect(() => {
    if (wasLoadingRef.current && !isPresetLoading) {
      setJustUpdated(true);
      const t = setTimeout(() => setJustUpdated(false), 400);
      return () => clearTimeout(t);
    }
    wasLoadingRef.current = isPresetLoading;
  }, [isPresetLoading]);

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
      {/* Header — Playbook bold, settings icon only */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[17px] font-bold text-white">Playbook</span>
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="p-1.5 rounded-lg transition-colors"
          aria-label="Playbook settings"
        >
            <Settings
              className="transition-all duration-300"
              size={20}
              style={{
                color: settingsOpen ? "#9DFF50" : "rgba(255,255,255,0.7)",
                transform: settingsOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
        </button>
      </div>

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
              <div className="flex gap-2">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={isPresetLoading}
                      onClick={() => {
                        const newPreset = isSelected ? null : preset;
                        setSelectedPreset(newPreset);
                        onPresetChange?.(newPreset);
                      }}
                      className="shrink-0 font-semibold transition-colors disabled:opacity-60"
                      style={{
                        padding: "10px 20px",
                        borderRadius: 24,
                        fontSize: 15,
                        border: isSelected ? "2px solid #9DFF50" : "1px solid rgba(255,255,255,0.15)",
                        background: isSelected ? "#9DFF50" : "transparent",
                        color: isSelected ? "#0D0D0D" : "#fff",
                      }}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Include emojis</span>
                <button
                  type="button"
                  onClick={() => setEmojisOn((v) => !v)}
                  className="relative w-[51px] h-[31px] rounded-full transition-colors duration-300"
                  style={{
                    background: emojisOn ? "#9DFF50" : "rgba(255,255,255,0.15)",
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

      {/* When updating: reply cards show bubble-shaped skeleton only (no text) */}
      <div className="flex flex-col gap-4">
        {categoryReplies.map((item, i) => (
          <motion.div
            key={item.label}
            initial={false}
            animate={{
              opacity: isPresetLoading ? 0.6 : 1,
              transition: { duration: 0.2 },
            }}
            transition={justUpdated ? { type: "tween", duration: 0.25 } : undefined}
          >
            <p className="text-[13px] text-white/70 mb-1.5">{item.label}</p>
            <button
              type="button"
              disabled={isPresetLoading}
              onClick={() => copyReply(formatReply(item.text), i)}
              className="w-full text-left transition-colors active:scale-[0.98] flex items-start gap-3 p-3 rounded-xl disabled:opacity-70"
              style={{ background: "#2A2A2E" }}
            >
              {!isPresetLoading && (
                <img
                  src={CHAMELEON_AVATAR}
                  alt=""
                  className="shrink-0 rounded-full object-cover ring-2 ring-[#9DFF50]/40"
                  style={{ width: 32, height: 32 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <span className="text-white flex-1 min-h-[1.25em] flex flex-col gap-1.5" style={{ fontSize: 15 }}>
                {isPresetLoading ? (
                  <>
                    <span className="inline-block w-full h-3 rounded bg-white/15 animate-pulse" />
                    <span className="inline-block w-[85%] h-3 rounded bg-white/10 animate-pulse" />
                  </>
                ) : copiedIndex === i ? (
                  "✓ Copied!"
                ) : (
                  formatReply(item.text)
                )}
              </span>
            </button>
          </motion.div>
        ))}
      </div>

      {!settingsOpen && (
        <p className="mt-2 text-center text-[13px] text-white/50">
          Tap ⚙️ to customize
        </p>
      )}
    </section>
  );
};

export default PlaybookSection;
