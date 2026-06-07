import { useState } from "react";
import { trpc } from "@/lib/trpc";
import HudCard from "@/components/HudCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Play,
  ListMusic, Music2, Edit2, Check, X, Search
} from "lucide-react";
import { toast } from "sonner";

type SetlistItem = {
  id: number;
  setlistId: number;
  hymnId: number;
  position: number;
  hymnTitle: string;
  hymnNumber: number | null;
  hymnAuthor: string | null;
  hymnCategory: string | null;
  hymnSlides: unknown;
};

export default function SetlistPage() {
  const [selectedSetlistId, setSelectedSetlistId] = useState<number | null>(null);
  const [newSetlistName, setNewSetlistName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [hymnSearch, setHymnSearch] = useState("");
  const [showHymnPicker, setShowHymnPicker] = useState(false);

  const { data: setlists = [], refetch: refetchSetlists } = trpc.setlists.list.useQuery();
  const { data: selectedSetlist, refetch: refetchSelected } = trpc.setlists.get.useQuery(
    { id: selectedSetlistId ?? 0 },
    { enabled: !!selectedSetlistId }
  );
  const { data: hymns = [] } = trpc.hymns.list.useQuery(
    { search: hymnSearch || undefined },
    { enabled: showHymnPicker }
  );
  const { data: allHymns = [] } = trpc.hymns.list.useQuery();

  const createSetlist = trpc.setlists.create.useMutation({
    onSuccess: () => { toast.success("Setlist creado"); refetchSetlists(); setNewSetlistName(""); },
    onError: () => toast.error("Error al crear setlist"),
  });
  const updateSetlist = trpc.setlists.update.useMutation({
    onSuccess: () => { toast.success("Setlist actualizado"); refetchSetlists(); refetchSelected(); setEditingName(false); },
    onError: () => toast.error("Error al actualizar"),
  });
  const deleteSetlist = trpc.setlists.delete.useMutation({
    onSuccess: () => { toast.success("Setlist eliminado"); refetchSetlists(); setSelectedSetlistId(null); },
    onError: () => toast.error("Error al eliminar"),
  });
  const addHymn = trpc.setlists.addHymn.useMutation({
    onSuccess: () => { refetchSelected(); setShowHymnPicker(false); toast.success("Himno agregado"); },
    onError: () => toast.error("Error al agregar himno"),
  });
  const removeHymn = trpc.setlists.removeHymn.useMutation({
    onSuccess: () => { refetchSelected(); toast.success("Himno removido"); },
    onError: () => toast.error("Error al remover"),
  });
  const reorder = trpc.setlists.reorder.useMutation({
    onSuccess: () => refetchSelected(),
  });
  const setProjection = trpc.projection.setState.useMutation({
    onSuccess: () => toast.success("Himno enviado a proyección"),
  });

  const items: SetlistItem[] = (selectedSetlist?.items ?? []) as SetlistItem[];

  const handleCreate = () => {
    if (!newSetlistName.trim()) return;
    createSetlist.mutate({ name: newSetlistName.trim() });
  };

  const handleMoveItem = (item: SetlistItem, dir: -1 | 1) => {
    const newPos = item.position + dir;
    if (newPos < 0 || newPos >= items.length) return;
    reorder.mutate({ itemId: item.id, newPosition: newPos });
    // Also update the displaced item
    const displaced = items.find(i => i.position === newPos);
    if (displaced) reorder.mutate({ itemId: displaced.id, newPosition: item.position });
  };

  const handleProjectHymn = (hymnId: number) => {
    setProjection.mutate({ activeHymnId: hymnId, currentSlide: 0, showWelcome: false, blackout: false });
  };

  return (
    <div className="h-full overflow-y-auto p-5" style={{ background: "var(--bg-void)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <ListMusic size={20} style={{ color: "oklch(0.85 0.35 340)" }} />
        <h1
          className="text-lg font-black uppercase tracking-widest"
          style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.85 0.35 340)", textShadow: "0 0 15px oklch(0.65 0.35 340 / 0.6)" }}
        >
          LISTA DE SERVICIO
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Setlist list */}
        <div className="col-span-4">
          <HudCard title="SETLISTS" accent="pink" noPadding>
            {/* Create new */}
            <div className="p-3 border-b" style={{ borderColor: "oklch(0.65 0.35 340 / 0.15)" }}>
              <div className="flex gap-2">
                <Input
                  value={newSetlistName}
                  onChange={e => setNewSetlistName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  placeholder="Nombre del setlist..."
                  className="h-8 text-xs flex-1"
                  style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.65 0.35 340 / 0.3)", color: "var(--text-primary)" }}
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newSetlistName.trim()}
                  className="h-8 px-3 btn-cyber"
                  style={{ background: "oklch(0.65 0.35 340 / 0.2)", border: "1px solid oklch(0.65 0.35 340 / 0.6)", color: "oklch(0.85 0.35 340)" }}
                >
                  <Plus size={13} />
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {setlists.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                  SIN SETLISTS
                </div>
              ) : (
                setlists.map(sl => (
                  <button
                    key={sl.id}
                    onClick={() => setSelectedSetlistId(sl.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b"
                    style={{
                      borderColor: "oklch(0.65 0.35 340 / 0.1)",
                      background: selectedSetlistId === sl.id ? "oklch(0.65 0.35 340 / 0.1)" : "transparent",
                      borderLeft: selectedSetlistId === sl.id ? "2px solid oklch(0.65 0.35 340)" : "2px solid transparent",
                    }}
                  >
                    <ListMusic size={14} style={{ color: selectedSetlistId === sl.id ? "oklch(0.85 0.35 340)" : "var(--text-muted)", flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase truncate" style={{ color: selectedSetlistId === sl.id ? "oklch(0.85 0.35 340)" : "var(--text-primary)" }}>
                        {sl.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}>
                        {new Date(sl.updatedAt).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteSetlist.mutate({ id: sl.id }); }}
                      className="w-6 h-6 flex items-center justify-center hover:text-red-400 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </button>
                ))
              )}
            </div>
          </HudCard>
        </div>

        {/* Right: Selected setlist */}
        <div className="col-span-8">
          {!selectedSetlistId ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <ListMusic size={48} style={{ color: "oklch(0.65 0.35 340 / 0.2)" }} />
              <p style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                SELECCIONA UN SETLIST
              </p>
            </div>
          ) : (
            <HudCard
              accent="cyan"
              title={selectedSetlist?.name?.toUpperCase() ?? "CARGANDO..."}
              titleRight={
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingName(true); setEditNameValue(selectedSetlist?.name ?? ""); }}
                    className="text-xs hover:opacity-80"
                    style={{ color: "oklch(0.80 0.20 195 / 0.7)" }}
                  >
                    <Edit2 size={12} />
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setShowHymnPicker(true)}
                    className="h-6 px-2 btn-cyber text-xs"
                    style={{ background: "oklch(0.80 0.20 195 / 0.15)", border: "1px solid oklch(0.80 0.20 195 / 0.5)", color: "oklch(0.80 0.20 195)" }}
                  >
                    <Plus size={11} className="mr-1" /> HIMNO
                  </Button>
                </div>
              }
              noPadding
            >
              {editingName && (
                <div className="p-3 border-b flex gap-2" style={{ borderColor: "oklch(0.80 0.20 195 / 0.2)" }}>
                  <Input
                    value={editNameValue}
                    onChange={e => setEditNameValue(e.target.value)}
                    className="h-7 text-xs flex-1"
                    style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.80 0.20 195 / 0.3)", color: "var(--text-primary)" }}
                  />
                  <button onClick={() => updateSetlist.mutate({ id: selectedSetlistId, name: editNameValue })} style={{ color: "oklch(0.65 0.20 145)" }}><Check size={14} /></button>
                  <button onClick={() => setEditingName(false)} style={{ color: "var(--text-muted)" }}><X size={14} /></button>
                </div>
              )}

              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <Music2 size={32} className="mx-auto mb-3" style={{ color: "oklch(0.80 0.20 195 / 0.2)" }} />
                  <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
                    SETLIST VACÍO — AGREGA HIMNOS
                  </p>
                </div>
              ) : (
                <div>
                  {items.sort((a, b) => a.position - b.position).map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 border-b transition-all duration-150 hover:bg-white/5"
                      style={{ borderColor: "oklch(0.80 0.20 195 / 0.1)" }}
                    >
                      <span
                        className="text-sm font-black w-6 text-center flex-shrink-0"
                        style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.80 0.20 195 / 0.5)" }}
                      >
                        {idx + 1}
                      </span>
                      {item.hymnNumber && (
                        <span
                          className="text-xs w-7 text-center flex-shrink-0"
                          style={{ color: "oklch(0.65 0.35 340 / 0.7)", fontFamily: "'Orbitron', sans-serif" }}
                        >
                          #{item.hymnNumber}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold uppercase truncate" style={{ color: "var(--text-primary)" }}>
                          {item.hymnTitle}
                        </div>
                        {item.hymnCategory && (
                          <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}>
                            {item.hymnCategory}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleProjectHymn(item.hymnId)}
                          className="w-7 h-7 flex items-center justify-center rounded-sm transition-all hover:bg-white/10"
                          style={{ color: "oklch(0.65 0.35 340 / 0.7)" }}
                          title="Proyectar"
                        >
                          <Play size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveItem(item, -1)}
                          disabled={idx === 0}
                          className="w-6 h-6 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveItem(item, 1)}
                          disabled={idx === items.length - 1}
                          className="w-6 h-6 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          onClick={() => removeHymn.mutate({ itemId: item.id })}
                          className="w-6 h-6 flex items-center justify-center hover:text-red-400 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HudCard>
          )}
        </div>
      </div>

      {/* Hymn picker modal */}
      {showHymnPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 0.8)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-sm overflow-hidden"
            style={{
              background: "var(--bg-deep)",
              border: "1px solid oklch(0.80 0.20 195 / 0.5)",
              boxShadow: "0 0 30px oklch(0.80 0.20 195 / 0.15)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "oklch(0.80 0.20 195 / 0.3)" }}
            >
              <span className="text-sm font-black uppercase tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.80 0.20 195)" }}>
                AGREGAR HIMNO
              </span>
              <button onClick={() => setShowHymnPicker(false)} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div className="p-3 border-b" style={{ borderColor: "oklch(0.80 0.20 195 / 0.15)" }}>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <Input
                  value={hymnSearch}
                  onChange={e => setHymnSearch(e.target.value)}
                  placeholder="BUSCAR..."
                  className="pl-8 h-8 text-xs"
                  style={{ background: "var(--bg-panel)", border: "1px solid oklch(0.80 0.20 195 / 0.3)", color: "var(--text-primary)", fontFamily: "'Share Tech Mono', monospace" }}
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {allHymns.filter(h => !hymnSearch || h.title.toLowerCase().includes(hymnSearch.toLowerCase())).map(h => (
                <button
                  key={h.id}
                  onClick={() => addHymn.mutate({ setlistId: selectedSetlistId!, hymnId: h.id })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b"
                  style={{ borderColor: "oklch(0.80 0.20 195 / 0.08)" }}
                >
                  {h.number && <span className="text-xs w-6 text-right" style={{ color: "oklch(0.65 0.35 340 / 0.7)", fontFamily: "'Orbitron', sans-serif" }}>{h.number}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase truncate" style={{ color: "var(--text-primary)" }}>{h.title}</div>
                    {h.category && <div className="text-xs" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>{h.category}</div>}
                  </div>
                  <Plus size={12} style={{ color: "oklch(0.80 0.20 195 / 0.5)", flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
