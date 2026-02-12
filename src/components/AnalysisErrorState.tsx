import {
  getConfig,
  type AnalysisErrorCode,
} from "@/lib/analysisErrorTypes";

const FALLBACK_AVATAR = "/assets/ChameleonAvatar.png";

export type AnalysisErrorStateProps = {
  errorType: AnalysisErrorCode;
  onRetry: () => void;
  onTryAnotherPhoto: () => void;
  isLoading?: boolean;
};

export default function AnalysisErrorState({
  errorType,
  onRetry,
  onTryAnotherPhoto,
  isLoading = false,
}: AnalysisErrorStateProps) {
  const config = getConfig(errorType);
  const isRetry = config.buttonAction === "retry";
  const handleAction = isRetry ? onRetry : onTryAnotherPhoto;
  const avatarSrc = config.avatar ?? FALLBACK_AVATAR;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center justify-center">
        <img
          src={avatarSrc}
          alt="Leon"
          className="h-48 w-auto max-h-[220px] object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            if (el.src !== FALLBACK_AVATAR) {
              el.src = FALLBACK_AVATAR;
            } else {
              el.style.display = "none";
            }
          }}
        />
      </div>
      <p className="mt-6 text-[17px] text-white/90 leading-snug">
        {config.message}
      </p>
      <button
        type="button"
        onClick={handleAction}
        disabled={isLoading}
        className="mt-6 py-3 px-6 rounded-2xl font-semibold text-white bg-[#9DFF50]/20 text-[#9DFF50] border border-[#9DFF50]/50 active:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {isLoading ? "One sec…" : config.buttonLabel}
      </button>
    </div>
  );
}
