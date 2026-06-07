import { Music2, Code2, Heart, Github, Globe } from "lucide-react";
import HudCard from "@/components/HudCard";

export default function About() {
  return (
    <div className="h-full overflow-y-auto p-5" style={{ background: "var(--bg-void)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Music2 size={20} style={{ color: "oklch(0.85 0.35 340)" }} />
        <h1
          className="text-lg font-black uppercase tracking-widest"
          style={{ fontFamily: "'Orbitron', sans-serif", color: "oklch(0.85 0.35 340)", textShadow: "0 0 15px oklch(0.65 0.35 340 / 0.6)" }}
        >
          ACERCA DE
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* App info */}
        <HudCard accent="pink">
          <div className="text-center py-4">
            <div
              className="text-5xl font-black mb-1"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: "oklch(0.85 0.35 340)",
                textShadow: "0 0 20px oklch(0.65 0.35 340 / 0.7), 0 0 40px oklch(0.65 0.35 340 / 0.4)",
              }}
            >
              HIMNS
            </div>
            <div
              className="text-2xl font-black tracking-[0.3em] mb-4"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: "oklch(0.80 0.20 195)",
                textShadow: "0 0 15px oklch(0.80 0.20 195 / 0.7)",
              }}
            >
              CHURCH
            </div>
            <div
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}
            >
              VERSIÓN 1.0.0
            </div>
            <p
              className="text-sm leading-relaxed max-w-md mx-auto"
              style={{ color: "var(--text-secondary)", fontFamily: "'Rajdhani', sans-serif", lineHeight: "1.7" }}
            >
              Sistema profesional de gestión y proyección de himnos para cultos cristianos.
              Diseñado para facilitar la adoración con tecnología moderna y una interfaz
              intuitiva de alto rendimiento.
            </p>
          </div>
        </HudCard>

        {/* Creator */}
        <HudCard title="CREADOR" accent="cyan">
          <div className="flex items-center gap-5 py-2">
            <div
              className="w-16 h-16 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.80 0.20 195 / 0.1)",
                border: "1px solid oklch(0.80 0.20 195 / 0.4)",
                boxShadow: "0 0 15px oklch(0.80 0.20 195 / 0.2)",
              }}
            >
              <Code2 size={28} style={{ color: "oklch(0.80 0.20 195)" }} />
            </div>
            <div>
              <div
                className="text-xl font-black uppercase tracking-wide mb-1"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: "oklch(0.90 0.20 195)",
                  textShadow: "0 0 12px oklch(0.80 0.20 195 / 0.6)",
                }}
              >
                Felipe Formanttel
              </div>
              <div
                className="text-xs uppercase tracking-widest"
                style={{ color: "oklch(0.80 0.20 195 / 0.7)", fontFamily: "'Share Tech Mono', monospace" }}
              >
                DESARROLLADOR &amp; DISEÑADOR
              </div>
              <div
                className="text-sm mt-2"
                style={{ color: "var(--text-secondary)", fontFamily: "'Rajdhani', sans-serif" }}
              >
                Creador de HimnsChurch — Sistema de proyección para iglesias.
              </div>
            </div>
          </div>
        </HudCard>

        {/* Features */}
        <HudCard title="FUNCIONALIDADES" accent="pink">
          <div className="grid grid-cols-2 gap-2">
            {[
              "Biblioteca de himnos completa",
              "Proyección en múltiples pantallas",
              "Sincronización en tiempo real",
              "Gestor de lista de servicio",
              "Importación desde texto plano",
              "Temas visuales personalizables",
              "Control de blackout",
              "Pantalla de bienvenida",
              "Navegación por teclado",
              "Base de datos precargada",
            ].map((feat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs py-1.5"
                style={{ color: "var(--text-secondary)", fontFamily: "'Rajdhani', sans-serif" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: i % 2 === 0 ? "oklch(0.65 0.35 340)" : "oklch(0.80 0.20 195)" }}
                />
                {feat}
              </div>
            ))}
          </div>
        </HudCard>

        {/* Tech stack */}
        <HudCard title="TECNOLOGÍA" accent="cyan">
          <div className="flex flex-wrap gap-2">
            {["React 19", "TypeScript", "tRPC", "Drizzle ORM", "Tailwind CSS 4", "BroadcastChannel API", "Node.js", "MySQL"].map(tech => (
              <span
                key={tech}
                className="px-2 py-1 text-xs rounded-sm"
                style={{
                  background: "oklch(0.80 0.20 195 / 0.08)",
                  border: "1px solid oklch(0.80 0.20 195 / 0.25)",
                  color: "oklch(0.80 0.20 195 / 0.9)",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.65rem",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </HudCard>

        {/* Footer credit */}
        <div
          className="text-center py-4 border-t"
          style={{ borderColor: "oklch(0.65 0.35 340 / 0.15)" }}
        >
          <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}>
            <Heart size={10} style={{ color: "oklch(0.65 0.35 340 / 0.6)" }} />
            <span>DESARROLLADO CON DEDICACIÓN POR</span>
            <span
              className="font-bold"
              style={{ color: "oklch(0.85 0.35 340)", textShadow: "0 0 8px oklch(0.65 0.35 340 / 0.5)" }}
            >
              FELIPE FORMANTTEL
            </span>
            <Heart size={10} style={{ color: "oklch(0.65 0.35 340 / 0.6)" }} />
          </div>
          <div className="mt-1 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}>
            PARA LA GLORIA DE DIOS — HIMNSCHURCH © 2025
          </div>
        </div>
      </div>
    </div>
  );
}
