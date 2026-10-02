import Link from "next/link";
import { BRAND } from "@/config/brand";

/*
 * The Two Play mark: one low-poly diamond split down the middle. The pale half
 * is Player 1, the charcoal half is Player 2; together they make one pair.
 * Temporary artwork. To swap in the owner's logo, change only `Mark` (and
 * re-export public/brand/mark.webp plus the icons in src/app).
 */
export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g transform="translate(-1.5 0)">
        <path d="M32 4 L4 32 L32 32 Z" fill="#f7f6f2" />
        <path d="M4 32 L32 60 L32 32 Z" fill="#c6c4bd" />
        <path d="M32 4 L4 32 L32 60 Z" fill="none" stroke="#7d7b74" strokeWidth="2" strokeLinejoin="round" />
      </g>
      <g transform="translate(1.5 0)">
        <path d="M32 4 L60 32 L32 32 Z" fill="#3b3e47" />
        <path d="M32 32 L60 32 L32 60 Z" fill="#1d1f25" />
        <path d="M32 4 L60 32 L32 60 Z" fill="none" stroke="#14151a" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function Lockup({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${BRAND.name} home`} className="flex shrink-0 items-center gap-2.5">
      <Mark size={compact ? 28 : 32} />
      <span className={`${compact ? "hidden sm:inline" : ""} font-display text-[19px] font-bold uppercase leading-none tracking-[0.06em] text-ink`}>
        Two<span className="text-ink-3">·</span>Play
      </span>
    </Link>
  );
}
