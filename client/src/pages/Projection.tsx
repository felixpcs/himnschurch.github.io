import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

type Theme = "dark" | "gradient" | "minimal";
type FontSize = "sm" | "md" | "lg" | "xl";
type Slide = { type: string; label: string; text: string };

const BC_CHANNEL = "himnschurch-projection";

const THEME_BG: Record<Theme, string> = {
  dark: "#000000",
  gradient: "radial-gradient(ellipse at center, #0d0d1a 0%, #000000 70%)",
  minimal: "#0a0a0f",
};

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: "proj-font-sm",
  md: "proj-font-md",
  lg: "proj-font-lg",
  xl: "proj-font-xl",
};

export default function Projection() {
  const [localState, setLocalState] = useState<{
    activeHymnId: number | null;
    currentSlide: number;
    blackout: boolean;
    showWelcome: boolean;
    welcomeText: string | null;
    theme: Theme;
    fontSize: FontSize;
  } | null>(null);

  const [activeHymn, setActiveHymn] = useState<{ id: number; title: string; slides: Slide[] } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: state, refetch: refetchState } = trpc.projection.getState.useQuery(undefined, {
    refetchInterval: 1500,
  });

  const { data: hymnData } = trpc.hymns.get.useQuery(
    { id: localState?.activeHymnId ?? 0 },
    { enabled: !!localState?.activeHymnId }
  );

  // Sync local state from server
  useEffect(() => {
    if (state) {
      setLocalState({
        activeHymnId: state.activeHymnId ?? null,
        currentSlide: state.currentSlide,
        blackout: state.blackout,
        showWelcome: state.showWelcome,
        welcomeText: state.welcomeText ?? "Bienvenidos al culto",
        theme: state.theme as Theme,
        fontSize: state.fontSize as FontSize,
      });
    }
  }, [state]);

  // Update hymn when activeHymnId changes
  useEffect(() => {
    if (hymnData) {
      setActiveHymn({ id: hymnData.id, title: hymnData.title, slides: hymnData.slides as Slide[] });
    }
  }, [hymnData]);

  // BroadcastChannel listener for instant updates
  useEffect(() => {
    let bc: BroadcastChannel;
    try {
      bc = new BroadcastChannel(BC_CHANNEL);
      bc.onmessage = (event) => {
        if (event.data?.type === "STATE_UPDATE") {
          refetchState();
        }
      };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, [refetchState]);

  const setStateMutation = trpc.projection.setState.useMutation({
    onSuccess: () => {
      refetchState();
      try {
        const bc = new BroadcastChannel(BC_CHANNEL);
        bc.postMessage({ type: "STATE_UPDATE" });
        bc.close();
      } catch {}
    },
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!localState) return;
      const slides = activeHymn?.slides ?? [];
      const total = slides.length;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        if (localState.currentSlide < total - 1) {
          setStateMutation.mutate({ currentSlide: localState.currentSlide + 1 });
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (localState.currentSlide > 0) {
          setStateMutation.mutate({ currentSlide: localState.currentSlide - 1 });
        }
      } else if (e.key === "b" || e.key === "B") {
        setStateMutation.mutate({ blackout: !localState.blackout });
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [localState, activeHymn, setStateMutation]);

  // Auto-fullscreen on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && document.fullscreenEnabled) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const currentSlide = localState?.currentSlide ?? 0;
  const slides = activeHymn?.slides ?? [];
  const slide = slides[currentSlide];
  const theme = (localState?.theme ?? "dark") as Theme;
  const fontSize = (localState?.fontSize ?? "lg") as FontSize;

  const bgStyle = THEME_BG[theme];
  const isGradient = theme === "gradient";

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none relative"
      style={{
        background: isGradient ? undefined : bgStyle,
        backgroundImage: isGradient ? bgStyle : undefined,
        cursor: "none",
      }}
    >
      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
          zIndex: 10,
        }}
      />

      {/* Corner decorations */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {/* Top-left */}
        <div className="absolute top-6 left-6" style={{ borderTop: "1px solid rgba(255,20,147,0.15)", borderLeft: "1px solid rgba(255,20,147,0.15)", width: 40, height: 40 }} />
        {/* Top-right */}
        <div className="absolute top-6 right-6" style={{ borderTop: "1px solid rgba(255,20,147,0.15)", borderRight: "1px solid rgba(255,20,147,0.15)", width: 40, height: 40 }} />
        {/* Bottom-left */}
        <div className="absolute bottom-6 left-6" style={{ borderBottom: "1px solid rgba(255,20,147,0.15)", borderLeft: "1px solid rgba(255,20,147,0.15)", width: 40, height: 40 }} />
        {/* Bottom-right */}
        <div className="absolute bottom-6 right-6" style={{ borderBottom: "1px solid rgba(255,20,147,0.15)", borderRight: "1px solid rgba(255,20,147,0.15)", width: 40, height: 40 }} />
      </div>

      {/* BLACKOUT */}
      {localState?.blackout && (
        <div className="absolute inset-0 bg-black z-50" />
      )}

      {/* WELCOME SCREEN */}
      {!localState?.blackout && localState?.showWelcome && (
        <div className="flex flex-col items-center justify-center gap-6 z-20 px-16 text-center">
          <div
            className="text-6xl font-black uppercase tracking-widest"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "white",
              textShadow: "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)",
              lineHeight: 1.2,
            }}
          >
            {localState?.welcomeText || "Bienvenidos al culto"}
          </div>
          <div
            className="text-sm uppercase tracking-[0.4em]"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            HIMNSCHURCH
          </div>
        </div>
      )}

      {/* HYMN SLIDE */}
      {!localState?.blackout && !localState?.showWelcome && slide && (
        <div className="flex flex-col items-center justify-center gap-6 z-20 px-16 text-center max-w-5xl w-full">
          {/* Slide label */}
          <div
            className="text-xs uppercase tracking-[0.4em]"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: slide.type === "chorus"
                ? "rgba(0,200,255,0.5)"
                : "rgba(255,20,147,0.4)",
            }}
          >
            {slide.label}
          </div>

          {/* Slide text */}
          <div
            className={`font-bold leading-relaxed whitespace-pre-line ${FONT_SIZE_CLASS[fontSize]}`}
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              color: "white",
              textShadow: slide.type === "chorus"
                ? "0 0 30px rgba(0,200,255,0.3), 0 0 60px rgba(0,200,255,0.1)"
                : "0 0 20px rgba(255,255,255,0.1)",
              lineHeight: 1.4,
              letterSpacing: "0.02em",
            }}
          >
            {slide.text}
          </div>

          {/* Slide counter dots */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === currentSlide ? 20 : 6,
                    height: 6,
                    background: i === currentSlide
                      ? (slide.type === "chorus" ? "rgba(0,200,255,0.8)" : "rgba(255,255,255,0.8)")
                      : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!localState?.blackout && !localState?.showWelcome && !slide && (
        <div className="flex flex-col items-center justify-center gap-4 z-20">
          <div
            className="text-2xl font-black uppercase tracking-widest"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "rgba(255,255,255,0.1)",
            }}
          >
            HIMNSCHURCH
          </div>
          <div
            className="text-xs uppercase tracking-[0.4em]"
            style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(255,255,255,0.05)" }}
          >
            EN ESPERA...
          </div>
        </div>
      )}

      {/* Bottom info bar */}
      <div
        className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-8 z-20"
        style={{ opacity: 0.15 }}
      >
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "white", letterSpacing: "0.2em" }}>
          HIMNSCHURCH
        </div>
        {activeHymn && !localState?.showWelcome && !localState?.blackout && (
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "white", letterSpacing: "0.1em" }}>
            {activeHymn.title.toUpperCase()} — {currentSlide + 1}/{slides.length}
          </div>
        )}
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", color: "white", letterSpacing: "0.2em" }}>
          FELIPE FORMANTTEL
        </div>
      </div>
    </div>
  );
}
