import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppContainer } from "@/contexts/AppContainerContext";
import { listAnalysisHistory, type AnalysisHistoryRow } from "@/lib/analysisHistory";
import { getOrCreateAnonymousUserId } from "@/lib/anonymousUserId";
import { getRelativeTime } from "@/lib/relativeTime";
import { cn } from "@/lib/utils";

const CHAMELEON_AVATAR = "/assets/ChameleonAvatar.png";

const CONTEXT_EMOJI: Record<string, string> = {
  Friend: "👥",
  Work: "💼",
  Dating: "💕",
  Formal: "🎩",
};

const PRIMARY_GREEN = "#9DFF50";

interface HistoryMenuProps {
  open: boolean;
  onClose: () => void;
  /** When viewing a result from history, pass its row id to highlight that row. */
  selectedId?: string | null;
}

function getVibeSummary(row: AnalysisHistoryRow): string {
  const summary = (row.analysis_result?.vibeCheck as { summary?: string } | undefined)?.summary;
  if (typeof summary !== "string") return "";
  return summary.length > 80 ? `${summary.slice(0, 80).trim()}…` : summary;
}

export default function HistoryMenu({ open, onClose, selectedId = null }: HistoryMenuProps) {
  const navigate = useNavigate();
  const containerRef = useAppContainer();
  const [items, setItems] = useState<AnalysisHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const anonymousUserId = getOrCreateAnonymousUserId();
    listAnalysisHistory(anonymousUserId)
      .then(({ data, error }) => {
        if (error) return;
        setItems(data ?? []);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleSelect = (row: AnalysisHistoryRow) => {
    onClose();
    navigate("/results", {
      state: {
        analysisData: row.analysis_result,
        imageData: row.image_url ?? undefined,
        relationshipLabel: row.relationship_context,
        fromHistory: true,
        historyRowId: row.id,
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        hideCloseButton
        containerRef={containerRef ?? undefined}
        className="z-[200] border-r border-white/10 bg-[#121212] p-0 text-white [&+[data-radix-popper-content-wrapper]]:z-[200]"
      >
        <SheetHeader className="border-b border-white/10 px-5 pt-6 pb-4 text-left">
          <SheetTitle className="text-[20px] font-semibold leading-tight tracking-tight text-white">
            History
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden">
          {loading ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <p className="text-sm text-white/60">Loading…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10">
              <img
                src={CHAMELEON_AVATAR}
                alt="Leon"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-[#9DFF50]/50"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <p className="text-center text-[15px] text-white/80">
                Your history is empty. Start scanning to save some vibes!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1 overflow-y-auto px-3 pb-6">
              {items.map((row) => {
                const label = row.relationship_context;
                const emoji = CONTEXT_EMOJI[label] ?? "💬";
                const summary = getVibeSummary(row);
                const time = getRelativeTime(row.created_at);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(row)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
                        "active:opacity-90",
                        selectedId === row.id && "bg-white/10"
                      )}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg"
                        aria-hidden
                      >
                        {emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium" style={{ color: PRIMARY_GREEN }}>
                          {label}
                        </p>
                        <p className="truncate text-[13px] text-white/70">{summary || "No summary"}</p>
                      </div>
                      <span className="shrink-0 text-[12px] text-white/50">{time}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
