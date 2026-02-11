interface UploadActionSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectSource: (source: "camera" | "library" | "files") => void;
}

const UploadActionSheet = ({ open, onClose, onSelectSource }: UploadActionSheetProps) => {
  if (!open) return null;

  const options = [
    { label: "Photo library", source: "library" as const },
    { label: "Camera", source: "camera" as const },
    { label: "Files", source: "files" as const },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full px-6 pb-5 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grouped options — #1C1C1E, 12px radius, separators #48484A */}
        <div className="rounded-[12px] overflow-hidden bg-[#1C1C1E]">
          {options.map((opt, i) => (
            <button
              key={opt.source}
              onClick={() => onSelectSource(opt.source)}
              className="w-full h-[55px] flex items-center justify-center text-[18px] font-normal text-[#0A84FF] hover:opacity-90 active:opacity-80 transition-opacity"
              style={{
                borderBottom: i < options.length - 1 ? "0.5px solid #48484A" : undefined,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Cancel — 8px gap, same styling, semi-bold */}
        <button
          onClick={onClose}
          className="mt-2 w-full h-[55px] rounded-[12px] bg-[#1C1C1E] text-[18px] font-semibold text-[#0A84FF] hover:opacity-90 active:opacity-80 transition-opacity"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UploadActionSheet;
