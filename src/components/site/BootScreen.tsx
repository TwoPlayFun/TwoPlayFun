"use client";

import { useEffect, useState } from "react";
import { Mark } from "@/components/Logo";

import { BOOT_KEY } from "@/config/game";

/**
 * Power-on screen, once per browser session: the two halves of the mark slide
 * together on black, then the screen washes to grey. Any key or tap skips it.
 * An inline script in the root layout hides it before paint on later visits.
 */
export function BootScreen() {
  const [phase, setPhase] = useState<"on" | "fade" | "gone">("on");

  useEffect(() => {
    let booted = false;
    try {
      booted = window.sessionStorage.getItem(BOOT_KEY) === "1";
    } catch {
      booted = false;
    }
    if (booted) {
      setPhase("gone");
      return;
    }
    const finish = () => {
      try {
        window.sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        // No storage: the boot screen simply plays again next time.
      }
      setPhase("fade");
      window.setTimeout(() => setPhase("gone"), 420);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(finish, reduced ? 300 : 2600);
    const skip = () => {
      window.clearTimeout(timer);
      finish();
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      className={`boot fixed inset-0 z-[100] grid grid-cols-1 place-items-center transition-opacity duration-400 ${phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      role="status"
      aria-label="Starting up"
      data-boot
    >
      <div className="boot-bg absolute inset-0" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative size-[96px] sm:size-[120px]">
          <span className="boot-half-l absolute inset-0">
            <Mark size={120} className="size-full [&>g:last-child]:hidden" />
          </span>
          <span className="boot-half-r absolute inset-0">
            <Mark size={120} className="size-full [&>g:first-child]:hidden" />
          </span>
        </div>
        <p className="boot-word mt-7 font-display text-[34px] font-bold uppercase tracking-[0.18em] sm:text-[44px]">Two Play</p>
        <p className="boot-sub mt-3 font-pixel text-[10px] uppercase tracking-[0.14em] sm:text-[11px]">Two player liquidity system</p>
        <p className="boot-sub mt-10 font-pixel text-[9px] uppercase tracking-[0.12em] opacity-70">Press any button</p>
      </div>
    </div>
  );
}
