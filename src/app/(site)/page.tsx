import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { SITE_NAV } from "@/config/nav";
import { ConsoleArt } from "@/components/home/ConsoleArt";
import { ChainStrip } from "@/components/home/ChainStrip";
import { BoxGlyph, CrossGlyph, FaceButtons, Hint, RingGlyph, TriGlyph } from "@/components/Glyphs";
import { RangeBars } from "@/components/ui";
import { DIFFICULTY, type Difficulty } from "@/config/game";

const GLYPH = { tri: TriGlyph, ring: RingGlyph, cross: CrossGlyph, box: BoxGlyph };

const STEPS = [
  { n: "01", title: "Pick a seat", body: "Sit as 1P with ETH or as 2P with the token. You only ever bring the asset you already hold.", G: TriGlyph },
  { n: "02", title: "Get matched", body: "The lobby pairs you with a player on the other side who chose the same difficulty.", G: RingGlyph },
  { n: "03", title: "Earn together", body: "Both deposits become one pool position. Trading fees and rewards are split between the two seats.", G: CrossGlyph },
  { n: "04", title: "Play while you wait", body: "No partner yet? The Arcade keeps you busy until player 2 shows up.", G: BoxGlyph },
];

const COMPARE = [
  { k: "Assets you need", solo: "Both sides of the pair", duo: "Only your side" },
  { k: "Getting started", solo: "Swap half, then deposit", duo: "Deposit what you hold" },
  { k: "While you wait", solo: "Nothing to do", duo: "Arcade mini-games" },
  { k: "Who you earn with", solo: "Nobody", duo: "A partner on the other seat" },
];

const AUDIENCE = [
  { t: "Liquidity providers", d: "Put one asset to work without buying the other half first." },
  { t: "Gamers", d: "Lobbies, seats, difficulty and a partner: DeFi that plays like a co-op game." },
  { t: `${CHAIN.name} builders`, d: "A social way to seed fresh pairs on the chain you build on." },
  { t: "Token creators", d: "Meet ETH holders who want to sit on the other side of your pool." },
];

export default function Home() {
  return (
    <>
      {/* hero */}
      <section className="wrap grid grid-cols-1 items-center gap-10 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.02fr] lg:pt-16">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-led shadow-[0_0_6px_var(--color-led)]" /> Co-op liquidity · {CHAIN.name}
          </p>
          <h1 className="h-display mt-5 text-[46px] sm:text-[64px] xl:text-[76px]">{BRAND.slogan}</h1>
          <p className="mt-6 max-w-[48ch] text-[18px] leading-relaxed text-ink-2">{BRAND.tagline}</p>
          <p className="mt-3 max-w-[52ch] text-[15.5px] text-ink-3">
            Player 1 brings ETH. Player 2 brings the token. Together you open one pair, and both seats earn from every trade that passes through it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/lobby" className="btn btn-dark">
              <CrossGlyph className="size-4 [&_path]:stroke-paper" /> Open the lobby
            </Link>
            <Link href="/draw" className="btn">
              Enter the draw
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-ink-3">
            <Hint g="tri">1P · ETH</Hint>
            <Hint g="ring">2P · {BRAND.symbol}</Hint>
            <Hint g="box">Pre-launch</Hint>
          </div>
        </div>
        <div className="relative">
          <ConsoleArt className="h-auto w-full" />
        </div>
      </section>

      <section className="wrap mt-14" aria-label="Live chain">
        <ChainStrip />
      </section>

      {/* how it plays */}
      <section className="wrap mt-24" aria-labelledby="how">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">How a pair plays</p>
            <h2 id="how" className="h-display mt-3 text-[34px] sm:text-[46px]">
              Liquidity is better with a partner
            </h2>
          </div>
          <Link href="/docs" className="btn btn-sm self-start sm:self-auto">
            Read the manual
          </Link>
        </div>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, title, body, G }) => (
            <li key={n} className="plate flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="num text-[13px] text-ink-3">{n}</span>
                <G className="size-5" />
              </div>
              <h3 className="mt-6 font-display text-[22px] font-bold uppercase leading-tight">{title}</h3>
              <p className="mt-2 text-[15px] text-ink-2">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* difficulty */}
      <section className="wrap mt-24 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center" aria-labelledby="diff">
        <div>
          <p className="eyebrow">Choose your difficulty</p>
          <h2 id="diff" className="h-display mt-3 text-[34px] sm:text-[46px]">
            Same pool, three ways to play it
          </h2>
          <p className="mt-4 max-w-[48ch] text-[16px] text-ink-2">
            Both players pick the same price range before they are matched. Tighter ranges earn more from each trade and ask more attention in return.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(DIFFICULTY) as Difficulty[]).map((d, i) => (
            <div key={d} className="plate flex items-start gap-4 p-4 sm:gap-5 sm:p-5">
              <span className="well flex h-14 w-16 shrink-0 items-center justify-center">
                <RangeBars bars={DIFFICULTY[d].bars} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-display text-[20px] font-bold uppercase leading-tight">{DIFFICULTY[d].label}</span>
                  <span className="rounded-[4px] border border-plastic-3 bg-shell-2 px-1.5 py-0.5 font-pixel text-[9.5px] uppercase leading-none text-ink-3">
                    Lv {i + 1} · {DIFFICULTY[d].range}
                  </span>
                </div>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{DIFFICULTY[d].note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* solo vs co-op */}
      <section className="wrap mt-24" aria-labelledby="why">
        <p className="eyebrow">Why co-op</p>
        <h2 id="why" className="h-display mt-3 max-w-[18ch] text-[34px] sm:text-[46px]">
          Providing liquidity used to be single player
        </h2>
        <div className="plate mt-8 overflow-hidden p-0">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-plastic-3 bg-plastic/60 px-4 py-3 sm:px-6">
            <span className="label">&nbsp;</span>
            <span className="label">Solo LP</span>
            <span className="label !text-ink">{BRAND.name}</span>
          </div>
          {COMPARE.map((r) => (
            <div key={r.k} className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-b border-plastic-3/70 px-4 py-4 text-[14.5px] last:border-0 sm:px-6 sm:text-[15.5px]">
              <span className="font-semibold">{r.k}</span>
              <span className="text-ink-3">{r.solo}</span>
              <span className="text-ink">{r.duo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* modes */}
      <section className="wrap mt-24" aria-labelledby="modes">
        <div className="flex items-center gap-4">
          <FaceButtons className="size-14 shrink-0" />
          <div>
            <p className="eyebrow">Select mode</p>
            <h2 id="modes" className="h-display mt-2 text-[34px] sm:text-[46px]">
              Four ways in
            </h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SITE_NAV.map((m) => {
            const G = GLYPH[m.glyph];
            return (
              <Link key={m.href} href={m.href} className="plate group flex flex-col p-5 transition-transform hover:-translate-y-0.5">
                <div className="crt grid aspect-[4/3] place-items-center">
                  <G className="size-14 transition-transform group-hover:scale-110" />
                </div>
                <p className="mt-4 font-display text-[22px] font-bold uppercase">{m.label}</p>
                <p className="mt-1 text-[14.5px] text-ink-2">{m.hint}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* audience */}
      <section className="wrap mt-24" aria-labelledby="who">
        <p className="eyebrow">Who plays</p>
        <h2 id="who" className="h-display mt-3 text-[34px] sm:text-[46px]">
          Built for two kinds of player, and then some
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map((a) => (
            <div key={a.t} className="well p-5">
              <p className="font-display text-[19px] font-bold uppercase leading-tight">{a.t}</p>
              <p className="mt-2 text-[14.5px] text-ink-2">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* draw */}
      <section className="wrap mt-24" aria-labelledby="draw">
        <div className="crt flex flex-col items-start gap-6 p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-pixel text-[11px] uppercase text-phos-dim">Pre-launch</p>
            <h2 id="draw" className="h-display mt-3 text-[32px] text-phos sm:text-[42px]">
              Grab a ticket for the {BRAND.symbol} draw
            </h2>
            <p className="mt-3 max-w-[50ch] text-[15.5px] text-phos-dim">
              Sign one free message with your wallet and get a ticket for {BRAND.symbol} allocations. No gas, no approvals.
            </p>
          </div>
          <Link href="/draw" className="btn shrink-0">
            <CrossGlyph className="size-4" /> Get a ticket
          </Link>
        </div>
      </section>
    </>
  );
}
