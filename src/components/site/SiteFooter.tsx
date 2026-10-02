import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { SITE_NAV } from "@/config/nav";
import { CaBlock } from "@/components/CopyCa";
import { Lockup } from "@/components/Logo";
import { GithubIcon, XIcon } from "@/components/icons";
import { FaceButtons } from "@/components/Glyphs";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-plastic-3 bg-[linear-gradient(180deg,#dcdad3,#cfcdc6)] shadow-[inset_0_1px_0_#f6f5f1]">
      <div className="ridges h-3 border-b border-plastic-3 opacity-70" aria-hidden />
      <div className="wrap grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.1fr_0.8fr_1.1fr]">
        <div>
          <Lockup />
          <p className="mt-4 max-w-[34ch] text-[15px] text-ink-2">{BRAND.tagline}</p>
          <div className="mt-6 flex items-center gap-3">
            <a href={BRAND.x} target="_blank" rel="noreferrer" className="btn btn-sm" aria-label={`${BRAND.name} on X`}>
              <XIcon className="size-4" /> {BRAND.xHandle}
            </a>
            {BRAND.github ? (
              <a href={BRAND.github} target="_blank" rel="noreferrer" className="btn btn-sm" aria-label={`${BRAND.name} on GitHub`}>
                <GithubIcon className="size-4" /> GitHub
              </a>
            ) : null}
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-1 content-start gap-2">
          <p className="label mb-1">Modes</p>
          <Link href="/" className="text-[15px] text-ink-2 hover:text-ink">Home</Link>
          {SITE_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-[15px] text-ink-2 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="md:col-span-2 lg:col-span-1">
          <CaBlock />
        </div>
      </div>
      <div className="border-t border-plastic-3">
        <div className="wrap flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[70ch] text-[13px] leading-relaxed text-ink-3">
            Pre-launch preview. No deposits are accepted yet and nothing on this site is financial advice. Pools carry smart contract and price risk.
            Network: {CHAIN.name} (chain id {CHAIN.id}).
          </p>
          <FaceButtons className="size-12 shrink-0" />
        </div>
      </div>
    </footer>
  );
}
