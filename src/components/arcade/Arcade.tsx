"use client";

import Link from "next/link";
import { BRAND } from "@/config/brand";
import { PairDrop } from "@/components/arcade/PairDrop";
import { BoxGlyph, CrossGlyph, Hint, RingGlyph, TriGlyph } from "@/components/Glyphs";
import { useWallet } from "@/components/wallet/WalletProvider";
import { roomsOf, useRooms } from "@/lib/rooms";
import { Led } from "@/components/ui";

const CARTRIDGES = [
  { name: "Pair Drop", status: "Playable", note: "Catch ETH and coins in turns to form pairs.", G: TriGlyph, live: true },
  { name: "Range Runner", status: "In development", note: "Keep the price inside your band as long as you can.", G: RingGlyph, live: false },
  { name: "Seat Swap", status: "In development", note: "A reflex game about handing a seat to the next player.", G: BoxGlyph, live: false },
];

export function Arcade() {
  const { address } = useWallet();
  const rooms = useRooms();
  const mine = roomsOf(rooms, address);
  const waiting = mine.filter((r) => !r.guest);

  return (
    <div className="wrap mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
      <section aria-label="Pair Drop" className="plate p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-display text-[20px] font-bold uppercase tracking-[0.04em]">Pair Drop</p>
          <span className="flex items-center gap-2 font-pixel text-[10px] uppercase text-ink-3">
            <Led /> Power
          </span>
        </div>
        <PairDrop />
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-ink-3">
          <Hint g="tri">← → or A D move</Hint>
          <Hint g="cross">Space start / pause</Hint>
          <Hint g="ring">Drag on screen to steer</Hint>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        <section className="plate p-5 sm:p-6">
          <p className="label">How to play</p>
          <ol className="mt-3 grid grid-cols-1 gap-2.5 text-[15px] text-ink-2">
            <li className="flex gap-3">
              <span className="num text-ink">01</span> Your tray has two halves, one for each player. Catch an ETH crystal, then a coin (or the other way round) to form a pair.
            </li>
            <li className="flex gap-3">
              <span className="num text-ink">02</span> Pairs score 50 and raise your multiplier. Catching the same thing twice in a row spills the first one and resets it.
            </li>
            <li className="flex gap-3">
              <span className="num text-ink">03</span> Red shards are rugs. Three of them and the game ends.
            </li>
          </ol>
          <p className="mt-4 text-[13px] text-ink-3">Scores stay on this device. A shared leaderboard is planned for launch; no rewards are attached to arcade scores today.</p>
        </section>

        <section className="plate p-5 sm:p-6" data-waiting>
          <p className="label">Your lobby</p>
          {waiting.length ? (
            <p className="mt-3 flex items-center gap-2 text-[15px]">
              <Led blink /> Room <b className="font-mono">{waiting[0].code}</b> is waiting for player 2.
            </p>
          ) : mine.length ? (
            <p className="mt-3 flex items-center gap-2 text-[15px]">
              <Led /> Your pair is formed. Deposits open at launch.
            </p>
          ) : (
            <p className="mt-3 text-[15px] text-ink-2">No room yet. Open one, then come back here while you wait for a partner.</p>
          )}
          <Link href="/lobby" className="btn btn-sm mt-4">
            <CrossGlyph className="size-3.5" /> Go to lobby
          </Link>
        </section>

        <section className="plate p-5 sm:p-6">
          <p className="label">Cartridges</p>
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {CARTRIDGES.map(({ name, status, note, G, live }) => (
              <li key={name} className={`well flex items-start gap-3 p-3 ${live ? "" : "opacity-70"}`}>
                <G className="mt-0.5 size-5 shrink-0" />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <b className="font-display text-[15px] uppercase">{name}</b>
                    <span className="font-pixel text-[9px] uppercase text-ink-3">{status}</span>
                  </span>
                  <span className="block text-[13.5px] text-ink-2">{note}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ink-3">More cartridges arrive as the {BRAND.name} lobby grows.</p>
        </section>
      </div>
    </div>
  );
}
