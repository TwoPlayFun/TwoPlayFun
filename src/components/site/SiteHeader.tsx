"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lockup } from "@/components/Logo";
import { NavCaPill } from "@/components/CopyCa";
import { NavWallet } from "@/components/wallet/WalletButton";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { BoxGlyph, CrossGlyph, RingGlyph, TriGlyph } from "@/components/Glyphs";
import { SITE_NAV } from "@/config/nav";
import { CHAIN } from "@/config/brand";

const GLYPH = { tri: TriGlyph, ring: RingGlyph, cross: CrossGlyph, box: BoxGlyph };

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  return (
    <header className="sticky top-0 z-40 border-b border-plastic-3 bg-[linear-gradient(180deg,#f5f4f0,#dfddd7)] shadow-[inset_0_-1px_0_#fff,0_2px_0_rgba(0,0,0,0.06)]">
      <div className="wrap flex h-16 items-center gap-3">
        <Lockup compact />
        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex xl:ml-8">
          {SITE_NAV.map((item) => {
            const G = GLYPH[item.glyph];
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 items-center gap-2 rounded-[7px] px-3 font-display text-[14px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                  active ? "well text-ink" : "text-ink-2 hover:bg-plastic/70 hover:text-ink"
                }`}
              >
                <G className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 font-pixel text-[10px] uppercase tracking-[0.06em] text-ink-3 2xl:flex">
            <span className="size-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]" />
            {CHAIN.name}
          </span>
          <NavCaPill />
          <span className="hidden sm:inline-flex">
            <NavWallet />
          </span>
          <span className="inline-flex sm:hidden">
            <NavWallet compact />
          </span>
          <button type="button" aria-label="Open menu" onClick={() => setMenu(true)} className="btn btn-sm !size-9 !min-h-0 !p-0 lg:hidden">
            <MenuIcon />
          </button>
        </div>
      </div>

      {menu
        ? createPortal(
            <div className="fixed inset-0 z-[60] flex flex-col bg-shell lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
              <div className="wrap flex h-16 items-center justify-between border-b border-plastic-3">
                <Lockup />
                <button type="button" aria-label="Close menu" onClick={() => setMenu(false)} className="btn btn-sm !size-9 !min-h-0 !p-0">
                  <CloseIcon />
                </button>
              </div>
              <nav className="wrap flex flex-1 flex-col gap-2.5 overflow-y-auto pb-10 pt-5" aria-label="Mobile">
                <p className="label mb-1">Select a mode</p>
                {SITE_NAV.map((item) => {
                  const G = GLYPH[item.glyph];
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMenu(false)} className="plate flex items-center gap-4 px-4 py-3.5">
                      <G className="size-6" />
                      <span>
                        <span className="block font-display text-[22px] font-bold uppercase leading-tight">{item.label}</span>
                        <span className="block text-[14px] text-ink-3">{item.hint}</span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
