import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import HudCard from "@/components/HudCard";
import HymnEditor from "@/components/HymnEditor";
import HymnImporter from "@/components/HymnImporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Upload, Edit2, Trash2, Music2,
  Hash, User, Tag, ChevronDown, ChevronUp, BookOpen
} from "lucide-react";
import { toast } from "sonner";
type Slide = { type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro'; label: string; text: string };
type Hymn = { id: number; number: number | null; title: string; author: string | null; category: string | null; slides: Slide[]; createdAt: Date; updatedAt: Date; };

export default function Library() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedHymn, setExpandedHymn] = useState<number | null>(null);
  const [editingHymn, setEditingHymn] = useState<Hymn | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: hymns = [], refetch } = trpc.hymns.list.useQuery(
    { search: search || undefined, category: selectedCategory || undefined },
    { refetchInterval: false }
  );
  const { data: categories = [] } = trpc.hymns.categories.useQuery();
  const deleteMutation = trpc.hymns.delete.useMutation({
    onSuccess: () => { toast.success("Himno eliminado"); refetch(); setDeleteConfirm(null); },
    onError: () => toast.error("Error al eliminar"),
  });

  const filteredHymns = useMemo(() => {
    if (!search && !selectedCategory) return hymns;
    return hymns;
  }, [hymns, search, selectedCategory]);

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      deleteMutation.mutate({ id });
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "var(--bg-void)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: "oklch(0.65 0.35 340 / 0.2)", background: "var(--bg-deep)" }}
      >
        <div className="flex items-center gap-3">
          <BookOpen size={20} style={{ color: "oklch(0.85 0.35 340)" }} />
          <h1
            className="text-lg font-black uppercase tracking-widest"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "oklch(0.85 0.35 340)",
              textShadow: "0 0 15px oklch(0.65 0.35 340 / 0.6)",
            }}
          >
            BIBLIOTECA DE HIMNOS
          </h1>
          <span
            className="text-xs px-2 py-0.5 rounded-sm"
            style={{
              background: "oklch(0.65 0.35 340 / 0.15)",
              color: "oklch(0.85 0.35 340)",
              border: "1px solid oklch(0.65 0.35 340 / 0.4)",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            {filteredHymns.length} HIMNOS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
            className="btn-cyber"
            style={{
              borderColor: "oklch(0.80 0.20 195 / 0.5)",
              color: "oklch(0.80 0.20 195)",
              background: "oklch(0.80 0.20 195 / 0.05)",
            }}
          >
            <Upload size={14} className="mr-1.5" /> IMPORTAR
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="btn-cyber"
            style={{
              background: "oklch(0.65 0.35 340 / 0.2)",
              border: "1px solid oklch(0.65 0.35 340 / 0.7)",
              color: "oklch(0.85 0.35 340)",
              boxShadow: "0 0 10px oklch(0.65 0.35 340 / 0.2)",
            }}
          >
            <Plus size={14} className="mr-1.5" /> NUEVO HIMNO
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="px-6 py-3 flex items-center gap-3 border-b flex-shrink-0"
        style={{ borderColor: "oklch(0.65 0.35 340 / 0.1)", background: "var(--bg-deep)" }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <Input
            placeholder="BUSCAR HIMNO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid oklch(0.65 0.35 340 / 0.3)",
              color: "var(--text-primary)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.75rem",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory("")}
            className="px-3 py-1 text-xs rounded-sm uppercase tracking-wide transition-all duration-150"
            style={!selectedCategory ? {
              background: "oklch(0.65 0.35 340 / 0.2)",
              border: "1px solid oklch(0.65 0.35 340 / 0.6)",
              color: "oklch(0.85 0.35 340)",
            } : {
              background: "transparent",
              border: "1px solid var(--border-dim)",
              color: "var(--text-secondary)",
            }}
          >
            TODOS
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              className="px-3 py-1 text-xs rounded-sm uppercase tracking-wide transition-all duration-150"
              style={selectedCategory === cat ? {
                background: "oklch(0.80 0.20 195 / 0.2)",
                border: "1px solid oklch(0.80 0.20 195 / 0.6)",
                color: "oklch(0.80 0.20 195)",
              } : {
                background: "transparent",
                border: "1px solid var(--border-dim)",
                color: "var(--text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hymn list */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredHymns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Music2 size={48} style={{ color: "oklch(0.65 0.35 340 / 0.3)" }} />
            <p style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
              {search ? "NO SE ENCONTRARON HIMNOS" : "BIBLIOTECA VACÍA"}
            </p>
            {!search && (
              <Button
                size="sm"
                onClick={() => setShowCreate(true)}
                className="btn-cyber"
                style={{
                  background: "oklch(0.65 0.35 340 / 0.2)",
                  border: "1px solid oklch(0.65 0.35 340 / 0.7)",
                  color: "oklch(0.85 0.35 340)",
                }}
              >
                <Plus size={14} className="mr-1.5" /> AGREGAR PRIMER HIMNO
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHymns.map((hymn) => (
              <HymnRow
                key={hymn.id}
                hymn={hymn}
                isExpanded={expandedHymn === hymn.id}
                onToggle={() => setExpandedHymn(expandedHymn === hymn.id ? null : hymn.id)}
                onEdit={() => setEditingHymn(hymn)}
                onDelete={() => handleDelete(hymn.id)}
                deleteConfirm={deleteConfirm === hymn.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showCreate || editingHymn) && (
        <HymnEditor
          hymn={editingHymn}
          onClose={() => { setShowCreate(false); setEditingHymn(null); }}
          onSaved={() => { setShowCreate(false); setEditingHymn(null); refetch(); }}
        />
      )}
      {showImport && (
        <HymnImporter
          onClose={() => setShowImport(false)}
          onSaved={() => { setShowImport(false); refetch(); }}
        />
      )}
    </div>
  );
}

// ─── HymnRow ──────────────────────────────────────────────────────────────────

interface HymnRowProps {
  hymn: Hymn;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
}

function HymnRow({ hymn, isExpanded, onToggle, onEdit, onDelete, deleteConfirm }: HymnRowProps) {
  const slides = hymn.slides as Array<{ type: string; label: string; text: string }>;

  return (
    <div
      className="rounded-sm overflow-hidden transition-all duration-200"
      style={{
        background: isExpanded ? "oklch(0.65 0.35 340 / 0.05)" : "var(--bg-card)",
        border: isExpanded
          ? "1px solid oklch(0.65 0.35 340 / 0.5)"
          : "1px solid var(--border-dim)",
        boxShadow: isExpanded ? "0 0 12px oklch(0.65 0.35 340 / 0.15)" : "none",
      }}
    >
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors duration-150"
        onClick={onToggle}
      >
        {/* Number */}
        {hymn.number && (
          <div
            className="w-10 h-10 flex items-center justify-center rounded-sm flex-shrink-0 text-sm font-black"
            style={{
              background: "oklch(0.65 0.35 340 / 0.1)",
              border: "1px solid oklch(0.65 0.35 340 / 0.3)",
              color: "oklch(0.85 0.35 340)",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {hymn.number}
          </div>
        )}

        {/* Title and meta */}
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-sm uppercase tracking-wide truncate"
            style={{ color: "var(--text-primary)", fontFamily: "'Rajdhani', sans-serif" }}
          >
            {hymn.title}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {hymn.author && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <User size={10} /> {hymn.author}
              </span>
            )}
            {hymn.category && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.80 0.20 195 / 0.1)",
                  border: "1px solid oklch(0.80 0.20 195 / 0.3)",
                  color: "oklch(0.80 0.20 195)",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.65rem",
                }}
              >
                {hymn.category}
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
              {slides.length} SECCIONES
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-all duration-150 hover:bg-white/10"
            style={{ color: "oklch(0.80 0.20 195 / 0.7)" }}
            title="Editar"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-all duration-150"
            style={{
              color: deleteConfirm ? "oklch(0.65 0.25 25)" : "var(--text-muted)",
              background: deleteConfirm ? "oklch(0.65 0.25 25 / 0.1)" : "transparent",
              border: deleteConfirm ? "1px solid oklch(0.65 0.25 25 / 0.4)" : "1px solid transparent",
            }}
            title={deleteConfirm ? "Confirmar eliminación" : "Eliminar"}
          >
            <Trash2 size={13} />
          </button>
          <div style={{ color: "var(--text-muted)" }}>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded slides */}
      {isExpanded && (
        <div
          className="px-4 pb-4 border-t"
          style={{ borderColor: "oklch(0.65 0.35 340 / 0.15)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="p-3 rounded-sm"
                style={{
                  background: slide.type === "chorus"
                    ? "oklch(0.80 0.20 195 / 0.05)"
                    : "oklch(0.65 0.35 340 / 0.05)",
                  border: `1px solid ${slide.type === "chorus"
                    ? "oklch(0.80 0.20 195 / 0.2)"
                    : "oklch(0.65 0.35 340 / 0.2)"}`,
                }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-1.5"
                  style={{
                    color: slide.type === "chorus"
                      ? "oklch(0.80 0.20 195)"
                      : "oklch(0.85 0.35 340)",
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.6rem",
                  }}
                >
                  {slide.label}
                </div>
                <div
                  className="text-xs leading-relaxed whitespace-pre-line"
                  style={{ color: "var(--text-secondary)", fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {slide.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
