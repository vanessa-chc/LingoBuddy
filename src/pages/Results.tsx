import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { useCallback, useRef, useState, useEffect } from "react";
import WordLabCard from "@/components/WordLabCard";
import PlaybookSection from "@/components/PlaybookSection";

const SNAP_POINTS = { expanded: 0.1, mid: 0.4, minimized: 0.6 };

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysisData = location.state?.analysisData;
  const imageData = location.state?.imageData;
  const context = location.state?.context;

  const sheetRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const controls = useAnimation();
  const y = useMotionValue(windowHeight * SNAP_POINTS.mid);

  useEffect(() => {
    const onResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    controls.start({ y: windowHeight * SNAP_POINTS.mid });
  }, [windowHeight, controls]);

  const bgOpacity = useTransform(
    y,
    [windowHeight * SNAP_POINTS.expanded, windowHeight * SNAP_POINTS.minimized],
    [0.3, 0.7]
  );

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const currentY = y.get();
      const velocity = info.velocity.y;
      const midY = windowHeight * SNAP_POINTS.mid;
      const expandedY = windowHeight * SNAP_POINTS.expanded;
      const minimizedY = windowHeight * SNAP_POINTS.minimized;

      // Fast swipe detection
      if (velocity < -500) {
        controls.start({ y: expandedY, transition: { type: "spring", damping: 30, stiffness: 300 } });
        return;
      }
      if (velocity > 500) {
        if (currentY > midY) {
          navigate("/");
          return;
        }
        controls.start({ y: minimizedY, transition: { type: "spring", damping: 30, stiffness: 300 } });
        return;
      }

      // Snap to nearest
      const distances = [
        { point: expandedY, key: "expanded" },
        { point: midY, key: "mid" },
        { point: minimizedY, key: "minimized" },
      ];
      const nearest = distances.reduce((a, b) =>
        Math.abs(currentY - a.point) < Math.abs(currentY - b.point) ? a : b
      );

      if (nearest.key === "minimized" && currentY > minimizedY + 40) {
        navigate("/");
        return;
      }

      controls.start({ y: nearest.point, transition: { type: "spring", damping: 30, stiffness: 300 } });
    },
    [y, windowHeight, controls, navigate]
  );

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

  return (
    <div className="fixed inset-0 bg-background flex justify-center overflow-hidden">
      <div className="w-full max-w-[430px] relative h-full">
        {/* Background: original screenshot */}
        {imageData && (
          <motion.div className="absolute inset-0 flex items-center justify-center p-6" style={{ opacity: bgOpacity }}>
            <img
              src={imageData}
              alt="Original screenshot"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </motion.div>
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
        <motion.div
          ref={sheetRef}
          className="absolute left-0 right-0 z-40 flex flex-col"
          style={{
            y,
            height: windowHeight,
            background: "#121214",
            borderRadius: "24px 24px 0 0",
            touchAction: "none",
          }}
          drag="y"
          dragConstraints={{
            top: windowHeight * SNAP_POINTS.expanded,
            bottom: windowHeight * SNAP_POINTS.minimized + 60,
          }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-12 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
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
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
