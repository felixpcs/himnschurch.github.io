import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import HudCard from "@/components/HudCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play, SkipBack, SkipForward, EyeOff, Eye, Radio,
  Monitor, Sun, Type, ChevronLeft, ChevronRight,
  Music2, Settings, Wifi, WifiOff, List, Search
} from "lucide-react";
import { toast } from "sonner";

type Theme = "dark" | "gradient" | "minimal";
type FontSize = "sm" | "md" | "lg" | "xl";
type Slide = { type: string; label: string; text: string };

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "dark", label: "NEGRO PURO" },
  { value: "gradient", label: "GRADIENTE" },
  { value: "minimal", label: "MÍNIMAL" },
];
const FONT_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
];

// BroadcastChannel for multi-screen sync
const BC_CHANNEL = "himnschurch-projection";

export default function Control() {
  const [projWindow, setProjWindow] = useState<Window | null>(null);
  const [welcomeText, setWelcomeText] = useState("Bienvenidos al culto");
  const [editingWelcome, setEditingWelcome] = useState(false);

  const [hymnSearch, setHymnSearch] = useState("");
  const [activeSetlistId, setActiveSetlistId] = useState<number | null>(null);

  const { data: state, refetch: refetchState } = trpc.projection.getState.useQuery(undefined, { refetchInterval: 2000 });
  const { data: hymns = [] } = trpc.hymns.list.useQuery({ search: hymnSearch || undefined });
  const { data: setlists = [] } = trpc.setlists.list.useQuery();
  const { data: activeSetlistData } = trpc.setlists.get.useQuery(
    { id: activeSetlistId ?? 0 },
    { enabled: !!activeSetlistId }
  );
  const setlistItems = activeSetlistData?.items ?? [];

  const setStateMutation = trpc.projection.setState.useMutation({
    onSuccess: () => {
      refetchState();
      broadcastState();
    },
  });

  const [activeHymn, setActiveHymn] = useState<{ id: number; title: string; slides: Slide[] } | null>(null);
  const { data: hymnData } = trpc.hymns.get.useQuery(
    { id: state?.activeHymnId ?? 0 },
    { enabled: !!state?.activeHymnId }
  );

  useEffect(() => {
    if (hymnData) {
      setActiveHymn({ id: hymnData.id, title: hymnData.title, slides: hymnData.slides as Slide[] });
    }
  }, [hymnData]);

  useEffect(() => {
    if (state?.welcomeText) setWelcomeText(state.welcomeText);
  }, [state?.welcomeText]);

  const broadcastState = useCallback(() => {
    try {
      const bc = new BroadcastChannel(BC_CHANNEL);
      bc.postMessage({ type: "STATE_UPDATE" });
      bc.close();
    } catch {}
  }, []);

  const updateState = (patch: Parameters<typeof setStateMutation.mutate>[0]) => {
    setStateMutation.mutate(patch);
  };

  const openProjection = () => {
    const w = window.open("/projection", "himnschurch-projection", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no");
    if (w) { setProjWindow(w); toast.success("Pantalla de proyección abierta"); }
    else toast.error("No se pudo abrir la ventana. Permite ventanas emergentes.");
  };

  const selectHymn = (hymnId: number) => {
    updateState({ activeHymnId: hymnId, currentSlide: 0, showWelcome: false, blackout: false });
  };

  const currentSlide = state?.currentSlide ?? 0;
  const totalSlides = activeHymn?.slides?.length ?? 0;

  const goNext = () => {
    if (currentSlide < totalSlides - 1) updateState({ currentSlide: currentSlide + 1 });
  };
  const goPrev = () => {
    if (currentSlide > 0) updateState({ currentSlide: currentSlide - 1 });
  };

  const toggleBlackout = () => updateState({ blackout: !state?.blackout });
  const toggleWelcome = () => updateState({ showWelcome: !state?.showWelcome });

  const saveWelcomeText = () => {
    updateState({ welcomeText });
    setEditingWelcome(false);
  };

  const isProjectionOpen = projWindow && !projWindow.closed;

  // Setlist navigation
  const goNextSetlistHymn = () => {
    if (!activeSetlistId || setlistItems.length === 0) return;
    const currentPos = setlistItems.findIndex((item: { hymnId: number }) => item.hymnId === state?.activeHymnId);
    const nextItem = setlistItems[currentPos + 1] as { hymnId: number } | undefined;
    if (nextItem) selectHymn(nextItem.hymnId);
  };
  const goPrevSetlistHymn = () => {
    if (!activeSetlistId || setlistItems.length === 0) return;
    const currentPos = setlistItems.findIndex((item: { hymnId: number }) => item.hymnId === state?.activeHymnId);
    const prevItem = setlistItems[currentPos - 1] as { hymnId: number } | undefined;
    if (prevItem) selectHymn(prevItem.hymnId);
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4" style={{ background: "var(--bg-void)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-lg font-black uppercase tracking-widest flex items-center gap-2"
          style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.80 0.20 195)", textShadow: "0 0 15px oklch(0.80 0.20 195 / 0.6)" }}
        >
          <Monitor size={20} /> PANEL DE CONTROL
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: isProjectionOpen ? "oklch(0.65 0.20 145)" : "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            {isProjectionOpen ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isProjectionOpen ? "PANTALLA CONECTADA" : "SIN PANTALLA"}
          </div>
          <Button
            size="sm"
            onClick={openProjection}
            className="btn-cyber"
            style={{
              background: "oklch(0.80 0.20 195 / 0.15)",
              border: "1px solid oklch(0.80 0.20 195 / 0.6)",
              color: "oklch(0.80 0.20 195)",
            }}
          >
            <Radio size={13} className="mr-1.5" /> ABRIR PROYECCIÓN
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Hymn selector + Setlist */}
        <div className="col-span-4 space-y-3">
          {/* Setlist selector */}
          {setlists.length > 0 && (
            <HudCard title="SETLIST" accent="cyan" noPadding>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setActiveSetlistId(null)}
                  className="w-full text-left px-3 py-1.5 rounded-sm text-xs transition-all duration-150"
                  style={{
                    background: !activeSetlistId ? "oklch(0.80 0.20 195 / 0.15)" : "transparent",
                    color: !activeSetlistId ? "oklch(0.80 0.20 195)" : "var(--text-muted)",
                    border: `1px solid ${!activeSetlistId ? "oklch(0.80 0.20 195 / 0.4)" : "transparent"}`,
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >TODOS LOS HIMNOS</button>
                {setlists.map((sl) => (
                  <button
                    key={sl.id}
                    onClick={() => setActiveSetlistId(sl.id)}
                    className="w-full text-left px-3 py-1.5 rounded-sm text-xs transition-all duration-150"
                    style={{
                      background: activeSetlistId === sl.id ? "oklch(0.80 0.20 195 / 0.15)" : "transparent",
                      color: activeSetlistId === sl.id ? "oklch(0.80 0.20 195)" : "var(--text-secondary)",
                      border: `1px solid ${activeSetlistId === sl.id ? "oklch(0.80 0.20 195 / 0.4)" : "transparent"}`,
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >{sl.name}</button>
                ))}
              </div>
              {/* Setlist navigation buttons */}
              {activeSetlistId && setlistItems.length > 0 && (
                <div className="flex gap-1 p-2 border-t" style={{ borderColor: "oklch(0.80 0.20 195 / 0.15)" }}>
                  <Button size="sm" variant="outline" onClick={goPrevSetlistHymn} className="flex-1 btn-cyber text-xs"
                    style={{ borderColor: "oklch(0.80 0.20 195 / 0.3)", color: "oklch(0.80 0.20 195)" }}>
                    <SkipBack size={12} className="mr-1" /> ANTERIOR
                  </Button>
                  <Button size="sm" variant="outline" onClick={goNextSetlistHymn} className="flex-1 btn-cyber text-xs"
                    style={{ borderColor: "oklch(0.80 0.20 195 / 0.3)", color: "oklch(0.80 0.20 195)" }}>
                    SIGUIENTE <SkipForward size={12} className="ml-1" />
                  </Button>
                </div>
              )}
            </HudCard>
          )}

          <HudCard title="SELECCIONAR HIMNO" accent="pink" noPadding>
            {/* Search */}
            <div className="p-2 border-b" style={{ borderColor: "oklch(0.65 0.35 340 / 0.15)" }}>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <Input
                  value={hymnSearch}
                  onChange={e => setHymnSearch(e.target.value)}
                  placeholder="Buscar himno..."
                  className="pl-7 h-7 text-xs"
                  style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.2)", color: "var(--text-primary)" }}
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {(activeSetlistId ? setlistItems : hymns).length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                  NO HAY HIMNOS
                </div>
              ) : activeSetlistId ? (
                setlistItems.map((item: { id: number; hymnId: number; position: number; title?: string; number?: number | null; category?: string | null }) => (
                  <button
                    key={item.id}
                    onClick={() => selectHymn(item.hymnId)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 border-b"
                    style={{
                      borderColor: "oklch(0.65 0.35 340 / 0.1)",
                      background: state?.activeHymnId === item.hymnId ? "oklch(0.65 0.35 340 / 0.15)" : "transparent",
                      borderLeft: state?.activeHymnId === item.hymnId ? "2px solid oklch(0.65 0.35 340)" : "2px solid transparent",
                    }}
                  >
                    <span className="text-xs font-black w-5 text-right flex-shrink-0" style={{ color: "oklch(0.65 0.35 340 / 0.7)", fontFamily: "'Orbitron', sans-serif" }}>
                      {item.position + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase truncate" style={{ color: state?.activeHymnId === item.hymnId ? "oklch(0.85 0.35 340)" : "var(--text-primary)" }}>
                        {item.title ?? `Himno #${item.hymnId}`}
                      </div>
                    </div>
                    {state?.activeHymnId === item.hymnId && <Play size={10} style={{ color: "oklch(0.85 0.35 340)", flexShrink: 0 }} />}
                  </button>
                ))
              ) : (
                hymns.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => selectHymn(h.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 border-b"
                    style={{
                      borderColor: "oklch(0.65 0.35 340 / 0.1)",
                      background: state?.activeHymnId === h.id ? "oklch(0.65 0.35 340 / 0.15)" : "transparent",
                      borderLeft: state?.activeHymnId === h.id ? "2px solid oklch(0.65 0.35 340)" : "2px solid transparent",
                    }}
                  >
                    {h.number && (
                      <span className="text-xs font-black w-6 text-right flex-shrink-0" style={{ color: "oklch(0.65 0.35 340 / 0.7)", fontFamily: "'Orbitron', sans-serif" }}>
                        {h.number}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase truncate" style={{ color: state?.activeHymnId === h.id ? "oklch(0.85 0.35 340)" : "var(--text-primary)" }}>
                        {h.title}
                      </div>
                      {h.category && (
                        <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}>
                          {h.category}
                        </div>
                      )}
                    </div>
                    {state?.activeHymnId === h.id && <Play size={10} style={{ color: "oklch(0.85 0.35 340)", flexShrink: 0 }} />}
                  </button>
                ))
              )}
            </div>
          </HudCard>
        </div>

        {/* Center: Slide navigation */}
        <div className="col-span-5 space-y-4">
          {/* Current slide preview */}
          <HudCard title="VISTA PREVIA" accent="cyan">
            <div
              className="rounded-sm p-4 min-h-32 flex flex-col items-center justify-center text-center"
              style={{
                background: "#000",
                border: "1px solid oklch(0.80 0.20 195 / 0.2)",
                minHeight: "140px",
              }}
            >
              {state?.blackout ? (
                <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                  — BLACKOUT ACTIVO —
                </div>
              ) : state?.showWelcome ? (
                <div>
                  <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "oklch(0.80 0.20 195 / 0.6)", fontFamily: "'Share Tech Mono', monospace" }}>BIENVENIDA</div>
                  <div className="text-lg font-bold" style={{ color: "white", fontFamily: "'Orbitron', sans-serif" }}>
                    {state?.welcomeText || "Bienvenidos"}
                  </div>
                </div>
              ) : activeHymn?.slides?.[currentSlide] ? (
                <div>
                  <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "oklch(0.80 0.20 195 / 0.6)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {activeHymn.slides[currentSlide].label}
                  </div>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: "white", fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    {activeHymn.slides[currentSlide].text}
                  </div>
                </div>
              ) : (
                <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                  SELECCIONA UN HIMNO
                </div>
              )}
            </div>
          </HudCard>

          {/* Navigation controls */}
          <HudCard title="NAVEGACIÓN" accent="cyan">
            <div className="space-y-3">
              {/* Slide counter */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                  SECCIÓN
                </span>
                <span
                  className="text-2xl font-black"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.80 0.20 195)", textShadow: "0 0 10px oklch(0.80 0.20 195 / 0.5)" }}
                >
                  {totalSlides > 0 ? currentSlide + 1 : 0}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                  / {totalSlides}
                </span>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 btn-cyber"
                  onClick={goPrev}
                  disabled={currentSlide === 0 || totalSlides === 0}
                  style={{ borderColor: "oklch(0.80 0.20 195 / 0.3)", color: "oklch(0.80 0.20 195)" }}
                >
                  <ChevronLeft size={16} className="mr-1" /> ANTERIOR
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 btn-cyber"
                  onClick={goNext}
                  disabled={currentSlide >= totalSlides - 1 || totalSlides === 0}
                  style={{ borderColor: "oklch(0.80 0.20 195 / 0.3)", color: "oklch(0.80 0.20 195)" }}
                >
                  SIGUIENTE <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>

              {/* Slide list */}
              {activeHymn && activeHymn.slides.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activeHymn.slides.map((slide, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateState({ currentSlide: idx })}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-sm text-left transition-all duration-150"
                      style={{
                        background: currentSlide === idx ? "oklch(0.80 0.20 195 / 0.15)" : "transparent",
                        border: `1px solid ${currentSlide === idx ? "oklch(0.80 0.20 195 / 0.4)" : "transparent"}`,
                      }}
                    >
                      <span
                        className="text-xs w-4 text-center font-mono"
                        style={{ color: currentSlide === idx ? "oklch(0.80 0.20 195)" : "var(--text-muted)" }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="text-xs uppercase font-semibold"
                        style={{
                          color: slide.type === "chorus"
                            ? "oklch(0.80 0.20 195)"
                            : currentSlide === idx ? "var(--text-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {slide.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </HudCard>
        </div>

        {/* Right: Controls */}
        <div className="col-span-3 space-y-4">
          {/* Live controls */}
          <HudCard title="CONTROLES EN VIVO" accent="pink">
            <div className="space-y-2">
              {/* Blackout */}
              <button
                onClick={toggleBlackout}
                className="w-full py-3 rounded-sm font-bold uppercase tracking-widest text-sm transition-all duration-200 btn-cyber"
                style={state?.blackout ? {
                  background: "oklch(0.65 0.25 25 / 0.2)",
                  border: "1px solid oklch(0.65 0.25 25 / 0.8)",
                  color: "oklch(0.75 0.25 25)",
                  boxShadow: "0 0 15px oklch(0.65 0.25 25 / 0.3)",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.7rem",
                } : {
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-dim)",
                  color: "var(--text-secondary)",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.7rem",
                }}
              >
                {state?.blackout ? <><EyeOff size={14} className="inline mr-1.5" />BLACKOUT ON</> : <><Eye size={14} className="inline mr-1.5" />BLACKOUT</>}
              </button>

              {/* Welcome screen */}
              <button
                onClick={toggleWelcome}
                className="w-full py-3 rounded-sm font-bold uppercase tracking-widest text-sm transition-all duration-200 btn-cyber"
                style={state?.showWelcome ? {
                  background: "oklch(0.65 0.35 340 / 0.2)",
                  border: "1px solid oklch(0.65 0.35 340 / 0.8)",
                  color: "oklch(0.85 0.35 340)",
                  boxShadow: "0 0 15px oklch(0.65 0.35 340 / 0.3)",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.7rem",
                } : {
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-dim)",
                  color: "var(--text-secondary)",
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.7rem",
                }}
              >
                <Sun size={14} className="inline mr-1.5" />
                {state?.showWelcome ? "BIENVENIDA ON" : "BIENVENIDA"}
              </button>
            </div>
          </HudCard>

          {/* Welcome text */}
          <HudCard title="TEXTO BIENVENIDA" accent="pink">
            {editingWelcome ? (
              <div className="space-y-2">
                <Input
                  value={welcomeText}
                  onChange={e => setWelcomeText(e.target.value)}
                  className="text-xs"
                  style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.3)", color: "var(--text-primary)" }}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingWelcome(false)} className="flex-1 btn-cyber text-xs" style={{ borderColor: "var(--border-dim)", color: "var(--text-secondary)" }}>
                    CANCELAR
                  </Button>
                  <Button size="sm" onClick={saveWelcomeText} className="flex-1 btn-cyber text-xs" style={{ background: "oklch(0.65 0.35 340 / 0.2)", border: "1px solid oklch(0.65 0.35 340 / 0.6)", color: "oklch(0.85 0.35 340)" }}>
                    GUARDAR
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingWelcome(true)}
                className="w-full text-left text-xs p-2 rounded-sm hover:bg-white/5 transition-colors"
                style={{ color: "var(--text-secondary)", fontFamily: "'Rajdhani', sans-serif" }}
              >
                {state?.welcomeText || "Bienvenidos al culto"}
              </button>
            )}
          </HudCard>

          {/* Theme */}
          <HudCard title="TEMA VISUAL" accent="cyan">
            <div className="space-y-1.5">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateState({ theme: opt.value })}
                  className="w-full py-2 px-3 rounded-sm text-xs uppercase tracking-wide text-left transition-all duration-150 btn-cyber"
                  style={state?.theme === opt.value ? {
                    background: "oklch(0.80 0.20 195 / 0.15)",
                    border: "1px solid oklch(0.80 0.20 195 / 0.6)",
                    color: "oklch(0.80 0.20 195)",
                  } : {
                    background: "transparent",
                    border: "1px solid var(--border-dim)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </HudCard>

          {/* Font size */}
          <HudCard title="TAMAÑO FUENTE" accent="cyan">
            <div className="flex gap-1.5">
              {FONT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateState({ fontSize: opt.value })}
                  className="flex-1 py-2 rounded-sm text-xs font-black uppercase transition-all duration-150 btn-cyber"
                  style={state?.fontSize === opt.value ? {
                    background: "oklch(0.80 0.20 195 / 0.15)",
                    border: "1px solid oklch(0.80 0.20 195 / 0.6)",
                    color: "oklch(0.80 0.20 195)",
                    fontFamily: "'Orbitron', sans-serif",
                  } : {
                    background: "transparent",
                    border: "1px solid var(--border-dim)",
                    color: "var(--text-secondary)",
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </HudCard>
        </div>
      </div>
    </div>
  );
}
