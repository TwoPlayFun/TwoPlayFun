"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND, CHAIN, shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectButton } from "@/components/wallet/WalletButton";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { Mark } from "@/components/Logo";
import { CrossGlyph, RingGlyph, TriGlyph } from "@/components/Glyphs";
import { Kv, Led } from "@/components/ui";
import { formatEth, rpc } from "@/lib/rpc";
import { XIcon } from "@/components/icons";

type Entry = { address: string; code: string; issued: string; signature: string };
type Entries = Record<string, Entry>;

const KEY = "twoplay.draw.v1";

export function drawMessage(address: string, issued: string) {
  return [
    `${BRAND.name} · pre-launch draw`,
    "",
    `address: ${address.toLowerCase()}`,
    `issued: ${issued}`,
    "",
    `Signing is free. It sends no transaction and moves no funds. One ticket per wallet for the ${BRAND.symbol} draw.`,
  ].join("\n");
}

async function ticketCode(signature: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signature.toLowerCase()));
  const hex = Array.from(new Uint8Array(digest).slice(0, 3), (b) => b.toString(16).padStart(2, "0")).join("");
  return `TWP-${hex.toUpperCase()}`;
}

function useEligibility(address: string | null) {
  const [state, setState] = useState<{ txs: number | null; wei: string | null; error: boolean }>({ txs: null, wei: null, error: false });
  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    Promise.all([rpc<string>("eth_getTransactionCount", [address, "latest"]), rpc<string>("eth_getBalance", [address, "latest"])])
      .then(([n, b]) => {
        if (!cancelled) setState({ txs: Number(BigInt(n)), wei: b, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ txs: null, wei: null, error: true });
      });
    return () => {
      cancelled = true;
      setState({ txs: null, wei: null, error: false });
    };
  }, [address]);
  return state;
}

function Step({ n, title, done, active, children }: { n: number; title: string; done: boolean; active: boolean; children: React.ReactNode }) {
  return (
    <li className={`plate p-5 ${active || done ? "" : "opacity-60"}`} data-step={n}>
      <div className="flex items-center gap-3">
        <span className={`grid size-8 place-items-center rounded-full font-display text-[15px] font-bold ${done ? "bg-led text-paper" : "well text-ink"}`}>{done ? "✓" : n}</span>
        <h2 className="font-display text-[19px] font-bold uppercase tracking-[0.04em]">{title}</h2>
      </div>
      <div className="mt-3 pl-11 text-[15px] text-ink-2">{children}</div>
    </li>
  );
}

const HEX = "0123456789ABCDEF";

function TicketCard({ entry, roll }: { entry: Entry; roll: boolean }) {
  const [shown, setShown] = useState(roll ? "TWP-??????" : entry.code);
  const done = useRef(!roll);
  useEffect(() => {
    if (done.current) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1400);
      const fixed = Math.floor(k * 6);
      const tail = Array.from({ length: 6 - fixed }, () => HEX[(Math.random() * 16) | 0]).join("");
      setShown(entry.code.slice(0, 4 + fixed) + tail);
      if (k < 1) raf = requestAnimationFrame(tick);
      else done.current = true;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entry.code]);

  return (
    <div className="crt overflow-hidden p-5 sm:p-6" data-ticket>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Mark size={22} />
          <span className="font-pixel text-[10px] uppercase text-phos-dim">{BRAND.symbol} draw</span>
        </span>
        <span className="font-pixel text-[10px] uppercase text-phos-dim">Block 1/1</span>
      </div>
      <p className="mt-6 text-center font-mono text-[34px] font-medium tracking-[0.08em] text-phos sm:text-[42px]" data-code>
        {shown}
      </p>
      <div className="mt-6">
        <Kv screen k="Wallet" v={shortAddress(entry.address)} />
        <Kv screen k="Signed" v={`${entry.issued.slice(0, 16).replace("T", " ")} UTC`} />
      </div>
    </div>
  );
}

export function Draw() {
  const { address, signMessage } = useWallet();
  const [entries, setEntries] = useLocalStore<Entries>(KEY, {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const entry = address ? (entries[address.toLowerCase()] ?? null) : null;
  const elig = useEligibility(address);

  const sign = async () => {
    if (!address || busy) return;
    setBusy(true);
    setError(null);
    try {
      const issued = new Date().toISOString();
      const signature = await signMessage(drawMessage(address, issued));
      const code = await ticketCode(signature);
      setEntries({ ...entries, [address.toLowerCase()]: { address, code, issued, signature } });
      setFresh(true);
    } catch (e) {
      setError(/declined|reject|denied|4001/i.test(String((e as Error).message)) ? "Signature cancelled in the wallet." : (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const share = () => {
    if (!entry) return;
    const text = `Player 2 has entered the pool. My ${BRAND.symbol} draw ticket: ${entry.code}\n\n${BRAND.url}`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const eligible = elig.txs !== null && elig.wei !== null && elig.txs > 0 && BigInt(elig.wei) > 0n;

  return (
    <div className="wrap mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1fr]">
      <ol className="grid grid-cols-1 gap-4">
        <Step n={1} title="Insert a wallet" done={Boolean(address)} active>
          {address ? (
            <p>
              Connected as <span className="font-mono text-ink">{shortAddress(address)}</span>. Connecting only reads your address.
            </p>
          ) : (
            <>
              <p>Any EVM wallet that can add {CHAIN.name} works. Connecting only reads your address.</p>
              <ConnectButton className="btn btn-dark mt-4">Connect wallet</ConnectButton>
            </>
          )}
        </Step>
        <Step n={2} title="Sign your entry" done={Boolean(entry)} active={Boolean(address)}>
          {entry ? (
            <p>This wallet is entered. One wallet, one ticket; signing again does not add a second one.</p>
          ) : (
            <>
              <p>Sign one plain-text message. It is not a transaction: no gas, no approval, nothing leaves your wallet.</p>
              <button type="button" className="btn btn-dark mt-4" disabled={!address || busy} onClick={sign} data-sign>
                <CrossGlyph className="size-4 [&_path]:stroke-paper" /> {busy ? "Check your wallet…" : "Sign entry"}
              </button>
              {error ? <p className="mt-3 text-[13.5px] text-led-red">{error}</p> : null}
            </>
          )}
        </Step>
        <Step n={3} title="Keep the wallet active" done={eligible} active={Boolean(entry)}>
          <p>At the snapshot a ticket counts when its wallet has sent at least one transaction on {CHAIN.name} and holds some ETH for gas. Read live from the chain:</p>
          {address ? (
            <div className="mt-3" data-eligibility>
              <Kv k="Transactions sent" v={elig.txs === null ? (elig.error ? "unavailable" : "…") : elig.txs} />
              <Kv k="ETH for gas" v={elig.wei === null ? (elig.error ? "unavailable" : "…") : formatEth(elig.wei)} />
              <p className="mt-2 flex items-center gap-2 text-[14px]">
                <Led on={eligible} red={!eligible && elig.txs !== null} /> {elig.txs === null ? "Checking…" : eligible ? "Counts today" : "Not yet: send a transaction and keep a little ETH"}
              </p>
            </div>
          ) : null}
        </Step>
      </ol>

      <div className="grid grid-cols-1 gap-6">
        {entry ? (
          <>
            <TicketCard key={entry.code} entry={entry} roll={fresh} />
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn" onClick={share} data-share>
                <XIcon className="size-4" /> Share on X
              </button>
            </div>
            <p className="text-[13px] text-ink-3">
              This preview keeps your ticket and signature on this device. The entry list is collected when the draw opens; signing there registers the same wallet again.
            </p>
          </>
        ) : (
          <div className="crt grid grid-cols-1 min-h-[260px] place-items-center p-6 text-center">
            <div>
              <p className="font-pixel text-[12px] uppercase text-phos">No ticket in this slot</p>
              <p className="mt-2 text-[14px] text-phos-dim">Connect and sign to write one.</p>
            </div>
          </div>
        )}

        <section className="plate p-5 sm:p-6">
          <p className="label">Rules</p>
          <ul className="mt-3 grid grid-cols-1 gap-3 text-[14.5px] text-ink-2">
            <li className="flex gap-3">
              <TriGlyph className="mt-1 size-4 shrink-0" />
              <span>
                <b className="text-ink">One wallet, one ticket.</b> Every ticket has the same odds.
              </span>
            </li>
            <li className="flex gap-3">
              <RingGlyph className="mt-1 size-4 shrink-0" />
              <span>
                <b className="text-ink">Prizes are {BRAND.symbol} allocations.</b> The amount and number of winners are announced before the draw.
              </span>
            </li>
            <li className="flex gap-3">
              <CrossGlyph className="mt-1 size-4 shrink-0" />
              <span>
                <b className="text-ink">Drawn from a future block hash</b> on {CHAIN.name}, announced in advance, with the entry list published first so anyone can re-run it.
              </span>
            </li>
            <li className="flex gap-3">
              <TriGlyph className="mt-1 size-4 shrink-0" />
              <span>
                <b className="text-ink">Free, always.</b> The draw never asks for a transaction, an approval or a seed phrase. Official news only comes from {BRAND.xHandle}.
              </span>
            </li>
          </ul>
          <div className="mt-4">
            <Kv k="Tickets entered" v="--" />
            <Kv k="Draw date" v="Announced on X" mono={false} />
          </div>
        </section>
      </div>
    </div>
  );
}
