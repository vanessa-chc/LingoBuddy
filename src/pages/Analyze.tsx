import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageData = location.state?.imageData as string | undefined;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen">
        <header className="flex items-center gap-3 px-5 pt-4 pb-2">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold text-foreground">Analyzing…</span>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-5 pb-8">
          {imageData && (
            <img src={imageData} alt="Uploaded screenshot" className="max-h-[400px] rounded-xl object-contain" />
          )}
          <p className="mt-6 text-muted-foreground text-base">Analysis page — coming soon</p>
        </main>
      </div>
    </div>
  );
};

export default Analyze;
