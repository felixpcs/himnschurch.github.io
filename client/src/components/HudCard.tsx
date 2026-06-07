import { cn } from "@/lib/utils";

interface HudCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "pink" | "cyan";
  title?: string;
  titleRight?: React.ReactNode;
  noPadding?: boolean;
}

export default function HudCard({
  children,
  className,
  accent = "pink",
  title,
  titleRight,
  noPadding = false,
}: HudCardProps) {
  const color = accent === "cyan"
    ? "oklch(0.80 0.20 195)"
    : "oklch(0.65 0.35 340)";
  const colorDim = accent === "cyan"
    ? "oklch(0.80 0.20 195 / 0.5)"
    : "oklch(0.65 0.35 340 / 0.5)";

  return (
    <div
      className={cn("relative", className)}
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${colorDim}`,
        boxShadow: `0 0 8px ${color.replace(')', ' / 0.1)')}`,
      }}
    >
      {/* Corner brackets */}
      <span
        className="absolute top-0 left-0 w-3 h-3 pointer-events-none"
        style={{
          borderTop: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`,
        }}
      />
      <span
        className="absolute top-0 right-0 w-3 h-3 pointer-events-none"
        style={{
          borderTop: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
        }}
      />
      <span
        className="absolute bottom-0 left-0 w-3 h-3 pointer-events-none"
        style={{
          borderBottom: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`,
        }}
      />
      <span
        className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none"
        style={{
          borderBottom: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
        }}
      />

      {/* Title bar */}
      {title && (
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            borderColor: colorDim,
            background: `${color.replace(')', ' / 0.05)')}`,
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color,
              textShadow: `0 0 8px ${color.replace(')', ' / 0.6)')}`,
            }}
          >
            {title}
          </span>
          {titleRight && (
            <div className="flex items-center gap-2">{titleRight}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={noPadding ? "" : "p-4"}>
        {children}
      </div>
    </div>
  );
}
