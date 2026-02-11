import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import WordLabCard from "@/components/WordLabCard";
import PlaybookSection from "@/components/PlaybookSection";
import ScreenshotPreview from "@/components/ScreenshotPreview";
import { analyzeScreenshot } from "@/lib/gemini";

const CHAMELEON_AVATAR = "/assets/ChameleonAvatar.png";

const SNAP_POINTS = { expanded: 0.1, mid: 0.32, collapsed: 0.6 };
const SPRING = { transition: "transform 300ms ease-out" };

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData);
  const [playbookLoading, setPlaybookLoading] = useState(false);
  const imageData = location.state?.imageData as string | undefined;

  // Persist refetch inputs from navigation state so preset change always has image + context
  const refetchRef = useRef<{ imageData: string; relationshipLabel: string } | null>(null);
  useEffect(() => {
    const state = location.state as { imageData?: string; relationshipLabel?: string; analysisData?: unknown } | undefined;
    if (state?.imageData && state?.relationshipLabel) {
      refetchRef.current = { imageData: state.imageData, relationshipLabel: state.relationshipLabel };
    }
    return () => { refetchRef.current = null; };
  }, [location.state]);

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
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [sheetY, setSheetY] = useState(window.innerHeight * SNAP_POINTS.collapsed);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const dragStartY = useRef(0);
  const dragStartSheetY = useRef(0);
  const isDragOnHandle = useRef(false);

  useEffect(() => {
    const onResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setSheetY(windowHeight * SNAP_POINTS.collapsed);
  }, [windowHeight]);

  const snapTo = useCallback((snapFraction: number) => {
    setIsAnimating(true);
    setSheetY(windowHeight * snapFraction);
  }, [windowHeight]);

  const getCurrentSnap = useCallback(() => {
    const collapsed = windowHeight * SNAP_POINTS.collapsed;
    const mid = windowHeight * SNAP_POINTS.mid;
    const expanded = windowHeight * SNAP_POINTS.expanded;
    const distances = [
      { key: "expanded", y: expanded, dist: Math.abs(sheetY - expanded) },
      { key: "mid", y: mid, dist: Math.abs(sheetY - mid) },
      { key: "collapsed", y: collapsed, dist: Math.abs(sheetY - collapsed) },
    ];
    return distances.reduce((a, b) => (a.dist < b.dist ? a : b));
  }, [sheetY, windowHeight]);

  // Handle-only drag handlers
  const onHandlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragOnHandle.current = true;
    setIsDragging(true);
    setIsAnimating(false);
    dragStartY.current = e.clientY;
    dragStartSheetY.current = sheetY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [sheetY]);

  const onHandlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragOnHandle.current) return;
    const delta = e.clientY - dragStartY.current;
    const newY = dragStartSheetY.current + delta;
    const minY = windowHeight * SNAP_POINTS.expanded;
    const maxY = windowHeight * SNAP_POINTS.collapsed;
    setSheetY(Math.max(minY, Math.min(maxY, newY)));
  }, [windowHeight]);

  const onHandlePointerUp = useCallback(() => {
    if (!isDragOnHandle.current) return;
    isDragOnHandle.current = false;
    setIsDragging(false);

    const collapsedY = windowHeight * SNAP_POINTS.collapsed;
    const midY = windowHeight * SNAP_POINTS.mid;
    const expandedY = windowHeight * SNAP_POINTS.expanded;

    // Snap to nearest; do NOT dismiss to Home on swipe down — stay at collapsed
    const distances = [
      { snap: SNAP_POINTS.expanded, dist: Math.abs(sheetY - expandedY) },
      { snap: SNAP_POINTS.mid, dist: Math.abs(sheetY - midY) },
      { snap: SNAP_POINTS.collapsed, dist: Math.abs(sheetY - collapsedY) },
    ];
    const nearest = distances.reduce((a, b) => (a.dist < b.dist ? a : b));
    snapTo(nearest.snap);
  }, [sheetY, windowHeight, snapTo]);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-[430px] flex flex-col min-h-screen items-center justify-center px-5">
          <p className="text-muted-foreground">No analysis data found.</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary text-sm">Go back</button>
        </div>
      </div>
    );
  }

  const sheetHeight = windowHeight - sheetY;
  const collapsedY = windowHeight * SNAP_POINTS.collapsed;
  const isSheetOverImage = sheetY < collapsedY;
  const imageOpacity = isSheetOverImage ? 0.5 : 1;

  return (
    <div className="fixed inset-0 bg-[#121212] flex justify-center overflow-hidden">
      <div className="w-full max-w-[430px] relative min-h-full flex flex-col px-5">
        {/* Header row: hamburger left, New chat + right */}
        <header className="relative z-50 flex items-center justify-between pt-6 pb-2">
          <button type="button" className="p-2 -ml-2 text-white" aria-label="Menu">
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

        {/* Leon's Take: own row below header, left-aligned, large bold white */}
        <h1 className="relative z-50 pt-2 text-left text-[34px] font-bold leading-tight tracking-tight text-white">
          Leon&apos;s Take
        </h1>

        {/* Image: same flow and size as Analyze (mt-6 mb-6 > ScreenshotPreview), 100% opacity when sheet collapsed, dimmed when sheet expanded */}
        {imageData && (
          <div
            className="mt-6 mb-6"
            style={{ opacity: imageOpacity, transition: "opacity 0.2s ease" }}
          >
            <ScreenshotPreview src={imageData} alt="Original screenshot" />
          </div>
        )}

        {/* Analysis sheet — always on top (above header and title) */}
        <div
          className="absolute left-0 right-0 z-[100] flex flex-col"
          style={{
            transform: `translateY(${sheetY}px)`,
            height: windowHeight,
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
