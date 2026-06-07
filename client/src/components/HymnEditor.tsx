import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import HudCard from "@/components/HudCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";

type SlideType = "verse" | "chorus" | "bridge" | "intro" | "outro";

interface Slide {
  type: SlideType;
  label: string;
  text: string;
}

interface HymnData {
  id: number;
  number: number | null;
  title: string;
  author: string | null;
  category: string | null;
  slides: Slide[];
}

interface HymnEditorProps {
  hymn?: HymnData | null;
  onClose: () => void;
  onSaved: () => void;
}

const SLIDE_TYPE_OPTIONS: { value: SlideType; label: string; color: string }[] = [
  { value: "verse", label: "Estrofa", color: "oklch(0.85 0.35 340)" },
  { value: "chorus", label: "Coro", color: "oklch(0.80 0.20 195)" },
  { value: "bridge", label: "Puente", color: "oklch(0.75 0.20 120)" },
  { value: "intro", label: "Intro", color: "oklch(0.75 0.15 60)" },
  { value: "outro", label: "Final", color: "oklch(0.65 0.15 300)" },
];

export default function HymnEditor({ hymn, onClose, onSaved }: HymnEditorProps) {
  const [title, setTitle] = useState(hymn?.title ?? "");
  const [number, setNumber] = useState(hymn?.number?.toString() ?? "");
  const [author, setAuthor] = useState(hymn?.author ?? "");
  const [category, setCategory] = useState(hymn?.category ?? "");
  const [slides, setSlides] = useState<Slide[]>(
    hymn?.slides?.length ? (hymn.slides as Slide[]) : [{ type: "verse", label: "Estrofa 1", text: "" }]
  );

  const createMutation = trpc.hymns.create.useMutation({
    onSuccess: () => { toast.success("Himno creado"); onSaved(); },
    onError: () => toast.error("Error al crear himno"),
  });
  const updateMutation = trpc.hymns.update.useMutation({
    onSuccess: () => { toast.success("Himno actualizado"); onSaved(); },
    onError: () => toast.error("Error al actualizar himno"),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const addSlide = (type: SlideType) => {
    const count = slides.filter(s => s.type === type).length + 1;
    const typeLabel = SLIDE_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;
    setSlides([...slides, { type, label: `${typeLabel} ${count}`, text: "" }]);
  };

  const updateSlide = (idx: number, field: keyof Slide, value: string) => {
    setSlides(slides.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const newSlides = [...slides];
    const target = idx + dir;
    if (target < 0 || target >= newSlides.length) return;
    [newSlides[idx], newSlides[target]] = [newSlides[target], newSlides[idx]];
    setSlides(newSlides);
  };

  const handleSave = () => {
    if (!title.trim()) { toast.error("El título es requerido"); return; }
    const data = {
      title: title.trim(),
      number: number ? parseInt(number) : undefined,
      author: author.trim() || undefined,
      category: category.trim() || undefined,
      slides: slides.filter(s => s.text.trim()),
    };
    if (data.slides.length === 0) { toast.error("Agrega al menos una sección con texto"); return; }
    if (hymn) {
      updateMutation.mutate({ id: hymn.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.8)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-sm overflow-hidden"
        style={{
          background: "var(--bg-deep)",
          border: "1px solid oklch(0.65 0.35 340 / 0.5)",
          boxShadow: "0 0 40px oklch(0.65 0.35 340 / 0.2)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: "oklch(0.65 0.35 340 / 0.3)", background: "oklch(0.65 0.35 340 / 0.05)" }}
        >
          <h2
            className="text-sm font-black uppercase tracking-widest"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.85 0.35 340)", textShadow: "0 0 10px oklch(0.65 0.35 340 / 0.6)" }}
          >
            {hymn ? "EDITAR HIMNO" : "NUEVO HIMNO"}
          </h2>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }} className="hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                TÍTULO *
              </label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nombre del himno"
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.3)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                NÚMERO
              </label>
              <Input
                type="number"
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="Ej: 1"
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.3)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                CATEGORÍA
              </label>
              <Input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ej: Adoración"
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.3)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                AUTOR
              </label>
              <Input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Nombre del autor"
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.3)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Slides */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                SECCIONES ({slides.length})
              </label>
              <div className="flex items-center gap-1.5">
                {SLIDE_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => addSlide(opt.value)}
                    className="px-2 py-1 text-xs rounded-sm uppercase tracking-wide transition-all duration-150 hover:opacity-80"
                    style={{
                      background: `${opt.color.replace(')', ' / 0.1)')}`,
                      border: `1px solid ${opt.color.replace(')', ' / 0.4)')}`,
                      color: opt.color,
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.65rem",
                    }}
                  >
                    + {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {slides.map((slide, idx) => {
                const typeOpt = SLIDE_TYPE_OPTIONS.find(o => o.value === slide.type);
                const color = typeOpt?.color ?? "oklch(0.85 0.35 340)";
                return (
                  <div
                    key={idx}
                    className="rounded-sm overflow-hidden"
                    style={{
                      border: `1px solid ${color.replace(')', ' / 0.3)')}`,
                      background: `${color.replace(')', ' / 0.04)')}`,
                    }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2 border-b"
                      style={{ borderColor: `${color.replace(')', ' / 0.2)')}` }}
                    >
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="opacity-50 hover:opacity-100 transition-opacity" style={{ color }}>
                          <GripVertical size={12} />
                        </button>
                      </div>
                      <select
                        value={slide.type}
                        onChange={e => updateSlide(idx, "type", e.target.value)}
                        className="text-xs bg-transparent border-none outline-none uppercase font-bold"
                        style={{ color, fontFamily: "'Share Tech Mono', monospace" }}
                      >
                        {SLIDE_TYPE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value} style={{ background: "var(--bg-deep)" }}>{o.label.toUpperCase()}</option>
                        ))}
                      </select>
                      <Input
                        value={slide.label}
                        onChange={e => updateSlide(idx, "label", e.target.value)}
                        className="h-6 text-xs flex-1"
                        style={{ background: "transparent", border: "none", color, fontFamily: "'Share Tech Mono', monospace" }}
                      />
                      <div className="flex items-center gap-1 ml-auto">
                        <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100" style={{ color: "var(--text-muted)" }}>▲</button>
                        <button onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1} className="w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100" style={{ color: "var(--text-muted)" }}>▼</button>
                        <button onClick={() => removeSlide(idx)} disabled={slides.length <= 1} className="w-5 h-5 flex items-center justify-center hover:text-red-400 transition-colors" style={{ color: "var(--text-muted)" }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <Textarea
                      value={slide.text}
                      onChange={e => updateSlide(idx, "text", e.target.value)}
                      placeholder="Escribe la letra aquí..."
                      rows={3}
                      className="resize-none border-none rounded-none text-sm"
                      style={{
                        background: "transparent",
                        color: "var(--text-primary)",
                        fontFamily: "'Rajdhani', sans-serif",
                        lineHeight: "1.6",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-3 border-t flex-shrink-0"
          style={{ borderColor: "oklch(0.65 0.35 340 / 0.2)", background: "var(--bg-deep)" }}
        >
          <Button variant="outline" size="sm" onClick={onClose} className="btn-cyber" style={{ borderColor: "var(--border-dim)", color: "var(--text-secondary)" }}>
            CANCELAR
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="btn-cyber"
            style={{
              background: "oklch(0.65 0.35 340 / 0.2)",
              border: "1px solid oklch(0.65 0.35 340 / 0.7)",
              color: "oklch(0.85 0.35 340)",
              boxShadow: "0 0 10px oklch(0.65 0.35 340 / 0.2)",
            }}
          >
            <Save size={13} className="mr-1.5" />
            {isLoading ? "GUARDANDO..." : "GUARDAR HIMNO"}
          </Button>
        </div>
      </div>
    </div>
  );
}
