import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Plus, Upload, Clipboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [imageData, setImageData] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImageData(base64);
    e.target.value = "";
  }, []);

  const handleSelectSource = useCallback((source: "camera" | "library" | "files") => {
    setSheetOpen(false);
    if (fileInputRef.current) {
      // Set capture for camera, otherwise just open file picker
      if (source === "camera") {
        fileInputRef.current.setAttribute("capture", "environment");
      } else {
        fileInputRef.current.removeAttribute("capture");
      }
      fileInputRef.current.click();
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const base64 = await fileToBase64(new File([blob], "clipboard.png", { type: imageType }));
          setImageData(base64);
          return;
        }
      }
    } catch {
      // Clipboard API not available or no image — silently fail
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (imageData) {
      navigate("/analyze", { state: { imageData } });
    }
  }, [imageData, navigate]);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-4 pb-2">
          <button className="p-2 -ml-2 text-foreground" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-foreground px-3 py-1.5 rounded-full border border-border">
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-5 pt-6 pb-8">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
            What did you find, Alex?
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Show Leon what's confusing
          </p>

          {/* Upload Zone / Image Preview */}
          <div className="mt-8 flex-1 flex flex-col">
            {imageData ? (
              <div className="relative flex-1 flex items-center justify-center">
                <img
                  src={imageData}
                  alt="Uploaded screenshot"
                  className="max-h-[400px] w-full object-contain rounded-xl"
                />
                <button
                  onClick={() => setImageData(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => setSheetOpen(true)}
                  className="flex-1 min-h-[240px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-base text-muted-foreground">Upload a screenshot</span>
                </div>

                <button
                  onClick={handlePaste}
                  className="mt-4 mx-auto flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Clipboard className="w-4 h-4" />
                  Paste from clipboard
                </button>
              </>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Analyze Button */}
          <Button
            disabled={!imageData}
            onClick={handleAnalyze}
            className="w-full mt-8 h-14 rounded-2xl text-base font-semibold bg-cta text-cta-foreground hover:bg-cta/90 disabled:opacity-40 disabled:pointer-events-none"
          >
            Analyze
          </Button>
        </main>
      </div>

      {/* Action Sheet */}
      <UploadActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelectSource={handleSelectSource}
      />
    </div>
  );
};

export default Index;
