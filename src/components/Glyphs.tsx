/* Controller face-button glyphs, drawn for this site. */
type P = { className?: string; title?: string };

const base = (title?: string) => (title ? { role: "img", "aria-label": title } : { "aria-hidden": true });

export const TriGlyph = ({ className = "size-4", title }: P) => (
  <svg viewBox="0 0 20 20" className={className} {...base(title)}>
    <path d="M10 3.2 17 15.5H3Z" fill="none" stroke="var(--color-tri)" strokeWidth="2.4" strokeLinejoin="round" />
  </svg>
);
export const RingGlyph = ({ className = "size-4", title }: P) => (
  <svg viewBox="0 0 20 20" className={className} {...base(title)}>
    <circle cx="10" cy="10" r="6.3" fill="none" stroke="var(--color-cir)" strokeWidth="2.4" />
  </svg>
);
export const CrossGlyph = ({ className = "size-4", title }: P) => (
  <svg viewBox="0 0 20 20" className={className} {...base(title)}>
    <path d="M4.5 4.5 15.5 15.5M15.5 4.5 4.5 15.5" stroke="var(--color-crs)" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
export const BoxGlyph = ({ className = "size-4", title }: P) => (
  <svg viewBox="0 0 20 20" className={className} {...base(title)}>
    <rect x="4.2" y="4.2" width="11.6" height="11.6" fill="none" stroke="var(--color-sqr)" strokeWidth="2.4" strokeLinejoin="round" />
  </svg>
);

/** The four glyphs in a diamond, as on a controller's right hand. */
export function FaceButtons({ className = "size-14" }: { className?: string }) {
  return (
    <span className={`relative inline-block ${className}`} aria-hidden="true">
      {[
        { G: TriGlyph, pos: "left-1/2 top-0 -translate-x-1/2" },
        { G: RingGlyph, pos: "right-0 top-1/2 -translate-y-1/2" },
        { G: CrossGlyph, pos: "bottom-0 left-1/2 -translate-x-1/2" },
        { G: BoxGlyph, pos: "left-0 top-1/2 -translate-y-1/2" },
      ].map(({ G, pos }, i) => (
        <span key={i} className={`absolute grid size-[34%] place-items-center rounded-full border border-edge bg-[linear-gradient(180deg,#f7f6f2,#d2d0c9)] shadow-[0_2px_0_#8f8d86] ${pos}`}>
          <G className="size-[62%]" />
        </span>
      ))}
    </span>
  );
}

/** Small "press button" hint, e.g. <Hint g="cross">Select</Hint>. */
export function Hint({ g, children }: { g: "tri" | "ring" | "cross" | "box"; children: React.ReactNode }) {
  const G = { tri: TriGlyph, ring: RingGlyph, cross: CrossGlyph, box: BoxGlyph }[g];
  return (
    <span className="inline-flex items-center gap-1.5 font-pixel text-[10px] uppercase tracking-[0.08em]">
      <G className="size-3.5" />
      {children}
    </span>
  );
}
