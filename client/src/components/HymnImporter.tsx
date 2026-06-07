import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Info } from "lucide-react";
import { toast } from "sonner";

interface HymnImporterProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function HymnImporter({ onClose, onSaved }: HymnImporterProps) {
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [rawText, setRawText] = useState("");

  const importMutation = trpc.hymns.import.useMutation({
    onSuccess: (data) => {
      toast.success(`Himno importado con ${data.slidesDetected} secciones detectadas`);
      onSaved();
    },
    onError: () => toast.error("Error al importar himno"),
  });

  const handleImport = () => {
    if (!title.trim()) { toast.error("El título es requerido"); return; }
    if (!rawText.trim()) { toast.error("Pega la letra del himno"); return; }
    importMutation.mutate({
      title: title.trim(),
      number: number ? parseInt(number) : undefined,
      author: author.trim() || undefined,
      category: category.trim() || undefined,
      rawText: rawText.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.8)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-sm overflow-hidden"
        style={{
          background: "var(--bg-deep)",
          border: "1px solid oklch(0.80 0.20 195 / 0.5)",
          boxShadow: "0 0 40px oklch(0.80 0.20 195 / 0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: "oklch(0.80 0.20 195 / 0.3)", background: "oklch(0.80 0.20 195 / 0.05)" }}
        >
          <h2
            className="text-sm font-black uppercase tracking-widest flex items-center gap-2"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.80 0.20 195)", textShadow: "0 0 10px oklch(0.80 0.20 195 / 0.6)" }}
          >
            <Upload size={14} /> IMPORTAR HIMNO
          </h2>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }} className="hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Info box */}
          <div
            className="flex gap-3 p-3 rounded-sm text-xs"
            style={{
              background: "oklch(0.80 0.20 195 / 0.05)",
              border: "1px solid oklch(0.80 0.20 195 / 0.2)",
              color: "var(--text-secondary)",
              fontFamily: "'Rajdhani', sans-serif",
              lineHeight: "1.6",
            }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.80 0.20 195)" }} />
            <div>
              <strong style={{ color: "oklch(0.80 0.20 195)" }}>Detección automática de secciones:</strong> El sistema detecta estrofas y coros por palabras clave como "Estrofa", "Coro", "Verso", "Chorus", "Estribillo". También puedes pegar texto libre y se dividirá automáticamente por párrafos.
            </div>
          </div>

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
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.80 0.20 195 / 0.3)", color: "var(--text-primary)" }}
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
                placeholder="Ej: 42"
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.80 0.20 195 / 0.3)", color: "var(--text-primary)" }}
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
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.80 0.20 195 / 0.3)", color: "var(--text-primary)" }}
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
                style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.80 0.20 195 / 0.3)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Raw text */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
              LETRA DEL HIMNO *
            </label>
            <Textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`Pega aquí la letra del himno. Ejemplo:\n\nEstrofa 1\nCuán grande es Él\nCuán grande es Él\n\nCoro\nEntonces mi alma canta\nCuán grande es Él`}
              rows={12}
              className="resize-none text-sm"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid oklch(0.80 0.20 195 / 0.3)",
                color: "var(--text-primary)",
                fontFamily: "'Rajdhani', sans-serif",
                lineHeight: "1.6",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-3 border-t flex-shrink-0"
          style={{ borderColor: "oklch(0.80 0.20 195 / 0.2)", background: "var(--bg-deep)" }}
        >
          <Button variant="outline" size="sm" onClick={onClose} className="btn-cyber" style={{ borderColor: "var(--border-dim)", color: "var(--text-secondary)" }}>
            CANCELAR
          </Button>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={importMutation.isPending}
            className="btn-cyber"
            style={{
              background: "oklch(0.80 0.20 195 / 0.2)",
              border: "1px solid oklch(0.80 0.20 195 / 0.7)",
              color: "oklch(0.80 0.20 195)",
              boxShadow: "0 0 10px oklch(0.80 0.20 195 / 0.2)",
            }}
          >
            <Upload size={13} className="mr-1.5" />
            {importMutation.isPending ? "IMPORTANDO..." : "IMPORTAR HIMNO"}
          </Button>
        </div>
      </div>
    </div>
  );
}
