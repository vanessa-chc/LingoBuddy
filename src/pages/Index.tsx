import { Menu, Plus, Upload, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
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

          {/* Upload Zone */}
          <div className="mt-8 flex-1 flex flex-col">
            <div className="flex-1 min-h-[240px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-base text-muted-foreground">Upload a screenshot</span>
            </div>

            {/* Clipboard Link */}
            <button className="mt-4 mx-auto flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <Clipboard className="w-4 h-4" />
              Paste from clipboard
            </button>
          </div>

          {/* Analyze Button */}
          <Button
            disabled
            className="w-full mt-8 h-14 rounded-2xl text-base font-semibold bg-cta text-cta-foreground hover:bg-cta/90 disabled:opacity-40 disabled:pointer-events-none"
          >
            Analyze
          </Button>
        </main>
      </div>
    </div>
  );
};

export default Index;
