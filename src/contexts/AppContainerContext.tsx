import { createContext, useContext, useRef, type RefObject } from "react";

const AppContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useAppContainer() {
  return useContext(AppContainerContext);
}

export function AppContainerProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  return (
    <AppContainerContext.Provider value={containerRef}>
      <div className="min-h-screen w-full bg-[#0A0A0B]">
        <div
          ref={containerRef}
          className="mx-auto min-h-screen w-full max-w-[430px] relative bg-[#121212] shadow-2xl"
        >
          {children}
        </div>
      </div>
    </AppContainerContext.Provider>
  );
}
