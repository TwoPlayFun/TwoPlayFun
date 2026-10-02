"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BRAND, CHAIN, CONTRACTS } from "@/config/brand";
import { BoxGlyph, CrossGlyph, RingGlyph, TriGlyph } from "@/components/Glyphs";
import { RangeBars } from "@/components/ui";
import { DIFFICULTY, type Difficulty } from "@/lib/rooms";

/* ---------- figures, drawn for this manual ---------- */


function Fig({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="crt mt-5 p-4">
      <svg viewBox="0 0 320 120" className="block h-auto w-full" role="img" aria-label={label}>
        {children}
      </svg>
    </figure>
  );
}
const P = "#d6e6dc";
const D = "#8fa69a";

const FIGS: Record<string, ReactNode> = {
  match: (
    <Fig label="ETH from player 1 and the token from player 2 merge into one pair">
      <rect x="14" y="22" width="76" height="34" rx="4" fill="none" stroke={P} strokeWidth="2" />
      <text x="52" y="44" fill={P} fontSize="12" textAnchor="middle" fontFamily="monospace">1P · ETH</text>
      <rect x="14" y="66" width="76" height="34" rx="4" fill="none" stroke={P} strokeWidth="2" />
      <text x="52" y="88" fill={P} fontSize="12" textAnchor="middle" fontFamily="monospace">2P · TOKEN</text>
      <path d="M96 39 C140 39 140 60 176 60 M96 83 C140 83 140 60 176 60" stroke={D} strokeWidth="2" fill="none" strokeDasharray="4 4" />
      <rect x="180" y="38" width="126" height="44" rx="4" fill={P} />
      <text x="243" y="65" fill="#15171c" fontSize="13" textAnchor="middle" fontFamily="monospace" fontWeight="700">ONE PAIR</text>
    </Fig>
  ),
  difficulty: (
    <Fig label="Three ranges around the price: full, wide and tight">
      <path d="M10 70 L50 58 L90 74 L130 50 L170 62 L210 40 L250 56 L290 46 L310 52" stroke={P} strokeWidth="2" fill="none" />
      <rect x="10" y="14" width="300" height="96" fill="none" stroke={D} strokeDasharray="3 4" />
      <rect x="10" y="32" width="300" height="56" fill="rgba(214,230,220,0.08)" stroke={D} />
      <rect x="10" y="44" width="300" height="24" fill="rgba(214,230,220,0.16)" stroke={P} />
      <text x="16" y="26" fill={D} fontSize="9" fontFamily="monospace">CASUAL</text>
      <text x="16" y="42" fill={D} fontSize="9" fontFamily="monospace">STANDARD</text>
      <text x="16" y="62" fill={P} fontSize="9" fontFamily="monospace">EXPERT</text>
    </Fig>
  ),
  seats: (
    <Fig label="Each seat is its own save file with its entry snapshot">
      {[20, 170].map((x, i) => (
        <g key={x}>
          <rect x={x} y="16" width="130" height="88" rx="4" fill="none" stroke={P} strokeWidth="2" />
          <rect x={x} y="16" width="130" height="20" rx="4" fill={P} />
          <text x={x + 10} y="30" fill="#15171c" fontSize="10" fontFamily="monospace" fontWeight="700">{i ? "SEAT 2P" : "SEAT 1P"}</text>
          <text x={x + 10} y="56" fill={D} fontSize="9" fontFamily="monospace">ENTRY AMOUNT</text>
          <text x={x + 10} y="72" fill={D} fontSize="9" fontFamily="monospace">ENTRY PRICE</text>
          <text x={x + 10} y="88" fill={D} fontSize="9" fontFamily="monospace">FEE SHARE</text>
        </g>
      ))}
    </Fig>
  ),
  fees: (
    <Fig label="Pool fees and rewards flow to both seats">
      <rect x="120" y="12" width="80" height="30" rx="4" fill={P} />
      <text x="160" y="31" fill="#15171c" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="700">SWAP FEES</text>
      <path d="M160 42 L160 58 M160 58 L70 58 L70 74 M160 58 L250 58 L250 74" stroke={P} strokeWidth="2" fill="none" />
      <rect x="20" y="76" width="100" height="30" rx="4" fill="none" stroke={P} strokeWidth="2" />
      <text x="70" y="95" fill={P} fontSize="10" textAnchor="middle" fontFamily="monospace">1P SHARE</text>
      <rect x="200" y="76" width="100" height="30" rx="4" fill="none" stroke={P} strokeWidth="2" />
      <text x="250" y="95" fill={P} fontSize="10" textAnchor="middle" fontFamily="monospace">2P SHARE</text>
      <text x="160" y="96" fill={D} fontSize="9" textAnchor="middle" fontFamily="monospace">+ REWARDS</text>
    </Fig>
  ),
  swing: (
    <Fig label="The asset that moved more since entry absorbs the swing">
      <line x1="20" y1="70" x2="300" y2="70" stroke={D} strokeDasharray="3 4" />
      <rect x="70" y="56" width="50" height="14" fill={P} />
      <text x="95" y="90" fill={P} fontSize="10" textAnchor="middle" fontFamily="monospace">ETH +4%</text>
      <rect x="200" y="20" width="50" height="50" fill="none" stroke={P} strokeWidth="2" />
      <text x="225" y="90" fill={P} fontSize="10" textAnchor="middle" fontFamily="monospace">TOKEN +40%</text>
      <text x="225" y="108" fill={D} fontSize="9" textAnchor="middle" fontFamily="monospace">MOVED MORE</text>
    </Fig>
  ),
  swap: (
    <Fig label="A waiting player takes over an empty seat">
      <rect x="20" y="36" width="90" height="48" rx="4" fill="none" stroke={D} strokeWidth="2" strokeDasharray="4 4" />
      <text x="65" y="64" fill={D} fontSize="10" textAnchor="middle" fontFamily="monospace">EMPTY SEAT</text>
      <path d="M210 60 L124 60 M136 50 L124 60 L136 70" stroke={P} strokeWidth="2" fill="none" />
      <rect x="214" y="36" width="90" height="48" rx="4" fill={P} />
      <text x="259" y="64" fill="#15171c" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="700">NEXT IN LINE</text>
    </Fig>
  ),
};

/* ---------- pages ---------- */

type Page = { id: string; title: string; G: typeof TriGlyph; blocks: number; body: ReactNode; fig?: string };

const PAGES: Page[] = [
  {
    id: "match",
    title: "The match",
    G: TriGlyph,
    blocks: 1,
    fig: "match",
    body: (
      <>
        <p>
          Every pool needs two sides. In {BRAND.name} each side is a player: <b>1P brings ETH</b>, <b>2P brings the token</b>. Neither of you has to hold both assets, and
          neither of you has to buy the other side first.
        </p>
        <p>
          A deposit sits in the lobby until a partner arrives on the other side at the same difficulty. Then the two deposits become one liquidity position on {CHAIN.name},
          with two seats in it.
        </p>
        <p>An unmatched deposit earns nothing while it waits and can be taken back at any time. (Design for launch; deposits are not open yet.)</p>
      </>
    ),
  },
  {
    id: "difficulty",
    title: "Difficulty",
    G: RingGlyph,
    blocks: 1,
    fig: "difficulty",
    body: (
      <>
        <p>Both players choose the same price range before they are matched. Narrower ranges earn more of each trade but can drift out of range.</p>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {(Object.keys(DIFFICULTY) as Difficulty[]).map((d) => (
            <div key={d} className="well flex items-center gap-3 p-3">
              <RangeBars bars={DIFFICULTY[d].bars} />
              <span className="text-[14.5px]">
                <b>{DIFFICULTY[d].label}</b> · {DIFFICULTY[d].range}. {DIFFICULTY[d].note}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "seats",
    title: "Seats",
    G: BoxGlyph,
    blocks: 1,
    fig: "seats",
    body: (
      <>
        <p>
          Each seat in a pair is its own save file: it records what that player put in, the price at entry and the share of fees it is owed. Seats are planned as
          transferable tokens, so a seat can change hands without closing the pair.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees & rewards",
    G: CrossGlyph,
    blocks: 1,
    fig: "fees",
    body: (
      <>
        <p>
          A paired position earns the pool&apos;s trading fees like any other liquidity, and the fees are split between the two seats by the value each brought in. On top
          of that, paired seats are planned to earn {BRAND.symbol} rewards.
        </p>
        <p>Fee tiers, reward rates and schedules are published before deposits open. Until then every figure on this site shows &ldquo;--&rdquo;.</p>
      </>
    ),
  },
  {
    id: "swing",
    title: "Who takes the swing",
    G: TriGlyph,
    blocks: 2,
    fig: "swing",
    body: (
      <>
        <p>
          Prices move after you pair up, and a liquidity position always ends up holding more of whatever fell. The draft rule: <b>the asset that moved further from its entry
          price absorbs that swing</b>. The steadier side is paid back in its own asset first, as long as the position holds enough to cover it.
        </p>
        <p>In very large moves the position can run short, and then the steadier side also gets back less than it put in. Exact limits ship with the contracts.</p>
      </>
    ),
  },
  {
    id: "swap",
    title: "Seat swap",
    G: RingGlyph,
    blocks: 1,
    fig: "swap",
    body: (
      <>
        <p>
          When one player leaves, the next player waiting on the same side and difficulty takes the empty seat. The pair keeps running; nobody has to unwind the position.
          (Planned for launch.)
        </p>
      </>
    ),
  },
  {
    id: "arcade",
    title: "Arcade & draw",
    G: BoxGlyph,
    blocks: 1,
    body: (
      <>
        <p>
          Waiting is part of the game. The <Link href="/arcade" className="underline underline-offset-2">Arcade</Link> has mini-games to play while the lobby finds you a partner.
          Scores stay on your device for now.
        </p>
        <p>
          The <Link href="/draw" className="underline underline-offset-2">Draw</Link> is a free pre-launch lottery for {BRAND.symbol} allocations: one signed message per wallet, no
          gas, no approvals.
        </p>
      </>
    ),
  },
  {
    id: "token",
    title: `${BRAND.symbol}`,
    G: CrossGlyph,
    blocks: 1,
    body: (
      <>
        <p>
          {BRAND.symbol} is the game&apos;s token on {CHAIN.name}. It is the first 2P asset in the lobby and the reward paid to paired seats. Its contract address is published at
          launch; the copy button in the header and the footer switches on then.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-2">
          {CONTRACTS.map((c) => (
            <li key={c.name} className="well flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-3">
              <span className="min-w-0">
                <b className="font-mono text-[14px]">{c.name}</b>
                <span className="block text-[13.5px] text-ink-3">{c.role}</span>
              </span>
              <span className="font-pixel text-[10px] uppercase text-ink-3 [overflow-wrap:anywhere]">{c.address || "At launch"}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "risks",
    title: "Risks",
    G: TriGlyph,
    blocks: 1,
    body: (
      <>
        <p>
          <b>Contracts can have bugs.</b> Audit status will be published before deposits open; none is claimed today.
        </p>
        <p>
          <b>Price risk.</b> If your asset is the one that moves more, your seat takes the swing.
        </p>
        <p>
          <b>Range risk.</b> Expert positions can leave their range and stop earning fees.
        </p>
        <p>
          <b>Waiting.</b> An unmatched deposit earns nothing.
        </p>
        <p>
          <b>Phishing.</b> {BRAND.name} never asks for a seed phrase and never messages first. Official links come from {BRAND.xHandle}.
        </p>
      </>
    ),
  },
];

export function Manual() {
  const [sel, setSel] = useState(0);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const i = PAGES.findIndex((p) => `#${p.id}` === window.location.hash);
      if (i >= 0) setSel(i);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const choose = (i: number, focus = false) => {
    setSel(i);
    window.history.replaceState(null, "", `#${PAGES[i].id}`);
    if (focus) document.getElementById(`m-${PAGES[i].id}`)?.focus();
    if (window.innerWidth < 1024) panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => {
        const n = Math.min(PAGES.length - 1, s + 1);
        document.getElementById(`m-${PAGES[n].id}`)?.focus();
        return n;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => {
        const n = Math.max(0, s - 1);
        document.getElementById(`m-${PAGES[n].id}`)?.focus();
        return n;
      });
    }
  };

  const page = PAGES[sel];
  const used = PAGES.reduce((a, p) => a + p.blocks, 0);

  return (
    <div className="wrap mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[340px_1fr]">
      <nav aria-label="Manual chapters" className="plate p-3 lg:sticky lg:top-[88px]">
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <p className="label !text-ink-2">Manual · slot 1</p>
          <p className="num text-[11.5px] text-ink-3">{used} blocks</p>
        </div>
        <ul className="well grid grid-cols-1 gap-1 p-1.5" onKeyDown={onKey}>
          {PAGES.map((p, i) => (
            <li key={p.id}>
              <button
                id={`m-${p.id}`}
                type="button"
                onClick={() => choose(i)}
                aria-current={i === sel ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-[5px] px-2.5 py-2 text-left transition-colors ${
                  i === sel ? "bg-screen text-phos" : "text-ink hover:bg-paper/70"
                }`}
              >
                <p.G className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold uppercase tracking-[0.03em]">{p.title}</span>
                <span className={`font-pixel text-[9px] ${i === sel ? "text-phos-dim" : "text-ink-3"}`}>{p.blocks} blk</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="px-2 pt-3 text-[12.5px] text-ink-3">↑ ↓ to browse chapters</p>
      </nav>

      <article ref={panel} className="plate scroll-mt-[88px] p-5 sm:p-8" aria-live="polite" data-chapter={page.id}>
        <p className="label">
          Chapter {String(sel + 1).padStart(2, "0")} / {String(PAGES.length).padStart(2, "0")}
        </p>
        <h2 className="h-display mt-2 flex items-center gap-3 text-[32px] sm:text-[40px]">
          <page.G className="size-7 shrink-0" />
          {page.title}
        </h2>
        <div className="prose-manual mt-5 max-w-[64ch] text-[16px] leading-[1.65]">{page.body}</div>
        {page.fig ? FIGS[page.fig] : null}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" className="btn btn-sm" disabled={sel === 0} onClick={() => choose(sel - 1)}>
            ← Prev
          </button>
          <button type="button" className="btn btn-sm" disabled={sel === PAGES.length - 1} onClick={() => choose(sel + 1)}>
            Next →
          </button>
        </div>
      </article>
    </div>
  );
}
