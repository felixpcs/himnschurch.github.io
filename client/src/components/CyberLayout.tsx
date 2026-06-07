import { Link, useLocation } from "wouter";
import {
  Music2, ListMusic, Play, Settings, BookOpen, Info,
  Radio, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent?: "pink" | "cyan";
}

const navItems: NavItem[] = [
  { href: "/", label: "Biblioteca", icon: <BookOpen size={16} />, accent: "pink" },
  { href: "/control", label: "Control", icon: <Play size={16} />, accent: "cyan" },
  { href: "/setlist", label: "Setlist", icon: <ListMusic size={16} />, accent: "pink" },
  { href: "/about", label: "Acerca de", icon: <Info size={16} />, accent: "cyan" },
];

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-void)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{
          background: "var(--bg-deep)",
          borderColor: "oklch(0.65 0.35 340 / 0.2)",
        }}
      >
        {/* Logo */}
        <div
          className="px-4 py-5 border-b"
          style={{ borderColor: "oklch(0.65 0.35 340 / 0.2)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-sm"
              style={{
                background: "oklch(0.65 0.35 340 / 0.15)",
                border: "1px solid oklch(0.65 0.35 340 / 0.6)",
                boxShadow: "0 0 10px oklch(0.65 0.35 340 / 0.3)",
              }}
            >
              <Music2 size={16} style={{ color: "oklch(0.85 0.35 340)" }} />
            </div>
            <div>
              <div
                className="text-sm font-black leading-none"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: "oklch(0.85 0.35 340)",
                  textShadow: "0 0 10px oklch(0.65 0.35 340 / 0.7)",
                }}
              >
                HIMNS
              </div>
              <div
                className="text-xs leading-none mt-0.5"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  color: "oklch(0.80 0.20 195)",
                  textShadow: "0 0 8px oklch(0.80 0.20 195 / 0.7)",
                  letterSpacing: "0.15em",
                }}
              >
                CHURCH
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 mt-3">
            <div
              className="w-1.5 h-1.5 rounded-full animate-neon-pulse"
              style={{ background: "oklch(0.65 0.20 145)", boxShadow: "0 0 6px oklch(0.65 0.20 145)" }}
            />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}
            >
              SISTEMA ACTIVO
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div
            className="px-4 mb-2 text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}
          >
            MÓDULOS
          </div>
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const neonColor = item.accent === "cyan"
                ? "oklch(0.80 0.20 195)"
                : "oklch(0.85 0.35 340)";
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-all duration-150 group",
                        isActive ? "nav-item-active" : "hover:bg-white/5"
                      )}
                      style={isActive ? {
                        color: neonColor,
                        background: `${neonColor.replace(')', ' / 0.08)')}`,
                        borderLeft: `2px solid ${neonColor}`,
                        boxShadow: `inset 0 0 10px ${neonColor.replace(')', ' / 0.05)')}`,
                      } : {
                        color: "var(--text-secondary)",
                        borderLeft: "2px solid transparent",
                      }}
                    >
                      <span style={isActive ? { color: neonColor } : {}}>{item.icon}</span>
                      <span
                        className="text-sm font-semibold uppercase tracking-wide"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight size={12} className="ml-auto" style={{ color: neonColor }} />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Projection shortcut */}
          <div
            className="mx-2 mt-4 border-t pt-4"
            style={{ borderColor: "oklch(0.65 0.35 340 / 0.15)" }}
          >
            <div
              className="px-2 mb-2 text-xs uppercase tracking-widest"
              style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}
            >
              PROYECCIÓN
            </div>
            <a
              href="/projection"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer transition-all duration-150 hover:bg-white/5"
              style={{ color: "var(--text-secondary)", borderLeft: "2px solid transparent" }}
            >
              <Radio size={16} />
              <span
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Abrir Pantalla
              </span>
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: "oklch(0.65 0.35 340 / 0.15)" }}
        >
          <div
            className="text-xs text-center"
            style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem" }}
          >
            <span style={{ color: "oklch(0.65 0.35 340 / 0.6)" }}>©</span> Felipe Formanttel
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div
          className="h-10 flex-shrink-0 flex items-center justify-between px-6 border-b"
          style={{
            background: "var(--bg-deep)",
            borderColor: "oklch(0.65 0.35 340 / 0.15)",
          }}
        >
          <div
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)", fontFamily: "'Share Tech Mono', monospace" }}
          >
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase()}
          </div>
          <div
            className="text-xs uppercase tracking-widest"
            style={{ color: "oklch(0.80 0.20 195 / 0.7)", fontFamily: "'Share Tech Mono', monospace" }}
          >
            HIMNSCHURCH v1.0
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
