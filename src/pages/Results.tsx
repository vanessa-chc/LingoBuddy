import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import WordLabCard from "@/components/WordLabCard";
import PlaybookSection from "@/components/PlaybookSection";
import ScreenshotPreview from "@/components/ScreenshotPreview";

const SNAP_POINTS = { expanded: 0.1, mid: 0.35, collapsed: 0.6 };
const SPRING = { transition: "transform 300ms ease-out" };

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisData = location.state?.analysisData;
  const imageData = location.state?.imageData;

  const contentRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [sheetY, setSheetY] = useState(window.innerHeight * SNAP_POINTS.mid);
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

  // Set initial position on mount
  useEffect(() => {
    setSheetY(windowHeight * SNAP_POINTS.mid);
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
    const maxY = windowHeight * SNAP_POINTS.collapsed + 80;
    setSheetY(Math.max(minY, Math.min(maxY, newY)));
  }, [windowHeight]);

  const onHandlePointerUp = useCallback(() => {
    if (!isDragOnHandle.current) return;
    isDragOnHandle.current = false;
    setIsDragging(false);

    const collapsedY = windowHeight * SNAP_POINTS.collapsed;
    const midY = windowHeight * SNAP_POINTS.mid;
    const expandedY = windowHeight * SNAP_POINTS.expanded;

    // If dragged well below collapsed → dismiss
    if (sheetY > collapsedY + 40) {
      navigate("/");
      return;
    }

    // Snap to nearest
    const distances = [
      { snap: SNAP_POINTS.expanded, dist: Math.abs(sheetY - expandedY) },
      { snap: SNAP_POINTS.mid, dist: Math.abs(sheetY - midY) },
      { snap: SNAP_POINTS.collapsed, dist: Math.abs(sheetY - collapsedY) },
    ];
    const nearest = distances.reduce((a, b) => (a.dist < b.dist ? a : b));
    snapTo(nearest.snap);
  }, [sheetY, windowHeight, navigate, snapTo]);

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

  return (
    <div className="fixed inset-0 bg-background flex justify-center overflow-hidden">
      <div className="w-full max-w-[430px] relative h-full">
        {/* Background: original screenshot - always visible */}
        {imageData && (
          <div className="absolute left-0 right-0 flex justify-center px-5" style={{ opacity: 0.5, top: 60 }}>
            <ScreenshotPreview src={imageData} alt="Original screenshot" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-50 p-2 rounded-full bg-background/60 backdrop-blur text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Bottom Sheet */}
        <div
          className="absolute left-0 right-0 z-40 flex flex-col"
          style={{
            transform: `translateY(${sheetY}px)`,
            height: windowHeight,
            background: "#121214",
            borderRadius: "24px 24px 0 0",
            ...(isAnimating && !isDragging ? SPRING : {}),
          }}
        >
          {/* Handle - primary drag target */}
          <div
            className="flex justify-center cursor-grab active:cursor-grabbing select-none"
            style={{ padding: "12px 0 8px" }}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onHandlePointerMove}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
          >
            <div
              className="rounded-full active:scale-110 transition-transform"
              style={{
                width: 40,
                height: 4,
                background: "rgba(255,255,255,0.3)",
                borderRadius: 2,
              }}
            />
          </div>

          {/* Scrollable content - independent scroll, NO drag resize */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{
              paddingTop: 16,
              paddingBottom: 60,
              paddingLeft: 20,
              paddingRight: 20,
              maxHeight: sheetHeight - 32,
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            {/* Header */}
            <h1 className="text-[22px] font-semibold text-foreground mb-4">Analysis</h1>
            <div className="h-px bg-border mb-5" />

            {/* Vibe Check */}
            <section className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-semibold text-foreground">Vibe Check</span>
                {analysisData.overallTone && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "hsl(var(--cta))", color: "hsl(var(--cta-foreground))" }}
                  >
                    {analysisData.overallTone}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysisData.summary}</p>
            </section>
            <div className="h-px bg-border mb-5" />

            {/* Word Lab */}
            {(() => {
              const wordLabItems = (analysisData.wordLab || analysisData.slangTerms || []).slice(0, 3);
              if (!wordLabItems.length) return null;
              return (
                <>
                  <section className="mb-5">
                    <span className="text-base font-semibold text-foreground mb-3 block">Word Lab</span>
                    <div className="flex flex-col gap-5">
                      {wordLabItems.map((term: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-secondary">
                          <WordLabCard term={term} />
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="h-px bg-border mb-5" />
                </>
              );
            })()}

            {/* Playbook */}
            <PlaybookSection
              playbook={analysisData.playbook}
              suggestedReplies={analysisData.suggestedReplies}
            />

            {/* Cultural Notes */}
            {analysisData.culturalNotes && (
              <section className="mb-5">
                <span className="text-base font-semibold text-foreground mb-3 block">Cultural Context</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{analysisData.culturalNotes}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
