"use client";

import { useEffect, useState } from "react";
import { CHAIN } from "@/config/brand";
import { rpc } from "@/lib/rpc";
import { Led } from "@/components/ui";

/** Live readout from Robinhood Chain through the site's read-only relay. */
export function ChainStrip() {
  const [block, setBlock] = useState<number | null>(null);
  const [gas, setGas] = useState<number | null>(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      Promise.all([rpc<string>("eth_blockNumber"), rpc<string>("eth_gasPrice")])
        .then(([b, g]) => {
          if (cancelled) return;
          setBlock(Number(BigInt(b)));
          setGas(Number(BigInt(g)) / 1e9);
          setDown(false);
        })
        .catch(() => {
          if (!cancelled) setDown(true);
        });
    load();
    const t = window.setInterval(load, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  const cells = [
    { k: "Network", v: CHAIN.name },
    { k: "Chain id", v: String(CHAIN.id) },
    { k: "Latest block", v: block === null ? (down ? "offline" : "…") : block.toLocaleString("en-US") },
    { k: "Gas", v: gas === null ? (down ? "offline" : "…") : `${gas < 0.01 ? gas.toFixed(4) : gas.toFixed(3)} gwei` },
    { k: "Pairs on chain", v: "--" },
  ];

  return (
    <div className="crt grid grid-cols-2 gap-px overflow-hidden p-0 sm:grid-cols-3 lg:grid-cols-5" data-chain-strip>
      {cells.map((c, i) => (
        <div key={c.k} className={`px-4 py-3.5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
          <p className="flex items-center gap-1.5 font-pixel text-[9.5px] uppercase text-phos-dim">
            {i === 2 ? <Led on={!down && block !== null} red={down} /> : null}
            {c.k}
          </p>
          <p className="num mt-1 truncate text-[15px] text-phos" data-cell={c.k}>
            {c.v}
          </p>
        </div>
      ))}
    </div>
  );
}
