import { Camera, Image, FolderOpen, X } from "lucide-react";

interface UploadActionSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectSource: (source: "camera" | "library" | "files") => void;
}

const UploadActionSheet = ({ open, onClose, onSelectSource }: UploadActionSheetProps) => {
  if (!open) return null;

  const options = [
    { icon: Camera, label: "Take Photo", source: "camera" as const },
    { icon: Image, label: "Photo Library", source: "library" as const },
    { icon: FolderOpen, label: "Files (Browse)", source: "files" as const },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-[430px] px-3 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl overflow-hidden bg-card">
          {options.map((opt, i) => (
            <button
              key={opt.source}
              onClick={() => onSelectSource(opt.source)}
              className={`w-full flex items-center gap-3 px-5 py-4 text-foreground text-[17px] hover:bg-secondary transition-colors ${
                i < options.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <opt.icon className="w-5 h-5 text-primary" />
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-card py-4 text-[17px] font-semibold text-destructive hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UploadActionSheet;
