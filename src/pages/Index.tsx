import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import UploadActionSheet from "@/components/UploadActionSheet";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/heic";

const fileToBase64 = (file: File): Promise<string> =>
new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const Index = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const navigateToAnalyze = useCallback(
    (base64: string) => {
      navigate("/analyze", { state: { imageData: base64 } });
    },
    [navigate]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const base64 = await fileToBase64(file);
      e.target.value = "";
      navigateToAnalyze(base64);
    },
    [navigateToAnalyze]
  );

  const handleSelectSource = useCallback(
    (source: "camera" | "library" | "files") => {
      setSheetOpen(false);
      if (fileInputRef.current) {
        if (source === "camera") {
          fileInputRef.current.setAttribute("capture", "environment");
        } else {
          fileInputRef.current.removeAttribute("capture");
        }
        fileInputRef.current.click();
      }
    },
    []
  );

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const base64 = await fileToBase64(
            new File([blob], "clipboard.png", { type: imageType })
          );
          navigateToAnalyze(base64);
          return;
        }
      }
    } catch {

      // Clipboard API not available or no image
    }}, [navigateToAnalyze]);

  return (
    <div className="min-h-screen bg-[#121212] flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        {/* Header — hamburger only, Figma layout */}
        <header className="flex items-center px-5 pt-6 pb-2">
          <button className="p-2 -ml-2 text-white" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-5 pb-8">
          <div className="pt-2">
            <h1 className="font-bold leading-[1.2] tracking-tight text-white text-[32px]">
              What did you find, Vanessa?
            </h1>
            <p className="mt-3 text-[17px] text-[#AAAAAA]">
              Show Leon what&apos;s confusing
            </p>
          </div>

          {/* Upload Zone — card #2E2E2E, 16–24px radius, gradient icon */}
          <div className="mt-10 flex flex-col items-center flex-1">
            <div
              onClick={() => setSheetOpen(true)}
              className="w-full min-h-[320px] rounded-[20px] bg-[#2E2E2E] flex flex-col items-center justify-center py-16 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <svg
                className="w-20 h-20 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="url(#upload-icon-gradient)"
              >
                <defs>
                  <linearGradient id="upload-icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#B8FF00" />
                    <stop offset="100%" stopColor="#00FF00" />
                  </linearGradient>
                </defs>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="mt-4 text-[17px] text-white font-normal">
                Upload a screenshot
              </span>
            </div>

            <button
              type="button"
              className="mt-5 text-[15px] text-[#AAAAAA] bg-transparent border-none cursor-pointer hover:text-white/90 transition-colors"
            >
              Paste from clipboard
            </button>

            <div className="flex-1 min-h-[24px]" aria-hidden />

            {/* Analyze button — disabled, no toast */}
            <button
              type="button"
              disabled
              className="w-full py-4 rounded-[14px] bg-[#3C3C3C] text-white text-[18px] font-semibold cursor-not-allowed opacity-60"
            >
              Analyze
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
        </main>
      </div>

      {/* Action Sheet */}
      <UploadActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectSource={handleSelectSource} />

    </div>);

};

export default Index;