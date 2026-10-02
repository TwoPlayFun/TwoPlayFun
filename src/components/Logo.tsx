import Link from "next/link";
import { BRAND } from "@/config/brand";

/*
 * The Two Play mark (owner artwork, 2 Oct 2026): a white rounded-pixel "T".
 * It is a single colour, so it is drawn as a CSS mask over `currentColor`
 * and takes the colour of its text context. Source: public/brand/mark.webp
 * (square, transparent). To swap the logo, replace that file.
 */
export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current [mask:url(/brand/mark.webp)_center/contain_no-repeat] [-webkit-mask:url(/brand/mark.webp)_center/contain_no-repeat] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The mark in white on the owner's slate plate, like the app icon. */
export function MarkTile({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-[22%] bg-slate text-paper shadow-[inset_1px_1px_0_rgba(255,255,255,0.25),inset_-1px_-1px_0_rgba(0,0,0,0.25),0_2px_0_#8f8d86] ${className}`}
      style={{ width: size, height: size }}
    >
      <Mark size={Math.round(size * 0.72)} />
    </span>
  );
}

export function Lockup({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${BRAND.name} home`} className="flex shrink-0 items-center gap-2.5">
      <MarkTile size={compact ? 32 : 36} />
      <span className={`${compact ? "hidden sm:inline" : ""} font-display text-[19px] font-bold uppercase leading-none tracking-[0.06em] text-ink`}>
        Two<span className="text-ink-3">·</span>Play
      </span>
    </Link>
  );
}
