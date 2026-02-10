import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Plus, Upload, Clipboard } from "lucide-react";
import { toast } from "sonner";
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
    }
  }, [navigateToAnalyze]);

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
        <main className="flex-1 flex flex-col px-5 pb-8">
          <div className="pt-[60px]">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
              What did you find, Alex?
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Show Leon what's confusing
            </p>
          </div>

          {/* Upload Zone */}
          <div className="mt-10 flex flex-col items-center">
            <div
              onClick={() => setSheetOpen(true)}
              className="w-full min-h-[500px] rounded-[16px] border-2 border-dashed border-[rgba(255,255,255,0.15)] bg-[#2A2A2E] flex flex-col items-center justify-center py-20 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <Upload className="w-20 h-20 text-[#ECFF51]" strokeWidth={1.5} />
              <span className="mt-4 text-[17px] text-[rgba(255,255,255,0.7)]">
                Upload a screenshot
              </span>
            </div>

            <button
              onClick={() => toast("Coming soon in full version")}
              className="mt-4 text-[15px] text-[#ECFF51] bg-transparent border-none flex items-center gap-2"
            >
              <Clipboard className="w-4 h-4" />
              Paste from clipboard
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
        onSelectSource={handleSelectSource}
      />
    </div>
  );
};

export default Index;
