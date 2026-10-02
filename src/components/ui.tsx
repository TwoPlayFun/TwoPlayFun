import type { ReactNode } from "react";

export function PageHead({ eyebrow, title, children, aside }: { eyebrow: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="wrap pt-10 sm:pt-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[720px]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="h-display mt-3 text-[40px] sm:text-[56px]">{title}</h1>
          {children ? <div className="mt-4 max-w-[62ch] text-[16.5px] text-ink-2">{children}</div> : null}
        </div>
        {aside}
      </div>
    </div>
  );
}

/** Segmented selector built from recessed keys; the chosen key sits pressed in. */
export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="well grid gap-1 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`min-h-[40px] min-w-0 rounded-[6px] px-2 font-display text-[13.5px] font-semibold uppercase tracking-[0.05em] transition-colors ${
              on ? "bg-[linear-gradient(180deg,#3a3d46,#23252c)] text-paper shadow-[inset_0_2px_0_rgba(0,0,0,0.35)]" : "text-ink-2 hover:bg-paper/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Seven-cell strip showing how much of the price line a range covers. */
export function RangeBars({ bars, className = "" }: { bars: number[]; className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {bars.map((b, i) => (
        <i key={i} className={`block w-[7px] ${b ? "bg-ink" : "bg-plastic-3/60"}`} style={{ height: 6 + (3 - Math.abs(3 - i)) * 3 }} />
      ))}
    </span>
  );
}

export function Kv({ k, v, mono = true, screen = false }: { k: ReactNode; v: ReactNode; mono?: boolean; screen?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5 text-[14px]">
      <span className={`shrink-0 ${screen ? "text-phos-dim" : "text-ink-3"}`}>{k}</span>
      <span className={`min-w-4 flex-1 translate-y-[-3px] border-b border-dotted ${screen ? "border-phos-dim/40" : "border-plastic-3"}`} />
      <span className={`shrink-0 text-right ${screen ? "text-phos" : "text-ink"} ${mono ? "num" : ""}`}>{v}</span>
    </div>
  );
}

export function Led({ on = true, red = false, blink = false }: { on?: boolean; red?: boolean; blink?: boolean }) {
  const color = red ? "bg-led-red shadow-[0_0_6px_var(--color-led-red)]" : on ? "bg-led shadow-[0_0_6px_var(--color-led)]" : "bg-plastic-3";
  return <span className={`inline-block size-2 shrink-0 rounded-full ${color} ${blink ? "animate-blink" : ""}`} aria-hidden="true" />;
}
