import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import WordLabCard from "@/components/WordLabCard";
import PlaybookSection from "@/components/PlaybookSection";
import ScreenshotPreview from "@/components/ScreenshotPreview";
import HistoryMenu from "@/components/HistoryMenu";
import { analyzeScreenshot } from "@/lib/gemini";
import { insertAnalysisHistory } from "@/lib/analysisHistory";

const CHAMELEON_AVATAR = "/assets/ChameleonAvatar.png";

const SNAP_POINTS = { expanded: 0.1, mid: 0.32, collapsed: 0.6 };
const SPRING = { transition: "transform 300ms ease-out" };

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData);
  const [playbookLoading, setPlaybookLoading] = useState(false);
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
  const imageData = location.state?.imageData as string | undefined;
  const fromAnalyze = (location.state as { fromAnalyze?: boolean } | undefined)?.fromAnalyze === true;
  const fromHistory = (location.state as { fromHistory?: boolean } | undefined)?.fromHistory === true;

  // Persist refetch inputs from navigation state so preset change always has image + context
  const refetchRef = useRef<{ imageData: string; relationshipLabel: string } | null>(null);
  const hasSavedToHistoryRef = useRef(false);

  useEffect(() => {
    const state = location.state as { imageData?: string; relationshipLabel?: string; analysisData?: unknown } | undefined;
    if (state?.imageData && state?.relationshipLabel) {
      refetchRef.current = { imageData: state.imageData, relationshipLabel: state.relationshipLabel };
    }
    return () => { refetchRef.current = null; };
  }, [location.state]);

  // Save to analysis_history once when we land from Analyze (new analysis). No save on refresh (state lost) or when opening from history.
  useEffect(() => {
    if (fromHistory || !fromAnalyze || hasSavedToHistoryRef.current) return;
    const relationshipLabel = (location.state as { relationshipLabel?: string })?.relationshipLabel;
    if (!analysisData || !imageData || !relationshipLabel) return;

    hasSavedToHistoryRef.current = true;
    insertAnalysisHistory({
      relationship_context: relationshipLabel,
      analysis_result: analysisData as Record<string, unknown>,
      image_url: imageData,
    }).then(({ error }) => {
      if (error) console.error("Failed to save analysis history:", error);
    });
  }, [fromAnalyze, fromHistory, analysisData, imageData, location.state]);

  const handlePresetChange = useCallback(async (preset: string | null) => {
    const refetch = refetchRef.current;
    if (!refetch?.imageData || !refetch?.relationshipLabel) {
      toast.error("Missing image or context. Start a new analysis from the home screen.");
      return;
    }
    setPlaybookLoading(true);
    try {
      const next = await analyzeScreenshot(
        refetch.imageData,
        refetch.relationshipLabel,
        undefined,
        preset ?? undefined
      );
      // Preset refetch updates only playbook replies; keep existing vibeCheck and wordLab
      setAnalysisData((prev) =>
        prev ? { ...prev, playbook: next.playbook } : next
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't update replies. Try again.");
      // Do not clear or overwrite analysisData on error — keep existing UI
    } finally {
      setPlaybookLoading(false);
    }
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(() => typeof window !== "undefined" ? window.innerHeight : 600);
  const [sheetY, setSheetY] = useState(() => typeof window !== "undefined" ? window.innerHeight * SNAP_POINTS.collapsed : 360);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const dragStartY = useRef(0);
  const dragStartSheetY = useRef(0);
  const isDragOnHandle = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height ?? window.innerHeight;
      setContainerHeight(height);
      setSheetY((prev) => {
        const collapsedY = height * SNAP_POINTS.collapsed;
        const midY = height * SNAP_POINTS.mid;
        const expandedY = height * SNAP_POINTS.expanded;
        const distances = [
          { snap: collapsedY, dist: Math.abs(prev - collapsedY) },
          { snap: midY, dist: Math.abs(prev - midY) },
          { snap: expandedY, dist: Math.abs(prev - expandedY) },
        ];
        const nearest = distances.reduce((a, b) => (a.dist < b.dist ? a : b));
        return nearest.snap;
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setSheetY(containerHeight * SNAP_POINTS.collapsed);
  }, [containerHeight]);

  const snapTo = useCallback((snapFraction: number) => {
    setIsAnimating(true);
    setSheetY(containerHeight * snapFraction);
  }, [containerHeight]);

  const getCurrentSnap = useCallback(() => {
    const collapsed = containerHeight * SNAP_POINTS.collapsed;
    const mid = containerHeight * SNAP_POINTS.mid;
    const expanded = containerHeight * SNAP_POINTS.expanded;
    const distances = [
      { key: "expanded", y: expanded, dist: Math.abs(sheetY - expanded) },
      { key: "mid", y: mid, dist: Math.abs(sheetY - mid) },
      { key: "collapsed", y: collapsed, dist: Math.abs(sheetY - collapsed) },
    ];
    return distances.reduce((a, b) => (a.dist < b.dist ? a : b));
  }, [sheetY, containerHeight]);

  // Handle-only drag handlers
  const onHandlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragOnHandle.current = true;
    setIsDragging(true);
    setIsAnimating(false);
    dragStartY.current = e.clientY;
    dragStartSheetY.current = sheetY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [sheetY, containerHeight]);

  const onHandlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragOnHandle.current) return;
    const delta = e.clientY - dragStartY.current;
    const newY = dragStartSheetY.current + delta;
    const minY = containerHeight * SNAP_POINTS.expanded;
    const maxY = containerHeight * SNAP_POINTS.collapsed;
    setSheetY(Math.max(minY, Math.min(maxY, newY)));
  }, [containerHeight]);

  const onHandlePointerUp = useCallback(() => {
    if (!isDragOnHandle.current) return;
    isDragOnHandle.current = false;
    setIsDragging(false);

    const collapsedY = containerHeight * SNAP_POINTS.collapsed;
    const midY = containerHeight * SNAP_POINTS.mid;
    const expandedY = containerHeight * SNAP_POINTS.expanded;

    // Snap to nearest; do NOT dismiss to Home on swipe down — stay at collapsed
    const distances = [
      { snap: SNAP_POINTS.expanded, dist: Math.abs(sheetY - expandedY) },
      { snap: SNAP_POINTS.mid, dist: Math.abs(sheetY - midY) },
      { snap: SNAP_POINTS.collapsed, dist: Math.abs(sheetY - collapsedY) },
    ];
    const nearest = distances.reduce((a, b) => (a.dist < b.dist ? a : b));
    snapTo(nearest.snap);
  }, [sheetY, containerHeight, snapTo]);

  if (!analysisData) {
    return (
      <div className="min-h-screen w-full bg-[#121212] relative">
        <div className="w-full flex flex-col min-h-screen">
          <header className="flex items-center px-6 pt-6 pb-2 w-full">
            <button
              type="button"
              onClick={() => setHistoryMenuOpen(true)}
              className="p-2 -ml-2 text-white"
              aria-label="Open history"
            >
              <Menu className="w-6 h-6" />
            </button>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <p className="text-white/70">No analysis data found.</p>
            <button onClick={() => navigate("/")} className="mt-4 text-[#9DFF50] text-sm font-medium">Go back</button>
          </div>
          <HistoryMenu open={historyMenuOpen} onClose={() => setHistoryMenuOpen(false)} />
        </div>
      </div>
    );
  }

  const sheetHeight = containerHeight - sheetY;
  const collapsedY = containerHeight * SNAP_POINTS.collapsed;
  const isSheetOverImage = sheetY < collapsedY;
  const imageOpacity = isSheetOverImage ? 0.5 : 1;

  return (
    <div className="min-h-screen w-full bg-[#121212] overflow-hidden relative" ref={containerRef}>
      <div className="w-full relative min-h-full flex flex-col">
        {/* Header — match Index: no wrapper px, header has px-6 so hamburger position is identical */}
        <header className="relative z-[110] flex items-center justify-between px-6 pt-6 pb-2 w-full">
          <button
            type="button"
            onClick={() => setHistoryMenuOpen(true)}
            className="p-2 -ml-2 text-white touch-manipulation"
            aria-label="Open history"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-white text-[15px] font-medium"
            aria-label="New chat"
          >
            New chat <Plus className="w-4 h-4" />
          </button>
        </header>

        <HistoryMenu open={historyMenuOpen} onClose={() => setHistoryMenuOpen(false)} />

        {/* Content area — px-6 to match Index so hamburger aligns; header has its own px-6 */}
        <div className="px-6">
          <h1 className="relative z-50 pt-2 text-left text-[34px] font-bold leading-tight tracking-tight text-white">
            Leon&apos;s Take
          </h1>
          {imageData && (
            <div
              className="mt-6 mb-6"
              style={{ opacity: imageOpacity, transition: "opacity 0.2s ease" }}
            >
              <ScreenshotPreview src={imageData} alt="Original screenshot" />
            </div>
          )}
        </div>

        {/* Analysis sheet — always on top (above header and title) */}
        <div
          className="absolute left-0 right-0 z-[100] flex flex-col"
          style={{
            transform: `translateY(${sheetY}px)`,
            height: containerHeight,
            background: "#0D0D0D",
            borderRadius: "24px 24px 0 0",
            ...(isAnimating && !isDragging ? SPRING : {}),
          }}
        >
          {/* Drag handle — centered, Figma proportions (light gray bar) */}
          <div
            className="flex justify-center cursor-grab active:cursor-grabbing select-none"
            style={{ padding: "14px 0 10px" }}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
          >
            <div
              className="rounded-full active:scale-110 transition-transform"
              style={{
                width: 36,
                height: 4,
                background: "rgba(255,255,255,0.35)",
                borderRadius: 2,
              }}
            />
          </div>

          {/* Analysis header — centered below handle */}
          <h1 className="text-[20px] font-semibold text-white text-center mb-4">Analysis</h1>

          {/* Scrollable content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{
              paddingTop: 0,
              paddingBottom: 60,
              paddingLeft: 20,
              paddingRight: 20,
              maxHeight: sheetHeight - 56,
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            <div className="h-px bg-border mb-5" />

            {/* Vibe Check — Chameleon Avatar once, left of summary (Leon Moment) */}
            <section className="mb-5">
              <span className="text-[17px] font-bold text-white mb-3 block">Vibe Check</span>
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#2A2A2E" }}>
                <img
                  src={CHAMELEON_AVATAR}
                  alt="Leon"
                  className="shrink-0 rounded-full object-cover w-8 h-8 ring-2 ring-[#9DFF50]/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <p className="text-[15px] font-normal text-white flex-1" style={{ lineHeight: 1.6 }}>
                  {analysisData.vibeCheck?.summary ?? ""}
                </p>
              </div>
            </section>
            <div className="h-px bg-border mb-5" />

            {/* Word Lab — clean list from wordLab or slangTerms: Bold Lime Slang -> Definition */}
            {(() => {
              const terms = analysisData.wordLab ?? analysisData.slangTerms ?? [];
              if (terms.length === 0) return null;
              return (
                <>
                  <section className="mb-5">
                    <span className="text-[17px] font-bold text-white mb-3 block">Word Lab</span>
                    <div className="flex flex-col gap-3">
                      {terms.slice(0, 3).map((term, i) => (
                        <WordLabCard key={i} term={term} />
                      ))}
                    </div>
                  </section>
                  <div className="h-px bg-border mb-5" />
                </>
              );
            })()}

            {/* Playbook — PRD: playbook.vibeMatch, safeChill, sincere; preset selection refetches replies */}
            <PlaybookSection
              playbook={analysisData.playbook}
              onPresetChange={handlePresetChange}
              isPresetLoading={playbookLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
